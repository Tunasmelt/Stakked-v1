'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { Canvas } from '@/components/editor/Canvas';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { LeftSidebar } from '@/components/editor/LeftSidebar';
import { Toolbar } from '@/components/editor/Toolbar';
import { KeyboardManager } from '@/components/editor/KeyboardManager';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { TweaksPanel } from '@/components/system/TweaksPanel';
import { TutorialOverlay } from '@/components/system/TutorialOverlay';
import ProjectSettingsModal from '@/components/editor/ProjectSettingsModal';
import { useAutoSave } from '@/lib/db';
import { useProjectPersistence } from '@/hooks/useProjectPersistence';
import { useUIStore } from '@/stores/ui-store';
import { useTutorialStore } from '@/stores/tutorial-store';
import { ResizablePanel } from '@/components/ui/ResizablePanel';
import styles from '@/styles/editor.module.css';

/**
 * Editor Page — main visual builder shell.
 * Grid layout: [top 44px] · [left 180-260 | canvas 1fr | right 220-320] ·
 * [foot 28px mono status bar]. TweaksPanel is a bottom-right widget that
 * floats above the foot.
 */
export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  // Persistence & Auto-save
  const { isInitializing } = useProjectPersistence(projectId);
  useAutoSave();

  const project = useProjectStore((state) => state.project);
  const activePageIndex = useProjectStore((state) => state.activePageIndex);

  // NOTE: beforeunload is handled by useProjectPersistence which reads the
  // live Zustand store — no duplicate listener needed here.
  const page = project?.pages[activePageIndex];
  const zoom = useEditorStore((state) => state.zoom);
  const selectedIds = useEditorStore((state) => state.selectedElementIds);
  const breakpoint = useEditorStore((state) => state.breakpoint);
  const viewMode = useUIStore((state) => state.viewMode);
  const leftPanelOpen = useUIStore((state) => state.leftPanelOpen);
  const rightPanelOpen = useUIStore((state) => state.rightPanelOpen);
  const { startTour } = useTutorialStore();

  if (isInitializing || !project) {
    return (
      <div className={styles.splash}>
        <div className={styles.splashLogo}>Stakked</div>
        <div className={styles.splashCaption}>{'// resolving project…'}</div>
      </div>
    );
  }

  const elementCount = page?.elements.length ?? 0;

  return (
    <div className={styles.container}>
      {/* Global event manager */}
      <KeyboardManager />

      {/* Top toolbar */}
      <div className={styles.top} data-tour="toolbar">
        <Toolbar />
      </div>

      {/* Middle: left sidebar | canvas | right sidebar */}
      <div className={styles.editorBody}>
        {/* Left panel */}
        <ResizablePanel side="left" defaultWidth={220} min={160} max={400}>
          <aside
            className={`${styles.panel} ${styles.left} ${!leftPanelOpen ? styles.closed : ''}`}
            data-tour="left-sidebar"
            style={{ width: '100%', height: '100%' }}
          >
            <LeftSidebar />
          </aside>
        </ResizablePanel>

        {/* Main canvas area */}
        <main className={styles.canvasArea} data-tour="canvas">
          {viewMode === 'canvas' ? <Canvas /> : <WorkflowCanvas />}
        </main>

        {/* Right panel (Properties) */}
        <ResizablePanel side="right" defaultWidth={280} min={220} max={480}>
          <aside
            className={`${styles.panel} ${styles.right} ${!rightPanelOpen ? styles.closed : ''}`}
            data-tour="right-panel"
            style={{ width: '100%', height: '100%' }}
          >
            <PropertiesPanel />
          </aside>
        </ResizablePanel>
      </div>

      {/* Status foot — mono caption row */}
      <div className={styles.foot}>
        <div className={styles.footLeft}>
          <span className={styles.footDot} aria-hidden />
          <span>{`// ${project.title}`}</span>
          <span>·</span>
          <span>
            {page?.title ?? 'page'} · {elementCount} els
          </span>
          <span>·</span>
          <span>{breakpoint}</span>
        </div>
        <div className={styles.footRight}>
          <span>{Math.round(zoom * 100)}%</span>
          <span>·</span>
          <span>{selectedIds.length} selected</span>
          <span>·</span>
          <button
            onClick={() => startTour('editor')}
            title="Open editor tutorial (?)" 
            style={{
              background: 'none',
              border: '1px solid var(--line)',
              borderRadius: 4,
              padding: '1px 7px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-mute)',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              lineHeight: '16px',
              transition: 'color 120ms, border-color 120ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-mute)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
            }}
          >
            ?
          </button>
        </div>
      </div>

      {/* Floating panels */}
      <TweaksPanel />
      <TutorialOverlay />
      <ProjectSettingsModal />
    </div>
  );
}
