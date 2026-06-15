import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { getProfile } from "@/lib/profile.functions";
import { getWeeklyTasks } from "@/lib/weekly.functions";
import { getRoadmap } from "@/lib/roadmap.functions";
import { getReadiness } from "@/lib/readiness.functions";
import { listResumeAnalyses } from "@/lib/resume.functions";
import { Progress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ArrowRight, Calendar, Map, MessageCircle, Sparkles, Target, FileText, Gauge, Flame, Zap, Compass, Brain, Trophy } from "lucide-react";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareerOS" }] }),
  component: Dashboard,
});

const GREETINGS = [
  "✨ Ready to level up today?",
  "🚀 One step closer to your dream career.",
  "🔥 Your streak is looking good.",
  "🎯 Small wins today. Big career tomorrow.",
  "🧠 Future you is watching. Make them proud.",
];

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
  const nextTask = tasks.find((t) => !t.done);

  const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10 reveal" style={{ animationDelay: "20ms" }}>
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Home</p>
        <h1 className="font-display text-4xl gradient-text">
          {profile?.full_name ? `Hey, ${profile.full_name.split(" ")[0]}.` : "Welcome back."}
        </h1>
        <p className="mt-2 text-muted-foreground">{greeting}</p>
      </div>

      {/* DOMINANT — Today's Mission */}
      <Link
        to="/weekly"
        className="block glass-card hover-breathe rounded-[2rem] p-8 md:p-10 mb-8 relative overflow-hidden border-gold/25 reveal"
        style={{ animationDelay: "60ms" }}
      >
        <div className="absolute -top-24 -right-16 h-72 w-72 bg-gold/20 blur-3xl rounded-full" />
        <div className="absolute inset-0 grain" />
        <div className="relative flex items-start gap-5">
          <div className="h-14 w-14 rounded-2xl bg-gold/15 grid place-items-center shrink-0 glow-active">
            <Target className="h-7 w-7 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Today's Mission</p>
            <h2 className="font-display text-3xl md:text-4xl mt-2 leading-tight">
              {nextTask?.title ?? (tasks.length ? "All tasks done — plan next week." : "Generate this week's plan.")}
            </h2>
            <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/70">
                <Calendar className="h-3.5 w-3.5 text-gold" /> {completed}/{tasks.length || "—"} this week
              </span>
              <span className="inline-flex items-center gap-1 text-gold">
                Open <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* MEDIUM — Progress trio */}
      <div className="grid lg:grid-cols-3 gap-5 mb-12">
        <div className="glass-card hover-breathe rounded-3xl p-7 lg:col-span-2 relative overflow-hidden reveal" style={{ animationDelay: "120ms" }}>
          <div className="absolute -top-20 -right-20 h-48 w-48 bg-primary/15 blur-3xl rounded-full" />
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Career Score</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-7xl gold-text"><AnimatedNumber value={score} /></span>
            <span className="text-muted-foreground">/100</span>
          </div>
          <Progress value={score} className="mt-6 h-1.5" />
          <p className="mt-4 text-sm text-muted-foreground">{score < 40 ? "You're early — every week compounds." : score < 70 ? "Strong base. Keep shipping." : "Excellent. You're placement-ready."}</p>
        </div>
        <div className="grid gap-5 reveal" style={{ animationDelay: "180ms" }}>
          <div className="glass-card hover-breathe rounded-3xl p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gold/15 grid place-items-center"><Zap className="h-6 w-6 text-gold"/></div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total XP</p>
              <div className="font-display text-3xl gold-text"><AnimatedNumber value={profile?.xp ?? 0} /></div>
            </div>
          </div>
          <div className="glass-card hover-breathe rounded-3xl p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-500/15 grid place-items-center"><Flame className="h-6 w-6 text-orange-400"/></div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Streak</p>
              <div className="font-display text-3xl"><AnimatedNumber value={profile?.streak_days ?? 0} /> <span className="text-base text-muted-foreground">days</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* SMALL — Everything else */}
      <div className="mb-4 reveal" style={{ animationDelay: "240ms" }}>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Your toolkit</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        {[
          { to: "/readiness", icon: Gauge, label: "Readiness", title: readinessScore !== null ? `${readinessScore}/100` : "Compute now", subtitle: readinessScore !== null ? `${ready?.readiness?.estimated_weeks ?? 0} weeks to 90+` : "Across resume, skills, projects" },
          { to: "/resume", icon: FileText, label: "Resume", title: latestResume ? `Score ${latestResume.overall_score}` : "Upload your resume", subtitle: latestResume ? `ATS ${latestResume.ats_score} · Keywords ${latestResume.keyword_score}` : "AI scores 6 dimensions" },
          { to: "/skillgap", icon: Compass, label: "Skill Gap", title: "Pick a target role", subtitle: "See exactly what's missing" },
          { to: "/roadmap", icon: Map, label: "Career GPS", title: r?.roadmap ? `${(r.roadmap.semesters as unknown[])?.length ?? 0} semesters` : "Build your roadmap", subtitle: "Tailored to your goal" },
          { to: "/mentor", icon: Brain, label: "AI Mentor", title: "Ask anything", subtitle: "Career, placements, doubts" },
          { to: "/weekly", icon: Trophy, label: "This Week", title: tasks.length ? `${completed}/${tasks.length} tasks done` : "Generate your week", subtitle: tasks.length ? `${tasks.length - completed} remaining` : "AI builds it in 5s" },
        ].map((c, i) => (
          <div key={c.to} className="reveal" style={{ animationDelay: `${280 + i * 60}ms` }}>
            <DashCard {...c} />
          </div>
        ))}
      </div>

      <div className="mt-12 glass-card hover-breathe rounded-3xl p-7 flex items-center gap-4 reveal" style={{ animationDelay: "700ms" }}>
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
    <Link to={to} className="glass-card hover-breathe rounded-3xl p-6 block group h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground"><Icon className="h-3.5 w-3.5 text-gold"/>{label}</div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition"/>
      </div>
      <h3 className="font-display text-xl mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </Link>
  );
}
