import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { analyzeResume, listResumeAnalyses } from "@/lib/resume.functions";
import { getUsage } from "@/lib/usage.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, Sparkles, AlertCircle, TrendingUp } from "lucide-react";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume Analyzer — CareerOS" }] }),
  component: ResumePage,
});

function ResumePage() {
  const qc = useQueryClient();
  const analyzeFn = useServerFn(analyzeResume);
  const listFn = useServerFn(listResumeAnalyses);
  const usageFn = useServerFn(getUsage);

  const { data: list } = useQuery({ queryKey: ["resume-list"], queryFn: () => listFn(), staleTime: 60_000, refetchOnWindowFocus: false });
  const { data: usage } = useQuery({ queryKey: ["usage"], queryFn: () => usageFn() });

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const mut = useMutation({
    mutationFn: analyzeFn,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["resume-list"] }); qc.invalidateQueries({ queryKey: ["usage"] }); },
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    if (f.type !== "application/pdf") { setErr("Please upload a PDF."); return; }
    if (f.size > 8 * 1024 * 1024) { setErr("PDF must be under 8 MB."); return; }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = () => rej(new Error("Could not read file"));
        r.readAsDataURL(f);
      });
      await mut.mutateAsync({ data: { file_name: f.name, file_data: base64 } });
    } catch (e: unknown) {
      const msg = (e as Error).message || "Failed to analyze";
      if (msg.includes("FREE_LIMIT_REACHED")) setShowUpgrade(true);
      else setErr(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const latest = list?.analyses?.[0];
  const used = usage?.usage.resume_analyses ?? 0;
  const limit = usage?.limits.resume_analyses ?? 2;
  const isPro = usage?.is_pro;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Resume Analyzer</p>
        <h1 className="font-display text-4xl gradient-text">Know why recruiters skip your resume.</h1>
        <p className="text-muted-foreground mt-2 text-sm">Upload your PDF. AI scores it across 6 dimensions and tells you exactly what to fix.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Upload card */}
        <div className="card rounded-2xl p-6">
          <h3 className="font-display text-lg mb-1">Upload resume</h3>
          <p className="text-xs text-muted-foreground mb-5">PDF only · up to 8 MB</p>
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
          <Button
            className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11"
            disabled={uploading || mut.isPending}
            onClick={() => fileRef.current?.click()}
          >
            {uploading || mut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {mut.isPending ? "Analyzing…" : "Choose PDF"}
          </Button>
          {err && (
            <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">{err}</p>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-border/40">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Analyses used</span>
              <span className="font-medium">{isPro ? "Unlimited" : `${used} / ${limit}`}</span>
            </div>
            {!isPro && <Progress value={(used / limit) * 100} className="h-1.5" />}
            {!isPro && used >= limit && (
              <Button size="sm" variant="outline" className="w-full mt-3 rounded-lg" onClick={() => setShowUpgrade(true)}>
                <Sparkles className="h-3 w-3 mr-1" /> Unlock unlimited
              </Button>
            )}
          </div>

          {/* History */}
          {list?.analyses && list.analyses.length > 1 && (
            <div className="mt-5 pt-5 border-t border-border/40">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">History</p>
              <div className="space-y-2">
                {list.analyses.slice(1).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <div className="text-xs font-medium truncate max-w-[140px]">{a.file_name}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="font-display text-lg gold-text">{a.overall_score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Analysis */}
        <div className="lg:col-span-2">
          {!latest && !mut.isPending && (
            <div className="card rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="h-14 w-14 rounded-2xl icon-glow-teal mx-auto mb-4 grid place-items-center">
                <FileText className="h-6 w-6" />
              </div>
              <p className="font-display text-xl gradient-text">Upload a resume to get started</p>
              <p className="text-sm text-muted-foreground mt-2">You'll get a score across 6 dimensions + actionable fixes.</p>
            </div>
          )}
          {mut.isPending && (
            <div className="card rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
              <p className="font-display text-xl gradient-text">Analyzing your resume…</p>
              <p className="text-sm text-muted-foreground mt-2">Gemini is reading it carefully. Takes 15–30 seconds.</p>
            </div>
          )}
          {latest && !mut.isPending && <AnalysisView analysis={latest} />}
        </div>
      </div>

      <ProUpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} source="resume-limit" />
    </div>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const color = value >= 70 ? "badge-green" : value >= 45 ? "badge-gold" : "badge-red";
  return <span className={color}>{value}</span>;
}

function AnalysisView({ analysis }: { analysis: Record<string, unknown> }) {
  const f = (analysis.feedback ?? {}) as Record<string, unknown>;
  const subScores = [
    { label: "ATS",        value: analysis.ats_score as number,        colorClass: "icon-glow-teal" },
    { label: "Keywords",   value: analysis.keyword_score as number,     colorClass: "icon-glow-indigo" },
    { label: "Projects",   value: analysis.project_score as number,     colorClass: "icon-glow-emerald" },
    { label: "Experience", value: analysis.experience_score as number,  colorClass: "icon-glow-gold" },
    { label: "Formatting", value: analysis.formatting_score as number,  colorClass: "icon-glow-rose" },
  ];

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="card rounded-2xl p-6 flex items-start gap-6">
        <div className="text-center shrink-0">
          <div className="font-display text-7xl gold-text leading-none">{analysis.overall_score as number}</div>
          <div className="text-xs text-muted-foreground mt-1">/100</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-gold" />
            <span className="text-sm font-semibold">Overall Score</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.summary as string}</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {subScores.map((s) => (
              <div key={s.label} className={`rounded-xl p-3 text-center ${s.colorClass}`}>
                <div className="font-display text-xl">{s.value}</div>
                <div className="text-[10px] mt-1 opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top fixes */}
      {(f.top_fixes as Array<{ title: string; detail: string; priority: string }>)?.length > 0 && (
        <div className="card rounded-2xl p-5">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Top fixes</div>
          <div className="space-y-3">
            {(f.top_fixes as Array<{ title: string; detail: string; priority: string }>).map((x, i) => (
              <div key={i} className="flex gap-3">
                <span className={`text-[10px] uppercase font-bold tracking-wider shrink-0 mt-1 ${x.priority === "high" ? "text-red-400" : x.priority === "medium" ? "text-amber-400" : "text-muted-foreground"}`}>
                  {x.priority}
                </span>
                <div>
                  <div className="text-sm font-medium">{x.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{x.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <ChipCard title="Missing keywords" items={(f.missing_keywords as string[]) || []} colorClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" />
        <ChipCard title="Missing skills"   items={(f.missing_skills   as string[]) || []} colorClass="bg-teal-500/10 text-teal-400 border border-teal-500/20" />
        <ChipCard title="Weak action verbs" items={(f.weak_action_verbs as string[]) || []} colorClass="bg-rose-500/10 text-rose-400 border border-rose-500/20" />
        {(f.length_recommendation as string) && (
          <div className="card rounded-xl p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Length</div>
            <p className="text-sm">{f.length_recommendation as string}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChipCard({ title, items, colorClass }: { title: string; items: string[]; colorClass: string }) {
  if (!items.length) return null;
  return (
    <div className="card rounded-xl p-4">
      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => (
          <span key={t} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${colorClass}`}>{t}</span>
        ))}
      </div>
    </div>
  );
}
