'use client';

import React, { useRef, useCallback, useState } from 'react';
import { StakkedElement, StakkedDrawingContent, DrawingPath } from '@/types/element';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  element: StakkedElement;
  isSelected: boolean;
  isEditing: boolean;
}

type DrawTool = 'pencil' | 'pen' | 'highlighter' | 'eraser';

const TOOL_COLORS: Record<DrawTool, string> = {
  pencil: '#ffffff',
  pen: '#3b82f6',
  highlighter: 'rgba(250,204,21,0.4)',
  eraser: 'transparent',
};

/**
 * DrawingElement — interactive SVG canvas for freehand drawing.
 * In editor mode (isEditing = true, which the canvas triggers on dblclick),
 * the user can draw paths with pencil/pen/highlighter/eraser tools.
 */
export default function DrawingElement({ element, isEditing }: Props) {
  const c = element.content as StakkedDrawingContent;
  const w = typeof element.size.width === 'number' ? element.size.width : 400;
  const h = typeof element.size.height === 'number' ? element.size.height : 300;

  const updateElement = useProjectStore(s => s.updateElement);
  const activePageIndex = useProjectStore(s => s.activePageIndex);

  const [activeTool, setActiveTool] = useState<DrawTool>('pencil');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  const svgRef = useRef<SVGSVGElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Pick tool colour automatically (override with custom colour for pen)
  const effectiveColor = activeTool === 'highlighter'
    ? 'rgba(250,204,21,0.4)'
    : activeTool === 'eraser'
    ? 'transparent'
    : strokeColor;

  const getSVGPoint = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * w,
      y: ((e.clientY - rect.top) / rect.height) * h,
    };
  }, [w, h]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    const pt = getSVGPoint(e);
    lastPoint.current = pt;
    setCurrentPath(`M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
    setIsDrawing(true);
  }, [isEditing, getSVGPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || !isEditing) return;
    const pt = getSVGPoint(e);
    const lp = lastPoint.current ?? pt;
    // Smooth catmull-rom style with quadratic bezier
    const midX = (lp.x + pt.x) / 2;
    const midY = (lp.y + pt.y) / 2;
    setCurrentPath(prev => `${prev} Q${lp.x.toFixed(1)},${lp.y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`);
    lastPoint.current = pt;
  }, [isDrawing, isEditing, getSVGPoint]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || !isEditing) return;
    setIsDrawing(false);

    if (activeTool === 'eraser') {
      // Remove the most-recently drawn path (last-in, first-erased).
      // This gives a practical undo-by-stroke behaviour without needing
      // full SVG hit-testing geometry, which is expensive and fragile.
      if ((c.paths || []).length > 0) {
        updateElement(activePageIndex, element.id, {
          content: { ...c, paths: c.paths.slice(0, -1) } as StakkedDrawingContent,
        });
      }
      setCurrentPath('');
      lastPoint.current = null;
      return;
    }

    if (currentPath.length < 10) return; // Ignore tiny stray clicks

    const newPath: DrawingPath = {
      id: uuidv4(),
      d: currentPath,
      color: effectiveColor,
      width: activeTool === 'highlighter' ? strokeWidth * 6 : strokeWidth,
      tool: activeTool,
      opacity: activeTool === 'highlighter' ? 0.4 : 1,
    };

    const updated = [...(c.paths || []), newPath];
    updateElement(activePageIndex, element.id, {
      content: { ...c, paths: updated } as StakkedDrawingContent,
    });
    setCurrentPath('');
    lastPoint.current = null;
  }, [isDrawing, isEditing, currentPath, activeTool, effectiveColor, strokeWidth, c, updateElement, activePageIndex, element.id]);

  const handleClear = useCallback(() => {
    updateElement(activePageIndex, element.id, {
      content: { ...c, paths: [] } as StakkedDrawingContent,
    });
  }, [c, updateElement, activePageIndex, element.id]);

  const handleUndo = useCallback(() => {
    const updated = (c.paths ?? []).slice(0, -1);
    updateElement(activePageIndex, element.id, {
      content: { ...c, paths: updated } as StakkedDrawingContent,
    });
  }, [c, updateElement, activePageIndex, element.id]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Drawing toolbar — only visible when editing */}
      {isEditing && (
        <div style={{
          position: 'absolute', top: -44, left: 0,
          display: 'flex', gap: 4, alignItems: 'center',
          background: 'rgba(0,0,0,0.8)', borderRadius: 6,
          padding: '4px 8px', zIndex: 100,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {(['pencil', 'pen', 'highlighter', 'eraser'] as DrawTool[]).map(t => (
            <button
              key={t}
              onClick={() => setActiveTool(t)}
              style={{
                padding: '3px 8px',
                borderRadius: 4,
                border: activeTool === t ? '1px solid var(--accent, #3b82f6)' : '1px solid transparent',
                background: activeTool === t ? 'var(--accent, #3b82f6)' : 'transparent',
                color: activeTool === t ? '#fff' : 'rgba(255,255,255,0.6)',
                fontSize: 10,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {t}
            </button>
          ))}
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
          <input
            type="color"
            value={strokeColor}
            onChange={e => setStrokeColor(e.target.value)}
            style={{ width: 22, height: 22, border: 0, borderRadius: 3, cursor: 'pointer', padding: 0 }}
            title="Stroke colour"
          />
          <input
            type="range"
            min={1} max={24} step={1}
            value={strokeWidth}
            onChange={e => setStrokeWidth(Number(e.target.value))}
            style={{ width: 60 }}
            title="Stroke width"
          />
          <button onClick={handleUndo} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 0, cursor: 'pointer', fontSize: 11 }} title="Undo last stroke">↩</button>
          <button onClick={handleClear} style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 0, cursor: 'pointer', fontSize: 11 }} title="Clear all">✕</button>
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: 'block',
          cursor: isEditing ? (activeTool === 'eraser' ? 'cell' : 'crosshair') : 'default',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Saved paths */}
        {(c.paths || []).map((path, i) => (
          <path
            key={path.id ?? i}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={path.opacity}
          />
        ))}
        {/* Live path being drawn */}
        {isDrawing && currentPath && (
          <path
            d={currentPath}
            stroke={effectiveColor}
            strokeWidth={activeTool === 'highlighter' ? strokeWidth * 6 : strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={activeTool === 'highlighter' ? 0.4 : 1}
          />
        )}
      </svg>

      {/* Empty state hint */}
      {(c.paths || []).length === 0 && !isEditing && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.2)', fontSize: 11,
          fontFamily: 'var(--font-mono)', pointerEvents: 'none',
        }}>
          double-click to draw
        </div>
      )}
    </div>
  );
}
