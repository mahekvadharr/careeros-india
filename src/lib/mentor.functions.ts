import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGemini, type ChatMessage } from "./ai.server";

const MENTOR_SYSTEM = `You are the CareerOS AI Mentor — a premium, sharp, no-fluff career coach for Indian engineering and CS students.

Rules:
- ONLY answer career, internship, placement, skills, projects, resume, LinkedIn, interview, college, and study-related questions.
- If asked anything off-topic, politely redirect: "I'm your career mentor — let's keep this focused on your career. What's on your mind professionally?"
- Be concise, structured, premium. Use bullet points when listing steps.
- Indian context: mention Indian companies, college calendars, placement seasons, ₹ salaries when relevant.
- Never generic. Always specific and actionable.`;

export const getMentorHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("mentor_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(200);
    return { messages: data ?? [] };
  });

export const sendMentorMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ content: z.string().trim().min(1).max(2000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Fetch profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("branch, year, target_career, dream_companies, current_skills")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch last 20 messages for context
    const { data: history } = await supabase
      .from("mentor_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(20);

    const profileLine = profile
      ? `Student profile — branch: ${profile.branch ?? "?"}, year: ${profile.year ?? "?"}, target: ${profile.target_career ?? "?"}, dream companies: ${(profile.dream_companies ?? []).join(", ") || "?"}, skills: ${(profile.current_skills ?? []).join(", ") || "?"}.`
      : "Student profile not yet completed.";

    const messages: ChatMessage[] = [
      { role: "system", content: `${MENTOR_SYSTEM}\n\n${profileLine}` },
      ...((history ?? []) as ChatMessage[]),
      { role: "user", content: data.content },
    ];

    const { text } = await callGemini({ messages });
    const reply = text || "I'm here — could you rephrase that?";

    await supabase.from("mentor_messages").insert([
      { user_id: userId, role: "user", content: data.content },
      { user_id: userId, role: "assistant", content: reply },
    ]);

    return { reply };
  });
