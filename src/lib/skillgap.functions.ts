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

For every missing skill produce a guided learning path:
- steps: 3-8 ordered sub-topics ("what to learn, in what order"). Concrete, not vague.
- roadmap: a real roadmap.sh page (e.g. https://roadmap.sh/backend, /frontend, /devops, /system-design, /ai-data-scientist, /python, /javascript). Use the most specific page that applies.
- course: a real course URL (freeCodeCamp, Coursera, Udemy, official docs).
- practice: a real practice platform URL (LeetCode, HackerRank, Frontend Mentor, Kaggle, Codeforces, Excalidraw exercises).
- youtube_videos: 2-3 real YouTube video or playlist URLs that actually teach this skill (prefer freeCodeCamp, Apna College, CodeWithHarry, Fireship, Traversy Media, NeetCode, Hitesh Choudhary).

For learning_plan items, include the same kind of real, working URLs. All URLs must be plausible and currently reachable — never fabricate paths.`;
    const user = `Student — branch: ${profile?.branch ?? "?"}, year: ${profile?.year ?? "?"}, skills: ${(profile?.current_skills ?? []).join(", ") || "none"}. Target role: ${data.target_role}.`;

    const { toolArguments } = await callGemini({
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      tools: [SKILLGAP_TOOL],
      tool_choice: { type: "function", function: { name: "emit_skill_gap" } },
    });
    const r = (toolArguments ?? {}) as Record<string, unknown>;

    const { data: row, error } = await supabase
      .from("skill_gap_results")
      .insert({
        user_id: userId,
        target_role: data.target_role,
        match_percentage: (r.match_percentage as number) ?? 0,
        required_skills: (r.required_skills as never) ?? ([] as never),
        matched_skills: (r.matched_skills as never) ?? ([] as never),
        missing_skills: (r.missing_skills as never) ?? ([] as never),
        learning_plan: (r.learning_plan as never) ?? ([] as never),
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
