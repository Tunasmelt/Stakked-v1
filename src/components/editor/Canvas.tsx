'use client';

import React, {
  useRef, useEffect, useCallback, useState, useMemo, memo
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { useUIStore } from '@/stores/ui-store';
import { defaultElement, ElementType, StakkedElement } from '@/types/element';
import { CanvasElement } from './CanvasElement';
import { Rulers } from './Rulers';
import Moveable, {
  OnDrag, OnResize, OnRotate, OnDragEnd, OnResizeEnd, OnRotateEnd,
  OnDragGroup, OnResizeGroup, OnRotateGroup, OnDragGroupEnd, OnResizeGroupEnd,
  OnResizeGroupStart, OnRotateGroupEnd,
} from 'react-moveable';
import styles from '@/styles/Canvas.module.css';
import { CanvasContextMenu } from './CanvasContextMenu';

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_ZOOM = 0.10;   // 10%
const MAX_ZOOM = 4.00;   // 400%
const SNAP_THRESHOLD = 5;
// Snap threshold in screen pixels (normalised to canvas space during drag)
const SNAP_SCREEN_PX = 8;

// Stable fallback so `|| []` never creates a fresh array per render
const STABLE_EMPTY: readonly StakkedElement[] = Object.freeze([]);

// Moveable uses CSS selectors — UUID may start with a digit, prefix with `el-`
const selectorOf = (id: string) => `#el-${CSS.escape(id)}`;
const elementIdFromDom = (node: HTMLElement | SVGElement): string =>
  (node as HTMLElement).dataset?.elementId ?? node.id.replace(/^el-/, '');

/**
 * Safe CSS→number conversion for Moveable commit handlers.
 *
 * `parseFloat` returns NaN for empty/missing style values, and 0 for "0px".
 * The naive `parseFloat(x) || fallback` pattern treats 0 as falsy, so elements
 * dragged exactly to x=0 or y=0 silently snap back to their previous position.
 * Using NaN-aware logic ensures zero is preserved as a valid coordinate.
 */
const parsePx = (val: string, fallback: number): number => {
  const n = parseFloat(val);
  return Number.isNaN(n) ? fallback : n;
};

// ─── Canvas ───────────────────────────────────────────────────────────────────
export const Canvas: React.FC = memo(() => {
  // Refs (60fps — avoid React re-render on every frame)
  const containerRef  = useRef<HTMLDivElement>(null);
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const zoomRef       = useRef(1);
  const panRef        = useRef({ x: 0, y: 0 });
  const moveRef       = useRef<Record<string, { x: number; y: number }>>({});
  const sizeRef       = useRef<Record<string, { width: number; height: number | 'auto' }>>({});
  const rotationRef   = useRef<Record<string, number>>({});

  // Project initialisation tracking (only auto-centre once per project load)
  const centeredProjectId = useRef<string | null>(null);

  // Store selectors
  const projectId       = useProjectStore(s => s.project?.id);
  const activePageIndex = useProjectStore(s => s.activePageIndex);
  const page            = useProjectStore(s => s.project?.pages[s.activePageIndex]);
  const elements        = page?.elements ?? STABLE_EMPTY;
  const { commitElementMove, commitElementResize, commitElementRotation } = useProjectStore.getState();

  // ── Container child lookup ─────────────────────────────────────────────────
  // Maps every child element ID → its container StakkedElement so that
  // drag/resize commit handlers can convert container-relative DOM positions
  // back to canvas-absolute store positions.
  const { childIds, childToContainer } = useMemo(() => {
    const childIds = new Set<string>();
    const childToContainer = new Map<string, StakkedElement>();
    for (const el of elements) {
      if (el.content.type === 'container') {
        for (const childId of (el.content as { children: string[] }).children) {
          childIds.add(childId);
          childToContainer.set(childId, el);
        }
      }
    }
    return { childIds, childToContainer };
  }, [elements]);

  const clearSelection    = useEditorStore(s => s.clearSelection);
  const setSelection      = useEditorStore(s => s.setSelection);
  const setDragging       = useEditorStore(s => s.setDragging);
  const addElement        = useProjectStore(s => s.addElement);
  const activeTool        = useEditorStore(s => s.activeTool);
  // Fine-grained subscriptions — avoids re-rendering canvas on every drag/resize flag change
  const selectedElementIds = useEditorStore(s => s.selectedElementIds);
  const isEditingText      = useEditorStore(s => s.isEditingText);
  const zoom               = useEditorStore(s => s.zoom);
  const canvasSize         = useEditorStore(s => s.canvasSize);
  const pan                = useEditorStore(s => s.pan);
  const { setZoom: storeSetZoom, setPan: storeSetPan } = useEditorStore.getState();
  const isDragging         = useEditorStore(s => s.isDragging);
  const previewMode        = useUIStore(s => s.previewMode);

  // Local UI state
  const [contextMenu, setContextMenu]   = useState<{ x: number; y: number; elementId: string | null } | null>(null);
  const [activeGuides, setActiveGuides] = useState<{ x: number[]; y: number[]; gaps: { x1: number; y1: number; x2: number; y2: number }[] }>({ x: [], y: [], gaps: [] });
  const [showGrid, setShowGrid]         = useState(false);
  const [isShiftDown, setIsShiftDown]   = useState(false);
  const [isAltDown, setIsAltDown]       = useState(false);
  const [dropGhost, setDropGhost]       = useState<{ x: number; y: number; label: string } | null>(null);
  const [sizeTooltip, setSizeTooltip]   = useState<{ x: number; y: number; w: number; h: number; mode: 'drag' | 'resize' } | null>(null);

  // Tracks whether Alt was held at drag-start (for alt+drag duplicate)
  const altWasPressedOnDragStart = useRef(false);
  // Original position before alt+drag (so the duplicated copy stays in place)
  const altDragOriginalPos = useRef<{ x: number; y: number } | null>(null);

  // Cursor: driven by activeTool (overridden to 'grabbing' while panning)
  const wrapperCursor = activeTool === 'hand' ? 'grab' : activeTool === 'text' ? 'text' : 'default';

  // Marquee (rubber-band) selection state
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  // Mirror of marquee state in a ref so commitMarquee can read it without
  // calling setMarquee(prev => ...) — state-updater callbacks that trigger
  // other store setters (setSelection/clearSelection) are treated as
  // setState-during-render by React 19 and throw a console error.
  const marqueeRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const marqueeStartRef = useRef<{ canvasX: number; canvasY: number } | null>(null);
  const isMarqueeingRef = useRef(false);

  // ── Shift + Alt key tracking ──
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftDown(true);
      if (e.key === 'Alt')   setIsAltDown(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftDown(false);
      if (e.key === 'Alt')   setIsAltDown(false);
    };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  // ── Grid toggle via G key ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA' &&
          !(document.activeElement as HTMLElement)?.isContentEditable) {
        setShowGrid(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Clamp pan so the canvas never fully leaves the viewport ──
  const clampPan = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const vw = wrapper.clientWidth;
    const vh = wrapper.clientHeight;
    const cw = canvasSize.width  * zoomRef.current;
    const ch = (typeof canvasSize.height === 'number' ? canvasSize.height : vh) * zoomRef.current;
    // Allow the page to scroll until only 20% of it is still visible
    const marginX = Math.max(vw * 0.2, 60);
    const marginY = Math.max(vh * 0.2, 60);
    panRef.current.x = Math.min(vw - marginX, Math.max(marginX - cw, panRef.current.x));
    panRef.current.y = Math.min(vh - marginY, Math.max(marginY - ch, panRef.current.y));
  }, [canvasSize]);

  // ── Apply CSS transform ──
  const updateTransform = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.transform =
        `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`;
    }
    storeSetZoom(zoomRef.current);
    storeSetPan({ ...panRef.current });
  }, [storeSetPan, storeSetZoom]);

  // ── Centre page in viewport ──
  const centerPage = useCallback(() => {
    if (!wrapperRef.current || !page) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const margin = 80;
    const fitZoom = Math.min((rect.width - margin) / canvasSize.width, 1);
    const clamped = Math.max(Math.min(fitZoom, MAX_ZOOM), MIN_ZOOM);
    zoomRef.current = clamped;
    panRef.current.x = (rect.width - canvasSize.width * clamped) / 2;
    panRef.current.y = 60;
    updateTransform();
    window.dispatchEvent(new CustomEvent('stakked-zoom-change', { detail: { zoom: clamped } }));
  }, [page, canvasSize.width, updateTransform]);

  // Auto-centre ONLY when a new project is first loaded — NOT on page switches
  useEffect(() => {
    if (page && projectId && projectId !== centeredProjectId.current) {
      centeredProjectId.current = projectId;
      centerPage();
    }
  }, [page, projectId, centerPage]);

  // Re-centre when canvas WIDTH changes (breakpoint switch) — skips first render
  const skipFirstWidth = useRef(true);
  useEffect(() => {
    if (skipFirstWidth.current) { skipFirstWidth.current = false; return; }
    if (page) centerPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.width]);

  // ── External events (fit-page, stakked-zoom-to, context-menu) ──
  useEffect(() => {
    const handleFit = () => centerPage();
    const handleZoomTo = (e: Event) => {
      const { zoom: newZoom, centerX, centerY } = (e as CustomEvent).detail ?? {};
      if (!newZoom || !wrapperRef.current || !page) return;
      const clamped = Math.max(Math.min(newZoom, MAX_ZOOM), MIN_ZOOM);
      const rect = wrapperRef.current.getBoundingClientRect();
      zoomRef.current = clamped;
      if (centerX != null && centerY != null) {
        // Center the viewport on the given artboard coordinate
        panRef.current.x = rect.width  / 2 - centerX * clamped;
        panRef.current.y = rect.height / 2 - centerY * clamped;
      } else {
        panRef.current.x = (rect.width - canvasSize.width * clamped) / 2;
        panRef.current.y = 60;
      }
      updateTransform();
    };
    const handleCtxMenu = (e: Event) => {
      const { x, y, elementId } = (e as CustomEvent).detail;
      setContextMenu({ x, y, elementId });
    };
    window.addEventListener('stakked-fit-page', handleFit);
    window.addEventListener('stakked-zoom-to', handleZoomTo);
    window.addEventListener('stakked-context-menu', handleCtxMenu);
    return () => {
      window.removeEventListener('stakked-fit-page', handleFit);
      window.removeEventListener('stakked-zoom-to', handleZoomTo);
      window.removeEventListener('stakked-context-menu', handleCtxMenu);
    };
  }, [centerPage, updateTransform, page, canvasSize.width]);

  // ── Marquee (rubber-band) selection ────────────────────────────────────────
  const startMarquee = useCallback((clientX: number, clientY: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const canvasX = (clientX - rect.left - panRef.current.x) / zoomRef.current;
    const canvasY = (clientY - rect.top  - panRef.current.y) / zoomRef.current;
    marqueeStartRef.current = { canvasX, canvasY };
    isMarqueeingRef.current = false;
  }, []);

  const updateMarquee = useCallback((clientX: number, clientY: number) => {
    const wrapper = wrapperRef.current;
    const start   = marqueeStartRef.current;
    if (!wrapper || !start) return;
    const rect    = wrapper.getBoundingClientRect();
    const canvasX = (clientX - rect.left - panRef.current.x) / zoomRef.current;
    const canvasY = (clientY - rect.top  - panRef.current.y) / zoomRef.current;
    const dx = canvasX - start.canvasX;
    const dy = canvasY - start.canvasY;
    if (!isMarqueeingRef.current && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    isMarqueeingRef.current = true;
    const marqueeRect = {
      x: Math.min(canvasX, start.canvasX),
      y: Math.min(canvasY, start.canvasY),
      w: Math.abs(dx),
      h: Math.abs(dy),
    };
    marqueeRectRef.current = marqueeRect;
    setMarquee(marqueeRect);
  }, []);

  const commitMarquee = useCallback(() => {
    const start = marqueeStartRef.current;
    if (!start || !isMarqueeingRef.current) {
      if (!isMarqueeingRef.current) clearSelection();
      marqueeStartRef.current = null;
      isMarqueeingRef.current = false;
      setMarquee(null);
      return;
    }
    // Read current marquee from the ref — never use setMarquee(prev => ...)
    // to call other store setters, as that is setState-during-render in React 19.
    const prev = marqueeRectRef.current;
    marqueeRectRef.current = null;
    setMarquee(null);
    marqueeStartRef.current = null;
    isMarqueeingRef.current = false;

    if (prev) {
      const ids = (elements as StakkedElement[])
        .filter(el => {
          if (!el.visible || el.locked) return false;
          const ew = typeof el.size.width  === 'number' ? el.size.width  : 0;
          const eh = typeof el.size.height === 'number' ? el.size.height : 0;
          return (
            el.position.x < prev.x + prev.w &&
            el.position.x + ew > prev.x &&
            el.position.y < prev.y + prev.h &&
            el.position.y + eh > prev.y
          );
        })
        .map(el => el.id);
      if (ids.length > 0) setSelection(ids);
      else clearSelection();
    }
  }, [elements, setSelection, clearSelection]);

  // ── Pan & Zoom input handlers ──
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let isPanning    = false;
    let isSpaceDown  = false;
    let isMarqueeActive = false; // local shadow of ref for this closure
    let lastMouse    = { x: 0, y: 0 };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA' &&
          !(document.activeElement as HTMLElement)?.isContentEditable) {
        isSpaceDown = true;
        wrapper.style.cursor = 'grab';
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceDown = false;
        if (!isPanning) wrapper.style.cursor = '';
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const factor = Math.pow(1.1, delta / 100);
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current * factor));
        const rect = wrapper.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const wx = (mx - panRef.current.x) / zoomRef.current;
        const wy = (my - panRef.current.y) / zoomRef.current;
        zoomRef.current = newZoom;
        panRef.current.x = mx - wx * newZoom;
        panRef.current.y = my - wy * newZoom;
        window.dispatchEvent(new CustomEvent('stakked-zoom-change', { detail: { zoom: newZoom } }));
        updateTransform();
      } else {
        panRef.current.x -= e.deltaX;
        panRef.current.y -= e.deltaY;
        clampPan();
        updateTransform();
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && isSpaceDown)) {
        isPanning = true;
        isMarqueeActive = false;
        lastMouse = { x: e.clientX, y: e.clientY };
        wrapper.style.cursor = 'grabbing';
        e.preventDefault();
        return;
      }
      // Left-click on the canvas background (not on an element) → start marquee
      if (e.button === 0) {
        const target = e.target as HTMLElement;
        if (!target.closest?.('[id^="el-"]') && !target.closest?.('[class*="moveable"]')) {
          isMarqueeActive = true;
          startMarquee(e.clientX, e.clientY);
        }
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        panRef.current.x += e.clientX - lastMouse.x;
        panRef.current.y += e.clientY - lastMouse.y;
        lastMouse = { x: e.clientX, y: e.clientY };
        clampPan();
        updateTransform();
        return;
      }
      if (isMarqueeActive) {
        updateMarquee(e.clientX, e.clientY);
      }
    };
    const onMouseUp = () => {
      if (isPanning) {
        isPanning = false;
        wrapper.style.cursor = isSpaceDown ? 'grab' : '';
        return;
      }
      if (isMarqueeActive) {
        isMarqueeActive = false;
        commitMarquee();
      }
    };

    wrapper.addEventListener('wheel', onWheel, { passive: false });
    wrapper.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      wrapper.removeEventListener('wheel', onWheel);
      wrapper.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [updateTransform, clampPan, startMarquee, updateMarquee, commitMarquee]);

  // ── Deselect on canvas click — covers artboard + empty space ──
  const handleWrapperClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest?.('[id^="el-"]')) return;
    // Marquee commitMarquee handles the deselect; plain click is a no-op here
    // because commitMarquee already fired on pointerup.
  }, []);

  // Right-click on empty canvas
  const handleWrapperContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest?.('[id^="el-"]')) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, elementId: null });
  }, []);

  // ── Drop new elements from sidebar ──
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!wrapperRef.current || !page) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
    const y = (e.clientY - rect.top  - panRef.current.y) / zoomRef.current;

    const type = e.dataTransfer.getData('stakked/element-type') as ElementType;
    if (type) {
      const el = defaultElement(type);
      // Center the new element under the drop cursor rather than placing
      // its top-left corner at the cursor position.
      const elW = typeof el.size.width  === 'number' ? el.size.width  : 120;
      const elH = typeof el.size.height === 'number' ? el.size.height : 60;
      const dropX = Math.round(x - elW / 2);
      const dropY = Math.round(y - elH / 2);
      el.position = { x: dropX, y: dropY };
      el.style.position.x = dropX;
      el.style.position.y = dropY;
      addElement(activePageIndex, el);
      setSelection([el.id]);
      setDropGhost(null);
      return;
    }
    const assetUrl = e.dataTransfer.getData('stakked/asset-url');
    if (assetUrl) {
      const el = defaultElement('image');
      const elW = typeof el.size.width  === 'number' ? el.size.width  : 200;
      const elH = typeof el.size.height === 'number' ? el.size.height : 150;
      const dropX = Math.round(x - elW / 2);
      const dropY = Math.round(y - elH / 2);
      el.position = { x: dropX, y: dropY };
      el.style.position.x = dropX;
      el.style.position.y = dropY;
      if (el.content.type === 'image') el.content.src = assetUrl;
      addElement(activePageIndex, el);
      setSelection([el.id]);
    }
    setDropGhost(null);
  }, [page, activePageIndex, addElement, setSelection]);

  // ── Snap guides ──
  const staticGuides = useMemo(() => {
    const w = canvasSize.width;
    const h = typeof canvasSize.height === 'number' ? canvasSize.height : 0;
    return {
      x: [Math.round(w / 2), w],            // centre + right edge
      y: h > 0 ? [Math.round(h / 2)] : [],  // centre
    };
  }, [canvasSize.width, canvasSize.height]);

  /**
   * Compute element-to-element snap guides and return clamped [nx, ny].
   * Returns the (possibly adjusted) position after snapping.
   * Also detects equal-gap opportunities for gap snap guides.
   */
  const computeElementGuides = useCallback((
    movingIds: string[],
    mx: number,
    my: number,
    mW: number,
    mH: number,
  ): { nx: number; ny: number } => {
    const threshold = SNAP_SCREEN_PX / zoomRef.current;

    // 6 snap points of the dragged element (left, centerX, right / top, centerY, bottom)
    const dragXPoints = [mx, mx + mW / 2, mx + mW];
    const dragYPoints = [my, my + mH / 2, my + mH];

    let bestSnapX: { delta: number; guide: number; offset: number } | null = null;
    let bestSnapY: { delta: number; guide: number; offset: number } | null = null;

    const gX = new Set<number>();
    const gY = new Set<number>();

    // Collect all non-selected, visible elements' snap lines
    const staticElems = (elements as StakkedElement[]).filter(
      el => !movingIds.includes(el.id) && el.visible
    );

    for (const el of staticElems) {
      const eW = typeof el.size.width  === 'number' ? el.size.width  : 0;
      const eH = typeof el.size.height === 'number' ? el.size.height : 0;
      const snapXCandidates = [el.position.x, el.position.x + eW / 2, el.position.x + eW];
      const snapYCandidates = [el.position.y, el.position.y + eH / 2, el.position.y + eH];

      for (const candidate of snapXCandidates) {
        for (let pi = 0; pi < dragXPoints.length; pi++) {
          const delta = Math.abs(candidate - dragXPoints[pi]);
          if (delta <= threshold) {
            gX.add(candidate);
            if (!bestSnapX || delta < bestSnapX.delta) {
              bestSnapX = { delta, guide: candidate, offset: pi === 0 ? 0 : pi === 1 ? mW / 2 : mW };
            }
          }
        }
      }

      for (const candidate of snapYCandidates) {
        for (let pi = 0; pi < dragYPoints.length; pi++) {
          const delta = Math.abs(candidate - dragYPoints[pi]);
          if (delta <= threshold) {
            gY.add(candidate);
            if (!bestSnapY || delta < bestSnapY.delta) {
              bestSnapY = { delta, guide: candidate, offset: pi === 0 ? 0 : pi === 1 ? mH / 2 : mH };
            }
          }
        }
      }
    }

    const snappedNx = bestSnapX ? bestSnapX.guide - bestSnapX.offset : mx;
    const snappedNy = bestSnapY ? bestSnapY.guide - bestSnapY.offset : my;

    // ── Equal-gap detection ────────────────────────────────────────────────
    // Check if spacing between the dragged element and two static neighbours is equal
    const gapLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const dragCx = snappedNx + mW / 2;
    const dragCy = snappedNy + mH / 2;

    // Collect centres of static elements
    const staticCentres = staticElems.map(el => ({
      cx: el.position.x + (typeof el.size.width  === 'number' ? el.size.width  : 0) / 2,
      cy: el.position.y + (typeof el.size.height === 'number' ? el.size.height : 0) / 2,
      el,
    }));

    // Sort by horizontal distance; check if gap from left neighbour === gap to right neighbour
    const byHDist = staticCentres.slice().sort((a, b) => Math.abs(a.cx - dragCx) - Math.abs(b.cx - dragCx));
    if (byHDist.length >= 2) {
      const left  = byHDist.find(s => s.cx < dragCx);
      const right = byHDist.find(s => s.cx > dragCx);
      if (left && right) {
        const gapL = dragCx - left.cx;
        const gapR = right.cx - dragCx;
        if (Math.abs(gapL - gapR) <= threshold * 2) {
          gapLines.push({ x1: left.cx, y1: dragCy, x2: right.cx, y2: dragCy });
        }
      }
    }

    const byVDist = staticCentres.slice().sort((a, b) => Math.abs(a.cy - dragCy) - Math.abs(b.cy - dragCy));
    if (byVDist.length >= 2) {
      const above = byVDist.find(s => s.cy < dragCy);
      const below = byVDist.find(s => s.cy > dragCy);
      if (above && below) {
        const gapA = dragCy - above.cy;
        const gapB = below.cy - dragCy;
        if (Math.abs(gapA - gapB) <= threshold * 2) {
          gapLines.push({ x1: dragCx, y1: above.cy, x2: dragCx, y2: below.cy });
        }
      }
    }

    setActiveGuides({ x: Array.from(gX), y: Array.from(gY), gaps: gapLines });
    return { nx: snappedNx, ny: snappedNy };
  }, [elements]);

  // ── Helper: restore the full CSS transform after Moveable moves ──
  // Moveable adds its own translate to style.transform; we cancel that by
  // re-applying exactly what buildWrapperStyle computed (rotation + scale/skew/3D).
  // This keeps left/top as the sole position source.
  const restoreTransform = useCallback((target: HTMLElement | SVGElement, id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const tr = el.style?.transform;
    const parts: string[] = [`rotate(${el.rotation ?? 0}deg)`];
    if (tr) {
      // scaleX/scaleY may be -1 for flip — always include when non-identity
      const sx = tr.scaleX ?? 1;
      const sy = tr.scaleY ?? 1;
      if (sx !== 1 || sy !== 1) parts.push(`scale(${sx},${sy})`);
      if (tr.skewX)      parts.push(`skewX(${tr.skewX}deg)`);
      if (tr.skewY)      parts.push(`skewY(${tr.skewY}deg)`);
      if (tr.translateX) parts.push(`translateX(${tr.translateX}px)`);
      if (tr.translateY) parts.push(`translateY(${tr.translateY}px)`);
      if (tr.rotateX)    parts.push(`rotateX(${tr.rotateX}deg)`);
      if (tr.rotateY)    parts.push(`rotateY(${tr.rotateY}deg)`);
    }
    (target as HTMLElement).style.transform = parts.join(' ');
  }, [elements]);

  // ── Page background style ──
  const bgStyle = useMemo<React.CSSProperties>(() => {
    const bg = page?.canvas.background;
    const bgCss: React.CSSProperties = {};
    if (bg) {
      if (bg.type === 'color') {
        bgCss.backgroundColor = bg.value;
      } else if (bg.type === 'gradient') {
        bgCss.background = bg.value;
      } else if (bg.type === 'pattern') {
        bgCss.background = bg.value;
      } else if (bg.type === 'image' && bg.value) {
        bgCss.backgroundImage = `url(${bg.value})`;
        bgCss.backgroundSize = (bg as { fit?: string }).fit ?? 'cover';
        bgCss.backgroundPosition = 'center';
        bgCss.backgroundRepeat = 'no-repeat';
      }
    }
    return { width: canvasSize.width, height: canvasSize.height, ...bgCss };
  }, [canvasSize.width, canvasSize.height, page?.canvas.background]);

  const pageLabel = page
    ? `// ${page.title ?? 'page'} · ${canvasSize.width}×${canvasSize.height}`
    : '';

  // Snap guidelines: page centre + right/bottom edges + other elements
  const verticalGuidelines = useMemo(() =>
    [canvasSize.width / 2, canvasSize.width],
    [canvasSize.width]);

  const horizontalGuidelines = useMemo(() =>
    typeof canvasSize.height === 'number'
      ? [canvasSize.height / 2, canvasSize.height]
      : [],
    [canvasSize.height]);

  const elementGuidelines = useMemo(() =>
    elements
      .filter(e => !selectedElementIds.includes(e.id) && e.visible)
      .map(e => selectorOf(e.id)),
    [elements, selectedElementIds]);

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        ref={wrapperRef}
        className={styles.wrapper}
        style={{ cursor: wrapperCursor }}
        onClick={handleWrapperClick}
        onContextMenu={handleWrapperContextMenu}
        onDragOver={e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          if (!wrapperRef.current) return;
          const rect = wrapperRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
          const y = (e.clientY - rect.top  - panRef.current.y) / zoomRef.current;
          const type = e.dataTransfer.types.includes('stakked/element-type')
            ? e.dataTransfer.getData('stakked/element-type') || 'element'
            : 'asset';
          setDropGhost({ x, y, label: type });
        }}
        onDragLeave={() => setDropGhost(null)}
        onDrop={handleDrop}
        data-tour="canvas"
      >
        <Rulers zoom={zoom} pan={pan} />

        {/* W×H / X,Y tooltip shown during drag and resize */}
        {sizeTooltip && (
          <div style={{
            position: 'absolute',
            left: sizeTooltip.x,
            top:  sizeTooltip.y,
            background: 'var(--bg-2, #18181b)',
            border: '1px solid var(--line, rgba(255,255,255,0.1))',
            borderRadius: 4,
            padding: '3px 7px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
          }}>
            {sizeTooltip.mode === 'drag'
              ? `X: ${sizeTooltip.w}  Y: ${sizeTooltip.h}`
              : `${sizeTooltip.w} × ${sizeTooltip.h}`}
          </div>
        )}

        {/* Grid toggle pill — bottom-right corner of viewport */}
        <button
          className={styles.gridToggle}
          onClick={e => { e.stopPropagation(); setShowGrid(v => !v); }}
          title="Toggle grid (G)"
          style={{ opacity: showGrid ? 1 : 0.45 }}
        >
          Grid
        </button>

        <div ref={containerRef} className={styles.canvasContainer}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePageIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              className={styles.backgroundLayer}
              style={bgStyle}
              data-label={pageLabel}
              data-export-canvas="true"
            >
              {/* Reference grid (toggleable) */}
              {showGrid && <div className={styles.gridOverlay} />}

              {/* Drop ghost — shown during sidebar-to-canvas drag */}
              {dropGhost && (
                <div
                  className={styles.dropGhost}
                  style={{ left: dropGhost.x, top: dropGhost.y, width: 120, height: 60 }}
                >
                  {dropGhost.label}
                </div>
              )}

              <div className={styles.elementsLayer}>
                {/* Container children are rendered inside their container's DOM node;
                    only root-level (non-child) elements go in the flat layer. */}
                {elements
                  .filter(el => !childIds.has(el.id))
                  .map(el => <CanvasElement key={el.id} id={el.id} />)}
              </div>

              {/* Centralised Moveable ── only when elements are selected */}
              {selectedElementIds.length > 0 && !isEditingText && !previewMode && (
                <Moveable
                  target={
                    selectedElementIds.length === 1
                      ? selectorOf(selectedElementIds[0])
                      : selectedElementIds.map(selectorOf)
                  }
                  container={containerRef.current}
                  draggable
                  resizable
                  rotatable
                  snappable
                  snapCenter
                  snapElement
                  snapGap
                  isDisplaySnapDigit
                  snapThreshold={SNAP_THRESHOLD}
                  // zoom prop = visual handle scale (NOT coordinate scaling)
                  zoom={1 / zoomRef.current}
                  keepRatio={isShiftDown}
                  rotationSnaps={isShiftDown ? [0, 45, 90, 135, 180, 225, 270, 315] : []}
                  rotationSnapTolerance={5}
                  verticalGuidelines={verticalGuidelines}
                  horizontalGuidelines={horizontalGuidelines}
                  elementGuidelines={elementGuidelines}
                  snapGridWidth={showGrid ? 8 : 1}
                  snapGridHeight={showGrid ? 8 : 1}
                  bounds={{ left: 0, top: 0, right: canvasSize.width, bottom: typeof canvasSize.height === 'number' ? canvasSize.height : undefined }}

                  // ── Single element drag ──────────────────────────
                  onDragStart={({ target }) => {
                    setDragging(true);
                    const id = elementIdFromDom(target as HTMLElement);
                    const el = elements.find(e => e.id === id);
                    if (el) {
                      moveRef.current[id] = { x: el.position.x, y: el.position.y };
                      // Alt+drag: record whether Alt is held at gesture start
                      altWasPressedOnDragStart.current = isAltDown;
                      altDragOriginalPos.current = { x: el.position.x, y: el.position.y };
                    }
                  }}
                  onDrag={({ target, dist, clientX, clientY }: OnDrag) => {
                    const id    = elementIdFromDom(target as HTMLElement);
                    const start = moveRef.current[id] ?? { x: 0, y: 0 };
                    const rawNx = start.x + dist[0];
                    const rawNy = start.y + dist[1];
                    const el    = elements.find(e => e.id === id);
                    const mW    = el ? (typeof el.size.width  === 'number' ? el.size.width  : 0) : 0;
                    const mH    = el ? (typeof el.size.height === 'number' ? el.size.height : 0) : 0;
                    // Snap to nearest element edge/centre — returns clamped position
                    const { nx, ny } = computeElementGuides([id], rawNx, rawNy, mW, mH);
                    // nx/ny are always canvas-absolute; child elements inside a
                    // container need their style written as container-relative.
                    const t   = target as HTMLElement;
                    const ctn = childToContainer.get(id);
                    t.style.left = ctn ? `${nx - ctn.position.x}px` : `${nx}px`;
                    t.style.top  = ctn ? `${ny - ctn.position.y}px` : `${ny}px`;
                    restoreTransform(target as HTMLElement, id);
                    // Show X,Y tooltip
                    if (wrapperRef.current) {
                      const wr = wrapperRef.current.getBoundingClientRect();
                      setSizeTooltip({ x: clientX - wr.left + 12, y: clientY - wr.top + 12, w: Math.round(nx), h: Math.round(ny), mode: 'drag' });
                    }
                  }}
                  onDragEnd={({ target, isDrag }: OnDragEnd) => {
                    setDragging(false);
                    setSizeTooltip(null);
                    setActiveGuides({ x: [], y: [], gaps: [] });
                    const id = elementIdFromDom(target as HTMLElement);
                    // Always restore transform (clears any translate Moveable added on click)
                    restoreTransform(target as HTMLElement, id);
                    if (!isDrag) {
                      altWasPressedOnDragStart.current = false;
                      altDragOriginalPos.current = null;
                      return;
                    }
                    // Read fresh state — Moveable caches the handler from the render
                    // that started the gesture; a concurrent edit (BroadcastChannel /
                    // 30 s cloud sync) may have updated `elements` since then.
                    const { project: _p, activePageIndex: _ai } = useProjectStore.getState();
                    const el = _p?.pages[_ai].elements.find(e => e.id === id);
                    if (el) {
                      // style.left/top may be container-relative for nested children;
                      // add the container offset back to restore canvas-absolute coords.
                      const ctn = childToContainer.get(el.id);
                      const ox = ctn?.position.x ?? 0;
                      const oy = ctn?.position.y ?? 0;
                      commitElementMove(_ai, el.id, moveRef.current[el.id], {
                        x: parsePx((target as HTMLElement).style.left, el.position.x - ox) + ox,
                        y: parsePx((target as HTMLElement).style.top,  el.position.y - oy) + oy,
                      });

                      // Alt+drag: duplicate the element at its ORIGINAL position
                      // (the dragged copy is already committed above at its new position)
                      if (altWasPressedOnDragStart.current && altDragOriginalPos.current) {
                        const { duplicateSelection } = useProjectStore.getState();
                        duplicateSelection(_ai, [el.id]);
                      }
                    }
                    altWasPressedOnDragStart.current = false;
                    altDragOriginalPos.current = null;
                  }}

                  // ── Single element resize ────────────────────────
                  onResizeStart={({ target }) => {
                    setDragging(true);
                    const id = elementIdFromDom(target as HTMLElement);
                    const el = elements.find(e => e.id === id);
                    if (el) {
                      sizeRef.current[id] = { width: el.size.width, height: el.size.height };
                      moveRef.current[id] = { x: el.position.x, y: el.position.y };
                    }
                  }}
                  onResize={({ target, width, height, drag, clientX, clientY }: OnResize) => {
                    const id = elementIdFromDom(target as HTMLElement);
                    const t  = target as HTMLElement;
                    t.style.width  = `${width}px`;
                    t.style.height = `${height}px`;
                    const startPos = moveRef.current[id];
                    if (startPos) {
                      const ctn = childToContainer.get(id);
                      const newLeft = startPos.x + drag.dist[0];
                      const newTop  = startPos.y + drag.dist[1];
                      t.style.left = ctn ? `${newLeft - ctn.position.x}px` : `${newLeft}px`;
                      t.style.top  = ctn ? `${newTop  - ctn.position.y}px` : `${newTop}px`;
                    }
                    restoreTransform(target as HTMLElement, id);
                    // Show W×H tooltip near cursor
                    if (wrapperRef.current) {
                      const wr = wrapperRef.current.getBoundingClientRect();
                      setSizeTooltip({ x: clientX - wr.left + 12, y: clientY - wr.top + 12, w: Math.round(width), h: Math.round(height), mode: 'resize' });
                    }
                  }}
                  onResizeEnd={({ target }: OnResizeEnd) => {
                    setDragging(false);
                    setSizeTooltip(null);
                    const id = elementIdFromDom(target as HTMLElement);
                    restoreTransform(target as HTMLElement, id);
                    const { project: _p2, activePageIndex: _ai2 } = useProjectStore.getState();
                    const el = _p2?.pages[_ai2].elements.find(e => e.id === id);
                    if (el) {
                      commitElementResize(activePageIndex, el.id, sizeRef.current[id], {
                        width:  parsePx((target as HTMLElement).style.width,  el.size.width as number),
                        height: parsePx((target as HTMLElement).style.height, el.size.height as number),
                      });
                    }
                  }}

                  // ── Single element rotate ────────────────────────
                  onRotateStart={({ target }) => {
                    setDragging(true);
                    const id = elementIdFromDom(target as HTMLElement);
                    const el = elements.find(e => e.id === id);
                    if (el) rotationRef.current[id] = el.rotation;
                  }}
                  onRotate={({ target, rotation }: OnRotate) => {
                    (target as HTMLElement).style.transform = `rotate(${rotation}deg)`;
                  }}
                  onRotateEnd={({ target, lastEvent }: OnRotateEnd) => {
                    setDragging(false);
                    const id = elementIdFromDom(target as HTMLElement);
                    const { project: _p3, activePageIndex: _ai3 } = useProjectStore.getState();
                    const el = _p3?.pages[_ai3].elements.find(e => e.id === id);
                    if (el) {
                      commitElementRotation(
                        activePageIndex, el.id,
                        rotationRef.current[id] ?? 0,
                        lastEvent?.rotation ?? rotationRef.current[id] ?? 0,
                      );
                    }
                  }}

                  // ── Group drag ──────────────────────────────────
                  onDragGroupStart={() => {
                    setDragging(true);
                    moveRef.current = {};
                    for (const id of selectedElementIds) {
                      const el = elements.find(e => e.id === id);
                      if (el) moveRef.current[id] = { x: el.position.x, y: el.position.y };
                    }
                  }}
                  onDragGroup={({ events }: OnDragGroup) => {
                    // Use the first element in the group as the snap reference
                    const firstEvent = events[0];
                    let snapNxOffset = 0;
                    let snapNyOffset = 0;
                    if (firstEvent) {
                      const firstId    = elementIdFromDom(firstEvent.target as HTMLElement);
                      const firstStart = moveRef.current[firstId];
                      const firstEl    = elements.find(e => e.id === firstId);
                      if (firstStart && firstEl) {
                        const mW = typeof firstEl.size.width  === 'number' ? firstEl.size.width  : 0;
                        const mH = typeof firstEl.size.height === 'number' ? firstEl.size.height : 0;
                        const rawNx = firstStart.x + firstEvent.dist[0];
                        const rawNy = firstStart.y + firstEvent.dist[1];
                        const { nx: snappedNx, ny: snappedNy } = computeElementGuides(
                          selectedElementIds, rawNx, rawNy, mW, mH
                        );
                        snapNxOffset = snappedNx - rawNx;
                        snapNyOffset = snappedNy - rawNy;
                      }
                    }
                    for (const { target, dist } of events) {
                      const id    = elementIdFromDom(target as HTMLElement);
                      const start = moveRef.current[id];
                      if (!start) continue;
                      const t   = target as HTMLElement;
                      const ctn = childToContainer.get(id);
                      const nx  = start.x + dist[0] + snapNxOffset;
                      const ny  = start.y + dist[1] + snapNyOffset;
                      t.style.left = ctn ? `${nx - ctn.position.x}px` : `${nx}px`;
                      t.style.top  = ctn ? `${ny - ctn.position.y}px` : `${ny}px`;
                      restoreTransform(target as HTMLElement, id);
                    }
                  }}
                  onDragGroupEnd={({ targets, isDrag }: OnDragGroupEnd) => {
                    setDragging(false);
                    setActiveGuides({ x: [], y: [], gaps: [] });
                    for (const t of targets) {
                      const id = elementIdFromDom(t as HTMLElement);
                      restoreTransform(t as HTMLElement, id);
                    }
                    if (!isDrag) return;
                    // Read fresh page index from store — avoids stale closure
                    // when the user switches pages during a long drag gesture.
                    const { project: _pg, activePageIndex: _aig } = useProjectStore.getState();
                    for (const t of targets) {
                      const id = elementIdFromDom(t as HTMLElement);
                      const el = _pg?.pages[_aig].elements.find(e => e.id === id);
                      if (el) {
                        const ctn = childToContainer.get(id);
                        const ox = ctn?.position.x ?? 0;
                        const oy = ctn?.position.y ?? 0;
                        commitElementMove(_aig, el.id, moveRef.current[id], {
                          x: parsePx((t as HTMLElement).style.left, el.position.x - ox) + ox,
                          y: parsePx((t as HTMLElement).style.top,  el.position.y - oy) + oy,
                        });
                      }
                    }
                  }}

                  // ── Group resize ────────────────────────────────
                  onResizeGroupStart={({ targets }: OnResizeGroupStart) => {
                    setDragging(true);
                    sizeRef.current = {};
                    moveRef.current = {};
                    for (const t of targets) {
                      const id = elementIdFromDom(t);
                      const el = elements.find(e => e.id === id);
                      if (el) {
                        sizeRef.current[id] = { width: el.size.width, height: el.size.height };
                        moveRef.current[id] = { x: el.position.x, y: el.position.y };
                      }
                    }
                  }}
                  onResizeGroup={({ events }: OnResizeGroup) => {
                    for (const { target, width, height, drag } of events) {
                      const id = elementIdFromDom(target as HTMLElement);
                      const t  = target as HTMLElement;
                      t.style.width  = `${width}px`;
                      t.style.height = `${height}px`;
                      const start = moveRef.current[id];
                      if (start) {
                        const ctn = childToContainer.get(id);
                        const newLeft = start.x + drag.dist[0];
                        const newTop  = start.y + drag.dist[1];
                        t.style.left = ctn ? `${newLeft - ctn.position.x}px` : `${newLeft}px`;
                        t.style.top  = ctn ? `${newTop  - ctn.position.y}px` : `${newTop}px`;
                      }
                      restoreTransform(target as HTMLElement, id);
                    }
                  }}
                  onResizeGroupEnd={({ targets }: OnResizeGroupEnd) => {
                    setDragging(false);
                    const { project: _pr, activePageIndex: _air } = useProjectStore.getState();
                    for (const t of targets) {
                      const id = elementIdFromDom(t as HTMLElement);
                      restoreTransform(t as HTMLElement, id);
                      const el = _pr?.pages[_air].elements.find(e => e.id === id);
                      if (el) {
                        commitElementResize(_air, el.id, sizeRef.current[id], {
                          width:  parsePx((t as HTMLElement).style.width,  el.size.width as number),
                          height: parsePx((t as HTMLElement).style.height, el.size.height as number),
                        });
                      }
                    }
                  }}

                  // ── Group rotate ────────────────────────────────
                  onRotateGroupStart={() => {
                    setDragging(true);
                    for (const id of selectedElementIds) {
                      const el = elements.find(e => e.id === id);
                      if (el) rotationRef.current[id] = el.rotation;
                    }
                  }}
                  onRotateGroup={({ events }: OnRotateGroup) => {
                    for (const { target, rotation } of events) {
                      (target as HTMLElement).style.transform = `rotate(${rotation}deg)`;
                    }
                  }}
                  onRotateGroupEnd={({ targets }: OnRotateGroupEnd) => {
                    setDragging(false);
                    const { project: _prot, activePageIndex: _airot } = useProjectStore.getState();
                    for (const t of targets) {
                      const id    = elementIdFromDom(t as HTMLElement);
                      const el    = _prot?.pages[_airot].elements.find(e => e.id === id);
                      const prev  = rotationRef.current[id] ?? 0;
                      const match = (t as HTMLElement).style.transform.match(/rotate\(([\d.-]+)deg\)/);
                      const next  = match ? parseFloat(match[1]) : prev;
                      if (el) commitElementRotation(_airot, el.id, prev, next);
                    }
                  }}
                />
              )}

              {/* Marquee selection rect */}
              {marquee && (
                <div
                  style={{
                    position: 'absolute',
                    left: marquee.x,
                    top:  marquee.y,
                    width:  marquee.w,
                    height: marquee.h,
                    border: '1.5px solid var(--accent)',
                    background: 'color-mix(in oklab, var(--accent) 12%, transparent)',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    borderRadius: 2,
                  }}
                />
              )}

              {/* SVG snap guides layer */}
              {isDragging && (
                <svg
                  className={styles.guidesLayer}
                  style={{ pointerEvents: 'none', position: 'absolute', inset: 0, overflow: 'visible' }}
                >
                  {/* Page-centre + edge guides (dashed accent) */}
                  {staticGuides.x.map(gx => (
                    <line key={`sc-x-${gx}`} x1={gx} y1={-9999} x2={gx} y2={9999}
                      stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
                  ))}
                  {staticGuides.y.map(gy => (
                    <line key={`sc-y-${gy}`} x1={-9999} y1={gy} x2={9999} y2={gy}
                      stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
                  ))}
                  {/* Element-to-element alignment guides (solid green) */}
                  {activeGuides.x.map(gx => (
                    <line key={`el-x-${gx}`} x1={gx} y1={-9999} x2={gx} y2={9999}
                      stroke="var(--ok, #22c55e)" strokeWidth={1} opacity={0.9} />
                  ))}
                  {activeGuides.y.map(gy => (
                    <line key={`el-y-${gy}`} x1={-9999} y1={gy} x2={9999} y2={gy}
                      stroke="var(--ok, #22c55e)" strokeWidth={1} opacity={0.9} />
                  ))}
                  {/* Equal-gap measurement guides (orange double-ended lines) */}
                  {activeGuides.gaps.map((g, i) => (
                    <g key={`gap-${i}`} opacity={0.85}>
                      <line x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}
                        stroke="#f97316" strokeWidth={1} strokeDasharray="3 2" />
                      {/* Arrow-head at start */}
                      <line x1={g.x1} y1={g.y1 - 4} x2={g.x1} y2={g.y1 + 4}
                        stroke="#f97316" strokeWidth={1.5} />
                      {/* Arrow-head at end */}
                      <line x1={g.x2} y1={g.y2 - 4} x2={g.x2} y2={g.y2 + 4}
                        stroke="#f97316" strokeWidth={1.5} />
                    </g>
                  ))}
                </svg>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CanvasContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
    </>
  );
});

Canvas.displayName = 'Canvas';
