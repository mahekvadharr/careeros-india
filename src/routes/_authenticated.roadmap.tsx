import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateRoadmap, getRoadmap } from "@/lib/roadmap.functions";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Career Roadmap — CareerOS" }] }),
  component: RoadmapPage,
});

type ItemResources = { roadmap?: string; course?: string; practice?: string; portfolio_project?: string };
type Item = { title: string; description: string; category: string; resources?: ItemResources };
type Semester = { semester: number; title: string; focus: string; items: Item[] };

const FOCUS_COLORS: Record<string, string> = {
  DSA: "icon-glow-gold",
  Backend: "icon-glow-teal",
  Frontend: "icon-glow-indigo",
  "System Design": "icon-glow-rose",
  Interview: "icon-glow-amber",
  default: "icon-glow-gold",
};

function RoadmapPage() {
  const getFn = useServerFn(getRoadmap);
  const genFn = useServerFn(generateRoadmap);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["roadmap"], queryFn: () => getFn(), staleTime: 60_000, refetchOnWindowFocus: false });
  const gen = useMutation({
    mutationFn: () => genFn(),
    onSuccess: () => { toast.success("Roadmap generated."); qc.invalidateQueries({ queryKey: ["roadmap"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const semesters = (data?.roadmap?.semesters as Semester[] | undefined) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Career GPS</p>
          <h1 className="font-display text-4xl gradient-text">Your semester-wise plan</h1>
          <p className="mt-2 text-sm text-muted-foreground">Tailored to your branch, year, and dream companies.</p>
        </div>
        <Button onClick={() => gen.mutate()} disabled={gen.isPending} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6 shrink-0">
          {gen.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
          {semesters.length ? "Regenerate" : "Generate roadmap"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 text-gold animate-spin" /></div>
      ) : !semesters.length ? (
        <div className="card rounded-2xl p-12 text-center">
          <div className="h-14 w-14 rounded-2xl icon-glow-gold mx-auto mb-4 grid place-items-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl gradient-text">No roadmap yet</h2>
          <p className="text-muted-foreground mt-2 text-sm">Click generate — Gemini will craft a 6-8 semester plan in seconds.</p>
        </div>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-3 top-4 bottom-4 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
          <div className="space-y-5">
            {semesters.map((s, si) => {
              const colorKey = Object.keys(FOCUS_COLORS).find(k => s.focus.includes(k)) ?? "default";
              const colorClass = FOCUS_COLORS[colorKey];
              return (
                <div key={s.semester} className="relative">
                  <div className="absolute -left-[21px] top-6 h-4 w-4 rounded-full bg-primary shadow-gold ring-4 ring-background grid place-items-center">
                    <span className="text-[8px] font-bold text-primary-foreground">{si + 1}</span>
                  </div>
                  <div className="card rounded-2xl overflow-hidden">
                    {/* Semester header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Semester {s.semester}</span>
                        <h3 className="font-display text-xl gradient-text leading-tight">{s.title}</h3>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${colorClass}`}>{s.focus}</span>
                    </div>
                    {/* Items grid */}
                    <div className="p-4 grid sm:grid-cols-2 gap-3">
                      {s.items.map((item, idx) => (
                        <div key={idx} className="rounded-xl bg-secondary/30 border border-border/40 p-4 hover:border-border transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm leading-tight">{item.title}</h4>
                            <span className="text-[9px] uppercase tracking-widest text-primary/70 bg-primary/8 px-1.5 py-0.5 rounded">{item.category}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                          {item.resources && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.resources.roadmap && (
                                <a href={item.resources.roadmap} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] rounded-md bg-primary/8 hover:bg-primary/15 text-primary px-2 py-1 transition-colors">
                                  <ExternalLink className="h-2.5 w-2.5" /> Roadmap
                                </a>
                              )}
                              {item.resources.course && (
                                <a href={item.resources.course} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] rounded-md bg-secondary/60 hover:bg-secondary px-2 py-1 transition-colors">
                                  Course
                                </a>
                              )}
                              {item.resources.practice && (
                                <a href={item.resources.practice} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] rounded-md bg-secondary/60 hover:bg-secondary px-2 py-1 transition-colors">
                                  Practice
                                </a>
                              )}
                            </div>
                          )}
                          {item.resources?.portfolio_project && (
                            <p className="text-[11px] text-muted-foreground italic mt-2">🛠 {item.resources.portfolio_project}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
