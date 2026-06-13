import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGemini } from "./ai.server";

const WEEKLY_TOOL = {
  type: "function",
  function: {
    name: "emit_weekly_tasks",
    description: "Emit a week's worth of focused, actionable career tasks for an Indian engineering student.",
    parameters: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          minItems: 5,
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              detail: { type: "string" },
              hours: { type: "number" },
              category: { type: "string", enum: ["learn", "build", "apply", "network", "review"] },
              resources: {
                type: "object",
                description: "Concrete WHERE-to-do-this links. Prefer roadmap.sh, freeCodeCamp, official docs, LeetCode, GitHub, YouTube.",
                properties: {
                  start_here: { type: "string", description: "Single best link to begin (URL)." },
                  learn: { type: "string", description: "Primary learning resource URL (course, tutorial, docs)." },
                  practice: { type: "string", description: "Practice platform URL (LeetCode set, project brief, exercise)." },
                  roadmap: { type: "string", description: "roadmap.sh URL when applicable." },
                  youtube: { type: "string", description: "Real YouTube video or playlist URL that teaches this task's topic." },
                  estimated_minutes: { type: "integer", minimum: 15, maximum: 600 },
                },
                required: ["start_here", "learn", "practice", "roadmap", "youtube", "estimated_minutes"],
                additionalProperties: false,
              },
            },
            required: ["title", "detail", "hours", "category", "resources"],
            additionalProperties: false,
          },
        },
      },
      required: ["tasks"],
      additionalProperties: false,
    },
  },
};

function mondayOf(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0=Mon
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const generateWeeklyTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (!profile) throw new Error("Profile not found");

    const { data: gap } = await supabase
      .from("skill_gap_results")
      .select("target_role, missing_skills, learning_plan")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const gapContext = gap
      ? `Latest Skill Gap (target: ${gap.target_role}). Build this week's missions by taking 1-3 next steps from these missing skills and converting them into small daily tasks. Reuse the same roadmap.sh / YouTube links from the gap when relevant.\n\nMissing skills:\n${JSON.stringify(gap.missing_skills).slice(0, 4000)}\n\nLearning plan:\n${JSON.stringify(gap.learning_plan).slice(0, 2000)}`
      : `No skill gap analysis yet — generate a balanced week based on the profile alone.`;

    const sys = `You are CareerOS, a premium AI career coach for Indian engineering students. Generate this week's focused action plan as small, Duolingo-style daily tasks (NOT vague goals). Each task must be tiny and specific — e.g. "Watch <video> + solve 5 array problems on LeetCode", not "Learn JavaScript".

STRICT LINK RULES (any violation = failure):
- youtube: ONLY canonical https://www.youtube.com/watch?v=VIDEOID URLs (11-char id). NEVER /embed/, /shorts/, youtu.be, or fake ids. If unsure, leave as "".
- roadmap: ONLY confirmed roadmap.sh pages (/frontend /backend /full-stack /devops /python /javascript /typescript /react /nodejs /sql /system-design /ai-data-scientist /android /ios /ux-design /product-manager /datastructures-and-algorithms /computer-science). Else "".
- start_here / learn / practice: only canonical roots of well-known sites (leetcode.com, hackerrank.com, freecodecamp.org/learn, developer.mozilla.org, react.dev, official docs, github.com). No guessed deep paths.
- Do NOT reuse the same URL across multiple tasks. Use freeCodeCamp at most once across the whole week.`;
    const user = `Profile: branch=${profile.branch}, year=${profile.year}, target=${profile.target_career}, dream companies=${(profile.dream_companies ?? []).join(", ")}, skills=${(profile.current_skills ?? []).join(", ")}, weekly hours=${profile.weekly_hours}.\n\n${gapContext}\n\nGenerate 5-7 tasks totaling ~${profile.weekly_hours} hours.`;

    const { toolArguments } = await callGemini({
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      tools: [WEEKLY_TOOL],
      tool_choice: { type: "function", function: { name: "emit_weekly_tasks" } },
    });
    const rawTasks = ((toolArguments as { tasks?: unknown[] })?.tasks ?? []) as Array<Record<string, unknown>>;
    const tasks = rawTasks.map((t, i) => ({ id: `${Date.now()}-${i}`, done: false, ...t }));
    const week = mondayOf();

    await supabase
      .from("weekly_tasks")
      .upsert({ user_id: userId, week_start: week, tasks }, { onConflict: "user_id,week_start" });
    return { week_start: week, tasks };
  });

export const getWeeklyTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const week = mondayOf();
    const { data } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", week)
      .maybeSingle();
    return { week_start: week, plan: data };
  });

export const toggleWeeklyTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ taskId: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const week = mondayOf();
    const { data: row } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", week)
      .maybeSingle();
    if (!row) throw new Error("No weekly plan yet");
    const prevTasks = row.tasks as Array<{ id: string; done?: boolean }>;
    const prev = prevTasks.find((t) => t.id === data.taskId);
    const nowDone = !(prev?.done);
    const tasks = prevTasks.map((t) => (t.id === data.taskId ? { ...t, done: nowDone } : t));
    await supabase.from("weekly_tasks").update({ tasks }).eq("id", row.id);

    // XP + streak — only when marking complete
    let xpAwarded = 0;
    let streakDays = 0;
    let totalXp = 0;
    if (nowDone) {
      xpAwarded = 25;
      const { data: prof } = await supabase
        .from("profiles")
        .select("xp, streak_days, last_active_date")
        .eq("user_id", userId)
        .maybeSingle();
      const today = new Date().toISOString().slice(0, 10);
      const last = prof?.last_active_date as string | null | undefined;
      let nextStreak = prof?.streak_days ?? 0;
      if (last === today) {
        // already counted today
      } else if (last && new Date(today).getTime() - new Date(last).getTime() === 86400000) {
        nextStreak += 1;
      } else {
        nextStreak = 1;
      }
      totalXp = (prof?.xp ?? 0) + xpAwarded;
      streakDays = nextStreak;
      await supabase
        .from("profiles")
        .update({ xp: totalXp, streak_days: streakDays, last_active_date: today })
        .eq("user_id", userId);
    }
    return { tasks, xpAwarded, streakDays, totalXp };
  });
