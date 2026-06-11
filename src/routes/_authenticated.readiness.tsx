import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { computeReadiness, getReadiness } from "@/lib/readiness.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCcw, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/readiness")({
  head: () => ({ meta: [{ title: "Internship Readiness — CareerOS" }] }),
  component: ReadinessPage,
});

function ReadinessPage() {
  const qc = useQueryClient();
  const getFn = useServerFn(getReadiness);
  const computeFn = useServerFn(computeReadiness);
  const { data, isLoading } = useQuery({ queryKey: ["readiness"], queryFn: () => getFn() });
  const mut = useMutation({
    mutationFn: computeFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["readiness"] }),
  });

  const r = (mut.data?.readiness ?? data?.readiness) as Record<string, unknown> | undefined;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Internship Readiness</p>
          <h1 className="font-display text-4xl gradient-text mt-2">How ready are you, really?</h1>
          <p className="text-muted-foreground mt-2">A live score across resume, skills, projects, certs, LinkedIn and roadmap.</p>
        </div>
        <Button variant="outline" disabled={mut.isPending} onClick={() => mut.mutate(undefined)}>
          {mut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
          {r ? "Recompute" : "Compute now"}
        </Button>
      </div>

      {isLoading && <div className="glass-card rounded-3xl p-10 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-gold" /></div>}

      {!r && !isLoading && (
        <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
          Click <span className="text-foreground">Compute now</span> to see your readiness score.
        </div>
      )}

      {r && (
        <div className="space-y-5">
          <div className="glass-card rounded-3xl p-7 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-48 w-48 bg-gold/15 blur-3xl rounded-full" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total readiness</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-7xl gold-text">{r.total_score as number}</span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <Progress value={r.total_score as number} className="mt-6 h-1.5" />
            <p className="mt-3 text-sm text-muted-foreground">Estimated {r.estimated_weeks as number} weeks to reach 90+.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Pillar label="Resume" value={r.resume_score as number} />
            <Pillar label="Skills" value={r.skills_score as number} />
            <Pillar label="Projects" value={r.projects_score as number} />
            <Pillar label="Certifications" value={r.certifications_score as number} />
            <Pillar label="LinkedIn" value={r.linkedin_score as number} />
            <Pillar label="Roadmap" value={r.roadmap_score as number} />
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Improvement plan</div>
            <ol className="space-y-3">
              {((r.improvement_plan as Array<{ title: string; detail: string }>) || []).map((p, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-display text-xl text-gold/80 leading-none">{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.detail}</div>
                  </div>
                </li>
              ))}
              {((r.improvement_plan as unknown[])?.length ?? 0) === 0 && <li className="text-sm text-success">Nothing critical missing — keep shipping.</li>}
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/resume" className="text-xs px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary inline-flex items-center gap-1">Resume Analyzer <ArrowRight className="h-3 w-3" /></Link>
              <Link to="/skillgap" className="text-xs px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary inline-flex items-center gap-1">Skill Gap <ArrowRight className="h-3 w-3" /></Link>
              <Link to="/roadmap" className="text-xs px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary inline-flex items-center gap-1">Career GPS <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pillar({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
        <span className="font-display text-xl">{value}</span>
      </div>
      <Progress value={value} className="mt-2 h-1" />
    </div>
  );
}
