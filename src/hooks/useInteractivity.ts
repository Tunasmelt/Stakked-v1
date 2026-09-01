/* src/hooks/useInteractivity.ts */
'use client';

import { useEffect, useMemo, useCallback, useRef } from 'react';
import { StakkedElement, ElementBehavior } from '@/types/element';
import { useProjectStore } from '@/stores/project-store';
import { useGlobalState } from '@/stores/state-store';

/**
 * useInteractivity
 * ----------------
 * Resolves and executes element behaviors.
 *
 * @param element  The element whose behaviors to process.
 * @param isPublic True when rendering in the public viewer or preview. When
 *                 false (editor canvas) we do NOT fire real navigations so the
 *                 editor doesn't jump away on accidental clicks.
 */
export function useInteractivity(element: StakkedElement | undefined, isPublic = false) {
  const resolveAndNavigate = useCallback((initialTargetId: string) => {
    const project = useProjectStore.getState().project;
    if (!project) return;

    const current = initialTargetId;
    const limit = 10;
    let itr = 0;

    while (itr++ < limit) {
      if (current.startsWith('page-')) {
        const pageId = current.replace('page-', '');
        const index = project.pages.findIndex(p => p.id === pageId);
        if (index !== -1) useProjectStore.getState().setActivePageIndex(index);
        return;
      }
      // Bare page ID
      const index = project.pages.findIndex(p => p.id === current);
      if (index !== -1) useProjectStore.getState().setActivePageIndex(index);
      return;
    }
  }, []);

  const executeAction = useCallback((behavior: ElementBehavior) => {
    if (!element) return;

    switch (behavior.action) {
      case 'navigate': {
        const { targetId, pageId, url } = behavior.params;
        if (typeof targetId === 'string') {
          resolveAndNavigate(targetId);
        } else if (typeof pageId === 'string') {
          resolveAndNavigate(`page-${pageId}`);
        } else if (typeof url === 'string') {
          if (!isPublic) {
            // In the editor, log instead of navigating away
            if (process.env.NODE_ENV === 'development') console.log('[interactivity] navigate suppressed in editor:', url);
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }
        break;
      }

      case 'showHide': {
        const targetId = behavior.targetId;
        if (targetId) {
          // Route through the store so the toggle survives re-renders.
          // toggleElementVisibility reads activePageIndex from the store snapshot.
          const { activePageIndex, toggleElementVisibility } = useProjectStore.getState();
          toggleElementVisibility(activePageIndex, targetId);
        }
        break;
      }

      case 'playPause': {
        const el = document.getElementById(`el-${element.id}`);
        const media = el?.querySelector<HTMLVideoElement | HTMLAudioElement>('video, audio');
        if (media) {
          if (media.paused) media.play().catch(() => null);
          else media.pause();
        }
        break;
      }

      case 'setGlobalState': {
        const { key, value } = behavior.params;
        if (typeof key === 'string') {
          useGlobalState.getState().setValue(key, value as string | number | boolean);
        }
        break;
      }

      case 'animate': {
        // Animation system removed — this action is a no-op
        break;
      }

      case 'emitEvent': {
        const { eventName, detail } = behavior.params;
        if (typeof eventName === 'string') {
          const domEl = document.getElementById(`el-${element.id}`);
          let parsedDetail: unknown;
          if (typeof detail === 'string') {
            try { parsedDetail = JSON.parse(detail); } catch { parsedDetail = detail; }
          }
          domEl?.dispatchEvent(
            new CustomEvent(eventName, { bubbles: true, composed: true, detail: parsedDetail })
          );
        }
        break;
      }

      default:
        console.warn('[interactivity] unknown action:', behavior.action);
    }
  }, [isPublic, resolveAndNavigate, element]);

  // ── React event handlers (onClick, onMouseEnter, onMouseLeave) ──────────
  const reactHandlers = useMemo(() => {
    const handlers: Record<string, () => void> = {};
    if (!element) return handlers;

    // Collect ALL behaviors per trigger so multiple same-trigger behaviors all
    // fire.  The previous pattern used `=` inside the loop which silently
    // overwrote earlier behaviors when more than one shared the same trigger.
    const groups: Record<string, ElementBehavior[]> = {};
    for (const behavior of element.behaviors ?? []) {
      if (
        behavior.trigger === 'onClick' ||
        behavior.trigger === 'onMouseEnter' ||
        behavior.trigger === 'onMouseLeave'
      ) {
        (groups[behavior.trigger] ??= []).push(behavior);
      }
    }

    for (const [trigger, list] of Object.entries(groups)) {
      handlers[trigger] = () => list.forEach((b) => executeAction(b));
    }

    return handlers;
  }, [element, executeAction]);

  // ── onScrollIntoView — IntersectionObserver ──────────────────────────────
  const scrollBehaviors = useMemo(
    () => (element?.behaviors ?? []).filter(b => b.trigger === 'onScrollIntoView'),
    [element]
  );
  useEffect(() => {
    if (!element || scrollBehaviors.length === 0) return;
    const domEl = document.getElementById(`el-${element.id}`);
    if (!domEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            scrollBehaviors.forEach(b => executeAction(b));
          }
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(domEl);
    return () => observer.disconnect();
  }, [element, scrollBehaviors, executeAction]);

  // ── onInterval — setInterval ─────────────────────────────────────────────
  const intervalBehaviors = useMemo(
    () => (element?.behaviors ?? []).filter(b => b.trigger === 'onInterval'),
    [element]
  );
  const intervalRef = useRef<ReturnType<typeof setInterval>[]>([]);
  useEffect(() => {
    if (!element || intervalBehaviors.length === 0) return;

    const ids = intervalBehaviors.map(b => {
      const ms = typeof b.params.interval === 'number' ? b.params.interval : 1000;
      return setInterval(() => executeAction(b), Math.max(100, ms));
    });
    intervalRef.current = ids;
    return () => ids.forEach(clearInterval);
  }, [element, intervalBehaviors, executeAction]);

  return reactHandlers;
}
