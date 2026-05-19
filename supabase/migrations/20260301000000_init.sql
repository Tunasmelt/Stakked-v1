-- NOTE: After running this migration, manually create the storage bucket:
--   Bucket name : published-html
--   Public      : true  (allows direct CDN URL access)
--   File size   : 50 MB limit recommended
--   Allowed MIME: text/html

-- ============================================================
-- Table: projects
-- Cloud-saved project data
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);

-- ============================================================
-- Table: published_projects
-- Publish pipeline metadata + HTML snapshot
-- ============================================================
CREATE TABLE IF NOT EXISTS published_projects (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  project_id  TEXT NOT NULL,
  title       TEXT,
  user_id     TEXT NOT NULL DEFAULT 'anon',
  tags        TEXT[] DEFAULT '{}',
  fork_count  INT DEFAULT 0,
  public_url  TEXT,
  data        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS published_projects_slug_idx ON published_projects(slug);
CREATE INDEX IF NOT EXISTS published_projects_user_id_idx ON published_projects(user_id);

-- ============================================================
-- Table: form_submissions
-- Contact form submissions from published pages
-- ============================================================
CREATE TABLE IF NOT EXISTS form_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id   TEXT NOT NULL,
  project_id   TEXT,           -- references the published project, for owner queries
  owner_id     TEXT,           -- user_id of the project owner at publish time
  data         JSONB NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS form_submissions_element_id_idx ON form_submissions(element_id);
CREATE INDEX IF NOT EXISTS form_submissions_owner_id_idx  ON form_submissions(owner_id);

-- ============================================================
-- Row-Level Security
-- ============================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON projects
  FOR ALL USING (auth.uid()::text = user_id);

ALTER TABLE published_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published projects" ON published_projects
  FOR SELECT USING (true);
CREATE POLICY "Users manage own published projects" ON published_projects
  FOR ALL USING (auth.uid()::text = user_id OR user_id = 'anon');

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert form submissions" ON form_submissions
  FOR INSERT WITH CHECK (true);
-- Project owners can read submissions for their own projects
CREATE POLICY "Project owners can read own submissions" ON form_submissions
  FOR SELECT USING (auth.uid()::text = owner_id);
