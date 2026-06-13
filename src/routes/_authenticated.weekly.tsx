import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateWeeklyTasks, getWeeklyTasks, toggleWeeklyTask } from "@/lib/weekly.functions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Wand2, Calendar, Rocket, BookOpen, Dumbbell, Clock, Youtube, Map as MapIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/weekly")({
  head: () => ({ meta: [{ title: "Weekly Plan — CareerOS" }] }),
  component: WeeklyPage,
});

type TaskResources = { start_here?: string; learn?: string; practice?: string; roadmap?: string; youtube?: string; estimated_minutes?: number };
type Task = { id: string; title: string; detail: string; hours: number; category: string; done?: boolean; resources?: TaskResources };

function WeeklyPage() {
  const getFn = useServerFn(getWeeklyTasks);
  const genFn = useServerFn(generateWeeklyTasks);
  const toggleFn = useServerFn(toggleWeeklyTask);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["weekly"], queryFn: () => getFn() });
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
      if (res?.xpAwarded) {
        toast.success(`+${res.xpAwarded} XP · ${res.streakDays}-day streak 🔥`);
      }
    },
  });

  const tasks = (data?.plan?.tasks as Task[] | undefined) ?? [];
  const totalHours = tasks.reduce((s, t) => s + (t.hours || 0), 0);
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Weekly Plan</p>
          <h1 className="font-display text-4xl gradient-text">This week, here's the move.</h1>
          <p className="mt-2 text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>Week of {data?.week_start} · {totalHours}h total · {done}/{tasks.length} done</p>
        </div>
        <Button onClick={() => gen.mutate()} disabled={gen.isPending} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6">
          {gen.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Wand2 className="h-4 w-4 mr-2"/>}
          {tasks.length ? "Regenerate week" : "Generate week"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 text-gold animate-spin"/></div>
      ) : !tasks.length ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <h2 className="font-display text-2xl gradient-text">No plan yet for this week</h2>
          <p className="text-muted-foreground mt-2">One click — Gemini drafts a focused week tailored to you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t.id} className={`glass-card rounded-2xl p-5 flex items-start gap-4 transition-opacity ${t.done ? "opacity-60" : ""}`}>
              <Checkbox checked={!!t.done} onCheckedChange={() => toggle.mutate(t.id)} className="mt-1"/>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className={`font-medium ${t.done ? "line-through" : ""}`}>{t.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase tracking-widest text-gold/80">{t.category}</span>
                    <span className="text-xs text-muted-foreground">{t.hours}h</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t.detail}</p>
                {t.resources && (
                  <div className="mt-3 rounded-xl border border-border/40 bg-background/40 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-2">Resources</div>
                    {!(t.resources.start_here || t.resources.learn || t.resources.practice || t.resources.roadmap || t.resources.youtube) ? (
                      <p className="text-xs text-muted-foreground italic">Resource currently unavailable for this task.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {t.resources.start_here && (
                          <a href={t.resources.start_here} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 rounded-md bg-gold/10 hover:bg-gold/20 text-gold px-2.5 py-1 transition-colors">
                            <Rocket className="h-3 w-3"/> Start here
                          </a>
                        )}
                        {t.resources.learn && (
                          <a href={t.resources.learn} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 rounded-md bg-secondary/60 hover:bg-secondary px-2.5 py-1 transition-colors">
                            <BookOpen className="h-3 w-3"/> Learn
                          </a>
                        )}
                        {t.resources.practice && (
                          <a href={t.resources.practice} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 rounded-md bg-secondary/60 hover:bg-secondary px-2.5 py-1 transition-colors">
                            <Dumbbell className="h-3 w-3"/> Practice
                          </a>
                        )}
                        {t.resources.roadmap && (
                          <a href={t.resources.roadmap} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 rounded-md bg-gold/10 hover:bg-gold/20 text-gold px-2.5 py-1 transition-colors">
                            <MapIcon className="h-3 w-3"/> roadmap.sh
                          </a>
                        )}
                        {t.resources.youtube && (
                          <a href={t.resources.youtube} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 transition-colors">
                            <Youtube className="h-3 w-3"/> Watch
                          </a>
                        )}
                        {t.resources.estimated_minutes ? (
                          <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-muted-foreground">
                            <Clock className="h-3 w-3"/> ~{t.resources.estimated_minutes} min
                          </span>
                        ) : null}
                      </div>
                    )}
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
