/* src/components/system/TutorialOverlay.tsx */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Lightbulb, BookOpen } from 'lucide-react';
import { useTutorialStore, TOURS } from '@/stores/tutorial-store';
import styles from '@/styles/TutorialOverlay.module.css';

/* ─── Spotlight geometry ───────────────────────────────────────────────────*/

interface Rect { top: number; left: number; width: number; height: number }

function getTargetRect(selector: string | null): Rect | null {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

const PAD = 12; // padding around spotlight

/* ─── Tooltip placement ────────────────────────────────────────────────────*/

function computeTooltipStyle(
  rect: Rect | null,
  placement: string,
  tooltipW = 340,
  tooltipH = 220,
): React.CSSProperties {
  if (!rect || placement === 'center') {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const slot = { ...rect };
  const gap = 16;

  switch (placement) {
    case 'bottom': {
      let left = slot.left + slot.width / 2 - tooltipW / 2;
      left = Math.max(12, Math.min(vw - tooltipW - 12, left));
      return { position: 'fixed', top: slot.top + slot.height + gap, left };
    }
    case 'top': {
      let left = slot.left + slot.width / 2 - tooltipW / 2;
      left = Math.max(12, Math.min(vw - tooltipW - 12, left));
      return { position: 'fixed', top: slot.top - tooltipH - gap, left };
    }
    case 'right': {
      let top = slot.top + slot.height / 2 - tooltipH / 2;
      top = Math.max(12, Math.min(vh - tooltipH - 12, top));
      return { position: 'fixed', top, left: slot.left + slot.width + gap };
    }
    case 'left': {
      let top = slot.top + slot.height / 2 - tooltipH / 2;
      top = Math.max(12, Math.min(vh - tooltipH - 12, top));
      return { position: 'fixed', top, left: slot.left - tooltipW - gap };
    }
    default:
      return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
  }
}

/* ─── Overlay ──────────────────────────────────────────────────────────────*/

export function TutorialOverlay() {
  const { isOpen, tourId, stepIndex, nextStep, prevStep, closeTour } = useTutorialStore();
  const [rect, setRect] = useState<Rect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps = tourId ? TOURS[tourId] : [];
  const step = steps[stepIndex] ?? null;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  /* Recompute spotlight rect whenever step changes */
  useEffect(() => {
    const updateRect = () => {
      if (!step) { setRect(null); return; }
      setRect(getTargetRect(step.target));
    };
    updateRect();
    const obs = new ResizeObserver(updateRect);
    if (step?.target) {
      const el = document.querySelector(step.target);
      if (el) obs.observe(el);
    }
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [step]);

  /* Scroll element into view on step change */
  useEffect(() => {
    if (!step?.target) return;
    const el = document.querySelector(step.target);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [step]);

  /* Keyboard navigation */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTour();
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, nextStep, prevStep, closeTour]);

  if (!isOpen || !step) return null;

  const spotRect = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  const tooltipStyle = computeTooltipStyle(
    spotRect ? { ...spotRect, top: rect!.top, left: rect!.left } : null,
    step.placement ?? 'center',
  );

  return (
    <div className={styles.root} aria-modal aria-label="Feature tour" role="dialog">
      {/* ── SVG spotlight mask ── */}
      <svg
        className={styles.mask}
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}
      >
        <defs>
          <mask id="tutorial-mask">
            <rect x={0} y={0} width="100%" height="100%" fill="white" />
            {spotRect && (
              <rect
                x={spotRect.left}
                y={spotRect.top}
                width={spotRect.width}
                height={spotRect.height}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Semi-transparent overlay with hole cut out */}
        <rect
          x={0} y={0} width="100%" height="100%"
          fill="rgba(0,0,0,0.72)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Spotlight border ring */}
      {spotRect && (
        <div
          className={styles.ring}
          style={{
            position: 'fixed',
            top: spotRect.top,
            left: spotRect.left,
            width: spotRect.width,
            height: spotRect.height,
          }}
        />
      )}

      {/* ── Tooltip card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          ref={tooltipRef}
          className={styles.card}
          style={tooltipStyle}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <BookOpen size={12} color="var(--accent, #d6ff3d)" />
              <span className={styles.tourLabel}>
                {tourId === 'workspace' ? 'Workspace Tour' : 'Editor Tour'}
              </span>
            </div>
            <button className={styles.closeBtn} onClick={closeTour} aria-label="Close tutorial">
              <X size={13} />
            </button>
          </div>

          {/* Body */}
          <div className={styles.cardBody}>
            <h2 className={styles.stepTitle}>{step.title}</h2>
            <p className={styles.stepBody}>{step.body}</p>

            {step.tip && (
              <div className={styles.tipBlock}>
                <Lightbulb size={10} color="var(--accent, #d6ff3d)" />
                <span>{step.tip}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.cardFooter}>
            {/* Step dots */}
            <div className={styles.dots}>
              {steps.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === stepIndex ? styles.dotActive : ''}`}
                  onClick={() => useTutorialStore.getState().goToStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Nav buttons */}
            <div className={styles.navBtns}>
              {!isFirst && (
                <button className={styles.prevBtn} onClick={prevStep}>
                  <ChevronLeft size={13} /> Back
                </button>
              )}
              <button className={styles.nextBtn} onClick={nextStep}>
                {isLast ? 'Finish' : 'Next'}
                {!isLast && <ChevronRight size={13} />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Step counter badge */}
      <div className={styles.counter}>
        {stepIndex + 1} / {steps.length}
      </div>
    </div>
  );
}
