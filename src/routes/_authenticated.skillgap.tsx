import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { analyzeSkillGap, latestSkillGap, TARGET_ROLES } from "@/lib/skillgap.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Check, X, TrendingUp, Youtube, Map as MapIcon } from "lucide-react";

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
                {((r.learning_plan as Array<{ skill: string; weeks: number; resource: string; roadmap?: string; course?: string; practice?: string }>) || []).map((p, i) => (
                  <li key={i} className="border-l-2 border-gold/40 pl-3">
                    <div className="text-sm font-medium">{p.skill} <span className="text-xs text-muted-foreground">· {p.weeks}w</span></div>
                    <div className="text-xs text-muted-foreground">{p.resource}</div>
                    <div className="flex flex-wrap gap-1.5 text-[10px] mt-1.5">
                      {p.roadmap && <a href={p.roadmap} target="_blank" rel="noreferrer" className="rounded-md bg-gold/10 hover:bg-gold/20 text-gold px-2 py-0.5">Roadmap</a>}
                      {p.course && <a href={p.course} target="_blank" rel="noreferrer" className="rounded-md bg-secondary/60 hover:bg-secondary px-2 py-0.5">Course</a>}
                      {p.practice && <a href={p.practice} target="_blank" rel="noreferrer" className="rounded-md bg-secondary/60 hover:bg-secondary px-2 py-0.5">Practice</a>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Missing — guided learning path</div>
            <div className="space-y-5">
              {((r.missing_skills as Array<{ name: string; priority: string; why: string; roadmap?: string; course?: string; practice?: string; weeks_to_job_ready?: number; steps?: string[]; youtube_videos?: Array<{ title: string; url: string }> }>) || []).map((m) => (
                <div key={m.name} className="rounded-xl border border-border/40 bg-background/30 p-4">
                  <div className="flex items-start gap-3">
                    <span className={`text-[10px] uppercase tracking-widest pt-1 ${m.priority === "high" ? "text-destructive" : m.priority === "medium" ? "text-warning" : "text-muted-foreground"}`}>{m.priority}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">{m.name}</div>
                        {m.weeks_to_job_ready ? <span className="text-[10px] uppercase tracking-widest text-gold/80">~{m.weeks_to_job_ready}w to job-ready</span> : null}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.why}</div>

                      {m.steps && m.steps.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-1.5">What to learn — in order</div>
                          <ol className="space-y-1 text-xs text-foreground/90">
                            {m.steps.map((s, i) => (
                              <li key={i} className="flex gap-2"><span className="text-gold/70 font-mono">{i + 1}.</span><span>{s}</span></li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {m.youtube_videos && m.youtube_videos.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-1.5">Watch</div>
                          <div className="flex flex-col gap-1">
                            {m.youtube_videos.map((v, i) => (
                              <a key={i} href={v.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 text-xs text-foreground/90 hover:text-gold">
                                <Youtube className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0"/>
                                <span className="underline-offset-2 hover:underline">{v.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 text-[10px] mt-3">
                        {m.roadmap && <a href={m.roadmap} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-gold/10 hover:bg-gold/20 text-gold px-2 py-0.5"><MapIcon className="h-3 w-3"/>roadmap.sh</a>}
                        {m.course && <a href={m.course} target="_blank" rel="noreferrer" className="rounded-md bg-secondary/60 hover:bg-secondary px-2 py-0.5">Course</a>}
                        {m.practice && <a href={m.practice} target="_blank" rel="noreferrer" className="rounded-md bg-secondary/60 hover:bg-secondary px-2 py-0.5">Practice</a>}
                      </div>
                    </div>
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
