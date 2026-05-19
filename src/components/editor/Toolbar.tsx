'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MousePointer2, Hand, Undo2, Redo2, Eye,
  Maximize, Rocket, Sparkles, Wand2, FileText, SlidersHorizontal, Download, Search, Settings,
  Play, Square, LayoutDashboard, Workflow, WifiOff, LogIn, LogOut, User, ZoomIn, ZoomOut,
  Image as ImageIcon, Film
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { useUIStore } from '@/stores/ui-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { BreakpointSwitcher } from './BreakpointSwitcher';
import AIGenerateModal from './AIGenerateModal';
import PublishModal from './PublishModal';
import { defaultAnimation } from '@/lib/animation-engine';
import { exportMedia, ExportFormat } from '@/lib/export-media';
import { downloadBlob } from '@/lib/export-image';
import { compileProjectToHtml } from '@/lib/export';
import styles from '@/styles/Toolbar.module.css';

/**
 * Toolbar
 *
 * Top editor chrome. Matches the Claude-design `.tbar` layout:
 * [tools] · [history] · [file title] · [zoom] · [spacer] · [breakpoints] ·
 * [save indicator] · [AI · Auto-Animate] · [Preview] · [Theme · Tweaks] ·
 * [Publish].
 */
export const Toolbar: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  // ── Fine-grained store selectors (avoid full-store subscription) ───────────
  const undo            = useProjectStore(state => state.undo);
  const redo            = useProjectStore(state => state.redo);
  const isDirty         = useProjectStore(state => state.isDirty);
  const canUndo         = useProjectStore(state => state.history.length > 0);
  const canRedo         = useProjectStore(state => state.future.length > 0);
  const project         = useProjectStore(state => state.project);
  const activePageIndex = useProjectStore(state => state.activePageIndex);
  const updateElement   = useProjectStore(state => state.updateElement);
  const commit          = useProjectStore(state => state.commit);

  // Individual selectors so dragging/resizing/selection changes don't re-render the toolbar
  const activeTool = useEditorStore(state => state.activeTool);
  const setTool    = useEditorStore(state => state.setTool);
  const zoom       = useEditorStore(state => state.zoom);

  const tweaksOpen           = useUIStore(state => state.tweaksOpen);
  const toggleTweaks         = useUIStore(state => state.toggleTweaks);
  const previewMode          = useUIStore(state => state.previewMode);
  const setPreviewMode       = useUIStore(state => state.setPreviewMode);
  const setCommandPaletteOpen = useUIStore(state => state.setCommandPaletteOpen);
  const setSettingsModalOpen = useUIStore(state => state.setSettingsModalOpen);
  const viewMode             = useUIStore(state => state.viewMode);
  const setViewMode          = useUIStore(state => state.setViewMode);

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [aiOpen, setAiOpen]         = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [exportOpen, setExportOpen]  = useState(false);

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [userEmail, setUserEmail]     = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Outside-click close for export + user menus ────────────────────────────
  const exportWrapRef = useRef<HTMLDivElement>(null);
  const userChipRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen && !userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (exportOpen && exportWrapRef.current && !exportWrapRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
      if (userMenuOpen && userChipRef.current && !userChipRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick, true);
    return () => document.removeEventListener('mousedown', handleClick, true);
  }, [exportOpen, userMenuOpen]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setUserEmail(null);
  };

  const displayZoom = Math.round(zoom * 100);

  // ── Zoom input local state (controlled, avoids remount flicker) ───────────
  const [zoomDraft, setZoomDraft] = useState(`${displayZoom}%`);
  const [isZoomFocused, setIsZoomFocused] = useState(false);
  const [prevDisplayZoom, setPrevDisplayZoom] = useState(displayZoom);
  if (prevDisplayZoom !== displayZoom && !isZoomFocused) {
    setPrevDisplayZoom(displayZoom);
    setZoomDraft(`${displayZoom}%`);
  }

  const handleZoomFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsZoomFocused(true);
    e.currentTarget.select();
  }, []);

  const handleZoomBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsZoomFocused(false);
    const val = parseInt(e.currentTarget.value.replace('%', ''));
    if (!isNaN(val)) {
      const newZoom = Math.min(Math.max(val / 100, 0.1), 5.0);
      window.dispatchEvent(new CustomEvent('stakked-zoom-to', { detail: { zoom: newZoom } }));
    }
    setZoomDraft(`${displayZoom}%`);
  }, [displayZoom]);

  const handlePreview = () => {
    if (!projectId) return;
    window.open(`/preview/${projectId}`, '_blank');
  };

  const handleFitPage = () => {
    window.dispatchEvent(new CustomEvent('stakked-fit-page'));
  };

  const handleZoomStep = (direction: 1 | -1) => {
    const steps = [0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5];
    const current = zoom;
    if (direction === 1) {
      const next = steps.find(s => s > current + 0.01) ?? 5;
      window.dispatchEvent(new CustomEvent('stakked-zoom-to', { detail: { zoom: next } }));
    } else {
      const prev = [...steps].reverse().find(s => s < current - 0.01) ?? 0.1;
      window.dispatchEvent(new CustomEvent('stakked-zoom-to', { detail: { zoom: prev } }));
    }
  };

  const handleZoomInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(e.currentTarget.value.replace('%', ''));
      if (!isNaN(val)) {
        const newZoom = Math.min(Math.max(val / 100, 0.1), 5.0);
        window.dispatchEvent(new CustomEvent('stakked-zoom-to', { detail: { zoom: newZoom } }));
        e.currentTarget.blur();
      }
    } else if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  }, []);

  /**
   * Auto Animate: sort visible elements by Y and cascade a fadeIn with a
   * 100ms stagger under a single undo checkpoint.
   */
  const handleAutoAnimate = () => {
    if (!project) return;
    const page = project.pages[activePageIndex];
    if (!page || page.elements.length === 0) return;

    const sorted = [...page.elements]
      .filter((el) => el.visible !== false)
      .sort((a, b) => a.position.y - b.position.y);

    commit(); // single undo checkpoint for the whole batch
    sorted.forEach((el, i) => {
      const anim = defaultAnimation('fadeIn');
      anim.trigger = 'whileInView';
      anim.delay = i * 100;
      anim.duration = 600;
      anim.easing = 'ease-out';
      // skipCommit=true — commit() above already created the checkpoint
      updateElement(activePageIndex, el.id, { animations: [anim] }, true);
    });
  };

  const handleExport = async (format: ExportFormat | 'html') => {
    if (!project) return;
    try {
      if (format === 'html') {
        const html = compileProjectToHtml(project, { pageIndex: activePageIndex });
        const blob = new Blob([html], { type: 'text/html' });
        downloadBlob(blob, `${project.title || 'export'}.html`);
      } else {
        const node = document.querySelector('[data-export-canvas]') as HTMLElement;
        if (!node) {
          console.warn('Canvas node not found for export');
          return;
        }

        await exportMedia(node, {
          format: format as ExportFormat,
          filename: project.title || 'export',
          background: project.pages[activePageIndex].canvas.background.type === 'color' 
            ? project.pages[activePageIndex].canvas.background.value as string
            : '#0a0a0a'
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExportOpen(false);
  };

  const projectName = project?.title ?? 'untitled.stk';
  const elementCount = project?.pages[activePageIndex]?.elements.length ?? 0;

  return (
    <div className={styles.toolbar}>
      {/* Tools */}
      <div className={styles.group}>
        <button
          className={`${styles.iconbtn} ${activeTool === 'select' ? styles.active : ''}`}
          onClick={() => setTool('select')}
          title="Selection Tool (V)"
        >
          <MousePointer2 size={14} />
        </button>
        <button
          className={`${styles.iconbtn} ${activeTool === 'hand' ? styles.active : ''}`}
          onClick={() => setTool('hand')}
          title="Hand Tool (H)"
        >
          <Hand size={14} />
        </button>
      </div>

      <div className={styles.divider} />

      {/* View Mode Toggle */}
      <div className={styles.group}>
        <div className={styles.segmentedControl}>
          <button
            className={`${styles.segment} ${viewMode === 'canvas' ? styles.active : ''}`}
            onClick={() => setViewMode('canvas')}
            title="Design Canvas (Esc)"
          >
            <LayoutDashboard size={13} />
            <span>Design</span>
          </button>
          <button
            className={`${styles.segment} ${viewMode === 'workflow' ? styles.active : ''}`}
            onClick={() => setViewMode('workflow')}
            title="Logic Workflow (W)"
            data-tour="toolbar-workflow"
          >
            <Workflow size={13} />
            <span>Workflow</span>
          </button>
        </div>
      </div>

      <div className={styles.divider} />

      {/* History */}
      <div className={styles.group}>
        <button className={styles.iconbtn} onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 size={14} />
        </button>
        <button className={styles.iconbtn} onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={14} />
        </button>
      </div>

      <div className={styles.divider} />

      {/* File title */}
      <button
        type="button"
        className={styles.fileTitle}
        title={projectName}
        onClick={() => setSettingsModalOpen(true)}
      >
        <FileText size={12} />
        <span>{projectName}</span>
        <small>{elementCount} el</small>
      </button>

      {/* Zoom */}
      <div className={styles.zoom}>
        <button
          className={styles.iconbtn}
          onClick={() => handleZoomStep(-1)}
          title="Zoom out (Ctrl+−)"
          aria-label="Zoom out"
        >
          <ZoomOut size={13} />
        </button>
        <div className={styles.zoomInputWrapper}>
          <input
            className={styles.zoomInput}
            type="text"
            value={zoomDraft}
            onChange={(e) => setZoomDraft(e.target.value)}
            onFocus={handleZoomFocus}
            onBlur={handleZoomBlur}
            onKeyDown={handleZoomInput}
            aria-label="Zoom level"
          />
        </div>
        <button
          className={styles.iconbtn}
          onClick={() => handleZoomStep(1)}
          title="Zoom in (Ctrl+=)"
          aria-label="Zoom in"
        >
          <ZoomIn size={13} />
        </button>
        <button
          className={styles.iconbtn}
          onClick={handleFitPage}
          title="Fit to page (Shift+1)"
          aria-label="Fit to page"
        >
          <Maximize size={13} />
        </button>
      </div>

      <div className={styles.spacer} />

      {/* Breakpoints */}
      <div data-tour="toolbar-breakpoint">
        <BreakpointSwitcher />
      </div>

      <div className={styles.divider} />

      {/* Save indicator + offline chip */}
      {!isOnline && (
        <span className={styles.offlineChip} title="Working offline — changes will sync when you reconnect">
          <WifiOff size={10} /> offline
        </span>
      )}
      <div className={styles.saveIndicator}>
        <span
          className={`${styles.dot} ${isDirty ? styles.saving : styles.saved}`}
          aria-hidden="true"
        />
        <span>{isDirty ? 'saving…' : 'saved'}</span>
      </div>

      <div className={styles.divider} />

      {/* AI · Auto-Animate */}
      <div className={styles.group}>
        <button
          className={styles.aiBtn}
          onClick={() => setAiOpen(true)}
          title="AI Generate (Ctrl+K)"
        >
          <Sparkles size={13} />
          <span>AI</span>
        </button>
        <button
          className={styles.ghostBtn}
          onClick={handleAutoAnimate}
          title="Auto-animate visible elements"
        >
          <Wand2 size={13} />
          <span>Auto</span>
        </button>
        <button
          className={styles.iconbtn}
          onClick={() => setCommandPaletteOpen(true)}
          title="Command palette (Ctrl+Shift+P)"
        >
          <Search size={13} />
        </button>
      </div>

      <div className={styles.divider} />

      {/* Preview */}
      <div className={styles.group}>
        <button
          className={`${styles.ghostBtn} ${previewMode ? styles.active : ''}`}
          onClick={() => setPreviewMode(!previewMode)}
          title={previewMode ? 'Exit preview (Esc)' : 'Preview in-editor (P)'}
        >
          {previewMode ? <Square size={13} /> : <Play size={13} />}
          <span>{previewMode ? 'Stop' : 'Preview'}</span>
        </button>
        <button
          className={styles.iconbtn}
          onClick={handlePreview}
          title="Open preview in new tab"
        >
          <Eye size={13} />
        </button>
      </div>

      <div className={styles.divider} />

      {/* Tweaks · Settings */}
      <div className={styles.group}>
        <button
          className={`${styles.iconbtn} ${tweaksOpen ? styles.active : ''}`}
          onClick={toggleTweaks}
          title="Tweaks panel (T)"
        >
          <SlidersHorizontal size={13} />
        </button>
        <button
          className={styles.iconbtn}
          onClick={() => setSettingsModalOpen(true)}
          title="Project settings"
        >
          <Settings size={13} />
        </button>
      </div>

      <div className={styles.divider} />

      {/* Export dropdown */}
      <div className={styles.exportWrap} data-tour="toolbar-export" ref={exportWrapRef}>
        <button
          className={styles.ghostBtn}
          onClick={() => setExportOpen((v) => !v)}
          title="Export…"
        >
          <Download size={13} />
          <span>Export</span>
        </button>
        {exportOpen && (
          <div className={styles.exportMenu} role="menu">
            <button className={styles.exportItem} onClick={() => handleExport('html')}>
              <FileText size={12} /> HTML <small>.html</small>
            </button>
            <button className={styles.exportItem} onClick={() => handleExport('png')}>
              <ImageIcon size={12} /> PNG <small>.png</small>
            </button>
            <button className={styles.exportItem} onClick={() => handleExport('jpeg')}>
              <ImageIcon size={12} /> JPEG <small>.jpeg</small>
            </button>
            <button className={styles.exportItem} onClick={() => handleExport('pdf')}>
              <FileText size={12} /> PDF <small>.pdf</small>
            </button>
            <button className={styles.exportItem} onClick={() => handleExport('gif')}>
              <Film size={12} /> GIF <small>.gif</small>
            </button>
          </div>
        )}
      </div>

      {/* Publish */}
      <button
        className={styles.cta}
        onClick={() => setPublishOpen(true)}
        disabled={!project}
        title="Publish this project"
      >
        <Rocket size={13} />
        <span>Publish</span>
      </button>

      {/* User avatar / sign in */}
      <div className={styles.userChip} data-tour="toolbar-user" ref={userChipRef}>
        {isSupabaseConfigured ? (
          userEmail ? (
            <>
              <button
                className={styles.avatarBtn}
                onClick={() => setUserMenuOpen((v) => !v)}
                title={userEmail}
                aria-label="Account menu"
              >
                <span className={styles.avatarInitial}>
                  {userEmail.charAt(0).toUpperCase()}
                </span>
              </button>
              {userMenuOpen && (
                <div className={styles.userMenu} role="menu">
                  <div className={styles.userMenuEmail}>{userEmail}</div>
                  <button
                    className={styles.userMenuItem}
                    onClick={handleSignOut}
                    role="menuitem"
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/auth/login"
              className={styles.signInBtn}
              title="Sign in to sync projects"
            >
              <LogIn size={13} />
              <span>Sign in</span>
            </Link>
          )
        ) : (
          <span className={styles.guestBadge} title="Running in guest mode — add Supabase keys to enable accounts">
            <User size={13} />
            Guest
          </span>
        )}
      </div>

      {aiOpen && <AIGenerateModal open={aiOpen} onClose={() => setAiOpen(false)} />}
      {publishOpen && <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} />}
    </div>
  );
};
