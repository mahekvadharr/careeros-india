import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateWeeklyTasks, getWeeklyTasks, toggleWeeklyTask } from "@/lib/weekly.functions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Loader2, Wand2, Calendar, Rocket, BookOpen, Dumbbell, Clock, Youtube, Map as MapIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { canonicalYouTubeWatch } from "@/lib/yt";

export const Route = createFileRoute("/_authenticated/weekly")({
  head: () => ({ meta: [{ title: "Weekly Plan — CareerOS" }] }),
  component: WeeklyPage,
});

type TaskResources = { start_here?: string; learn?: string; practice?: string; roadmap?: string; youtube?: string; estimated_minutes?: number };
type Task = { id: string; title: string; detail: string; hours: number; category: string; done?: boolean; resources?: TaskResources };

const CATEGORY_COLORS: Record<string, string> = {
  DSA: "badge-gold",
  Project: "icon-glow-teal",
  Internship: "icon-glow-emerald",
  Skill: "icon-glow-indigo",
  Resume: "icon-glow-rose",
  default: "badge-gold",
};

function WeeklyPage() {
  const getFn = useServerFn(getWeeklyTasks);
  const genFn = useServerFn(generateWeeklyTasks);
  const toggleFn = useServerFn(toggleWeeklyTask);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["weekly"], queryFn: () => getFn(), staleTime: 60_000, refetchOnWindowFocus: false });
  const gen = useMutation({
    mutationFn: () => genFn(),
    onSuccess: () => { toast.success("This week's plan is ready."); qc.invalidateQueries({ queryKey: ["weekly"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const toggle = useMutation({
    mutationFn: (taskId: string) => toggleFn({ data: { taskId } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["weekly"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      if (res?.xpAwarded) toast.success(`+${res.xpAwarded} XP · ${res.streakDays}-day streak 🔥`);
    },
  });

  const tasks = (data?.plan?.tasks as Task[] | undefined) ?? [];
  const totalHours = tasks.reduce((s, t) => s + (t.hours || 0), 0);
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Weekly Mission</p>
          <h1 className="font-display text-4xl gradient-text">This week, here's the move.</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Week of {data?.week_start}</span>
            <span>·</span>
            <span>{totalHours}h total</span>
          </div>
        </div>
        <Button onClick={() => gen.mutate()} disabled={gen.isPending} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6 shrink-0">
          {gen.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
          {tasks.length ? "Regenerate" : "Generate week"}
        </Button>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="card rounded-2xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Week progress</span>
              <span className="text-sm text-muted-foreground">{done}/{tasks.length} tasks</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
          <div className="text-right shrink-0">
            <div className="font-display text-3xl gold-text">{pct}%</div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 text-gold animate-spin" /></div>
      ) : !tasks.length ? (
        <div className="card rounded-2xl p-12 text-center">
          <div className="h-14 w-14 rounded-2xl icon-glow-gold mx-auto mb-4 grid place-items-center">
            <Wand2 className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl gradient-text">No plan yet for this week</h2>
          <p className="text-muted-foreground mt-2 text-sm">One click — Gemini drafts a focused week tailored to you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t, idx) => (
            <div
              key={t.id}
              className={`card rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 hover:border-border ${t.done ? "opacity-50" : ""}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <Checkbox
                checked={!!t.done}
                onCheckedChange={() => toggle.mutate(t.id)}
                className="mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 mb-1">
                  <h3 className={`font-semibold text-sm leading-snug ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</h3>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="badge-gold text-[10px]">{t.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{t.hours}h</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.detail}</p>
                {t.done && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                  </div>
                )}
                {t.resources && !t.done && (
                  <div className="mt-3 p-3 rounded-xl bg-secondary/30 border border-border/40">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Resources</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {t.resources.start_here && (
                        <a href={t.resources.start_here} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1.5 transition-colors">
                          <Rocket className="h-3 w-3" /> Start here
                        </a>
                      )}
                      {t.resources.learn && (
                        <a href={t.resources.learn} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-secondary/60 hover:bg-secondary px-2.5 py-1.5 transition-colors">
                          <BookOpen className="h-3 w-3" /> Learn
                        </a>
                      )}
                      {t.resources.practice && (
                        <a href={t.resources.practice} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-secondary/60 hover:bg-secondary px-2.5 py-1.5 transition-colors">
                          <Dumbbell className="h-3 w-3" /> Practice
                        </a>
                      )}
                      {t.resources.roadmap && (
                        <a href={t.resources.roadmap} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1.5 transition-colors">
                          <MapIcon className="h-3 w-3" /> roadmap.sh
                        </a>
                      )}
                      {(() => {
                        const yt = canonicalYouTubeWatch(t.resources?.youtube);
                        return yt ? (
                          <a href={yt} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1.5 transition-colors">
                            <Youtube className="h-3 w-3" /> Watch
                          </a>
                        ) : null;
                      })()}
                      {t.resources.estimated_minutes && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground px-1">
                          <Clock className="h-3 w-3" /> ~{t.resources.estimated_minutes}min
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
