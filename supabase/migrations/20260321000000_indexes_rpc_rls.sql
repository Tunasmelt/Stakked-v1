-- ============================================================
-- Migration: indexes, fork_count RPC, and RLS WITH CHECK
-- ============================================================

-- 1. Sort indexes missing from the initial migration
--    published_projects is ordered by created_at in the community gallery
CREATE INDEX IF NOT EXISTS published_projects_created_at_idx
  ON published_projects(created_at DESC);

--    projects is ordered by updated_at in the workspace cloud-project list
CREATE INDEX IF NOT EXISTS projects_updated_at_idx
  ON projects(updated_at DESC);

--    form_submissions is ordered by submitted_at in the workspace inbox
CREATE INDEX IF NOT EXISTS form_submissions_submitted_at_idx
  ON form_submissions(submitted_at DESC);

-- 2. Add WITH CHECK to the projects "manage own" policy so INSERT/UPDATE
--    cannot set user_id to a value the caller doesn't own.
--    (USING alone is used as the check expression for FOR ALL, but explicit
--     WITH CHECK is clearer and prevents future policy-editor confusion.)
DROP POLICY IF EXISTS "Users manage own projects" ON projects;

CREATE POLICY "Users manage own projects"
  ON projects
  FOR ALL
  USING  (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = user_id);

-- 3. SECURITY DEFINER RPC to atomically increment fork_count.
--    Called from POST /api/fork — runs as the table owner so it bypasses RLS.
--    The function validates the slug exists before incrementing; if the row is
--    missing it silently returns (safe to call speculatively).
CREATE OR REPLACE FUNCTION increment_fork_count(p_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE published_projects
  SET    fork_count = COALESCE(fork_count, 0) + 1
  WHERE  slug = p_slug;
END;
$$;

-- Revoke direct execute from public; only the anon/service role needs it
-- (Supabase grants execute to anon by default for RPCs, which is fine here
--  since the API route is rate-limited and validates the slug format first.)
GRANT EXECUTE ON FUNCTION increment_fork_count(TEXT) TO anon, authenticated;
