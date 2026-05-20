/* src/components/viewer/ViewerCanvas.tsx */
'use client';

import React, { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StakkedProject } from '@/types/project';
import { CanvasElement } from '@/components/editor/CanvasElement';
import { useProjectStore } from '@/stores/project-store';
import { useGlobalState } from '@/stores/state-store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Map page transition names to Framer Motion variants. */
function getPageVariants(transition?: string) {
  switch (transition) {
    case 'slide':
      return {
        initial:  { x: '100%', opacity: 0 },
        animate:  { x: 0, opacity: 1 },
        exit:     { x: '-100%', opacity: 0 },
      };
    case 'zoom':
      return {
        initial:  { scale: 0.88, opacity: 0 },
        animate:  { scale: 1, opacity: 1 },
        exit:     { scale: 1.06, opacity: 0 },
      };
    case 'fade':
    default:
      return {
        initial:  { opacity: 0 },
        animate:  { opacity: 1 },
        exit:     { opacity: 0 },
      };
  }
}

interface Props {
  project: StakkedProject;
}

/**
 * ViewerCanvas
 * ------------
 * A read-only, high-fidelity renderer for published Stakked projects.
 * Disables all editing tools (Moveable, Selecto) and rulers.
 * Supports multi-page navigation via the project store's activePageIndex.
 */
export const ViewerCanvas: React.FC<Props> = ({ project }) => {
  const activePageIndex = useProjectStore((s) => s.activePageIndex);
  const setActivePageIndex = useProjectStore((s) => s.setActivePageIndex);
  const setGlobalValue = useGlobalState((s) => s.setValue);

  const page = project.pages[activePageIndex] ?? project.pages[0];
  const elements = page?.elements ?? [];
  const pageCount = project.pages.length;

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, pageCount - 1));
    setActivePageIndex(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageCount, setActivePageIndex]);

  /**
   * Walk logic nodes to resolve a targetId to a final page index.
   * Mirrors the logic in useInteractivity.ts.
   */
  const resolveTarget = useCallback((targetId: string): number | null => {
    let current = targetId;
    const limit = 10;
    let itr = 0;
    while (itr++ < limit) {
      if (current.startsWith('page-')) {
        const pageId = current.replace('page-', '');
        const idx = project.pages.findIndex(p => p.id === pageId);
        return idx !== -1 ? idx : null;
      }
      // Bare page ID
      const idx = project.pages.findIndex(p => p.id === current);
      return idx !== -1 ? idx : null;
    }
    return null;
  }, [project]);

  // Expose navigation and state to window for the inline exported runtime
  // (countdown, tabs) as well as any clicks wired via useInteractivity
  React.useEffect(() => {
    (window as unknown as Record<string, unknown>).__stakkedNavigate = (targetId: string) => {
      const idx = resolveTarget(targetId);
      if (idx !== null) goTo(idx);
    };
    (window as unknown as Record<string, unknown>).__stakkedSetVar = (k: string, v: string | number | boolean) => {
      setGlobalValue(k, v);
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__stakkedNavigate;
      delete (window as unknown as Record<string, unknown>).__stakkedSetVar;
    };
  }, [resolveTarget, goTo, setGlobalValue]);

  const bg = page?.canvas.background;
  const canvasStyle: React.CSSProperties = {
    position: 'relative',
    width: page?.canvas.width ?? 1440,
    height: page?.canvas.height ?? 1024,
    backgroundColor: bg?.type === 'color' ? bg.value : '#09090b',
    backgroundImage: bg?.type === 'gradient' ? bg.value : bg?.type === 'image' ? `url(${bg.value})` : undefined,
    backgroundSize: bg?.type === 'image' ? 'cover' : undefined,
    backgroundPosition: bg?.type === 'image' ? 'center' : undefined,
    margin: '0 auto',
    overflow: 'hidden',
    boxShadow: '0 0 100px rgba(0,0,0,0.5)',
  };

  const pageVariants = getPageVariants(undefined);

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        overflow: 'auto',
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '60px 0',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activePageIndex}
          style={canvasStyle}
          className="stakked-public-canvas"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {elements.map((el) => (
            <CanvasElement
              key={el.id}
              id={el.id}
              isPublic={true}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Multi-page navigation */}
      {pageCount > 1 && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'rgba(24,24,27,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 99,
            zIndex: 9998,
          }}
        >
          <button
            onClick={() => goTo(activePageIndex - 1)}
            disabled={activePageIndex === 0}
            style={{ background: 'none', border: 0, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 4, display: 'flex' }}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          {project.pages.map((pg, i) => (
            <button
              key={pg.id}
              onClick={() => goTo(i)}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === activePageIndex ? '#3b82f6' : 'rgba(255,255,255,0.25)',
                border: 0,
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={`Go to page ${i + 1}: ${pg.title}`}
            />
          ))}
          <button
            onClick={() => goTo(activePageIndex + 1)}
            disabled={activePageIndex === pageCount - 1}
            style={{ background: 'none', border: 0, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 4, display: 'flex' }}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Attribution Badge */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          padding: '8px 16px',
          background: 'rgba(24, 24, 27, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 99,
          color: 'white',
          fontSize: 12,
          textDecoration: 'none',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 9999,
        }}
      >
        <span>Made with</span>
        <span style={{ color: '#3b82f6' }}>Stakked</span>
      </a>
    </div>
  );
};
