import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const FREE_LIMITS = {
  ai_messages: 20,
  resume_analyses: 2,
  job_applications: 20,
} as const;

export type UsageKey = keyof typeof FREE_LIMITS;

export function currentPeriod(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export const getUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const period = currentPeriod();
    const { data } = await supabase
      .from("monthly_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("period", period)
      .maybeSingle();
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("user_id", userId)
      .maybeSingle();
    return {
      period,
      is_pro: profile?.is_pro ?? false,
      usage: {
        ai_messages: data?.ai_messages ?? 0,
        resume_analyses: data?.resume_analyses ?? 0,
        job_applications: data?.job_applications ?? 0,
      },
      limits: FREE_LIMITS,
    };
  });

// Server-side helper (not a serverFn) used by other server functions
export async function incrementUsage(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  key: UsageKey,
) {
  const period = currentPeriod();
  const { data: existing } = await supabase
    .from("monthly_usage")
    .select("id, ai_messages, resume_analyses, job_applications")
    .eq("user_id", userId)
    .eq("period", period)
    .maybeSingle();
  if (existing) {
    const next = { ...existing, [key]: (existing[key] ?? 0) + 1 };
    await supabase.from("monthly_usage").update(next).eq("id", existing.id);
  } else {
    await supabase
      .from("monthly_usage")
      .insert({ user_id: userId, period, [key]: 1 });
  }
}

export async function assertWithinLimit(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  key: UsageKey,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("user_id", userId)
    .maybeSingle();
  if (profile?.is_pro) return;
  const period = currentPeriod();
  const { data } = await supabase
    .from("monthly_usage")
    .select(key)
    .eq("user_id", userId)
    .eq("period", period)
    .maybeSingle();
  const used = ((data as Record<string, number> | null)?.[key] ?? 0);
  if (used >= FREE_LIMITS[key]) {
    throw new Error(
      `FREE_LIMIT_REACHED:${key}:${used}/${FREE_LIMITS[key]} — Upgrade to CareerOS Pro for unlimited access.`,
    );
  }
}
