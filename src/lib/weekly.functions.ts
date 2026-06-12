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
                  estimated_minutes: { type: "integer", minimum: 15, maximum: 600 },
                },
                required: ["start_here", "learn", "practice", "estimated_minutes"],
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

    const sys = `You are CareerOS, a premium AI career coach for Indian engineering students. Generate this week's focused action plan. Be concrete and Indian-context aware.`;
    const user = `Profile: branch=${profile.branch}, year=${profile.year}, target=${profile.target_career}, dream companies=${(profile.dream_companies ?? []).join(", ")}, skills=${(profile.current_skills ?? []).join(", ")}, weekly hours=${profile.weekly_hours}. Generate 5-7 tasks for this week totaling ~${profile.weekly_hours} hours.`;

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
