import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGemini, type ChatMessage } from "./ai.server";

const MENTOR_SYSTEM = `You are the CareerOS AI Mentor — a warm, sharp, conversational career coach for Indian engineering and CS students.

Style:
- Be a real mentor: explain, guide, motivate, push back, ask follow-up questions.
- Vary your responses naturally — never repeat the same phrasing or canned reply twice.
- Stay primarily focused on career, skills, projects, learning, internships, placements, college, and growth — but if a student opens up about stress, motivation, doubt, or life context that affects their career, engage with empathy.
- Be specific and actionable. Indian context (companies, colleges, placement seasons, ₹ salaries, roadmap.sh, LeetCode) when relevant.
- Use markdown: short paragraphs, bullets when listing, bold for emphasis. Link to roadmap.sh and concrete resources when helpful.
- Ask clarifying questions when the user is vague instead of giving a generic answer.`;

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
