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
  "Ready to level up today?",
  "One step closer to your dream career.",
  "Small wins today. Big career tomorrow.",
  "Future you is watching. Make them proud.",
  "Consistency beats intensity. Show up.",
];

const qOpts = { staleTime: 60_000, refetchOnWindowFocus: false, refetchOnMount: false, refetchOnReconnect: false };

function Dashboard() {
  const profileFn = useServerFn(getProfile);
  const weeklyFn = useServerFn(getWeeklyTasks);
  const roadmapFn = useServerFn(getRoadmap);
  const readinessFn = useServerFn(getReadiness);
  const resumeFn = useServerFn(listResumeAnalyses);

  const { data: p } = useQuery({ queryKey: ["profile"],     queryFn: () => profileFn(),   ...qOpts });
  const { data: w } = useQuery({ queryKey: ["weekly"],      queryFn: () => weeklyFn(),    ...qOpts });
  const { data: r } = useQuery({ queryKey: ["roadmap"],     queryFn: () => roadmapFn(),   ...qOpts });
  const { data: ready } = useQuery({ queryKey: ["readiness"], queryFn: () => readinessFn(), ...qOpts });
  const { data: resumes } = useQuery({ queryKey: ["resume-list"], queryFn: () => resumeFn(), ...qOpts });

  const profile = p?.profile;
  const tasks = (w?.plan?.tasks as Array<{ id: string; title: string; done?: boolean }> | undefined) ?? [];
  const completed = tasks.filter((t) => t.done).length;
  const score = profile?.career_score ?? 0;
  const readinessScore = ready?.readiness?.total_score ?? null;
  const latestResume = resumes?.analyses?.[0];
  const nextTask = tasks.find((t) => !t.done);
  const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Welcome */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-1.5">Home</p>
        <h1 className="font-display text-2xl sm:text-4xl gradient-text leading-tight">
          {profile?.full_name ? `Hey, ${profile.full_name.split(" ")[0]}.` : "Welcome back."}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{greeting}</p>
      </div>

      {/* Today's mission */}
      <Link to="/weekly" className="block card card-glow card-glow-gold hover-lift rounded-2xl p-5 sm:p-7 mb-5 relative overflow-hidden border-primary/15">
        <div className="absolute -top-16 -right-12 h-40 w-40 bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl icon-glow-gold grid place-items-center shrink-0">
            <Target className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">Today's Mission</p>
            <h2 className="font-display text-lg sm:text-2xl leading-tight line-clamp-2">
              {nextTask?.title ?? (tasks.length ? "All tasks done — plan next week." : "Generate this week's plan.")}
            </h2>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-gold" />
                {completed}/{tasks.length || "—"} this week
              </span>
              <span className="inline-flex items-center gap-1 text-gold font-medium">
                Open <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Career Score", value: score, suffix: "/100", colorClass: "icon-glow-gold" },
          { label: "Total XP", value: profile?.xp ?? 0, suffix: "xp", colorClass: "icon-glow-amber", icon: Zap },
          { label: "Streak", value: profile?.streak_days ?? 0, suffix: "d", colorClass: "icon-glow-rose", icon: Flame },
        ].map((s) => (
          <div key={s.label} className="card rounded-2xl p-3 sm:p-5 text-center">
            <div className="font-display text-xl sm:text-3xl gold-text leading-none">
              <AnimatedNumber value={s.value} />
              <span className="text-xs sm:text-sm text-muted-foreground ml-0.5">{s.suffix}</span>
            </div>
            <div className="text-[9px] sm:text-xs text-muted-foreground mt-1">{s.label}</div>
            <Progress value={s.label === "Career Score" ? s.value : undefined} className="h-1 mt-2 hidden sm:block" />
          </div>
        ))}
      </div>

      {/* Feature grid */}
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Your toolkit</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { to: "/readiness", icon: Gauge,         label: "Readiness",     title: readinessScore !== null ? `${readinessScore}/100` : "Compute now",      subtitle: readinessScore !== null ? `${ready?.readiness?.estimated_weeks ?? 0}w to 90+` : "6 dimensions",       glow: "card-glow-gold" },
          { to: "/resume",    icon: FileText,       label: "Resume",        title: latestResume ? `Score ${latestResume.overall_score}` : "Upload resume",   subtitle: latestResume ? `ATS ${latestResume.ats_score}` : "AI-powered scoring",                              glow: "card-glow-teal" },
          { to: "/skillgap",  icon: Compass,        label: "Skill Gap",     title: "Analyze gap",                                                            subtitle: "vs your target role",                                                                               glow: "card-glow-indigo" },
          { to: "/roadmap",   icon: Map,            label: "Career GPS",    title: r?.roadmap ? `${(r.roadmap.semesters as unknown[])?.length ?? 0} semesters` : "Build roadmap", subtitle: "Semester-wise plan",                                                          glow: "card-glow-emerald" },
          { to: "/mentor",    icon: Brain,          label: "AI Mentor",     title: "Ask anything",                                                           subtitle: "Career, placements, skills",                                                                        glow: "card-glow-rose" },
          { to: "/weekly",    icon: Trophy,         label: "This Week",     title: tasks.length ? `${completed}/${tasks.length} done` : "Generate plan",     subtitle: tasks.length ? `${tasks.length - completed} remaining` : "5-second plan",                           glow: "card-glow-amber" },
        ].map((c) => (
          <Link key={c.to} to={c.to} className={`card-glow ${c.glow} p-4 sm:p-5 block group`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div className="flex items-start gap-2.5">
              <c.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gold shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.subtitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick tip */}
      <div className="card rounded-2xl p-4 sm:p-5 mt-5 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Tip of the day</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Apply to 5 internships before Friday. Volume + targeting beats perfection every time.</p>
        </div>
      </div>
    </div>
  );
}
