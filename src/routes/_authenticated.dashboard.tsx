import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "@/lib/profile.functions";
import { getWeeklyTasks } from "@/lib/weekly.functions";
import { getRoadmap } from "@/lib/roadmap.functions";
import { getReadiness } from "@/lib/readiness.functions";
import { listResumeAnalyses } from "@/lib/resume.functions";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Calendar, Map, MessageCircle, Sparkles, Target, FileText, Gauge } from "lucide-react";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareerOS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const profileFn = useServerFn(getProfile);
  const weeklyFn = useServerFn(getWeeklyTasks);
  const roadmapFn = useServerFn(getRoadmap);
  const readinessFn = useServerFn(getReadiness);
  const resumeFn = useServerFn(listResumeAnalyses);

  const { data: p } = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const { data: w } = useQuery({ queryKey: ["weekly"], queryFn: () => weeklyFn() });
  const { data: r } = useQuery({ queryKey: ["roadmap"], queryFn: () => roadmapFn() });
  const { data: ready } = useQuery({ queryKey: ["readiness"], queryFn: () => readinessFn() });
  const { data: resumes } = useQuery({ queryKey: ["resume-list"], queryFn: () => resumeFn() });

  const profile = p?.profile;
  const tasks = (w?.plan?.tasks as Array<{ id: string; title: string; done?: boolean }> | undefined) ?? [];
  const completed = tasks.filter((t) => t.done).length;
  const score = profile?.career_score ?? 0;
  const readinessScore = ready?.readiness?.total_score ?? null;
  const latestResume = resumes?.analyses?.[0];


  const profile = p?.profile;
  const tasks = (w?.plan?.tasks as Array<{ id: string; title: string; done?: boolean }> | undefined) ?? [];
  const completed = tasks.filter((t) => t.done).length;
  const score = profile?.career_score ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Home</p>
          <h1 className="font-display text-4xl gradient-text">Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.</h1>
          <p className="mt-2 text-muted-foreground">Here's your career, at a glance.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-10">
        <div className="glass-card rounded-3xl p-7 lg:col-span-2 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-48 w-48 bg-primary/15 blur-3xl rounded-full" />
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Career Score</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-7xl gold-text">{score}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
          <Progress value={score} className="mt-6 h-1.5" />
          <p className="mt-4 text-sm text-muted-foreground">{score < 40 ? "You're early — every week compounds." : score < 70 ? "Strong base. Keep shipping." : "Excellent. You're placement-ready."}</p>
        </div>
        <div className="glass-card rounded-3xl p-7">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground"><Target className="h-3 w-3 text-gold"/>Target</div>
          <h3 className="font-display text-2xl mt-3">{profile?.target_career ?? "—"}</h3>
          <p className="text-sm text-muted-foreground mt-1">{profile?.branch} · Year {profile?.year}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {(profile?.dream_companies ?? []).slice(0, 4).map((c: string) => (
              <span key={c} className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-secondary/80 text-foreground/80">{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <DashCard to="/readiness" icon={Gauge} label="Readiness" title={readinessScore !== null ? `${readinessScore}/100` : "Compute now"} subtitle={readinessScore !== null ? `${ready?.readiness?.estimated_weeks ?? 0} weeks to 90+` : "Across resume, skills, projects"} />
        <DashCard to="/resume" icon={FileText} label="Resume" title={latestResume ? `Score ${latestResume.overall_score}` : "Upload your resume"} subtitle={latestResume ? `ATS ${latestResume.ats_score} · Keywords ${latestResume.keyword_score}` : "AI scores 6 dimensions"} />
        <DashCard to="/skillgap" icon={Target} label="Skill Gap" title="Pick a target role" subtitle="See exactly what's missing" />
        <DashCard to="/weekly" icon={Calendar} label="This Week" title={tasks.length ? `${completed}/${tasks.length} tasks done` : "Generate your week"} subtitle={tasks.length ? `${tasks.length - completed} remaining` : "AI builds it in 5s"} />
        <DashCard to="/roadmap" icon={Map} label="Roadmap" title={r?.roadmap ? `${(r.roadmap.semesters as unknown[])?.length ?? 0} semesters` : "Build your roadmap"} subtitle="Tailored to your goal" />
        <DashCard to="/mentor" icon={MessageCircle} label="AI Mentor" title="Ask anything" subtitle="Career, placements, doubts" />
      </div>


      <div className="mt-10 glass-card rounded-3xl p-7 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/15 grid place-items-center"><Sparkles className="h-5 w-5 text-gold"/></div>
        <div className="flex-1">
          <h3 className="font-display text-lg">Tip of the day</h3>
          <p className="text-sm text-muted-foreground">Apply to 5 internships before Friday. Volume + targeting beats perfection.</p>
        </div>
      </div>
    </div>
  );
}

function DashCard({ to, icon: Icon, label, title, subtitle }: { to: string; icon: React.ElementType; label: string; title: string; subtitle: string }) {
  return (
    <Link to={to} className="glass-card rounded-3xl p-6 group hover:-translate-y-1 transition-transform">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground"><Icon className="h-3 w-3 text-gold"/>{label}</div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition"/>
      </div>
      <h3 className="font-display text-xl mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </Link>
  );
}
