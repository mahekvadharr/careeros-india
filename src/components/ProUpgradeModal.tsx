import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { joinWaitlist, getWaitlistStatus } from "@/lib/waitlist.functions";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PRO_FEATURES = [
  "Unlimited Resume Analysis",
  "Advanced ATS Scoring",
  "Unlimited AI Career Coach",
  "Advanced Skill Gap Reports",
  "Personalized Learning Plans",
  "Career Twin (preview)",
];

export function ProUpgradeModal({ open, onOpenChange, source = "modal" }: { open: boolean; onOpenChange: (v: boolean) => void; source?: string }) {
  const qc = useQueryClient();
  const statusFn = useServerFn(getWaitlistStatus);
  const joinFn = useServerFn(joinWaitlist);
  const { data: status } = useQuery({ queryKey: ["waitlist"], queryFn: () => statusFn(), enabled: open });
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: async (notify: boolean) => {
      const finalEmail = (email.trim() || (await supabase.auth.getUser()).data.user?.email || "").trim();
      if (!finalEmail) throw new Error("Add an email to continue.");
      return joinFn({ data: { email: finalEmail, source: notify ? "notify" : source } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["waitlist"] }),
  });

  const joined = status?.joined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg glass-card border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold mb-2">
            <Sparkles className="h-3 w-3" /> CareerOS Pro
          </div>
          <DialogTitle className="font-display text-3xl">CareerOS Pro is coming soon 🚀</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Be first in line. {status?.total ? <span className="text-gold">{status.total} students</span> : "Students"} already on the waitlist.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 mt-2">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm">
              <div className="h-5 w-5 rounded-full bg-gold/15 grid place-items-center"><Check className="h-3 w-3 text-gold" /></div>
              {f}
            </li>
          ))}
        </ul>

        {joined ? (
          <div className="mt-5 rounded-2xl bg-success/10 border border-success/30 p-4 text-sm">
            ✅ You're on the waitlist. We'll email you the moment Pro opens.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <Input
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/60"
            />
            <div className="flex gap-2">
              <Button className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90" disabled={mutation.isPending} onClick={() => mutation.mutate(false)}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Waitlist"}
              </Button>
              <Button variant="outline" className="flex-1" disabled={mutation.isPending} onClick={() => mutation.mutate(true)}>
                Notify Me
              </Button>
            </div>
            {mutation.error && <p className="text-xs text-destructive">{(mutation.error as Error).message}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
