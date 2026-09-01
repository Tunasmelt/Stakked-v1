'use client';

import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Briefcase, Clock, Trash2, FolderOpen, Users, Settings, BookOpen, Edit2, Globe, HelpCircle,
} from 'lucide-react';
import { listProjects, saveProject, deleteProject, getStorageEstimate } from '@/lib/db';
import { StakkedProject } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore, CHROME_THEMES } from '@/stores/ui-store';
import { useTutorialStore } from '@/stores/tutorial-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { TutorialOverlay } from '@/components/system/TutorialOverlay';
import { STARTER_TEMPLATES } from '@/data/templates/starters';
import styles from '@/styles/Workspace.module.css';

/** Template metadata for display — derived from STARTER_TEMPLATES so every
 *  defined template is reachable from the UI (a hand-maintained subset here
 *  previously went stale and pointed at two empty stub templates). */
const TEMPLATE_CARDS = Object.entries(STARTER_TEMPLATES)
  .filter(([, tmpl]) => (tmpl.pages?.[0]?.elements.length ?? 0) > 0)
  .map(([key, tmpl], i) => ({
    key,
    name: tmpl.title ?? key,
    desc: [tmpl.category, tmpl.tags?.[0]].filter(Boolean).join(' · '),
    accent: i % 2 === 0 ? 'var(--accent)' : 'var(--surface)',
  }));

/**
 * Workspace Dashboard — project management hub.
 * Matches the prototype `.wx` tile: sysbar + 2-col body (180px sidebar +
 * project grid). Cards are 4:3 with a 65% preview strip + meta footer.
 */
