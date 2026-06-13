import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGemini } from "./ai.server";

const ROADMAP_TOOL = {
  type: "function",
  function: {
    name: "emit_roadmap",
    description: "Emit a semester-wise career roadmap for an Indian engineering student.",
    parameters: {
      type: "object",
      properties: {
        semesters: {
          type: "array",
          minItems: 4,
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              semester: { type: "integer" },
              title: { type: "string" },
              focus: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string", enum: ["skill", "project", "internship", "networking", "placement"] },
                    resources: {
                      type: "object",
                      description: "Actionable links. Use roadmap.sh for any technical skill or software role.",
                      properties: {
                        roadmap: { type: "string", description: "roadmap.sh URL (or equivalent) for the skill/role." },
                        course: { type: "string", description: "Recommended course URL (Coursera, freeCodeCamp, Udemy, official docs)." },
                        practice: { type: "string", description: "Practice platform URL (LeetCode, HackerRank, Kaggle, Frontend Mentor)." },
                        portfolio_project: { type: "string", description: "Concrete portfolio project idea to ship for this item." },
                      },
                      required: ["roadmap", "course", "practice", "portfolio_project"],
                      additionalProperties: false,
                    },
                  },
                  required: ["title", "description", "category", "resources"],
                  additionalProperties: false,
                },
              },
            },
            required: ["semester", "title", "focus", "items"],
            additionalProperties: false,
          },
        },
      },
      required: ["semesters"],
      additionalProperties: false,
    },
  },
};

export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (!profile) throw new Error("Profile not found");

    const systemPrompt = `You are CareerOS, a premium AI career strategist specifically for Indian engineering students. Generate a precise, actionable, semester-wise roadmap tailored to the student's profile (Indian placement/internship context).

STRICT LINK RULES (any violation = failure):
- roadmap: ONLY confirmed roadmap.sh pages (/frontend /backend /full-stack /devops /python /javascript /typescript /react /nodejs /sql /system-design /ai-data-scientist /android /ios /ux-design /product-manager /datastructures-and-algorithms /computer-science). If none fit, "".
- course/practice: only canonical roots of well-known sites (coursera.org, freecodecamp.org/learn, udemy.com, nptel.ac.in, leetcode.com, hackerrank.com, kaggle.com/learn, frontendmentor.io, official docs). No guessed deep paths.
- Do NOT reuse the same URL across multiple items. Use freeCodeCamp sparingly (max once).
- portfolio_project: short concrete project idea text (not a URL).`;

    const userPrompt = `Student profile:
- Branch: ${profile.branch}
- Current year: ${profile.year}
- Target career: ${profile.target_career}
- Dream companies: ${(profile.dream_companies ?? []).join(", ")}
- Current skills: ${(profile.current_skills ?? []).join(", ") || "none yet"}
- Confidence level: ${profile.confidence_level}/10
- Weekly hours available: ${profile.weekly_hours}

Generate a roadmap of 6 to 8 semesters starting from semester ${(((profile.year ?? 1) - 1) * 2) + 1}. Each semester should have 4-6 items mixing skills, projects, internships, networking, and placement prep.`;

    const { toolArguments } = await callGemini({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [ROADMAP_TOOL],
      tool_choice: { type: "function", function: { name: "emit_roadmap" } },
    });

    const semesters = (toolArguments as { semesters?: unknown })?.semesters ?? [];

    // Upsert
    const { data: existing } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const semestersJson = semesters as unknown as never;
    if (existing) {
      await supabase.from("roadmaps").update({ semesters: semestersJson }).eq("id", existing.id);
    } else {
      await supabase.from("roadmaps").insert({ user_id: userId, semesters: semestersJson });
    }
    return { semesters };
  });

export const getRoadmap = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return { roadmap: data };
  });
