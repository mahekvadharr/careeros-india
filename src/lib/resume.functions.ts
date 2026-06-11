import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertWithinLimit, incrementUsage } from "./usage.functions";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const RESUME_TOOL = {
  type: "function",
  function: {
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
            additionalProperties: false,
          },
        },
      },
      required: [
        "overall_score","ats_score","keyword_score","project_score","experience_score",
        "formatting_score","summary","missing_keywords","weak_action_verbs",
        "missing_quantified_achievements","missing_skills","length_recommendation","top_fixes",
      ],
      additionalProperties: false,
    },
  },
};

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

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { data: profile } = await supabase
      .from("profiles")
      .select("target_career, branch, year, current_skills")
      .eq("user_id", userId)
      .maybeSingle();

    const targetRole = data.target_role || profile?.target_career || "Software Engineer";

    const systemPrompt = `You are an elite resume reviewer for Indian engineering students targeting ${targetRole} roles. Score with calibrated rigor (most student resumes score 40-70 overall). Be brutally specific. Prefer concrete missing keywords/skills/numbers over vague advice.`;

    const userMsg = [
      { type: "text", text: `Analyze this resume for a ${targetRole} role. Student profile — branch: ${profile?.branch ?? "?"}, year: ${profile?.year ?? "?"}, known skills: ${(profile?.current_skills ?? []).join(", ") || "?"}.` },
      { type: "file", file: { filename: data.file_name, file_data: data.file_data } },
    ];

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        tools: [RESUME_TOOL],
        tool_choice: { type: "function", function: { name: "emit_resume_analysis" } },
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Rate limit reached — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in your Lovable workspace.");
      throw new Error(`AI gateway error (${res.status}): ${t.slice(0, 240)}`);
    }
    const json = await res.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("AI did not return analysis. Try again.");
    const analysis = JSON.parse(args) as Record<string, unknown>;

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
