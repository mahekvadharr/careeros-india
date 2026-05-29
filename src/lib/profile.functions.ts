import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const OnboardingSchema = z.object({
  branch: z.string().min(1).max(80),
  year: z.number().int().min(1).max(5),
  target_career: z.string().min(1).max(120),
  dream_companies: z.array(z.string().min(1).max(60)).min(1).max(10),
  current_skills: z.array(z.string().min(1).max(40)).max(30),
  confidence_level: z.number().int().min(1).max(10),
  weekly_hours: z.number().int().min(1).max(80),
});

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => OnboardingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // simple career score: confidence*5 + hours*1 + skills*2, clamped 0-100
    const score = Math.min(
      100,
      data.confidence_level * 5 + data.weekly_hours + data.current_skills.length * 2,
    );
    const { error } = await supabase
      .from("profiles")
      .update({
        branch: data.branch,
        year: data.year,
        target_career: data.target_career,
        dream_companies: data.dream_companies,
        current_skills: data.current_skills,
        confidence_level: data.confidence_level,
        weekly_hours: data.weekly_hours,
        onboarded: true,
        career_score: score,
      })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true, career_score: score };
  });