export default function WorkspacePage() {
  const router = useRouter();
  const [view, setView] = useState<'projects' | 'templates' | 'community' | 'settings'>('projects');
  const [projects, setProjects] = useState<StakkedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  interface FormSubmission {
    id: string;
    element_id: string;
    project_id: string | null;
    data: Record<string, string>;
    submitted_at: string;
  }
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [storagePct, setStoragePct] = useState(0);
  const createProjectTemplate = useProjectStore((state) => state.createProject);
  const { showConfirm, showPrompt, addToast, theme, setTheme } = useUIStore();
  const { startTour } = useTutorialStore();

  // Auth state
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch form submissions when settings tab opens
  useEffect(() => {
    if (view !== 'settings' || !supabase || !userId) return;
    setSubmissionsLoading(true);
    supabase
      .from('form_submissions')
      .select('id, element_id, project_id, data, submitted_at')
      .eq('owner_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!error) setSubmissions((data as FormSubmission[]) ?? []);
        setSubmissionsLoading(false);
      });
  }, [view, userId]);

  // Fetch real browser storage usage when settings tab opens
  useEffect(() => {
    if (view !== 'settings') return;
    getStorageEstimate().then(({ usage, quota }) => {
      setStoragePct(quota ? Math.min(100, Math.round(((usage ?? 0) / quota) * 100)) : 0);
    });
  }, [view]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  // Load existing projects from IndexedDB
  useEffect(() => {
    async function load() {
      try {
        // 1. Load from local IndexedDB first (fast)
        const localData = await listProjects();
        const merged = new Map(localData.map((p) => [p.id, p]));

        // 2. If authenticated, fetch cloud projects and merge
        if (isSupabaseConfigured && supabase) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: cloudRows } = await supabase
                .from('projects')
                .select('data, updated_at')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
                .limit(100);

              if (cloudRows) {
                for (const row of cloudRows) {
                  if (!row.data) continue;
                  const cloud = { ...row.data, updatedAt: row.updated_at ?? row.data.updatedAt };
                  const local = merged.get(cloud.id);
                  if (!local || new Date(cloud.updatedAt) > new Date(local.updatedAt)) {
                    merged.set(cloud.id, cloud);
                    // Persist cloud copy locally for offline access
                    await saveProject(cloud).catch(() => {});
                  }
                }
              }
            }
          } catch {
            // Cloud fetch failure is non-fatal — local projects still show
          }
        }

        setProjects(
          Array.from(merged.values()).sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleCreateNew = async () => {
    const newProject = await createProjectTemplate('Untitled Project');
    await saveProject(newProject);
    router.push(`/editor/${newProject.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    showConfirm(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      async () => {
        const deleted = projects.find((p) => p.id === id);
        setProjects(projects.filter((p) => p.id !== id));
        try {
          await deleteProject(id);
        } catch (err) {
          // Rollback on failure
          if (deleted) setProjects(prev => [...prev, deleted].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
          addToast('Delete failed — project restored.', 'error');
          console.error('[workspace] delete failed:', err);
        }
      },
      'Delete'
    );
  };

  const handleCreateFromTemplate = async (templateKey: string) => {
    const template = STARTER_TEMPLATES[templateKey as keyof typeof STARTER_TEMPLATES];
    if (!template) {
      addToast(`Template "${templateKey}" not found.`, 'error');
      return;
    }
    try {
      const newProject = await createProjectTemplate(template.title ?? 'New Project', template.category ?? 'portfolio');
      // Re-generate fresh page IDs so multiple projects from the same template never share IDs
      const freshPages = template.pages?.map(p => ({ ...p, id: uuidv4() }));
      const updatedProject = {
        ...newProject,
        ...(freshPages && { pages: freshPages }),
        ...(template.settings && { settings: { ...newProject.settings, ...template.settings } }),
      };
      await saveProject(updatedProject);
      router.push(`/editor/${updatedProject.id}`);
    } catch (err) {
      console.error('[workspace] template creation failed:', err);
      addToast('Failed to create project from template. Please try again.', 'error');
    }
  };

  const handleRename = async (e: React.MouseEvent, project: StakkedProject) => {
    e.stopPropagation();
    showPrompt(
      'Rename Project',
      project.title,
      async (newName) => {
        if (newName && newName !== project.title) {
          const updated = { ...project, title: newName, updatedAt: new Date().toISOString() };
          await saveProject(updated);
          setProjects(projects.map(p => p.id === project.id ? updated : p));
        }
      },
      'Enter new project name...'
    );
  };

  return (
    <div className={styles.container}>
      <TutorialOverlay />
      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <span className={styles.dot} aria-hidden />
          <span>stakked · workspace</span>
          <span className={styles.sep}>·</span>
          <span>{projects.length} projects</span>
        </div>
        <div className={styles.topRight}>
          {isSupabaseConfigured && (
            userEmail ? (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail}
                </span>
                <button
                  onClick={handleSignOut}
                  className={styles.nav}
                  style={{ color: 'var(--danger, #ef4444)' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/auth/login" className={styles.nav} style={{ color: 'var(--accent)' }}>
                Sign in
              </Link>
            )
          )}
          <Link href="/" className={styles.nav}>
            ← home
          </Link>
        </div>
      </div>

      <div className={styles.body}>
        <aside className={styles.side} data-tour="workspace-sidebar">
          <span className={styles.sideHeading}>{'// scope'}</span>
          <button 
            type="button" 
            className={`${styles.nav} ${view === 'projects' ? styles.active : ''}`}
            onClick={() => setView('projects')}
            data-tour="workspace-projects"
          >
            <FolderOpen size={12} />
            Projects
          </button>
          <button 
            type="button" 
            className={`${styles.nav} ${view === 'templates' ? styles.active : ''}`}
            onClick={() => setView('templates')}
            data-tour="workspace-templates"
          >
            <BookOpen size={12} />
            Templates
          </button>
          <button 
            type="button" 
            className={`${styles.nav} ${view === 'community' ? styles.active : ''}`}
            onClick={() => setView('community')}
            data-tour="workspace-community"
          >
            <Users size={12} />
            Community
          </button>

          <span className={styles.sideHeading} style={{ marginTop: 12 }}>
            {'// account'}
          </span>
          <button 
            type="button" 
            className={`${styles.nav} ${view === 'settings' ? styles.active : ''}`}
            onClick={() => setView('settings')}
            data-tour="workspace-settings"
          >
            <Settings size={12} />
            Settings
          </button>

          <span className={styles.sideHeading} style={{ marginTop: 12 }}>
            {'// help'}
          </span>
          <button
            type="button"
            className={styles.nav}
            onClick={() => startTour('workspace')}
            data-tour="workspace-help"
          >
            <HelpCircle size={12} />
            Tutorial
          </button>
        </aside>

        <main className={styles.main}>
          {view === 'projects' && (
            <>
              <header className={styles.header}>
                <div>
                  <h1 className={styles.title}>Projects</h1>
                  <p className={styles.subtitle}>
                    Pick up where you left off, or start a fresh canvas.
                  </p>
                </div>
                <button className={styles.newButton} onClick={handleCreateNew}>
                  <Plus size={12} />
                  New project
                </button>
              </header>

              <div className={styles.grid}>
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.skeleton} />
                  ))
                ) : projects.length > 0 ? (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className={styles.projectCard}
                      onClick={() => router.push(`/editor/${project.id}`)}
                    >
                      <div className={styles.badge}>
                        {project.pages[0]?.elements.length ?? 0} els
                      </div>
                      <div className={styles.preview} aria-hidden />
                      <div className={styles.info}>
                        <h3 className={styles.projectName}>{project.title}</h3>
                        <div className={styles.projectMeta}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Clock size={10} />
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </span>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button
                              className={styles.renameButton}
                              onClick={(e) => { e.stopPropagation(); handleRename(e, project); }}
                              title="Rename project"
                              aria-label="Rename project"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              className={styles.deleteButton}
                              onClick={(e) => { e.stopPropagation(); handleDelete(e, project.id); }}
                              title="Delete project"
                              aria-label="Delete project"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.empty}>
                    <Briefcase size={32} />
                    <h2>No projects yet</h2>
                    <p>Click &ldquo;New project&rdquo; to start your first canvas.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {view === 'templates' && (
            <>
              <header className={styles.header}>
                <div>
                  <h1 className={styles.title}>Templates</h1>
                  <p className={styles.subtitle}>
                    Professional starters curated for music, GFX, and creative portfolios.
                  </p>
                </div>
              </header>
              <div className={styles.grid}>
                {TEMPLATE_CARDS.map((tmpl) => (
                  <div
                    key={tmpl.key}
                    className={styles.projectCard}
                    style={{ background: tmpl.accent, cursor: 'pointer' }}
                    onClick={() => handleCreateFromTemplate(tmpl.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFromTemplate(tmpl.key)}
                    aria-label={`Create project from template: ${tmpl.name}`}
                  >
                    <div className={styles.preview} aria-hidden />
                    <div className={styles.info} style={{ background: 'transparent' }}>
                      <h3 className={styles.projectName}>{tmpl.name}</h3>
                      <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: 0 }}>{tmpl.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'community' && (
            <>
              <header className={styles.header}>
                <div>
                  <h1 className={styles.title}>Community</h1>
                  <p className={styles.subtitle}>
                    Your published projects — visible to anyone with the link.
                  </p>
                </div>
                <Link href="/community" className={styles.newButton} style={{ textDecoration: 'none' }}>
                  Open Gallery
                </Link>
              </header>
              {(() => {
                const published = projects.filter((p) => p.published);
                return published.length > 0 ? (
                  <div className={styles.grid}>
                    {published.map((p) => (
                      <div key={p.id} className={styles.projectCard}>
                        <div className={styles.preview} aria-hidden />
                        <div className={styles.info}>
                          <h3 className={styles.projectName}>{p.title}</h3>
                          <div className={styles.projectMeta}>
                            <Link
                              href={`/v/${p.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe size={10} />
                              View live
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-mute)' }}>
                    <Users size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                    <p>No published projects yet. Open a project and click Publish.</p>
                  </div>
                );
              })()}
            </>
          )}

          {view === 'settings' && (
            <>
              <header className={styles.header}>
                <div>
                  <h1 className={styles.title}>Account Settings</h1>
                  <p className={styles.subtitle}>
                    Manage experimental features, storage, and developer keys.
                  </p>
                </div>
              </header>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '20px 0' }}>
                <section>
                  <h3 style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-dim)' }}>Storage</h3>
                  <div style={{ padding: 16, border: '1px solid var(--line)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span>Local Projects</span>
                      <span>{projects.length} files</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, marginTop: 8 }}>
                      <div style={{ width: `${storagePct}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                    </div>
                  </div>
                </section>
                <section>
                  <h3 style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-dim)' }}>Theme</h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {CHROME_THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        title={t.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          border: theme === t.id
                            ? `2px solid ${t.sw[3]}`
                            : '2px solid transparent',
                          background: `linear-gradient(135deg, ${t.sw[0]} 50%, ${t.sw[3]} 100%)`,
                          cursor: 'pointer',
                          boxShadow: theme === t.id ? `0 0 0 3px ${t.sw[3]}44` : 'none',
                          transition: 'box-shadow 150ms, border-color 150ms',
                          flexShrink: 0,
                          outline: 'none',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: '6px 0 0' }}>
                    Theme applies immediately across the editor and workspace.
                  </p>
                </section>

                {/* Form Submissions */}
                {userId && isSupabaseConfigured && (
                  <section>
                    <h3 style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-dim)' }}>Form Submissions</h3>
                    <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
                      {submissionsLoading ? (
                        <div style={{ padding: 24, fontSize: 12, color: 'var(--text-mute)', textAlign: 'center' }}>
                          Loading…
                        </div>
                      ) : submissions.length === 0 ? (
                        <div style={{ padding: 24, fontSize: 12, color: 'var(--text-mute)', textAlign: 'center' }}>
                          No submissions yet. Form elements on your published pages will appear here.
                        </div>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                            <thead>
                              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>Date</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>Form</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {submissions.map((s, i) => (
                                <tr key={s.id} style={{ borderBottom: i < submissions.length - 1 ? '1px solid var(--line)' : 'none', background: i % 2 === 0 ? 'transparent' : 'var(--surface)' }}>
                                  <td style={{ padding: '8px 12px', color: 'var(--text-mute)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                                    {new Date(s.submitted_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                  </td>
                                  <td style={{ padding: '8px 12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {s.element_id.slice(0, 8)}…
                                  </td>
                                  <td style={{ padding: '8px 12px', color: 'var(--text)', maxWidth: 320 }}>
                                    {Object.entries(s.data).map(([k, v]) => (
                                      <span key={k} style={{ display: 'inline-block', marginRight: 12 }}>
                                        <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{k}: </span>
                                        {String(v)}
                                      </span>
                                    ))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-mute)', margin: '6px 0 0' }}>
                      Showing up to 100 most recent submissions across all your published projects.
                    </p>
                  </section>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
