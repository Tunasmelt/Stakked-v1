'use client';

import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { useProjectStore } from '@/stores/project-store';
import styles from '@/styles/BreakpointSwitcher.module.css';

const PRESETS = {
  desktop: { width: 1440, height: 2500 },
  tablet: { width: 1024, height: 2500 },
  mobile: { width: 390, height: 2500 }
};

export const BreakpointSwitcher: React.FC = () => {
  const breakpoint    = useEditorStore(s => s.breakpoint);
  const setBreakpoint = useEditorStore(s => s.setBreakpoint);
  const canvasSize    = useEditorStore(s => s.canvasSize);
  const setCanvasSize = useEditorStore(s => s.setCanvasSize);

  // On first render, sync canvasSize from the actual project canvas so the
  // editor viewport width matches what was saved (not the hardcoded 1440 default).
  const projectCanvasWidth = useProjectStore(
    (s) => s.project?.pages[s.activePageIndex]?.canvas?.width ?? null,
  );
  React.useEffect(() => {
    if (projectCanvasWidth !== null && breakpoint === 'desktop') {
      setCanvasSize({ ...canvasSize, width: projectCanvasWidth });
    }
    // Only run on initial project load — not on every canvas-size change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCanvasWidth]);

  const handlePreset = (type: keyof typeof PRESETS) => {
    setBreakpoint(type);
    setCanvasSize(PRESETS[type]);
  };

  const [draftWidth, setDraftWidth] = React.useState<string>(String(canvasSize.width));
  const [draftHeight, setDraftHeight] = React.useState<string>(String(canvasSize.height));

  React.useEffect(() => {
    setDraftWidth(String(canvasSize.width));
    setDraftHeight(String(canvasSize.height));
  }, [canvasSize.width, canvasSize.height]);

  const commitCustomSize = (dimension: 'width' | 'height', val: string) => {
    const num = parseInt(val);
    if (!num || num < 1) return; // reject invalid input
    setBreakpoint('custom');
    setCanvasSize({
      ...canvasSize,
      [dimension]: num,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.presets}>
        <button 
          className={`${styles.presetBtn} ${breakpoint === 'desktop' ? styles.active : ''}`}
          onClick={() => handlePreset('desktop')}
          title="Desktop (1440px)"
        >
          <Monitor size={16} />
        </button>
        <button 
          className={`${styles.presetBtn} ${breakpoint === 'tablet' ? styles.active : ''}`}
          onClick={() => handlePreset('tablet')}
          title="Tablet (1024px)"
        >
          <Tablet size={16} />
        </button>
        <button 
          className={`${styles.presetBtn} ${breakpoint === 'mobile' ? styles.active : ''}`}
          onClick={() => handlePreset('mobile')}
          title="Mobile (390px)"
        >
          <Smartphone size={16} />
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.inputs}>
        <div className={styles.inputGroup}>
          <input 
            type="number" 
            value={draftWidth} 
            onChange={(e) => setDraftWidth(e.target.value)}
            onBlur={(e) => commitCustomSize('width', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitCustomSize('width', (e.target as HTMLInputElement).value); }}
            className={styles.input}
          />
          <span className={styles.label}>W</span>
        </div>
        <div className={styles.inputGroup}>
          <input 
            type="number" 
            value={draftHeight} 
            onChange={(e) => setDraftHeight(e.target.value)}
            onBlur={(e) => commitCustomSize('height', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitCustomSize('height', (e.target as HTMLInputElement).value); }}
            className={styles.input}
          />
          <span className={styles.label}>H</span>
        </div>
      </div>
      
      {breakpoint !== 'desktop' && (
        <div className={styles.overrideBadge} title="Editing overrides for this breakpoint">
          REC
        </div>
      )}
    </div>
  );
};
