import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWaitlistStatus } from "@/lib/waitlist.functions";
import { getUsage } from "@/lib/usage.functions";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Lock } from "lucide-react";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";

export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({ meta: [{ title: "Pricing — CareerOS" }] }),
  component: PricingPage,
});

const FREE = [
  "Career GPS roadmap",
  "Weekly Mission",
  "Basic Skill Gap analysis",
  "Internship Readiness Score",
  "Resume Analyzer (2 / month)",
  "AI Career Coach (20 messages / month)",
  "Up to 20 job applications tracked",
];

const PRO = [
  "Unlimited Resume Analyses",
  "Advanced ATS scoring",
  "Unlimited AI Career Coach",
  "Advanced Skill Gap reports",
  "Personalized learning timelines",
  "Unlimited application tracking",
  "Advanced analytics dashboard",
  "Career Twin (coming soon)",
  "Priority AI recommendations",
];

function PricingPage() {
  const [open, setOpen] = useState(false);
  const statusFn = useServerFn(getWaitlistStatus);
  const usageFn = useServerFn(getUsage);
  const { data: status } = useQuery({ queryKey: ["waitlist"], queryFn: () => statusFn() });
  const { data: usage } = useQuery({ queryKey: ["usage"], queryFn: () => usageFn() });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Pricing</p>
        <h1 className="font-display text-5xl gradient-text mt-2">Simple plans. Serious careers.</h1>
        <p className="text-muted-foreground mt-3">Start free. Go Pro when you want unlimited.</p>
        {status?.total ? <p className="text-sm text-gold mt-2"><Sparkles className="h-3 w-3 inline mr-1" />{status.total} students on the Pro waitlist</p> : null}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass-card rounded-3xl p-7">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Free</p>
          <div className="font-display text-5xl mt-2">₹0</div>
          <p className="text-sm text-muted-foreground mt-1">Everything you need to start.</p>
          <ul className="mt-6 space-y-2">
            {FREE.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" />{f}</li>
            ))}
          </ul>
          {usage && !usage.is_pro && (
            <div className="mt-6 rounded-2xl bg-secondary/40 p-4 text-xs text-muted-foreground">
              <div>This month: <span className="text-foreground">{usage.usage.ai_messages}</span>/{usage.limits.ai_messages} AI messages · <span className="text-foreground">{usage.usage.resume_analyses}</span>/{usage.limits.resume_analyses} resume analyses</div>
            </div>
          )}
        </div>

        <div className="rounded-3xl p-7 shadow-gold border border-gold/40 bg-gradient-to-br from-secondary/80 to-secondary/40 relative">
          <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest bg-gold/15 text-gold px-2 py-1 rounded-full flex items-center gap-1"><Lock className="h-3 w-3" /> Coming soon</div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Pro</p>
          <div className="font-display text-5xl mt-2 gold-text">₹499<span className="text-sm text-muted-foreground">/mo</span></div>
          <p className="text-sm text-muted-foreground mt-1">Everything in Free, plus unlimited AI.</p>
          <ul className="mt-6 space-y-2">
            {PRO.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-gold" />{f}</li>
            ))}
          </ul>
          <Button className="mt-6 w-full bg-gold text-gold-foreground hover:bg-gold/90" onClick={() => setOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" /> {status?.joined ? "You're on the waitlist" : "Join the waitlist"}
          </Button>
        </div>
      </div>

      <ProUpgradeModal open={open} onOpenChange={setOpen} source="pricing-page" />
    </div>
  );
}
