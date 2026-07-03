import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getProfile, saveOnboarding } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Edit3, Check, Copy, ExternalLink, Flame, Zap, Trophy, Target, BookOpen, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — CareerOS" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const saveFn = useServerFn(saveOnboarding);
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile(), staleTime: 60_000, refetchOnWindowFocus: false });
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const profile = data?.profile;

  // Edit state
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("2");
  const [career, setCareer] = useState("");
  const [companies, setCompanies] = useState("");
  const [skills, setSkills] = useState("");
  const [hours, setHours] = useState("10");
  const [confidence, setConfidence] = useState("5");

  function startEdit() {
    if (!profile) return;
    setBranch(profile.branch ?? "Computer Science");
    setYear(String(profile.year ?? 2));
    setCareer(profile.target_career ?? "");
    setCompanies((profile.dream_companies as string[] ?? []).join(", "));
    setSkills((profile.current_skills as string[] ?? []).join(", "));
    setHours(String(profile.weekly_hours ?? 10));
    setConfidence(String(profile.confidence_level ?? 5));
    setEditing(true);
  }

  const mut = useMutation({
    mutationFn: () => saveFn({
      data: {
        branch,
        year: Number(year),
        target_career: career,
        dream_companies: companies.split(",").map(s => s.trim()).filter(Boolean),
        current_skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        weekly_hours: Number(hours),
        confidence_level: Number(confidence),
      }
    }),
    onSuccess: () => {
      toast.success("Profile updated.");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  function copyShareLink() {
    const url = `${window.location.origin}/u/${profile?.user_id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Profile link copied!");
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (isLoading) return (
    <div className="grid place-items-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 text-gold animate-spin" />
    </div>
  );

  const score = profile?.career_score ?? 0;
  const xp = profile?.xp ?? 0;
  const streak = profile?.streak_days ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Profile</p>
        <h1 className="font-display text-3xl sm:text-4xl gradient-text">Your career identity.</h1>
      </div>

      {/* Profile hero card */}
      <div className="card rounded-2xl p-6 sm:p-8 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6 relative">
          {/* Avatar */}
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 grid place-items-center shrink-0 shadow-gold self-center sm:self-start">
            <span className="font-display text-3xl sm:text-4xl gold-text">
              {(profile?.full_name ?? "U").charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl gradient-text leading-tight">
              {profile?.full_name ?? "Anonymous"}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {profile?.branch} · Year {profile?.year}
            </p>
            <p className="text-gold text-sm font-medium mt-0.5">{profile?.target_career}</p>

            {/* Share link */}
            <div className="mt-4 flex flex-col sm:flex-row items-center sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-lg bg-secondary/50 border border-border/50 px-3 py-2 w-full sm:w-auto min-w-0">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-mono truncate">
                  careeros-india.vercel.app/u/{profile?.user_id?.slice(0, 8)}…
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyShareLink}
                className="rounded-lg h-9 px-4 shrink-0 w-full sm:w-auto"
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                {copied ? "Copied!" : "Copy link"}
              </Button>
            </div>
          </div>

          {/* Edit button */}
          <Button
            variant="outline"
            size="sm"
            onClick={startEdit}
            className="rounded-lg h-9 px-4 shrink-0 self-center sm:self-start"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        {[
          { icon: Trophy, label: "Career Score", value: score, suffix: "/100", colorClass: "icon-glow-gold" },
          { icon: Zap, label: "Total XP", value: xp, suffix: "xp", colorClass: "icon-glow-amber" },
          { icon: Flame, label: "Day Streak", value: streak, suffix: "d", colorClass: "icon-glow-rose" },
        ].map((s) => (
          <div key={s.label} className="card rounded-2xl p-4 sm:p-5 text-center">
            <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${s.colorClass} grid place-items-center mx-auto mb-2 sm:mb-3`}>
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="font-display text-2xl sm:text-3xl gradient-text leading-none">
              {s.value}<span className="text-sm text-muted-foreground ml-0.5">{s.suffix}</span>
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Career score progress */}
      <div className="card rounded-2xl p-5 sm:p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium">Career Score</span>
          </div>
          <span className="font-display text-lg gold-text">{score}/100</span>
        </div>
        <Progress value={score} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">
          {score < 40 ? "Early stage — every task compounds. Keep going." :
           score < 70 ? "Building momentum. You're on track." :
           "Strong profile. Stay consistent and opportunities will follow."}
        </p>
      </div>

      {/* Profile details */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div className="card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-gold" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {((profile?.current_skills as string[]) ?? []).length > 0
              ? (profile?.current_skills as string[]).map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15 text-primary/90">
                    {s}
                  </span>
                ))
              : <span className="text-xs text-muted-foreground">No skills added yet</span>
            }
          </div>
        </div>

        <div className="card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-gold" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Dream Companies</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {((profile?.dream_companies as string[]) ?? []).length > 0
              ? (profile?.dream_companies as string[]).map((c) => (
                  <span key={c} className="text-xs px-2.5 py-1 rounded-lg bg-secondary/60 border border-border/50">
                    {c}
                  </span>
                ))
              : <span className="text-xs text-muted-foreground">No companies added yet</span>
            }
          </div>
        </div>
      </div>

      <div className="card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-gold" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Commitment</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs mb-1">Weekly hours</div>
            <div className="font-display text-xl gold-text">{profile?.weekly_hours ?? "—"}h</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-1">Confidence level</div>
            <div className="font-display text-xl gold-text">{profile?.confidence_level ?? "—"}/10</div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-xl gradient-text mb-5">Edit profile</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs mb-1.5 block">Branch</Label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger className="h-10 bg-secondary/60 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Computer Science","Information Technology","Electronics & Comm","Electrical","Mechanical","Civil","AI & ML","Data Science","Other"].map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="h-10 bg-secondary/60 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(y => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Target career</Label>
                <Input value={career} onChange={e => setCareer(e.target.value)} className="h-10 bg-secondary/60 border-border/60" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Dream companies <span className="text-muted-foreground">(comma-separated)</span></Label>
                <Input value={companies} onChange={e => setCompanies(e.target.value)} className="h-10 bg-secondary/60 border-border/60" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Current skills <span className="text-muted-foreground">(comma-separated)</span></Label>
                <Input value={skills} onChange={e => setSkills(e.target.value)} className="h-10 bg-secondary/60 border-border/60" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Hours/week</Label>
                  <Input type="number" min={1} max={80} value={hours} onChange={e => setHours(e.target.value)} className="h-10 bg-secondary/60 border-border/60" />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Confidence (1-10)</Label>
                  <Input type="number" min={1} max={10} value={confidence} onChange={e => setConfidence(e.target.value)} className="h-10 bg-secondary/60 border-border/60" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
              <Button onClick={() => mut.mutate()} disabled={mut.isPending} className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold">
                {mut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
