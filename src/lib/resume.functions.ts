import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertWithinLimit, incrementUsage } from "./usage.functions";

const RESUME_TOOL = {
  name: "emit_resume_analysis",
  description: "Emit structured resume scoring + actionable feedback.",
  parameters: {
    type: "object",
    properties: {
      overall_score: { type: "integer", minimum: 0, maximum: 100 },
      ats_score: { type: "integer", minimum: 0, maximum: 100 },
      keyword_score: { type: "integer", minimum: 0, maximum: 100 },
      project_score: { type: "integer", minimum: 0, maximum: 100 },
      experience_score: { type: "integer", minimum: 0, maximum: 100 },
      formatting_score: { type: "integer", minimum: 0, maximum: 100 },
      summary: { type: "string", description: "1-2 sentence overall verdict" },
      missing_keywords: { type: "array", items: { type: "string" }, maxItems: 12 },
      weak_action_verbs: { type: "array", items: { type: "string" }, maxItems: 10 },
      missing_quantified_achievements: { type: "array", items: { type: "string" }, maxItems: 8 },
      missing_skills: { type: "array", items: { type: "string" }, maxItems: 10 },
      length_recommendation: { type: "string" },
      top_fixes: {
        type: "array",
        minItems: 3,
        maxItems: 7,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            detail: { type: "string" },
            priority: { type: "string", enum: ["high", "medium", "low"] },
          },
          required: ["title", "detail", "priority"],
        },
      },
    },
    required: [
      "overall_score","ats_score","keyword_score","project_score","experience_score",
      "formatting_score","summary","missing_keywords","weak_action_verbs",
      "missing_quantified_achievements","missing_skills","length_recommendation","top_fixes",
    ],
  },
};

// Gemini's native API (not the OpenAI-compat shim) — supports PDF input
// directly via inline_data, which the OpenAI-compat endpoint does not.
const GEMINI_NATIVE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      file_name: z.string().trim().min(1).max(200),
      file_data: z.string().min(100).max(15_000_000), // base64 data URL (max ~10MB pdf)
      target_role: z.string().trim().max(120).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertWithinLimit(supabase, userId, "resume_analyses");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const { data: profile } = await supabase
      .from("profiles")
      .select("target_career, branch, year, current_skills")
      .eq("user_id", userId)
      .maybeSingle();

    const targetRole = data.target_role || profile?.target_career || "Software Engineer";

    const systemPrompt = `You are an elite resume reviewer for Indian engineering students targeting ${targetRole} roles. Score with calibrated rigor (most student resumes score 40-70 overall). Be brutally specific. Prefer concrete missing keywords/skills/numbers over vague advice.`;

    // data.file_data is a base64 data URL like "data:application/pdf;base64,JVBERi0..."
    // Gemini's inline_data wants just the raw base64 payload + mime type separately.
    const match = data.file_data.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = match?.[1] ?? "application/pdf";
    const base64Data = match?.[2] ?? data.file_data;

    const res = await fetch(`${GEMINI_NATIVE_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Analyze this resume for a ${targetRole} role. Student profile — branch: ${profile?.branch ?? "?"}, year: ${profile?.year ?? "?"}, known skills: ${(profile?.current_skills ?? []).join(", ") || "?"}.`,
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        tools: [{ function_declarations: [RESUME_TOOL] }],
        tool_config: {
          function_calling_config: { mode: "ANY", allowed_function_names: ["emit_resume_analysis"] },
        },
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      if (res.status === 429 || res.status === 503) throw new Error("AI is temporarily busy — please try again in 30 seconds.");
      if (res.status === 402) throw new Error("AI credits exhausted. Check your Google AI Studio billing.");
      throw new Error(`AI gateway error (${res.status}): ${t.slice(0, 240)}`);
    }

    const json = await res.json();
    const functionCall =
      json.candidates?.[0]?.content?.parts?.find((p: { functionCall?: unknown }) => p.functionCall)
        ?.functionCall;
    if (!functionCall?.args) throw new Error("AI did not return analysis. Try again.");
    const analysis = functionCall.args as Record<string, unknown>;

    const { data: row, error } = await supabase
      .from("resume_analyses")
      .insert({
        user_id: userId,
        file_name: data.file_name,
        target_role: targetRole,
        overall_score: analysis.overall_score as number,
        ats_score: analysis.ats_score as number,
        keyword_score: analysis.keyword_score as number,
        project_score: analysis.project_score as number,
        experience_score: analysis.experience_score as number,
        formatting_score: analysis.formatting_score as number,
        feedback: analysis as never,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await incrementUsage(supabase, userId, "resume_analyses");
    return { analysis: row };
  });

export const listResumeAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("resume_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    return { analyses: data ?? [] };
  });
