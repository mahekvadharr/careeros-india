
-- 1. Add is_pro to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false;

-- 2. resume_analyses
CREATE TABLE public.resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  target_role text,
  overall_score integer NOT NULL DEFAULT 0,
  ats_score integer NOT NULL DEFAULT 0,
  keyword_score integer NOT NULL DEFAULT 0,
  project_score integer NOT NULL DEFAULT 0,
  experience_score integer NOT NULL DEFAULT 0,
  formatting_score integer NOT NULL DEFAULT 0,
  feedback jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_analyses TO authenticated;
GRANT ALL ON public.resume_analyses TO service_role;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resume analyses" ON public.resume_analyses FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. skill_gap_results
CREATE TABLE public.skill_gap_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role text NOT NULL,
  match_percentage integer NOT NULL DEFAULT 0,
  required_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  matched_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  learning_plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_weeks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_gap_results TO authenticated;
GRANT ALL ON public.skill_gap_results TO service_role;
ALTER TABLE public.skill_gap_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skill gap" ON public.skill_gap_results FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. readiness_scores
CREATE TABLE public.readiness_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score integer NOT NULL DEFAULT 0,
  resume_score integer NOT NULL DEFAULT 0,
  skills_score integer NOT NULL DEFAULT 0,
  projects_score integer NOT NULL DEFAULT 0,
  certifications_score integer NOT NULL DEFAULT 0,
  linkedin_score integer NOT NULL DEFAULT 0,
  roadmap_score integer NOT NULL DEFAULT 0,
  improvement_plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_weeks integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.readiness_scores TO authenticated;
GRANT ALL ON public.readiness_scores TO service_role;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own readiness" ON public.readiness_scores FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. pro_waitlist
CREATE TABLE public.pro_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  source text NOT NULL DEFAULT 'modal',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_waitlist TO authenticated;
GRANT ALL ON public.pro_waitlist TO service_role;
ALTER TABLE public.pro_waitlist ENABLE ROW LEVEL SECURITY;
-- Authenticated users can insert their own row and read their own row.
CREATE POLICY "own waitlist" ON public.pro_waitlist FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. monthly_usage  (one row per user per YYYY-MM)
CREATE TABLE public.monthly_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period text NOT NULL,  -- 'YYYY-MM'
  ai_messages integer NOT NULL DEFAULT 0,
  resume_analyses integer NOT NULL DEFAULT 0,
  job_applications integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_usage TO authenticated;
GRANT ALL ON public.monthly_usage TO service_role;
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage" ON public.monthly_usage FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
