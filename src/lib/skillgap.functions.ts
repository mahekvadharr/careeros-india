import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGemini } from "./ai.server";

export const TARGET_ROLES = [
  "Full Stack Developer",
  "Data Analyst",
  "Business Intelligence Analyst",
  "Product Manager",
  "AI Engineer",
  "UI/UX Designer",
  "Backend Engineer",
  "Frontend Engineer",
  "DevOps Engineer",
  "Mobile Developer",
] as const;

const SKILLGAP_TOOL = {
  type: "function",
  function: {
    name: "emit_skill_gap",
    description: "Emit a precise skill-gap analysis for the target role.",
    parameters: {
      type: "object",
      properties: {
        match_percentage: { type: "integer", minimum: 0, maximum: 100 },
        required_skills: {
          type: "array",
          minItems: 8,
          maxItems: 16,
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              importance: { type: "string", enum: ["core", "important", "nice-to-have"] },
            },
            required: ["name", "importance"],
            additionalProperties: false,
          },
        },
        matched_skills: { type: "array", items: { type: "string" } },
        missing_skills: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
              why: { type: "string" },
              roadmap: { type: "string", description: "roadmap.sh URL (or equivalent) for the missing skill. Required for technical skills." },
              course: { type: "string", description: "Recommended course URL." },
              practice: { type: "string", description: "Practice platform URL." },
              weeks_to_job_ready: { type: "integer", minimum: 1, maximum: 52 },
              steps: {
                type: "array",
                minItems: 3,
                maxItems: 8,
                description: "Ordered learning steps — what to learn, in what order. Each step is a short, concrete sub-topic.",
                items: { type: "string" },
              },
              youtube_videos: {
                type: "array",
                minItems: 2,
                maxItems: 3,
                description: "Real YouTube video or playlist URLs that teach this skill. Prefer freeCodeCamp, Apna College, CodeWithHarry, Fireship, Traversy Media, etc.",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    url: { type: "string", description: "Full https://www.youtube.com/... URL" },
                  },
                  required: ["title", "url"],
                  additionalProperties: false,
                },
              },
            },
            required: ["name", "priority", "why", "roadmap", "course", "practice", "weeks_to_job_ready", "steps", "youtube_videos"],
            additionalProperties: false,
          },
        },
        learning_plan: {
          type: "array",
          minItems: 3,
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              skill: { type: "string" },
              weeks: { type: "integer", minimum: 1, maximum: 24 },
              resource: { type: "string", description: "Primary resource URL or title." },
              roadmap: { type: "string", description: "roadmap.sh URL when applicable." },
              course: { type: "string", description: "Recommended course URL." },
              practice: { type: "string", description: "Practice platform URL." },
            },
            required: ["skill", "weeks", "resource", "roadmap", "course", "practice"],
            additionalProperties: false,
          },
        },
        estimated_weeks: { type: "integer", minimum: 1, maximum: 104 },
      },
      required: ["match_percentage","required_skills","matched_skills","missing_skills","learning_plan","estimated_weeks"],
      additionalProperties: false,
    },
  },
};

export const analyzeSkillGap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ target_role: z.string().trim().min(2).max(80) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("branch, year, current_skills")
      .eq("user_id", userId)
      .maybeSingle();

    const sys = `You are a precise career analyst. Compare the student's current skills with what a ${data.target_role} role demands in the Indian job market in 2026. Calibrate the match percentage realistically.

STRICT LINK RULES (any violation = task failure):
- YouTube: ONLY canonical watch URLs in the exact form https://www.youtube.com/watch?v=VIDEOID (11-char id). NEVER use /embed/, /shorts/, youtu.be, playlist-only URLs, or made-up ids. If you are not certain a specific video id exists and matches the topic, OMIT it — fewer correct links is better than fake ones.
- roadmap.sh: ONLY use these confirmed pages — https://roadmap.sh/frontend, /backend, /full-stack, /devops, /python, /javascript, /typescript, /react, /nodejs, /sql, /system-design, /ai-data-scientist, /android, /ios, /design-system, /ux-design, /product-manager, /qa, /computer-science, /datastructures-and-algorithms. If none fit, leave roadmap as empty string "".
- course/practice: only well-known canonical roots (https://www.freecodecamp.org/learn, https://www.coursera.org, https://www.udemy.com, https://leetcode.com, https://www.hackerrank.com, https://www.frontendmentor.io, https://www.kaggle.com/learn, https://developer.mozilla.org, https://react.dev, official docs). No deep guessed paths.

QUALITY RULES:
- youtube_videos: 2-3 max, each must be DIFFERENT and directly teach THIS skill.
- Do NOT spam freeCodeCamp — use at most once across the whole response, only when it's the best fit.
- No two missing skills should share the same youtube/course/practice URL.
- steps: 3-8 concrete ordered sub-topics, not vague phrases.

For learning_plan items, follow the same link rules.`;
    const user = `Student — branch: ${profile?.branch ?? "?"}, year: ${profile?.year ?? "?"}, skills: ${(profile?.current_skills ?? []).join(", ") || "none"}. Target role: ${data.target_role}.`;

    const { toolArguments } = await callGemini({
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      tools: [SKILLGAP_TOOL],
      tool_choice: { type: "function", function: { name: "emit_skill_gap" } },
    });
    const r = (toolArguments ?? {}) as Record<string, unknown>;

    // Replace AI-emitted links entirely with curated, hand-verified entries.
    // If a skill is not in the database, NO link is shown (UI falls back to
    // "Resource currently unavailable").
    const { lookupSkill } = await import("./resource-db.server");

    const missing = Array.isArray(r.missing_skills) ? (r.missing_skills as Array<Record<string, unknown>>) : [];
    const cleanedMissing = missing.map((m) => {
      const db = lookupSkill(String(m.name ?? ""));
      return {
        ...m,
        roadmap: db?.roadmap ?? "",
        course: db?.course ?? db?.docs ?? "",
        practice: db?.practice ?? "",
        youtube_videos: db?.videos ?? [],
      };
    });

    const plan = Array.isArray(r.learning_plan) ? (r.learning_plan as Array<Record<string, unknown>>) : [];
    const cleanedPlan = plan.map((p) => {
      const db = lookupSkill(String(p.skill ?? ""));
      return {
        ...p,
        roadmap: db?.roadmap ?? "",
        course: db?.course ?? db?.docs ?? "",
        practice: db?.practice ?? "",
      };
    });

    const { data: row, error } = await supabase
      .from("skill_gap_results")
      .insert({
        user_id: userId,
        target_role: data.target_role,
        match_percentage: (r.match_percentage as number) ?? 0,
        required_skills: (r.required_skills as never) ?? ([] as never),
        matched_skills: (r.matched_skills as never) ?? ([] as never),
        missing_skills: cleanedMissing as never,
        learning_plan: cleanedPlan as never,
        estimated_weeks: (r.estimated_weeks as number) ?? 0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { result: row };
  });

export const latestSkillGap = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("skill_gap_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { result: data };
  });
