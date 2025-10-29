-- Create study_sessions table to track study sessions
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  subject_name text NOT NULL,
  topic text,
  duration_minutes integer NOT NULL,
  timer_mode text NOT NULL,
  started_at timestamp with time zone NOT NULL,
  completed_at timestamp with time zone NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON public.study_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON public.study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON public.study_sessions(completed_at);

-- Enable Row Level Security
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sessions"
ON public.study_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON public.study_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.study_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.study_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);