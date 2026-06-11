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
            },
            required: ["name", "priority", "why"],
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
              resource: { type: "string" },
            },
            required: ["skill", "weeks", "resource"],
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

    const sys = `You are a precise career analyst. Compare the student's current skills with what a ${data.target_role} role demands in the Indian job market in 2026. Calibrate the match percentage realistically.`;
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
