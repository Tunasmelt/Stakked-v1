'use client';

import React, { memo, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { StakkedContainerContent, StakkedElement } from '@/types/element';
import { StakkedElementStyleBase } from '@/types/style';
import { getEffectiveStyle } from '@/lib/style-utils';
import { ElementRenderer } from '../elements/ElementRenderer';
import { ElementErrorBoundary } from './ElementErrorBoundary';
import { useInteractivity } from '@/hooks/useInteractivity';
import { useUIStore } from '@/stores/ui-store';
import { useParallax } from '@/hooks/useParallax';
import { getMotionTriggerProps } from '@/lib/animation-engine';

interface CanvasElementProps {
  id: string;
  isPublic?: boolean;
  /**
   * When this element is a child of a container, pass the container's canvas-absolute
   * position so we can render the child relative to the container DOM node while keeping
   * canvas-absolute positions in the store.
   */
  containerPos?: { x: number; y: number };
}

/**
 * Converts a fully-merged StakkedElementStyleBase + element.rotation into a
 * React CSSProperties object that can be spread directly onto the wrapper div.
 *
 * Covers: position, size, fills (color/gradient/image/pattern), border,
 * border-radius, box-shadows, backdrop-filter, overflow, cursor, transforms.
 */
function buildWrapperStyle(
  effectiveStyle: StakkedElementStyleBase,
  rotation: number,
  zIndex: number,
  locked: boolean,
  isEditingText: boolean,
): React.CSSProperties {
  // ── Background (first fill wins) ──────────────────────────────────────────
  const fill = effectiveStyle.fills?.[0];
  let background: string | undefined;
  let backgroundColor: string | undefined;
  if (fill) {
    if (fill.type === 'color') {
      backgroundColor = fill.value;
    } else if (fill.type === 'gradient' || fill.type === 'pattern') {
      background = fill.value;
    } else if (fill.type === 'image' && fill.value) {
      background = `url(${fill.value}) center/${fill.fit ?? 'cover'} no-repeat`;
    }
    // Apply fill opacity via the value itself (rgba) rather than wrapping opacity
  }

  // ── Borders ───────────────────────────────────────────────────────────────
  const border = effectiveStyle.border;
  let borderStyle: React.CSSProperties = {};
  if (border) {
    if (border.linked) {
      // All four sides identical — use CSS shorthand
      const s = border.top;
      if (s.width > 0 && s.style !== 'none') {
        borderStyle = { border: `${s.width}px ${s.style} ${s.color}` };
      }
    } else {
      // Independent sides
      const mk = (s: typeof border.top) =>
        s.width > 0 && s.style !== 'none' ? `${s.width}px ${s.style} ${s.color}` : 'none';
      borderStyle = {
        borderTop:    mk(border.top),
        borderRight:  mk(border.right),
        borderBottom: mk(border.bottom),
        borderLeft:   mk(border.left),
      };
    }
  }

  // ── Border radius ─────────────────────────────────────────────────────────
  const br = effectiveStyle.borderRadius;
  const borderRadius = br
    ? `${br.topLeft}${br.unit} ${br.topRight}${br.unit} ${br.bottomRight}${br.unit} ${br.bottomLeft}${br.unit}`
    : undefined;

  // ── Box shadow ────────────────────────────────────────────────────────────
  const shadowParts = (effectiveStyle.effects?.shadows ?? []).map((s) =>
    `${s.type === 'inner' ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
  );
  const boxShadow = shadowParts.length > 0 ? shadowParts.join(', ') : undefined;

  // ── CSS transform ─────────────────────────────────────────────────────────
  const tr = effectiveStyle.transform;
  const parts: string[] = [`rotate(${rotation}deg)`];
  if (tr) {
    if (tr.scaleX !== 1 || tr.scaleY !== 1) parts.push(`scale(${tr.scaleX}, ${tr.scaleY})`);
    if (tr.skewX)   parts.push(`skewX(${tr.skewX}deg)`);
    if (tr.skewY)   parts.push(`skewY(${tr.skewY}deg)`);
    if (tr.translateX) parts.push(`translateX(${tr.translateX}px)`);
    if (tr.translateY) parts.push(`translateY(${tr.translateY}px)`);
    if (tr.rotateX) parts.push(`rotateX(${tr.rotateX}deg)`);
    if (tr.rotateY) parts.push(`rotateY(${tr.rotateY}deg)`);
  }
  const transform = parts.join(' ');

  // ── Position & size ───────────────────────────────────────────────────────
  const posX = effectiveStyle.position?.x;
  const posY = effectiveStyle.position?.y;
  const w = effectiveStyle.size?.width;
  const h = effectiveStyle.size?.height;
  const origin = tr?.origin ?? 'center';
  const perspective = tr?.perspective ? `${tr.perspective}px` : undefined;

  // ── Layout (flex / grid for containers) ──────────────────────────────────
  const layout = effectiveStyle.layout;
  let layoutStyle: React.CSSProperties = {};
  if (layout && layout.type !== 'free') {
    if (layout.type === 'stack') {
      const justifyMap: Record<string, string> = {
        start: 'flex-start', center: 'center', end: 'flex-end',
        between: 'space-between', around: 'space-around', evenly: 'space-evenly',
      };
      const alignMap: Record<string, string> = {
        start: 'flex-start', center: 'center', end: 'flex-end',
        stretch: 'stretch', baseline: 'baseline',
      };
      layoutStyle = {
        display: 'flex',
        flexDirection: (layout.direction as React.CSSProperties['flexDirection']) || 'row',
        flexWrap: layout.wrap ? 'wrap' : 'nowrap',
        justifyContent: justifyMap[layout.distribution] ?? 'flex-start',
        alignItems: alignMap[layout.align] ?? 'flex-start',
        gap: layout.gap != null ? `${layout.gap}px` : undefined,
      };
    } else if (layout.type === 'grid') {
      layoutStyle = {
        display: 'grid',
        gap: layout.gap != null ? `${layout.gap}px` : undefined,
      };
    }
  }

  return {
    position: 'absolute',
    ...(posX !== undefined && { left: posX }),
    ...(posY !== undefined && { top: posY }),
    ...(w !== undefined && { width: w }),
    ...(h !== undefined && { height: h }),
    transform,
    transformOrigin: origin,
    ...(perspective && { perspective }),
    zIndex,
    opacity: effectiveStyle.effects?.opacity ?? 1,
    overflow: (effectiveStyle.effects?.overflow as React.CSSProperties['overflow']) || 'visible',
    cursor: effectiveStyle.effects?.cursor || (locked ? 'default' : isEditingText ? 'text' : 'move'),
    ...(backgroundColor && { backgroundColor }),
    ...(background && { background }),
    ...borderStyle,
    ...(borderRadius && { borderRadius }),
    ...(boxShadow && { boxShadow }),
    ...(effectiveStyle.effects?.backdropFilter && {
      backdropFilter: effectiveStyle.effects.backdropFilter,
      WebkitBackdropFilter: effectiveStyle.effects.backdropFilter,
    }),
    ...layoutStyle,
    pointerEvents: 'auto',
  };
}

/**
 * CanvasElement: Wraps a project element with Moveable controls and handles selection.
 * Fixed for Zustand v5, React 19, and Zoom-aware transforms.
 */
export const CanvasElement = memo(({ id, isPublic, containerPos }: CanvasElementProps) => {
  const targetRef = useRef<HTMLDivElement>(null);

  const element = useProjectStore(state => {
    const page = state.project?.pages[state.activePageIndex];
    return page?.elements.find(e => e.id === id) as StakkedElement | undefined;
  });

  const isSelected    = useEditorStore(state => state.selectedElementIds.includes(id));
  const isEditingText = useEditorStore(state => state.isEditingText);
  const breakpoint    = useEditorStore(state => state.breakpoint);
  const canvasSize    = useEditorStore(state => state.canvasSize);
  const previewMode   = useUIStore(state => state.previewMode);
  const { setSelection, addToSelection, setEditingText } = useEditorStore.getState();

  const fireContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPublic || previewMode || element?.locked) return;
    window.dispatchEvent(new CustomEvent('stakked-context-menu', {
      detail: { x: e.clientX, y: e.clientY, elementId: id }
    }));
  }, [id, isPublic, previewMode, element?.locked]);

  const interactionHandlers = useInteractivity(element, isPublic);
  // Pass isEditor=true so the hook returns {} — window.scrollY is always 0 in
  // the custom pan/zoom canvas, and motion values would fight Moveable transforms.
  const parallaxProps = useParallax(element, !isPublic);

  const animation = element?.animations?.[0];
  const [animTriggered, setAnimTriggered] = useState(false);
  // In the editor (non-public, non-preview) suppress all motion props so Framer
  // doesn't fight Moveable's transform mutations during drag/resize.
  const motionProps = (animation && (isPublic || previewMode))
    ? getMotionTriggerProps(animation, animation.trigger === 'onClick' ? animTriggered : false)
    : {};

  // All hooks must run before any early return
  if (!element || !element.visible) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPublic || previewMode) return;
    e.stopPropagation();
    if (element.locked) return;
    if (!e.shiftKey) {
      if (!isSelected) setSelection([id]);
    } else {
      addToSelection(id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPublic || previewMode || element.locked) return;
    if (element.type === 'text') {
      e.stopPropagation();
      setSelection([id]);
      setEditingText(true);
    }
  };

  const effectiveStyle = getEffectiveStyle(element.style, breakpoint, canvasSize.width);

  const sizeStyle = effectiveStyle.size;
  const widthMode  = sizeStyle?.widthMode  ?? 'px';
  const heightMode = sizeStyle?.heightMode ?? 'px';
  const rawW = element.size.width;
  const rawH = element.size.height;
  const cssWidth  = widthMode  === 'auto' ? 'auto'
    : typeof rawW === 'number' ? `${rawW}${widthMode}`  : rawW;
  const cssHeight = heightMode === 'auto' || rawH === 'auto' ? 'auto'
    : typeof rawH === 'number' ? `${rawH}${heightMode}` : rawH;

  const wrapperStyle = {
    ...buildWrapperStyle(effectiveStyle, element.rotation, element.zIndex, element.locked, isEditingText),
    // element.position and element.size are the single sources of truth for layout.
    // Moveable commits drag/resize here; property panels write here; preview reads here.
    // When this element is a child of a container, positions are container-relative;
    // canvas-absolute values are restored in Canvas.tsx commit handlers.
    left: element.position.x - (containerPos?.x ?? 0),
    top:  element.position.y - (containerPos?.y ?? 0),
    width:  cssWidth,
    height: cssHeight,
    ...parallaxProps,
  };

  // Children of this element (when this is a container)
  const containerChildren =
    element.content.type === 'container'
      ? (element.content as StakkedContainerContent).children
      : [];

  const myContainerPos = { x: element.position.x, y: element.position.y };

  return (
    <ElementErrorBoundary elementId={id}>
      <motion.div
        ref={targetRef}
        id={`el-${id}`}
        className={`element-${id} ${isSelected && !previewMode ? 'stakked-selected' : ''}`}
        style={wrapperStyle}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={fireContextMenu}
        onClick={animation?.trigger === 'onClick' ? () => setAnimTriggered(v => !v) : undefined}
        {...motionProps}
        {...interactionHandlers}
      >
        <ElementRenderer
          element={element}
          isSelected={isSelected && !previewMode}
          isEditing={isEditingText && isSelected}
        />
        {/* Render container children inside this DOM node so overflow:hidden clips them */}
        {containerChildren.map(childId => (
          <CanvasElement
            key={childId}
            id={childId}
            isPublic={isPublic}
            containerPos={myContainerPos}
          />
        ))}
        {element.locked && !isPublic && !previewMode && (
          <div style={{
            position: 'absolute', top: 4, right: 4,
            background: 'rgba(0,0,0,0.55)', borderRadius: 4,
            padding: '2px 4px', display: 'flex', alignItems: 'center',
            pointerEvents: 'none', zIndex: 9999,
          }}>
            <Lock size={10} color="rgba(255,255,255,0.8)" />
          </div>
        )}
      </motion.div>
    </ElementErrorBoundary>
  );
});

CanvasElement.displayName = 'CanvasElement';
