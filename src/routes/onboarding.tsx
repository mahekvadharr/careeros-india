import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveOnboarding, getProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Loader2, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — CareerOS" }] }),
  component: Onboarding,
});

const STEPS = ["Basics", "Goals", "Skills", "You"];

function Onboarding() {
  const nav = useNavigate();
  const save = useServerFn(saveOnboarding);
  const fetchProfile = useServerFn(getProfile);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const [branch, setBranch] = useState("Computer Science");
  const [year, setYear] = useState<number>(2);
  const [career, setCareer] = useState("");
  const [companies, setCompanies] = useState("");
  const [skills, setSkills] = useState("");
  const [confidence, setConfidence] = useState<number[]>([5]);
  const [hours, setHours] = useState<number[]>([10]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) { nav({ to: "/auth" }); return; }
      const p = await fetchProfile();
      if (p.profile?.onboarded) { nav({ to: "/dashboard" }); return; }
      setReady(true);
    });
  }, [nav, fetchProfile]);

  async function submit() {
    setLoading(true);
    try {
      await save({
        data: {
          branch, year,
          target_career: career || "Software Engineer",
          dream_companies: companies.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10),
          current_skills: skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30),
          confidence_level: confidence[0],
          weekly_hours: hours[0],
        },
      });
      toast.success("Profile saved. Welcome to CareerOS.");
      nav({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setLoading(false); }
  }

  if (!ready) return (
    <div className="min-h-screen grid place-items-center bg-background">
      <Loader2 className="h-6 w-6 text-gold animate-spin" />
    </div>
  );

  const stepTitles = ["Tell us about you", "What's the dream?", "Where are you now?", "How much time do you have?"];
  const stepSubtitles = [
    "We'll tailor the roadmap to your branch and year.",
    "Be specific. Specific goals get specific plans.",
    "List what you already know. Honesty unlocks the right plan.",
    "Real talk: how many hours a week, and how confident are you today?",
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-80 shrink-0 border-r border-border/40 p-8 bg-card/40">
        <div className="flex items-center gap-2.5 mb-12">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-amber-700 shadow-gold grid place-items-center">
            <span className="text-primary-foreground font-bold text-xs">C</span>
          </div>
          <span className="font-display text-lg font-bold">CareerOS</span>
        </div>
        <div className="space-y-2 flex-1">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              i === step ? "bg-primary/10 border border-primary/20" :
              i < step  ? "text-muted-foreground" : "text-muted-foreground/40"
            }`}>
              <div className={`h-6 w-6 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
                i < step  ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary/20 text-primary border border-primary/40" :
                "bg-border text-muted-foreground/40"
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? "text-foreground" : ""}`}>{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto p-4 rounded-2xl bg-primary/5 border border-primary/15">
          <Sparkles className="h-5 w-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground leading-relaxed">Takes 2 minutes. Gives you a semester-by-semester plan for your exact branch and goal.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Mobile step indicator */}
          <div className="flex items-center gap-1.5 mb-8 lg:hidden">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full flex-1 transition-all ${i <= step ? "bg-primary" : "bg-secondary"}`} />
            ))}
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Step {step + 1} of {STEPS.length}</p>
          <h1 className="font-display text-3xl md:text-4xl gradient-text mb-2">{stepTitles[step]}</h1>
          <p className="text-muted-foreground mb-8 text-sm">{stepSubtitles[step]}</p>

          <div className="card rounded-2xl p-6 md:p-8 space-y-5">
            {step === 0 && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Branch</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger className="h-11 bg-secondary/60 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Computer Science","Information Technology","Electronics & Comm","Electrical","Mechanical","Civil","AI & ML","Data Science","Other"].map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Current year</Label>
                  <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                    <SelectTrigger className="h-11 bg-secondary/60 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Target career</Label>
                  <Input placeholder="e.g. Backend Engineer, AI/ML, Product Manager" value={career} onChange={(e) => setCareer(e.target.value)} className="h-11 bg-secondary/60 border-border/60" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Dream companies <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
                  <Input placeholder="Google, Microsoft, Zerodha, Razorpay" value={companies} onChange={(e) => setCompanies(e.target.value)} className="h-11 bg-secondary/60 border-border/60" />
                </div>
              </>
            )}
            {step === 2 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Current skills <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
                <Input placeholder="Python, React, SQL, Git" value={skills} onChange={(e) => setSkills(e.target.value)} className="h-11 bg-secondary/60 border-border/60" />
                <p className="text-xs text-muted-foreground mt-2">Leave blank if you're just starting — that's fine.</p>
              </div>
            )}
            {step === 3 && (
              <>
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <Label className="text-sm font-medium">Confidence in career direction</Label>
                    <span className="font-display text-2xl gold-text">{confidence[0]}<span className="text-sm text-muted-foreground">/10</span></span>
                  </div>
                  <Slider value={confidence} onValueChange={setConfidence} min={1} max={10} step={1} className="mt-2" />
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <Label className="text-sm font-medium">Hours per week you can commit</Label>
                    <span className="font-display text-2xl gold-text">{hours[0]}<span className="text-sm text-muted-foreground">h</span></span>
                  </div>
                  <Slider value={hours} onValueChange={setHours} min={2} max={40} step={1} className="mt-2" />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)} className="text-muted-foreground">
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={loading} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Finish setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
