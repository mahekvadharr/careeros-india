import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMentorHistory, sendMentorMessage } from "@/lib/mentor.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Sparkles, MessageCircle } from "lucide-react";
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
  const { data, isLoading } = useQuery({ queryKey: ["mentor"], queryFn: () => histFn(), staleTime: 30_000, refetchOnWindowFocus: false });
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
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl icon-glow-gold grid place-items-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">AI Mentor</p>
            <h1 className="font-display text-xl gradient-text leading-tight">Ask anything career.</h1>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {isLoading ? (
          <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 text-gold animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="h-16 w-16 rounded-2xl icon-glow-gold grid place-items-center mx-auto mb-5">
              <MessageCircle className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl gradient-text">Your personal career mentor.</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">Tuned for Indian engineering students. Knows your branch, year, and goals.</p>
            <div className="grid sm:grid-cols-2 gap-2 mt-8 max-w-xl w-full">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send.mutate(s)}
                  className="card rounded-xl p-4 text-left text-sm hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="h-7 w-7 rounded-lg icon-glow-gold grid place-items-center shrink-0 mr-2 mt-1">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "card rounded-bl-sm"
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        {send.isPending && (
          <div className="flex justify-start">
            <div className="h-7 w-7 rounded-lg icon-glow-gold grid place-items-center shrink-0 mr-2 mt-1">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="card rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/40 p-4 shrink-0">
        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
            placeholder="Ask your mentor anything about your career…"
            className="resize-none min-h-[48px] max-h-36 bg-secondary/60 border-border/60 rounded-xl pr-4 flex-1"
            rows={1}
          />
          <Button
            type="submit"
            disabled={!input.trim() || send.isPending}
            size="icon"
            className="rounded-xl h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
