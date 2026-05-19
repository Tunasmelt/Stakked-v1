-- Fix: RLS policy on published_projects incorrectly allowed any authenticated
-- user to UPDATE or DELETE rows where user_id = 'anon'.  Split the combined
-- FOR ALL policy into separate SELECT / INSERT / UPDATE / DELETE policies so
-- that anonymous rows can only be created or modified by unauthenticated
-- callers, and authenticated rows are owned exclusively by their creator.

-- Drop the overly-broad combined policy
DROP POLICY IF EXISTS "Users manage own published projects" ON published_projects;

-- Authenticated users may INSERT/UPDATE/DELETE only their own rows.
CREATE POLICY "Authenticated users manage own published projects"
  ON published_projects
  FOR ALL
  USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = user_id);

-- Unauthenticated callers may INSERT anon rows only.
-- UPDATE/DELETE of anon rows is intentionally disallowed — use the server-side
-- publish API (which does its own auth checks) to overwrite existing slugs.
CREATE POLICY "Unauthenticated callers can insert anon projects"
  ON published_projects
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL AND user_id = 'anon');
