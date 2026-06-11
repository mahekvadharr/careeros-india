import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Deterministic readiness score so users can re-run without burning AI credits.
export const computeReadiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [{ data: profile }, { data: latestResume }, { data: roadmap }, { data: weekly }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("resume_analyses").select("overall_score").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("roadmaps").select("semesters").eq("user_id", userId).maybeSingle(),
      supabase.from("weekly_tasks").select("tasks").eq("user_id", userId).order("week_start", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const skillsCount = (profile?.current_skills ?? []).length;
    const resumeScore = latestResume?.overall_score ?? 0;
    const skillsScore = Math.min(100, skillsCount * 8);
    // We don't have a projects table yet — derive from skills depth as proxy.
    const projectsScore = Math.min(100, skillsCount * 6);
    const certificationsScore = skillsCount > 5 ? 40 : 15;
    const linkedinScore = profile?.full_name && profile?.email ? 50 : 20;
    const semesters = (roadmap?.semesters as unknown[] | undefined)?.length ?? 0;
    const roadmapScore = Math.min(100, semesters * 14);
    const weeklyTasks = (weekly?.tasks as Array<{ done?: boolean }> | undefined) ?? [];
    const weeklyBoost = weeklyTasks.length
      ? Math.round((weeklyTasks.filter((t) => t.done).length / weeklyTasks.length) * 10)
      : 0;

    const total = Math.min(
      100,
      Math.round(
        resumeScore * 0.25 +
        skillsScore * 0.2 +
        projectsScore * 0.15 +
        certificationsScore * 0.1 +
        linkedinScore * 0.1 +
        roadmapScore * 0.2,
      ) + weeklyBoost,
    );

    const missing: string[] = [];
    const plan: Array<{ title: string; detail: string }> = [];
    if (resumeScore < 60) { missing.push("Resume below 60"); plan.push({ title: "Upload and improve resume", detail: "Run Resume Analyzer to lift your ATS and keyword scores above 70." }); }
    if (skillsCount < 6) { missing.push("Skills coverage thin"); plan.push({ title: "Add 3+ role-relevant skills", detail: "Complete a focused course or project this month and add the skill to your profile." }); }
    if (semesters === 0) { missing.push("No roadmap"); plan.push({ title: "Generate your career roadmap", detail: "Go to Career GPS and build a semester-wise plan." }); }
    if (certificationsScore < 40) { missing.push("Few certifications"); plan.push({ title: "Earn one certification", detail: "AWS Cloud Practitioner, Google Data Analytics, or Meta Frontend in 4-6 weeks." }); }
    if (linkedinScore < 50) { missing.push("LinkedIn incomplete"); plan.push({ title: "Polish LinkedIn", detail: "Headline, about, banner, pinned projects, 5+ skills endorsed." }); }

    const estimated_weeks = Math.max(4, Math.round((100 - total) / 8));

    const { data: row, error } = await supabase
      .from("readiness_scores")
      .upsert(
        {
          user_id: userId,
          total_score: total,
          resume_score: resumeScore,
          skills_score: skillsScore,
          projects_score: projectsScore,
          certifications_score: certificationsScore,
          linkedin_score: linkedinScore,
          roadmap_score: roadmapScore,
          improvement_plan: plan as never,
          missing_items: missing as never,
          estimated_weeks,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { readiness: row };
  });

export const getReadiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("readiness_scores")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return { readiness: data };
  });
