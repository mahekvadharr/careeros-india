import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Sparkles, Compass, Calendar, Briefcase, FileText, Mic, Wrench, Target, Check, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerOS — Stop Guessing Your Career" },
      { name: "description", content: "The AI Career Operating System for engineering college students. Career GPS, weekly missions, internship tracker, resume score, and reality checks." },
      { property: "og:title", content: "CareerOS" },
      { property: "og:description", content: "Stop guessing. A calm, premium career command center for engineering students." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Compass, title: "Never wonder what to do next.", desc: "A personal AI mentor that always knows your branch, year, and goal — and tells you the exact next step." },
  { icon: Calendar, title: "Get one clear mission every week.", desc: "Every Monday, one focused plan: finish this topic, ship this project, send these applications." },
  { icon: FileText, title: "Know why recruiters are skipping your resume.", desc: "An honest score, surgical fixes, and the keywords ATS systems and recruiters actually scan for." },
  { icon: Briefcase, title: "Internship Tracker", desc: "Applications, rejections, interviews, follow-ups — one calm dashboard." },
  { icon: Mic, title: "Mock Interviews", desc: "Role-based AI interviews with structured, actionable feedback." },
  { icon: Wrench, title: "Project Generator", desc: "Beginner, intermediate, portfolio projects — tailored to your year and goal." },
  { icon: Target, title: "Career Reality Check", desc: "Tell us your dream role. We tell you your readiness %, what's missing, and the months to close the gap." },
];

const tiers = [
  { name: "Free", price: "₹0", period: "forever", features: ["Career GPS basics", "10 mentor chats / month", "1 resume score"], cta: "Start free", highlight: false },
  { name: "Pro", price: "₹199", period: "/month", features: ["Unlimited mentor chats", "Unlimited resume scores", "Weekly action plan", "Project Generator"], cta: "Go Pro", highlight: true },
  { name: "Pro Plus", price: "₹399", period: "/month", features: ["Everything in Pro", "Mock interviews", "Internship tracker", "Career Reality Check"], cta: "Choose Plus", highlight: false },
  { name: "Yearly", price: "₹2,999", period: "/year", features: ["Everything in Pro Plus", "Save ₹1,789", "Priority AI access"], cta: "Save 37%", highlight: false },
];

