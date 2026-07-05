import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bug, Lightbulb, MessageCircle, Heart, Star, Send, Check } from "lucide-react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/feedback")({
  head: () => ({ meta: [{ title: "Send Feedback — CareerOS" }] }),
  component: FeedbackPage,
});

const TYPES = [
  { id: "bug",     label: "Bug report",     icon: Bug,           desc: "Something is broken",          color: "icon-glow-rose" },
  { id: "feature", label: "Feature request", icon: Lightbulb,    desc: "I want something new",          color: "icon-glow-amber" },
  { id: "general", label: "General feedback",icon: MessageCircle, desc: "Thoughts, suggestions",        color: "icon-glow-indigo" },
  { id: "praise",  label: "Love it ❤️",      icon: Heart,         desc: "Something that worked great",  color: "icon-glow-emerald" },
];

const RATINGS = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Fair" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

function FeedbackPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [type, setType] = useState<string>("general");
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!message.trim()) { toast.error("Please write a message."); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        type,
        rating,
        message: message.trim(),
        page: pathname,
      });
      if (error) throw error;
      setDone(true);
      toast.success("Feedback sent! Thank you.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send feedback");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="h-16 w-16 rounded-2xl icon-glow-emerald grid place-items-center mx-auto mb-6">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl gradient-text mb-3">Thank you.</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          Your feedback was sent directly to me. I read every single one and use it to decide what to build next.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2">— Mahek, founder of CareerOS India</p>
        <Button
          variant="outline"
          className="mt-8 rounded-full"
          onClick={() => { setDone(false); setMessage(""); setRating(null); setType("general"); }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Feedback</p>
        <h1 className="font-display text-3xl sm:text-4xl gradient-text">Tell me what you think.</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This is an MVP. Your feedback directly shapes what gets built next. Every message is read personally.
        </p>
      </div>

      <div className="space-y-5">
        {/* Type selector */}
        <div className="card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">What kind of feedback?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border transition-all text-center ${
                  type === t.id
                    ? "border-primary/40 bg-primary/8"
                    : "border-border/40 bg-secondary/20 hover:border-border hover:bg-secondary/40"
                }`}
              >
                <div className={`h-9 w-9 rounded-xl grid place-items-center ${type === t.id ? t.color : "bg-secondary/60 text-muted-foreground"}`}>
                  <t.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className={`text-xs font-semibold leading-tight ${type === t.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {t.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5 hidden sm:block">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            How would you rate CareerOS overall? <span className="text-muted-foreground/50">(optional)</span>
          </p>
          <div className="flex gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRating(rating === r.value ? null : r.value)}
                className="flex-1 flex flex-col items-center gap-1.5 group"
              >
                <Star
                  className={`h-6 w-6 sm:h-7 sm:w-7 transition-all ${
                    rating !== null && r.value <= rating
                      ? "text-gold fill-gold"
                      : "text-muted-foreground/30 group-hover:text-gold/60"
                  }`}
                />
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 hidden sm:block">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {type === "bug" ? "Describe the bug" :
             type === "feature" ? "What would you like to see?" :
             type === "praise" ? "What worked well?" :
             "Your thoughts"}
          </p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === "bug" ? "What happened? What did you expect? Which page were you on?" :
              type === "feature" ? "What problem would this solve? How would it work?" :
              type === "praise" ? "Tell me what you loved — it helps me know what to keep." :
              "Anything on your mind — what's missing, what's confusing, what surprised you..."
            }
            className="min-h-[140px] bg-secondary/40 border-border/50 resize-none text-sm leading-relaxed"
          />
          <p className="text-[10px] text-muted-foreground/40 mt-2">{message.length} characters</p>
        </div>

        {/* Submit */}
        <Button
          onClick={submit}
          disabled={loading || !message.trim()}
          className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold h-12 text-sm font-semibold"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
            : <><Send className="h-4 w-4 mr-2" />Send feedback</>
          }
        </Button>

        <p className="text-center text-xs text-muted-foreground/50">
          Sent directly to Mahek · Read personally · Shapes v2
        </p>
      </div>
    </div>
  );
}
