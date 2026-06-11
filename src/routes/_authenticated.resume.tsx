import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { analyzeResume, listResumeAnalyses } from "@/lib/resume.functions";
import { getUsage } from "@/lib/usage.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, Sparkles, AlertCircle } from "lucide-react";
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

  const { data: list } = useQuery({ queryKey: ["resume-list"], queryFn: () => listFn() });
  const { data: usage } = useQuery({ queryKey: ["usage"], queryFn: () => usageFn() });

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const mut = useMutation({
    mutationFn: analyzeFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume-list"] });
      qc.invalidateQueries({ queryKey: ["usage"] });
    },
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
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Resume Analyzer</p>
        <h1 className="font-display text-4xl gradient-text mt-2">Know why recruiters are skipping your resume.</h1>
        <p className="text-muted-foreground mt-2">Upload your PDF resume. AI scores it across 6 dimensions and tells you exactly what to fix.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 glass-card rounded-3xl p-6">
          <h3 className="font-display text-lg mb-2">Upload resume</h3>
          <p className="text-xs text-muted-foreground mb-4">PDF only · up to 8 MB</p>
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
          <Button
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            disabled={uploading || mut.isPending}
            onClick={() => fileRef.current?.click()}
          >
            {uploading || mut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {mut.isPending ? "Analyzing…" : "Choose PDF"}
          </Button>
          {err && <p className="mt-3 text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{err}</p>}

          <div className="mt-6 border-t border-border/40 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">This month</span>
              <span className="text-foreground">{isPro ? "Unlimited" : `${used}/${limit}`}</span>
            </div>
            {!isPro && <Progress value={(used / limit) * 100} className="mt-2 h-1.5" />}
            {!isPro && used >= limit && (
              <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => setShowUpgrade(true)}>
                <Sparkles className="h-3 w-3 mr-1" /> Unlock unlimited
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!latest && !mut.isPending && (
            <div className="glass-card rounded-3xl p-10 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Upload a resume to see your scores and personalized feedback.</p>
            </div>
          )}
          {latest && <AnalysisView analysis={latest} />}
        </div>
      </div>

      {list?.analyses && list.analyses.length > 1 && (
        <div className="mt-10">
          <h3 className="font-display text-xl mb-3">History</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {list.analyses.slice(1).map((a) => (
              <div key={a.id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{a.file_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-2xl font-display gold-text">{a.overall_score}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProUpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} source="resume-limit" />
    </div>
  );
}

function AnalysisView({ analysis }: { analysis: Record<string, unknown> }) {
  const f = (analysis.feedback ?? {}) as Record<string, unknown>;
  const scores = [
    { label: "Overall", value: analysis.overall_score as number, big: true },
    { label: "ATS", value: analysis.ats_score as number },
    { label: "Keywords", value: analysis.keyword_score as number },
    { label: "Projects", value: analysis.project_score as number },
    { label: "Experience", value: analysis.experience_score as number },
    { label: "Formatting", value: analysis.formatting_score as number },
  ];

  return (
    <div className="space-y-5">
      <div className="glass-card rounded-3xl p-7">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Overall</p>
            <div className="font-display text-7xl gold-text mt-1">{analysis.overall_score as number}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
          <div className="text-right max-w-xs">
            <p className="text-sm text-foreground/80">{f.summary as string}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {scores.slice(1).map((s) => (
            <div key={s.label} className="rounded-2xl bg-secondary/40 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <div className="font-display text-2xl mt-1">{s.value}</div>
              <Progress value={s.value} className="mt-2 h-1" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FeedbackList title="Top fixes" items={(f.top_fixes as Array<{ title: string; detail: string; priority: string }>) || []} renderItem={(x) => (
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-widest ${x.priority === "high" ? "text-destructive" : x.priority === "medium" ? "text-warning" : "text-muted-foreground"}`}>{x.priority}</span>
              <span className="text-sm font-medium">{x.title}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{x.detail}</p>
          </div>
        )} />
        <FeedbackChips title="Missing keywords" items={(f.missing_keywords as string[]) || []} />
        <FeedbackChips title="Weak action verbs" items={(f.weak_action_verbs as string[]) || []} />
        <FeedbackChips title="Missing skills" items={(f.missing_skills as string[]) || []} />
        <FeedbackList title="Quantify these" items={((f.missing_quantified_achievements as string[]) || []).map((s) => ({ s }))} renderItem={(x) => <p className="text-sm">{x.s}</p>} />
        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Length</div>
          <p className="text-sm mt-2">{(f.length_recommendation as string) || "—"}</p>
        </div>
      </div>
    </div>
  );
}

function FeedbackList<T>({ title, items, renderItem }: { title: string; items: T[]; renderItem: (x: T) => React.ReactNode }) {
  if (!items.length) return null;
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">{title}</div>
      <div className="space-y-3">{items.map((x, i) => <div key={i}>{renderItem(x)}</div>)}</div>
    </div>
  );
}

function FeedbackChips({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => <span key={t} className="text-xs px-2 py-1 rounded-full bg-secondary/60">{t}</span>)}
      </div>
    </div>
  );
}
