import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Sparkles, Compass, Calendar, Briefcase, FileText, Mic, Wrench, Target, Check, Clock, Twitter, Linkedin, Github } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerOS India — Stop Guessing Your Career" },
      { name: "description", content: "The AI Career Operating System for engineering college students. Career GPS, weekly missions, internship tracker, resume score." },
      { property: "og:title", content: "CareerOS India" },
      { property: "og:description", content: "Stop guessing. A calm, premium career command center for engineering students." },
    ],
  }),
  component: Landing,
});

// Each feature has a glow color variant and icon color
const features = [
  { icon: Compass,   glow: "card-glow-gold",   iconClass: "icon-glow-gold",    title: "Never wonder what to do next.",                  desc: "A personal AI mentor that always knows your branch, year, and goal — and tells you the exact next step." },
  { icon: Calendar,  glow: "card-glow-indigo",  iconClass: "icon-glow-indigo",  title: "Get one clear mission every week.",               desc: "Every Monday, one focused plan: finish this topic, ship this project, send these applications." },
  { icon: FileText,  glow: "card-glow-teal",    iconClass: "icon-glow-teal",    title: "Know why recruiters skip your resume.",           desc: "An honest score, surgical fixes, and the keywords ATS systems and recruiters actually scan for." },
  { icon: Briefcase, glow: "card-glow-amber",   iconClass: "icon-glow-amber",   title: "Internship Tracker",                             desc: "Applications, rejections, interviews, follow-ups — one calm dashboard." },
  { icon: Mic,       glow: "card-glow-rose",    iconClass: "icon-glow-rose",    title: "Mock Interviews",                                desc: "Role-based AI interviews with structured, actionable feedback." },
  { icon: Wrench,    glow: "card-glow-emerald", iconClass: "icon-glow-emerald", title: "Project Generator",                              desc: "Beginner, intermediate, portfolio projects — tailored to your year and goal." },
  { icon: Target,    glow: "card-glow-indigo",  iconClass: "icon-glow-indigo",  title: "Career Reality Check",                           desc: "Tell us your dream role. We tell you your readiness %, what's missing, and months to close the gap." },
];

const tiers = [
  { name: "Free",     price: "₹0",   period: "forever",  features: ["Career GPS basics", "10 mentor chats / month", "1 resume score"],                                            cta: "Start free",   highlight: false },
  { name: "Pro",      price: "₹199", period: "/month",   features: ["Unlimited mentor chats", "Unlimited resume scores", "Weekly action plan", "Project Generator"],               cta: "Go Pro",       highlight: true,  badge: "Most popular" },
  { name: "Pro Plus", price: "₹399", period: "/month",   features: ["Everything in Pro", "Mock interviews", "Internship tracker", "Career Reality Check"],                        cta: "Choose Plus",  highlight: false },
];

