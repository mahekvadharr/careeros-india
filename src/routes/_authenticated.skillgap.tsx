import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { analyzeSkillGap, latestSkillGap, TARGET_ROLES } from "@/lib/skillgap.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Check, X, TrendingUp, Youtube, Map as MapIcon } from "lucide-react";
import { canonicalYouTubeWatch } from "@/lib/yt";

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

          <div className="glass-card rounded-2xl p-5 animate-fade-in">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Missing — guided learning path</div>
            <div className="grid gap-4">
              {((r.missing_skills as Array<{ name: string; priority: string; why: string; roadmap?: string; course?: string; practice?: string; weeks_to_job_ready?: number; steps?: string[]; youtube_videos?: Array<{ title: string; url: string }> }>) || []).map((m, idx) => {
                const dot = m.priority === "high" ? "bg-destructive" : m.priority === "medium" ? "bg-warning" : "bg-muted-foreground";
                const videos = (m.youtube_videos ?? [])
                  .map((v) => ({ title: v.title, url: canonicalYouTubeWatch(v.url) }))
                  .filter((v) => v.url)
                  .slice(0, 3);
                const hasRoadmap = !!m.roadmap;
                const hasCourse = !!m.course;
                const hasPractice = !!m.practice;
                return (
                  <div
                    key={m.name}
                    style={{ animationDelay: `${idx * 60}ms` }}
                    className="group relative rounded-2xl border border-border/40 bg-background/40 p-5 transition-all duration-300 hover:border-gold/40 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-12px_hsl(var(--gold)/0.3)] animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`h-2 w-2 rounded-full ${dot} shrink-0`} />
                        <h3 className="font-display text-lg leading-tight truncate">{m.name}</h3>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.priority}</span>
                      </div>
                      {m.weeks_to_job_ready ? (
                        <span className="shrink-0 rounded-full bg-gold/10 text-gold text-[10px] uppercase tracking-widest px-2.5 py-1">~{m.weeks_to_job_ready}w</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{m.why}</p>

                    {m.steps && m.steps.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-2">Roadmap steps</div>
                        <ol className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                          {m.steps.map((s, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-gold/70 font-mono text-xs pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                              <span className="text-foreground/90">{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {(videos.length > 0 || hasRoadmap || hasCourse || hasPractice) ? (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-2">Resources</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {videos.map((v, i) => (
                            <a
                              key={i}
                              href={v.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="group/link flex items-center gap-2 rounded-lg border border-border/40 bg-secondary/30 px-3 py-2 text-xs hover:border-red-500/50 hover:bg-red-500/5 transition-colors"
                            >
                              <Youtube className="h-4 w-4 text-red-500 shrink-0" />
                              <span className="truncate group-hover/link:text-foreground">{v.title}</span>
                            </a>
                          ))}
                          {hasRoadmap && (
                            <a href={m.roadmap} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-gold hover:bg-gold/10 transition-colors">
                              <MapIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate">roadmap.sh</span>
                            </a>
                          )}
                          {hasCourse && (
                            <a href={m.course} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 rounded-lg border border-border/40 bg-secondary/30 px-3 py-2 text-xs hover:bg-secondary/60 transition-colors">
                              <span className="text-gold/70">📘</span>
                              <span className="truncate">Course</span>
                            </a>
                          )}
                          {hasPractice && (
                            <a href={m.practice} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 rounded-lg border border-border/40 bg-secondary/30 px-3 py-2 text-xs hover:bg-secondary/60 transition-colors">
                              <span className="text-gold/70">⚡</span>
                              <span className="truncate">Practice</span>
                            </a>
                          )}
                        </div>
                        {!hasRoadmap && (
                          <p className="text-[10px] text-muted-foreground/70 italic mt-2">No official roadmap available yet.</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <p className="text-xs text-muted-foreground italic">Resource currently unavailable — we only show hand-verified links.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
