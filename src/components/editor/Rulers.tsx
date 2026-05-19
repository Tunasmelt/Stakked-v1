'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import styles from '@/styles/Canvas.module.css';

interface RulerProps {
  zoom: number;
  pan: { x: number; y: number };
}

/** Draw a single ruler. All measurements are in CSS pixels; the canvas is
 *  scaled by devicePixelRatio so ticks appear sharp on Retina displays. */
function drawRuler(
  canvas: HTMLCanvasElement,
  axis: 'h' | 'v',
  zoom: number,
  pan: { x: number; y: number },
) {
  const dpr    = window.devicePixelRatio || 1;
  const cssW   = canvas.clientWidth;
  const cssH   = canvas.clientHeight;
  if (cssW === 0 || cssH === 0) return;

  // Keep backing store in sync with CSS size × DPR
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset to CSS px scale
  ctx.clearRect(0, 0, cssW, cssH);

  const rulerSize = axis === 'h' ? cssH : cssW;

  // ── Adaptive tick interval ─────────────────────────────────────────────────
  // Pick the smallest interval that produces at least 40px between major ticks.
  const candidates = [1, 2, 5, 10, 25, 50, 100, 200, 500, 1000];
  const targetGap  = 40;
  const interval   = candidates.find(c => c * zoom >= targetGap) ?? 1000;
  const subDivs    = interval >= 100 ? 10 : interval >= 10 ? 5 : 2;
  const subInterval = interval / subDivs;

  // ── Styles ─────────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.fillStyle   = 'rgba(255,255,255,0.45)';
  ctx.font        = `${9}px "Inter", system-ui, sans-serif`;
  ctx.textBaseline = axis === 'h' ? 'top' : 'middle';

  const offset = axis === 'h' ? pan.x : pan.y;
  const length = axis === 'h' ? cssW : cssH;

  // Minor ticks
  ctx.beginPath();
  const startSub = Math.floor(-offset / zoom / subInterval) * subInterval;
  for (let v = startSub; v * zoom + offset < length; v += subInterval) {
    const px = Math.round(v * zoom + offset) + 0.5;
    const isMajor = Math.round(v / interval) * interval === Math.round(v);
    const tickLen = isMajor ? rulerSize * 0.55 : rulerSize * 0.3;
    if (axis === 'h') {
      ctx.moveTo(px, rulerSize);
      ctx.lineTo(px, rulerSize - tickLen);
    } else {
      ctx.moveTo(rulerSize, px);
      ctx.lineTo(rulerSize - tickLen, px);
    }
  }
  ctx.stroke();

  // Major tick labels
  const startMaj = Math.floor(-offset / zoom / interval) * interval;
  for (let v = startMaj; v * zoom + offset < length; v += interval) {
    const px = Math.round(v * zoom + offset);
    const label = String(Math.round(v));
    if (axis === 'h') {
      ctx.fillText(label, px + 3, 2);
    } else {
      ctx.save();
      ctx.translate(rulerSize - 3, px);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'left';
      ctx.fillText(label, 2, 0);
      ctx.restore();
    }
  }
}

export const Rulers: React.FC<RulerProps> = ({ zoom, pan }) => {
  const hRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<HTMLCanvasElement>(null);

  const redraw = useCallback(() => {
    if (hRef.current) drawRuler(hRef.current, 'h', zoom, pan);
    if (vRef.current) drawRuler(vRef.current, 'v', zoom, pan);
  }, [zoom, pan]);

  useEffect(() => {
    redraw();
    const ro = new ResizeObserver(redraw);
    if (hRef.current?.parentElement) ro.observe(hRef.current.parentElement);
    if (vRef.current?.parentElement) ro.observe(vRef.current.parentElement);
    return () => ro.disconnect();
  }, [redraw]);

  // Also redraw on DPR change (e.g. moving window between monitors)
  useEffect(() => {
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handler = () => redraw();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [redraw]);

  return (
    <>
      <div className={styles.rulerHorizontal}>
        <canvas ref={hRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div className={styles.rulerVertical}>
        <canvas ref={vRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
    </>
  );
};
