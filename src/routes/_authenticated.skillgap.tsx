import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { analyzeSkillGap, latestSkillGap, TARGET_ROLES } from "@/lib/skillgap.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Check, X, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/skillgap")({
  head: () => ({ meta: [{ title: "Skill Gap — CareerOS" }] }),
  component: SkillGapPage,
});

function SkillGapPage() {
  const qc = useQueryClient();
  const getFn = useServerFn(latestSkillGap);
  const runFn = useServerFn(analyzeSkillGap);
  const { data } = useQuery({ queryKey: ["skillgap"], queryFn: () => getFn() });
  const [role, setRole] = useState<string>(TARGET_ROLES[0]);

  const mut = useMutation({
    mutationFn: runFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skillgap"] }),
  });

  const r = (mut.data?.result ?? data?.result) as Record<string, unknown> | undefined;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Skill Gap</p>
        <h1 className="font-display text-4xl gradient-text mt-2">See exactly what's between you and the role.</h1>
        <p className="text-muted-foreground mt-2">Pick a target role. We map what's required, what you have, what's missing, and how long to close the gap.</p>
      </div>

      <div className="glass-card rounded-3xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-md bg-secondary/60 border border-border/40 px-3 py-2 text-sm flex-1 min-w-[220px]"
          >
            {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button className="bg-gold text-gold-foreground hover:bg-gold/90" disabled={mut.isPending} onClick={() => mut.mutate({ data: { target_role: role } })}>
            {mut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            Analyze gap
          </Button>
        </div>
        {mut.error && <p className="mt-3 text-xs text-destructive">{(mut.error as Error).message}</p>}
      </div>

      {!r && !mut.isPending && (
        <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">Run an analysis to see your skill gap.</div>
      )}

      {r && (
        <div className="space-y-5">
          <div className="glass-card rounded-3xl p-7 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Match for {r.target_role as string}</p>
              <div className="font-display text-7xl gold-text mt-2">{r.match_percentage as number}%</div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Time to close</p>
              <div className="font-display text-3xl mt-2">{r.estimated_weeks as number} <span className="text-base text-muted-foreground">weeks</span></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Required skills</div>
              <ul className="space-y-2">
                {((r.required_skills as Array<{ name: string; importance: string }>) || []).map((s) => {
                  const matched = ((r.matched_skills as string[]) || []).map((x) => x.toLowerCase()).includes(s.name.toLowerCase());
                  return (
                    <li key={s.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {matched ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-destructive/70" />}
                        {s.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.importance}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Learning plan</div>
              <ol className="space-y-3">
                {((r.learning_plan as Array<{ skill: string; weeks: number; resource: string }>) || []).map((p, i) => (
                  <li key={i} className="border-l-2 border-gold/40 pl-3">
                    <div className="text-sm font-medium">{p.skill} <span className="text-xs text-muted-foreground">· {p.weeks}w</span></div>
                    <div className="text-xs text-muted-foreground">{p.resource}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Missing — sorted by priority</div>
            <div className="space-y-3">
              {((r.missing_skills as Array<{ name: string; priority: string; why: string }>) || []).map((m) => (
                <div key={m.name} className="flex gap-3">
                  <span className={`text-[10px] uppercase tracking-widest pt-1 ${m.priority === "high" ? "text-destructive" : m.priority === "medium" ? "text-warning" : "text-muted-foreground"}`}>{m.priority}</span>
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.why}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
