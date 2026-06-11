import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const joinWaitlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      email: z.string().trim().email().max(255),
      source: z.string().trim().min(1).max(40).default("modal"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("pro_waitlist")
      .upsert(
        { user_id: userId, email: data.email, source: data.source },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getWaitlistStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("pro_waitlist")
      .select("id, created_at")
      .eq("user_id", userId)
      .maybeSingle();
    const { count } = await supabase
      .from("pro_waitlist")
      .select("*", { count: "exact", head: true });
    return { joined: !!me, joined_at: me?.created_at ?? null, total: count ?? 0 };
  });
