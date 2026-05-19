/* src/components/editor/ProjectSettingsModal.tsx */
'use client';

import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, Database, Globe, BarChart3 } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import styles from '@/styles/SettingsModal.module.css';

export default function ProjectSettingsModal() {
  const isOpen = useUIStore((s) => s.settingsModalOpen);
  const setIsOpen = useUIStore((s) => s.setSettingsModalOpen);
  const project = useProjectStore((s) => s.project);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [activeTab, setActiveTab] = useState<'general' | 'variables' | 'analytics'>('general');

  // Escape closes the modal (ARIA requirement for role="dialog")
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, setIsOpen]);

  if (!isOpen || !project) return null;

  const updateSettings = (updates: Partial<typeof project.settings>) => {
    updateProject({ settings: { ...project.settings, ...updates } });
  };

  const addVariable = () => {
    const vars = project.settings.variables || {};
    const name = `var_${Object.keys(vars).length + 1}`;
    updateSettings({
      variables: {
        ...vars,
        [name]: { value: false, type: 'boolean' }
      }
    });
  };

  const removeVariable = (name: string) => {
    const vars = { ...project.settings.variables };
    delete vars[name];
    updateSettings({ variables: vars });
  };

  const updateVariable = (name: string, updates: Record<string, string | number | boolean>) => {
    const vars = { ...project.settings.variables };
    vars[name] = { ...vars[name], ...updates } as { value: string | number | boolean; type: 'string' | 'number' | 'boolean' };
    updateSettings({ variables: vars });
  };

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <Database size={16} className={styles.accentIcon} />
            <h2>Project settings</h2>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <button 
              className={`${styles.navItem} ${activeTab === 'general' ? styles.active : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Globe size={14} /> General
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'variables' ? styles.active : ''}`}
              onClick={() => setActiveTab('variables')}
            >
              <Database size={14} /> Variables
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={14} /> Analytics
            </button>
          </aside>

          <main className={styles.content}>
            {activeTab === 'general' && (
              <section className={styles.section}>
                <h3>General info</h3>
                <div className={styles.field}>
                  <label>Project Title</label>
                  <input 
                    type="text" 
                    value={project.title} 
                    onChange={(e) => updateProject({ title: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label>URL Slug</label>
                  <input
                    type="text"
                    value={project.slug}
                    onChange={(e) => {
                      // Sanitize to lowercase URL-safe characters only
                      const safe = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '-')
                        .replace(/-{2,}/g, '-')
                        .replace(/^-+|-+$/g, '');
                      updateProject({ slug: safe });
                    }}
                    placeholder="my-project-slug"
                  />
                </div>
              </section>
            )}

            {activeTab === 'analytics' && (
              <section className={styles.section}>
                <h3>Analytics</h3>
                <div className={styles.field}>
                  <label>Google Analytics ID</label>
                  <input
                    type="text"
                    value={(project.settings as { gaId?: string }).gaId ?? ''}
                    placeholder="G-XXXXXXXXXX"
                    onChange={(e) => updateSettings({ gaId: e.target.value } as Record<string, unknown>)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Plausible Domain</label>
                  <input
                    type="text"
                    value={(project.settings as { plausibleDomain?: string }).plausibleDomain ?? ''}
                    placeholder="yourdomain.com"
                    onChange={(e) => updateSettings({ plausibleDomain: e.target.value } as Record<string, unknown>)}
                  />
                </div>
                <p className={styles.caption}>
                  Analytics scripts are injected into the published site only — never in preview or the editor.
                </p>
              </section>
            )}

            {activeTab === 'variables' && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Global state</h3>
                  <button className={styles.addBtn} onClick={addVariable}>
                    <Plus size={12} /> Add Variable
                  </button>
                </div>
                <p className={styles.caption}>Define variables for logic gates and conditional routing.</p>
                
                <div className={styles.varList}>
                  {Object.entries(project.settings.variables || {}).map(([name, config], idx) => (
                    <div key={idx} className={styles.varRow}>
                      <input 
                        className={styles.varName} 
                        value={name} 
                        onChange={(e) => {
                          const vars = { ...project.settings.variables };
                          delete vars[name];
                          vars[e.target.value] = config;
                          updateSettings({ variables: vars });
                        }}
                      />
                      <select 
                        className={styles.varType} 
                        value={config.type}
                        onChange={(e) => updateVariable(name, { type: e.target.value })}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      {config.type === 'boolean' ? (
                        <input 
                          type="checkbox"
                          className={styles.varCheck}
                          checked={Boolean(config.value)}
                          onChange={(e) => updateVariable(name, { value: e.target.checked })}
                        />
                      ) : (
                        <input 
                          className={styles.varValue}
                          type={config.type === 'number' ? 'number' : 'text'}
                          value={String(config.value)}
                          onChange={(e) => {
                            const val = config.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                            updateVariable(name, { value: val });
                          }}
                        />
                      )}
                      <button className={styles.removeVar} onClick={() => removeVariable(name)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {Object.keys(project.settings.variables || {}).length === 0 && (
                    <div className={styles.empty}>No variables defined.</div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>

        <footer className={styles.footer}>
          <button className={styles.primaryBtn} onClick={() => setIsOpen(false)}>Done</button>
        </footer>
      </div>
    </div>
  );
}
