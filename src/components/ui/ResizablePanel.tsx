'use client';
/**
 * ResizablePanel — drag handle that lets the user widen/narrow the left and
 * right sidebars.  Minimum and maximum widths are enforced via CSS variables
 * so the rest of the layout still uses grid sizing.
 *
 * Usage:
 *   <ResizablePanel side="left" defaultWidth={220} min={160} max={400}>
 *     <LeftSidebar />
 *   </ResizablePanel>
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import styles from '@/styles/ResizablePanel.module.css';

interface Props {
  side: 'left' | 'right';
  defaultWidth?: number;
  min?: number;
  max?: number;
  children: React.ReactNode;
}

export const ResizablePanel: React.FC<Props> = ({
  side,
  defaultWidth = 220,
  min = 160,
  max = 480,
  children,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(defaultWidth);
  const panelRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - startX.current;
      const next = side === 'left'
        ? Math.min(max, Math.max(min, startWidth.current + dx))
        : Math.min(max, Math.max(min, startWidth.current - dx));
      setWidth(next);
    },
    [side, min, max],
  );

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onMouseMove);
    // mouseup was registered with { once: true } in onHandleMouseDown — no explicit removal needed
  }, [onMouseMove]);

  const onHandleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    },
    [width, onMouseMove, onMouseUp],
  );

  // cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div
      ref={panelRef}
      className={`${styles.panel} ${styles[side]}`}
      style={{ width }}
    >
      {children}
      <div
        className={`${styles.handle} ${styles[`handle_${side}`]}`}
        onMouseDown={onHandleMouseDown}
        title="Drag to resize panel"
      />
    </div>
  );
};
