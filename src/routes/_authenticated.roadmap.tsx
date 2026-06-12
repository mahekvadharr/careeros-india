import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateRoadmap, getRoadmap } from "@/lib/roadmap.functions";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Career Roadmap — CareerOS" }] }),
  component: RoadmapPage,
});

type ItemResources = { roadmap?: string; course?: string; practice?: string; portfolio_project?: string };
type Item = { title: string; description: string; category: string; resources?: ItemResources };
type Semester = { semester: number; title: string; focus: string; items: Item[] };

function RoadmapPage() {
  const getFn = useServerFn(getRoadmap);
  const genFn = useServerFn(generateRoadmap);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["roadmap"], queryFn: () => getFn() });
  const gen = useMutation({
    mutationFn: () => genFn(),
    onSuccess: () => { toast.success("Roadmap generated."); qc.invalidateQueries({ queryKey: ["roadmap"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const semesters = (data?.roadmap?.semesters as Semester[] | undefined) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Roadmap</p>
          <h1 className="font-display text-4xl gradient-text">Your semester-wise plan</h1>
          <p className="mt-2 text-muted-foreground">Tailored to your branch, year, and dream companies.</p>
        </div>
        <Button onClick={() => gen.mutate()} disabled={gen.isPending} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6">
          {gen.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Wand2 className="h-4 w-4 mr-2"/>}
          {semesters.length ? "Regenerate" : "Generate roadmap"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 text-gold animate-spin"/></div>
      ) : !semesters.length ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <Sparkles className="h-8 w-8 text-gold mx-auto mb-4"/>
          <h2 className="font-display text-2xl gradient-text">No roadmap yet</h2>
          <p className="text-muted-foreground mt-2">Click generate — Gemini will craft a 6-8 semester plan in a few seconds.</p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-transparent" />
          <div className="space-y-6">
            {semesters.map((s) => (
              <div key={s.semester} className="relative">
                <div className="absolute -left-[18px] top-7 h-3 w-3 rounded-full bg-primary shadow-gold ring-4 ring-background" />
                <div className="glass-card rounded-3xl p-7">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Semester {s.semester}</p>
                      <h3 className="font-display text-2xl gradient-text">{s.title}</h3>
                    </div>
                    <span className="text-xs text-gold uppercase tracking-widest">{s.focus}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {s.items.map((i, idx) => (
                      <div key={idx} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-medium text-sm">{i.title}</h4>
                          <span className="text-[9px] uppercase tracking-widest text-gold/80">{i.category}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{i.description}</p>
                        {i.resources && (
                          <div className="mt-3 space-y-1.5">
                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                              {i.resources.roadmap && <a href={i.resources.roadmap} target="_blank" rel="noreferrer" className="rounded-md bg-gold/10 hover:bg-gold/20 text-gold px-2 py-0.5">Roadmap</a>}
                              {i.resources.course && <a href={i.resources.course} target="_blank" rel="noreferrer" className="rounded-md bg-secondary/60 hover:bg-secondary px-2 py-0.5">Course</a>}
                              {i.resources.practice && <a href={i.resources.practice} target="_blank" rel="noreferrer" className="rounded-md bg-secondary/60 hover:bg-secondary px-2 py-0.5">Practice</a>}
                            </div>
                            {i.resources.portfolio_project && (
                              <p className="text-[11px] text-muted-foreground italic">🛠 Project: {i.resources.portfolio_project}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