const faqs = [
  { q: "Is CareerOS only for CS students?",            a: "No. The roadmap engine adapts to every engineering branch — Electronics, Mechanical, Electrical, AI/ML, Data Science, and more." },
  { q: "How is this different from YouTube advice?",   a: "Generic advice doesn't know you. CareerOS builds a plan for your branch, year, skills, hours, and dream role — and updates it every week." },
  { q: "Do I need to pay to start?",                   a: "No. The free tier gives you a Career GPS, 10 mentor chats, and one resume score. Upgrade only when you need more." },
  { q: "Will this help with placements?",              a: "Yes. Pro Plus includes mock interviews, internship tracking, and a Career Reality Check that maps the months to your dream role." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-amber-700 shadow-gold" />
            <span className="font-display text-xl tracking-tight">CareerOS</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">India</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign in</Button></Link>
            <Link to="/auth">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-gold px-5">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[1100px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(40,70,140,0.55),_transparent_60%)] blur-3xl" />
          <div className="absolute top-20 -left-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(20,40,90,0.6),_transparent_65%)] blur-3xl" />
          <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(198,161,91,0.18),_transparent_65%)] blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/40 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground mb-8 fade-up">
            <Sparkles className="h-3 w-3 text-gold" />
            Built for engineering college students
          </div>
          <h1 className="text-5xl md:text-7xl font-display gradient-text leading-[1.05] fade-up">
            Your future,<br />organized.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed fade-up">
            A calm, premium <span className="gold-text font-medium">Career Operating System</span> for engineering students.
            Career GPS, weekly missions, resume score — one quiet command center for the work that actually matters.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap fade-up">
            <Link to="/auth">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-12 px-7 text-base btn-press">
                Build my career plan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="rounded-full h-12 px-7 text-base border-border/50 bg-transparent hover:bg-secondary/40 btn-press">
                See how it works
              </Button>
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground/50">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-y border-border/30 bg-secondary/20">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground/50 font-medium">
          {["Calm", "Premium", "Ambitious", "Intelligent", "Reassuring"].map((word, i, arr) => (
            <span key={word} className="flex items-center gap-8">
              {word}{i < arr.length - 1 && <span className="text-border/60">·</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features — glow cards ── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">The operating system</p>
          <h2 className="text-4xl md:text-5xl font-display gradient-text">Everything you need.<br />Nothing you don't.</h2>
          <p className="mt-5 text-muted-foreground">Six precision tools. One unified plan. Designed for the way Indian engineering actually works.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className={`card-glow ${f.glow} p-7 flex flex-col gap-5`}>
              {/* Icon */}
              <div className={`h-12 w-12 rounded-2xl grid place-items-center shrink-0 ${f.iconClass}`}>
                <f.icon className="h-5 w-5" />
              </div>
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold leading-snug mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Roadmap example ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Roadmap engine</p>
            <h2 className="text-4xl md:text-5xl font-display gradient-text leading-tight">A plan as specific<br />as your goals.</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-[15px]">
              Tell us your branch, year, and dream companies. We'll generate a semester-by-semester roadmap —
              skills, projects, internships, placement prep — that updates as you grow.
            </p>
            <Link to="/auth">
              <Button className="mt-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6 btn-press">
                Generate mine <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="card-glow card-glow-indigo p-7">
            <div className="space-y-3">
              {[
                { sem: "Semester 3", focus: "DSA + Backend",   items: ["Master arrays, trees, DP", "Build a full-stack project", "Apply for summer internships"] },
                { sem: "Semester 4", focus: "System Design",   items: ["LLD + scalability basics", "Open source contribution", "Polish LinkedIn"] },
                { sem: "Semester 5", focus: "Interview prep",  items: ["100 Leetcode mediums", "Mock interviews weekly", "Off-campus referrals"] },
              ].map((s) => (
                <div key={s.sem} className="rounded-2xl p-5" style={{ background: "rgba(15,17,21,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{s.sem}</span>
                    <span className="text-xs font-semibold" style={{ color: "#818CF8" }}>{s.focus}</span>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-foreground/75">
                        <Check className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What clarity looks like ── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">A real example</p>
          <h2 className="text-4xl md:text-5xl font-display gradient-text">This is what clarity<br />actually looks like.</h2>
          <p className="mt-5 text-muted-foreground">Two minutes of onboarding. A complete plan on the other side.</p>
        </div>
        <div className="card-glow card-glow-teal p-8 md:p-10 relative">
          <div className="absolute -top-24 right-0 h-64 w-64 bg-primary/8 blur-3xl pointer-events-none" />
          <div className="grid md:grid-cols-2 gap-10 relative">
            <div className="space-y-7">
              {[
                { label: "Goal",    value: "Software Engineer" },
                { label: "Current", value: "1st Year · CS" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{item.label}</div>
                  <div className="text-2xl font-display">{item.value}</div>
                </div>
              ))}
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Estimated internship readiness</div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gold" />
                  <span className="text-2xl font-display gold-text">6 months</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-5">Your roadmap</div>
              <div className="space-y-3">
                {["Git", "Python", "Projects", "DSA"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold shrink-0 icon-glow-teal">
                      {i + 1}
                    </div>
                    <div className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium" style={{ background: "rgba(15,17,21,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-display gradient-text">Worth a coffee.<br />Costs less.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div key={t.name} className={`card-glow ${t.highlight ? "card-glow-gold" : "card-glow-indigo"} p-7 flex flex-col`} style={t.highlight ? { border: "1px solid rgba(198,161,91,0.3)" } : {}}>
              {t.badge && <div className="text-[10px] uppercase tracking-widest text-gold mb-3 font-semibold">{t.badge}</div>}
              <h3 className="font-display text-2xl">{t.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-display gradient-text">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground/80">
                    <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="mt-7 block">
                <Button className={`w-full rounded-full ${t.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold" : "bg-secondary/80 hover:bg-secondary text-foreground"}`}>
                  {t.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-xs text-muted-foreground/50">
          Razorpay subscriptions coming soon — start free now, upgrade with one tap.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-display gradient-text">Good questions.</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`${i}`} className="card-glow card-glow-gold border-0 px-6" style={{ borderRadius: "1rem" }}>
              <AccordionTrigger className="text-left font-medium hover:no-underline py-5 text-[15px]">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-28">
        <div className="card-glow card-glow-gold px-8 py-20 text-center relative" style={{ border: "1px solid rgba(198,161,91,0.2)" }}>
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[600px] bg-primary/12 blur-3xl pointer-events-none" />
          <p className="relative text-xs uppercase tracking-[0.3em] text-gold mb-4">Start today</p>
          <h2 className="relative text-4xl md:text-5xl font-display gradient-text">Your career, on autopilot.</h2>
          <p className="relative mt-5 text-muted-foreground max-w-md mx-auto text-[15px] leading-relaxed">
            Two minutes to set up. A lifetime of clarity. Free to start — no credit card needed.
          </p>
          <Link to="/auth" className="relative inline-block mt-10">
            <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-12 px-8 text-base btn-press">
              Build my career plan <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 bg-secondary/10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-amber-700" />
              <span className="font-display text-lg tracking-tight">CareerOS</span>
              <span className="text-xs text-muted-foreground">India</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
              <Link to="/auth" className="hover:text-foreground transition-colors">Sign in</Link>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: Linkedin, href: "https://linkedin.com" },
                { icon: Twitter,  href: "https://twitter.com" },
                { icon: Github,   href: "https://github.com/mahekvadharr" },
              ].map(({ icon: Icon, href }) => (
                <a key={href} href={href} target="_blank" rel="noreferrer"
                  className="h-8 w-8 rounded-lg bg-secondary/60 border border-border/40 grid place-items-center text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground/40">
            <span>© {new Date().getFullYear()} CareerOS India. Built with intent for engineering college students.</span>
            <span>Made in India 🇮🇳</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
