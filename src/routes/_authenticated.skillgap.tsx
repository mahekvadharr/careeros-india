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
  const { data } = useQuery({ queryKey: ["skillgap"], queryFn: () => getFn(), staleTime: 60_000, refetchOnWindowFocus: false });
  const [role, setRole] = useState<string>(TARGET_ROLES[0]);

  const mut = useMutation({
    mutationFn: runFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skillgap"] }),
  });

  const r = (mut.data?.result ?? data?.result) as Record<string, unknown> | undefined;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Skill Gap</p>
        <h1 className="font-display text-4xl gradient-text">See exactly what's between you and the role.</h1>
        <p className="text-muted-foreground mt-2 text-sm">Pick a target role. We map what's required, what you have, what's missing, and how long to close the gap.</p>
      </div>

      {/* Role selector */}
      <div className="card rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="flex-1 min-w-[220px] rounded-xl bg-secondary/60 border border-border/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <Button
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6 shrink-0"
          disabled={mut.isPending}
          onClick={() => mut.mutate({ data: { target_role: role } })}
        >
          {mut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
          Analyze gap
        </Button>
        {mut.error && <p className="w-full text-xs text-destructive">{(mut.error as Error).message}</p>}
      </div>

      {!r && !mut.isPending && (
        <div className="card rounded-2xl p-12 text-center text-muted-foreground">
          <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p>Select a role and run an analysis to see your skill gap.</p>
        </div>
      )}

      {mut.isPending && (
        <div className="card rounded-2xl p-12 text-center">
          <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Analyzing your profile against {role}…</p>
        </div>
      )}

      {r && !mut.isPending && (
        <div className="space-y-5">
          {/* Score header */}
          <div className="card rounded-2xl p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="text-center shrink-0">
              <div className="font-display text-5xl sm:text-7xl gold-text leading-none">{r.match_percentage as number}%</div>
              <div className="text-xs text-muted-foreground mt-1">match</div>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl gradient-text mb-1">Match for {r.target_role as string}</h3>
              <Progress value={r.match_percentage as number} className="h-2 mb-3" />
              <p className="text-sm text-muted-foreground">
                Estimated <span className="text-foreground font-semibold">{r.estimated_weeks as number} weeks</span> to close the gap.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Required skills */}
            <div className="card rounded-2xl p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Required skills</div>
              <ul className="space-y-2.5">
                {((r.required_skills as Array<{ name: string; importance: string }>) || []).map((s) => {
                  const matched = ((r.matched_skills as string[]) || []).map((x) => x.toLowerCase()).includes(s.name.toLowerCase());
                  return (
                    <li key={s.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className={`h-5 w-5 rounded-full grid place-items-center shrink-0 ${matched ? "bg-green-500/15 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {matched ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </span>
                        {s.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.importance}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Learning plan */}
            <div className="card rounded-2xl p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Learning plan</div>
              <ol className="space-y-3">
                {((r.learning_plan as Array<{ skill: string; weeks: number; resource: string; roadmap?: string; course?: string }>) || []).map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="h-6 w-6 rounded-lg icon-glow-gold grid place-items-center text-xs font-bold shrink-0">{i + 1}</div>
                    <div>
                      <div className="text-sm font-medium">{p.skill} <span className="text-xs text-muted-foreground">· {p.weeks}w</span></div>
                      <div className="text-xs text-muted-foreground">{p.resource}</div>
                      <div className="flex gap-1.5 mt-1">
                        {p.roadmap && <a href={p.roadmap} target="_blank" rel="noreferrer" className="text-[10px] rounded bg-primary/10 text-primary px-1.5 py-0.5 hover:bg-primary/20">Roadmap</a>}
                        {p.course && <a href={p.course} target="_blank" rel="noreferrer" className="text-[10px] rounded bg-secondary/60 px-1.5 py-0.5 hover:bg-secondary">Course</a>}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Missing skills — detailed cards */}
          <div className="card rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Missing — guided learning path</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {((r.missing_skills as Array<{ name: string; priority: string; why: string; roadmap?: string; course?: string; practice?: string; weeks_to_job_ready?: number; steps?: string[]; youtube_videos?: Array<{ title: string; url: string }> }>) || []).map((m, idx) => {
                const priorityColor = m.priority === "high" ? "badge-red" : m.priority === "medium" ? "badge-gold" : "text-muted-foreground text-xs";
                const videos = (m.youtube_videos ?? []).map((v) => ({ title: v.title, url: canonicalYouTubeWatch(v.url) })).filter((v) => v.url).slice(0, 2);
                return (
                  <div key={idx} className="rounded-xl bg-secondary/30 border border-border/40 p-4 hover:border-border transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-display text-base leading-tight">{m.name}</h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={priorityColor}>{m.priority}</span>
                        {m.weeks_to_job_ready && <span className="badge-gold text-[9px]">~{m.weeks_to_job_ready}w</span>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{m.why}</p>
                    {m.steps && m.steps.length > 0 && (
                      <ol className="space-y-1 mb-3">
                        {m.steps.slice(0, 3).map((s, i) => (
                          <li key={i} className="flex gap-2 text-xs">
                            <span className="text-primary/60 font-mono">{String(i + 1).padStart(2, "0")}</span>
                            <span className="text-foreground/80">{s}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {videos.map((v, i) => (
                        <a key={i} href={v.url!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] rounded-lg border border-red-500/20 bg-red-500/8 text-red-400 px-2 py-1 hover:bg-red-500/15 transition-colors truncate max-w-[140px]">
                          <Youtube className="h-3 w-3 shrink-0" /><span className="truncate">{v.title}</span>
                        </a>
                      ))}
                      {m.roadmap && <a href={m.roadmap} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] rounded-lg border border-primary/20 bg-primary/8 text-primary px-2 py-1 hover:bg-primary/15 transition-colors"><MapIcon className="h-3 w-3" /> Roadmap</a>}
                    </div>
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
