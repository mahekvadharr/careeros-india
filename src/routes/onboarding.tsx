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
import { ArrowRight, Loader2, Check } from "lucide-react";

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

  if (!ready) return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 text-gold animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background grain relative">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? "bg-primary" : "bg-secondary"}`} />
            </div>
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Step {step + 1} of {STEPS.length}</p>
        <h1 className="font-display text-4xl gradient-text mb-2">
          {step === 0 && "Tell us about you"}
          {step === 1 && "What's the dream?"}
          {step === 2 && "Where are you now?"}
          {step === 3 && "How much time do you have?"}
        </h1>
        <p className="text-muted-foreground mb-10">
          {step === 0 && "We'll tailor the roadmap to your branch and year."}
          {step === 1 && "Be specific. Specific goals get specific plans."}
          {step === 2 && "List what you already know. Honesty unlocks the right plan."}
          {step === 3 && "Real talk: how many hours a week, and how confident are you today?"}
        </p>

        <div className="glass-card rounded-3xl p-8 space-y-6">
          {step === 0 && (
            <>
              <div>
                <Label>Branch</Label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger className="mt-1.5 bg-secondary/60 h-11"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {["Computer Science", "Information Technology", "Electronics & Comm", "Electrical", "Mechanical", "Civil", "AI & ML", "Data Science", "Other"].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Current year</Label>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="mt-1.5 bg-secondary/60 h-11"><SelectValue/></SelectTrigger>
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
                <Label>Target career</Label>
                <Input placeholder="e.g. Backend Engineer, AI/ML, Product Manager" value={career} onChange={(e) => setCareer(e.target.value)} className="mt-1.5 bg-secondary/60 h-11"/>
              </div>
              <div>
                <Label>Dream companies (comma-separated)</Label>
                <Input placeholder="Google, Microsoft, Zerodha, Razorpay" value={companies} onChange={(e) => setCompanies(e.target.value)} className="mt-1.5 bg-secondary/60 h-11"/>
              </div>
            </>
          )}
          {step === 2 && (
            <div>
              <Label>Current skills (comma-separated)</Label>
              <Input placeholder="Python, React, SQL, Git" value={skills} onChange={(e) => setSkills(e.target.value)} className="mt-1.5 bg-secondary/60 h-11"/>
              <p className="text-xs text-muted-foreground mt-2">Leave blank if you're just starting — that's fine.</p>
            </div>
          )}
          {step === 3 && (
            <>
              <div>
                <div className="flex items-baseline justify-between"><Label>Confidence in career direction</Label><span className="text-gold font-display text-lg">{confidence[0]}/10</span></div>
                <Slider value={confidence} onValueChange={setConfidence} min={1} max={10} step={1} className="mt-4"/>
              </div>
              <div>
                <div className="flex items-baseline justify-between"><Label>Hours per week you can commit</Label><span className="text-gold font-display text-lg">{hours[0]}h</span></div>
                <Slider value={hours} onValueChange={setHours} min={2} max={40} step={1} className="mt-4"/>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6">Continue <ArrowRight className="ml-2 h-4 w-4"/></Button>
          ) : (
            <Button onClick={submit} disabled={loading} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Check className="h-4 w-4 mr-2"/>}
              Finish setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