const faqs = [
  { q: "Is CareerOS only for CS students?", a: "No. The roadmap engine adapts to every engineering branch — Electronics, Mechanical, Electrical, AI/ML, Data Science, and more." },
  { q: "How is this different from YouTube career advice?", a: "Generic advice doesn't know you. CareerOS builds a plan for your branch, year, skills, hours, and dream role — and updates it every week." },
  { q: "Do I need to pay to start?", a: "No. The free tier gives you a Career GPS, 10 mentor chats, and one resume score. Upgrade only when you need more." },
  { q: "Will this help with placements?", a: "Yes. Pro Plus includes mock interviews, internship tracking, and a Career Reality Check that maps the months to your dream role." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-amber-700 shadow-gold" />
            <span className="font-display text-xl">CareerOS</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">India</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-gold">Get started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Abstract navy + gold gradient backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[1100px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(40,70,140,0.55),_transparent_60%)] blur-3xl" />
          <div className="absolute top-20 -left-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(20,40,90,0.6),_transparent_65%)] blur-3xl" />
          <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(198,161,91,0.18),_transparent_65%)] blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-8 fade-up">
            <Sparkles className="h-3 w-3 text-gold" />
            Built for engineering college students
          </div>
          <h1 className="text-5xl md:text-7xl font-display gradient-text leading-[1.05] fade-up">
            Your future,<br/>organized.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed fade-up">
            A calm, premium <span className="gold-text font-medium">Career Operating System</span> for engineering students. Career GPS, weekly missions, internship tracker, resume score — one quiet command center for the work that actually matters.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 fade-up">
            <Link to="/auth">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-12 px-7 text-base btn-press">
                Build my career plan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="rounded-full h-12 px-7 text-base border-border/60 bg-transparent btn-press">See how it works</Button>
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/40 bg-background/40">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-[0.25em] text-muted-foreground/70">
          <span>Calm</span><span>·</span>
          <span>Premium</span><span>·</span>
          <span>Ambitious</span><span>·</span>
          <span>Intelligent</span><span>·</span>
          <span>Reassuring</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">The operating system</p>
          <h2 className="text-4xl md:text-5xl font-display gradient-text">Everything you need.<br/>Nothing you don't.</h2>
          <p className="mt-5 text-muted-foreground">Six precision tools. One unified plan. Designed for the way Indian engineering actually works.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-3xl p-7 hover-lift group">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 grid place-items-center mb-5 group-hover:shadow-gold transition-shadow">
                <f.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="text-xl font-display mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap example */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Roadmap engine</p>
            <h2 className="text-4xl md:text-5xl font-display gradient-text">A plan as specific<br/>as your goals.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">Tell us your branch, year, and dream companies. We'll generate a semester-by-semester roadmap — skills, projects, internships, placement prep — that updates as you grow.</p>
            <Link to="/auth"><Button className="mt-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-11 px-6">Generate mine <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
          </div>
          <div className="glass-card rounded-3xl p-7 shadow-luxe">
            <div className="space-y-4">
              {[
                { sem: "Semester 3", focus: "DSA + Backend", items: ["Master arrays, trees, DP", "Build a full-stack project", "Apply for summer internships"] },
                { sem: "Semester 4", focus: "System Design", items: ["LLD + scalability basics", "Open source contribution", "Polish LinkedIn"] },
                { sem: "Semester 5", focus: "Interview prep", items: ["100 Leetcode mediums", "Mock interviews weekly", "Off-campus referrals"] },
              ].map((s) => (
                <div key={s.sem} className="rounded-2xl border border-border/50 p-5 bg-background/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{s.sem}</span>
                    <span className="text-xs text-gold">{s.focus}</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {s.items.map((i) => <li key={i} className="flex items-start gap-2"><Check className="h-4 w-4 text-gold mt-0.5 shrink-0"/>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Loved by students</p>
          <h2 className="text-4xl md:text-5xl font-display gradient-text">Confidence, finally.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { name: "Aarav, 3rd year CS", text: "Went from no plan to a real internship interview in 4 months. The weekly mission card kept me honest." },
            { name: "Diya, 2nd year ECE", text: "The Reality Check told me exactly what was missing for product roles. Felt like having a senior on call." },
            { name: "Rohan, 4th year IT", text: "The mentor is sharper than most YouTubers. It actually knows the timelines I'm living through." },
          ].map((t) => (
            <figure key={t.name} className="glass-card rounded-3xl p-7">
              <blockquote className="text-lg leading-relaxed text-foreground/90">"{t.text}"</blockquote>
              <figcaption className="mt-6 text-sm text-muted-foreground">— {t.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-display gradient-text">Worth a coffee.<br/>Costs less.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((t) => (
            <div key={t.name} className={`rounded-3xl p-7 ${t.highlight ? "bg-gradient-to-b from-primary/15 to-background border border-primary/40 shadow-gold" : "glass-card"}`}>
              {t.highlight && <div className="text-[10px] uppercase tracking-widest text-gold mb-3">Most popular</div>}
              <h3 className="font-display text-2xl">{t.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-display gradient-text">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {t.features.map((f) => <li key={f} className="flex items-start gap-2 text-foreground/80"><Check className="h-4 w-4 text-gold mt-0.5 shrink-0"/>{f}</li>)}
              </ul>
              <Link to="/auth"><Button className={`mt-7 w-full rounded-full ${t.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary hover:bg-secondary/80"}`}>{t.cta}</Button></Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-xs text-muted-foreground">Razorpay subscriptions coming soon — start free now, upgrade with one tap.</p>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-28">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-display gradient-text">Good questions.</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`${i}`} className="glass-card rounded-2xl border-0 px-6">
              <AccordionTrigger className="text-left font-medium hover:no-underline py-5">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-28 text-center">
        <div className="glass-card rounded-3xl px-8 py-16 shadow-luxe relative overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[600px] bg-primary/15 blur-3xl" />
          <h2 className="relative text-4xl md:text-5xl font-display gradient-text">Your career, on autopilot.</h2>
          <p className="relative mt-5 text-muted-foreground max-w-xl mx-auto">Two minutes to set up. A lifetime of clarity.</p>
          <Link to="/auth" className="relative inline-block mt-8">
            <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-12 px-8 text-base">Build my career plan <ArrowRight className="ml-2 h-4 w-4"/></Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/40 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CareerOS · Built with intent for engineering college students.
      </footer>
    </div>
  );
}
