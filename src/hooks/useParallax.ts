/* src/hooks/useParallax.ts */
'use client';

import { useMemo } from 'react';
import { useScroll, useTransform, useSpring } from 'framer-motion';
import { StakkedElement } from '@/types/element';

/**
 * useParallax
 * -----------
 * Calculated motion offset based on scroll position.
 * Speed: 0 = static, 1 = move with scroll, > 1 = faster, < 0 = reverse.
 *
 * @param element  - The element to derive parallax settings from.
 * @param isEditor - Pass `true` inside the editor so the hook returns `{}`
 *                   without trying to read window.scrollY (which is always 0
 *                   in the custom-pan/zoom viewport and would produce wrong
 *                   results or break Framer Motion's layout tracking).
 */
export function useParallax(element: StakkedElement | undefined, isEditor = false) {
  const { scrollY } = useScroll();

  // Guard against bad speed values (NaN / Infinity) that break useTransform.
  const rawSpeed = element?.style?.parallax?.speed ?? 0;
  const speed = isFinite(rawSpeed) ? rawSpeed : 0;
  const direction = element?.style?.parallax?.direction ?? 'vertical';

  // Hooks must always be called — we gate the *return value* not the hooks.
  const rawY = useTransform(scrollY, [0, 4000], [0, 4000 * speed]);
  const y = useSpring(rawY, { stiffness: 400, damping: 90 });

  const rawX = useTransform(scrollY, [0, 4000], [0, 4000 * speed]);
  const x = useSpring(rawX, { stiffness: 400, damping: 90 });

  return useMemo(() => {
    // In the editor the canvas uses its own pan/zoom viewport; window.scrollY
    // is always 0 so parallax would never fire. Return empty to avoid
    // attaching stale motion values that conflict with Moveable transforms.
    if (isEditor || !element || speed === 0) return {};
    return direction === 'vertical' ? { y } : { x };
  }, [isEditor, speed, direction, x, y, element]);
}