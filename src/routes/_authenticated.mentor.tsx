import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMentorHistory, sendMentorMessage } from "@/lib/mentor.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mentor")({
  head: () => ({ meta: [{ title: "AI Mentor — CareerOS" }] }),
  component: MentorPage,
});

const STARTERS = [
  "How do I land a SDE internship in 4 months?",
  "What projects matter for product roles?",
  "Roadmap for AI/ML in 2026?",
  "How do I write a referral DM that gets replies?",
];

function MentorPage() {
  const histFn = useServerFn(getMentorHistory);
  const sendFn = useServerFn(sendMentorMessage);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["mentor"], queryFn: () => histFn() });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = useMutation({
    mutationFn: (content: string) => sendFn({ data: { content } }),
    onSuccess: () => { setInput(""); qc.invalidateQueries({ queryKey: ["mentor"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const messages = data?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, send.isPending]);

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const v = input.trim();
    if (!v || send.isPending) return;
    send.mutate(v);
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col max-w-3xl mx-auto w-full">
      <div className="px-6 pt-8 pb-4 border-b border-border/40">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">AI Mentor</p>
        <h1 className="font-display text-3xl gradient-text">Ask anything career.</h1>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {isLoading ? (
          <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 text-gold animate-spin"/></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 rounded-full bg-primary/15 grid place-items-center mx-auto mb-4"><Sparkles className="h-5 w-5 text-gold"/></div>
            <h2 className="font-display text-2xl gradient-text">Your personal career mentor.</h2>
            <p className="text-sm text-muted-foreground mt-2">Tuned for Indian engineering students. Try one of these:</p>
            <div className="grid sm:grid-cols-2 gap-2 mt-6 max-w-xl mx-auto">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send.mutate(s)} className="glass-card rounded-2xl p-3 text-left text-sm hover:border-primary/40 transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"}`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        {send.isPending && (
          <div className="flex justify-start"><div className="glass-card rounded-3xl px-5 py-3.5"><Loader2 className="h-4 w-4 text-gold animate-spin"/></div></div>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-border/40 p-4 bg-background/60 backdrop-blur-xl">
        <div className="relative flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
            placeholder="Ask your mentor anything about your career…"
            className="resize-none min-h-[52px] max-h-40 bg-secondary/60 border-border/60 rounded-2xl pr-14"
            rows={1}
          />
          <Button type="submit" disabled={!input.trim() || send.isPending} size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold shrink-0">
            <Send className="h-4 w-4"/>
          </Button>
        </div>
      </form>
    </div>
  );
}
