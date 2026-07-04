import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { computeReadiness, getReadiness } from "@/lib/readiness.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCcw, ArrowRight, Gauge } from "lucide-react";

export const Route = createFileRoute("/_authenticated/readiness")({
  head: () => ({ meta: [{ title: "Internship Readiness — CareerOS" }] }),
  component: ReadinessPage,
});

const PILLARS = [
  { key: "resume_score",         label: "Resume",         colorClass: "icon-glow-rose" },
  { key: "skills_score",         label: "Skills",         colorClass: "icon-glow-teal" },
  { key: "projects_score",       label: "Projects",       colorClass: "icon-glow-indigo" },
  { key: "certifications_score", label: "Certifications", colorClass: "icon-glow-amber" },
  { key: "linkedin_score",       label: "LinkedIn",       colorClass: "icon-glow-emerald" },
  { key: "roadmap_score",        label: "Roadmap",        colorClass: "icon-glow-gold" },
];

function ReadinessPage() {
  const qc = useQueryClient();
  const getFn = useServerFn(getReadiness);
  const computeFn = useServerFn(computeReadiness);
  const { data, isLoading } = useQuery({ queryKey: ["readiness"], queryFn: () => getFn(), staleTime: 60_000, refetchOnWindowFocus: false });
  const mut = useMutation({
    mutationFn: computeFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["readiness"] }),
  });

  const r = (mut.data?.readiness ?? data?.readiness) as Record<string, unknown> | undefined;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Internship Readiness</p>
          <h1 className="font-display text-4xl gradient-text">How ready are you, really?</h1>
          <p className="text-muted-foreground mt-2 text-sm">A live score across resume, skills, projects, certs, LinkedIn and roadmap.</p>
        </div>
        <Button variant="outline" disabled={mut.isPending} onClick={() => mut.mutate(undefined)} className="shrink-0 rounded-full h-10 px-5">
          {mut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
          {r ? "Recompute" : "Compute now"}
        </Button>
      </div>

      {isLoading && (
        <div className="card rounded-2xl p-10 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-gold" />
        </div>
      )}

      {!r && !isLoading && (
        <div className="card rounded-2xl p-12 text-center">
          <div className="h-14 w-14 rounded-2xl icon-glow-gold mx-auto mb-4 grid place-items-center">
            <Gauge className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl gradient-text">Ready to check your score?</h2>
          <p className="text-muted-foreground mt-2 text-sm">Click <span className="text-foreground font-medium">Compute now</span> to see your readiness score across 6 dimensions.</p>
        </div>
      )}

      {r && (
        <div className="space-y-5">
          {/* Big score */}
          <div className="card rounded-2xl p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
            <div className="text-center shrink-0">
              <div className="font-display text-6xl sm:text-8xl gold-text leading-none">{r.total_score as number}</div>
              <div className="text-xs text-muted-foreground mt-1">/100</div>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl gradient-text mb-3">Total Readiness</h3>
              <Progress value={r.total_score as number} className="h-2 mb-3" />
              <p className="text-sm text-muted-foreground">
                Estimated <span className="text-foreground font-semibold">{r.estimated_weeks as number} weeks</span> to reach 90+ readiness.
              </p>
            </div>
          </div>

          {/* 6 pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PILLARS.map((p) => {
              const value = r[p.key] as number;
              return (
                <div key={p.key} className="card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-8 w-8 rounded-lg grid place-items-center ${p.colorClass}`}>
                      <span className="text-xs font-bold">{p.label[0]}</span>
                    </div>
                    <span className="font-display text-2xl">{value}</span>
                  </div>
                  <div className="text-xs font-medium mb-2">{p.label}</div>
                  <Progress value={value} className="h-1.5" />
                </div>
              );
            })}
          </div>

          {/* Improvement plan */}
          <div className="card rounded-2xl p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Improvement plan</div>
            <ol className="space-y-4">
              {((r.improvement_plan as Array<{ title: string; detail: string }>) || []).map((p, i) => (
                <li key={i} className="flex gap-4">
                  <div className="h-7 w-7 rounded-lg icon-glow-gold grid place-items-center shrink-0 font-display text-sm">{i + 1}</div>
                  <div>
                    <div className="text-sm font-semibold">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.detail}</div>
                  </div>
                </li>
              ))}
              {((r.improvement_plan as unknown[])?.length ?? 0) === 0 && (
                <li className="text-sm text-green-400 flex items-center gap-2">
                  ✓ Nothing critical missing — keep shipping.
                </li>
              )}
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { to: "/resume",   label: "Resume Analyzer" },
                { to: "/skillgap", label: "Skill Gap" },
                { to: "/roadmap",  label: "Career GPS" },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-xs px-3 py-1.5 rounded-full card hover:border-border inline-flex items-center gap-1 transition-colors">
                  {label} <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
