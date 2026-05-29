import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — CareerOS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const fn = useServerFn(getProfile);
  const nav = useNavigate();
  const { data } = useQuery({ queryKey: ["profile"], queryFn: () => fn() });
  const p = data?.profile;

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav({ to: "/" });
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Settings</p>
      <h1 className="font-display text-4xl gradient-text">Your profile</h1>

      <div className="mt-8 glass-card rounded-3xl p-7 space-y-4">
        <Row label="Name" value={p?.full_name ?? "—"} />
        <Row label="Email" value={p?.email ?? "—"} />
        <Row label="Branch" value={p?.branch ?? "—"} />
        <Row label="Year" value={p?.year ? `Year ${p.year}` : "—"} />
        <Row label="Target career" value={p?.target_career ?? "—"} />
        <Row label="Dream companies" value={(p?.dream_companies ?? []).join(", ") || "—"} />
        <Row label="Skills" value={(p?.current_skills ?? []).join(", ") || "—"} />
        <Row label="Weekly hours" value={p?.weekly_hours ? `${p.weekly_hours}h` : "—"} />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Button onClick={() => nav({ to: "/onboarding" })} variant="outline" className="rounded-full">Re-do onboarding</Button>
        <Button onClick={signOut} variant="ghost" className="rounded-full text-destructive">Sign out</Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground/90 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
