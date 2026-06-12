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

    const sys = `You are CareerOS, a premium AI career coach for Indian engineering students. Generate this week's focused action plan as small, Duolingo-style daily tasks (NOT vague goals). Each task must be tiny and specific — e.g. "Watch <video> + solve 5 array problems on LeetCode + read roadmap.sh JS Basics", not "Learn JavaScript". For every task fill the resources object with REAL working URLs: start_here, learn, practice, roadmap (roadmap.sh page), and youtube (real YouTube video/playlist that teaches the topic — prefer freeCodeCamp, Apna College, CodeWithHarry, Fireship, Traversy Media, NeetCode).`;
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
    const tasks = (row.tasks as Array<{ id: string; done?: boolean }>).map((t) =>
      t.id === data.taskId ? { ...t, done: !t.done } : t,
    );
    await supabase.from("weekly_tasks").update({ tasks }).eq("id", row.id);
    return { tasks };
  });
