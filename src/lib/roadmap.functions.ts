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
                  },
                  required: ["title", "description", "category"],
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

    const systemPrompt = `You are CareerOS, a premium AI career strategist specifically for Indian engineering students. Generate a precise, actionable, semester-wise roadmap tailored to the student's profile. Focus on Indian context (placement season, internships at Indian and global companies, Indian college calendar). Be specific, not generic.`;

    const userPrompt = `Student profile:
- Branch: ${profile.branch}
- Current year: ${profile.year}
- Target career: ${profile.target_career}
- Dream companies: ${(profile.dream_companies ?? []).join(", ")}
- Current skills: ${(profile.current_skills ?? []).join(", ") || "none yet"}
- Confidence level: ${profile.confidence_level}/10
- Weekly hours available: ${profile.weekly_hours}

Generate a roadmap of 6 to 8 semesters starting from semester ${(profile.year - 1) * 2 + 1}. Each semester should have 4-6 items mixing skills, projects, internships, networking, and placement prep.`;

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

    if (existing) {
      await supabase.from("roadmaps").update({ semesters }).eq("id", existing.id);
    } else {
      await supabase.from("roadmaps").insert({ user_id: userId, semesters });
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
