import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateWeeklyTasks, getWeeklyTasks, toggleWeeklyTask } from "@/lib/weekly.functions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Wand2, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/weekly")({
  head: () => ({ meta: [{ title: "Weekly Plan — CareerOS" }] }),
  component: WeeklyPage,
});

type Task = { id: string; title: string; detail: string; hours: number; category: string; done?: boolean };

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly"] }),
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
