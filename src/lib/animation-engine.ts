/**
 * Animation Engine: 15 canonical presets + CSS + Framer Motion converters.
 *
 * Every preset is defined declaratively so the UI, the preview, and the
 * exported HTML all agree on the shape of each animation.
 */
import { Animation } from '@/types/animation';
import type { MotionProps } from 'framer-motion';
import type { Target, Transition, TargetAndTransition } from 'motion-dom';

export type AnimationPresetId = Animation['type'];

export interface AnimationPreset {
  id: AnimationPresetId;
  label: string;
  /** CSS @keyframes body (without the outer rule) */
  keyframes: string;
  /** Framer Motion initial state */
  initial: Target;
  /** Framer Motion animate state */
  animate: TargetAndTransition;
  /** Whether this preset honors `direction` */
  directional: boolean;
}

const DIRECTION_OFFSET = 40;

function directionalOffset(direction?: Animation['direction']): { x: number; y: number } {
  switch (direction) {
    case 'up': return { x: 0, y: DIRECTION_OFFSET };
    case 'down': return { x: 0, y: -DIRECTION_OFFSET };
    case 'left': return { x: DIRECTION_OFFSET, y: 0 };
    case 'right': return { x: -DIRECTION_OFFSET, y: 0 };
    default: return { x: 0, y: DIRECTION_OFFSET };
  }
}

/* ------------------------------ 15 presets --------------------------------- */

export const PRESETS: Record<AnimationPresetId, AnimationPreset> = {
  fadeIn: {
    id: 'fadeIn', label: 'Fade In', directional: false,
    keyframes: 'from { opacity: 0; } to { opacity: 1; }',
    initial: { opacity: 0 }, animate: { opacity: 1 },
  },
  fadeOut: {
    id: 'fadeOut', label: 'Fade Out', directional: false,
    keyframes: 'from { opacity: 1; } to { opacity: 0; }',
    initial: { opacity: 1 }, animate: { opacity: 0 },
  },
  slideIn: {
    id: 'slideIn', label: 'Slide In', directional: true,
    keyframes: 'from { opacity: 0; transform: translate(var(--slide-x, 0), var(--slide-y, 40px)); } to { opacity: 1; transform: translate(0, 0); }',
    initial: { opacity: 0, x: 0, y: DIRECTION_OFFSET },
    animate: { opacity: 1, x: 0, y: 0 },
  },
  slideOut: {
    id: 'slideOut', label: 'Slide Out', directional: true,
    keyframes: 'from { opacity: 1; transform: translate(0, 0); } to { opacity: 0; transform: translate(var(--slide-x, 0), var(--slide-y, 40px)); }',
    initial: { opacity: 1, x: 0, y: 0 },
    animate: { opacity: 0, x: 0, y: DIRECTION_OFFSET },
  },
  scaleIn: {
    id: 'scaleIn', label: 'Scale In', directional: false,
    keyframes: 'from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); }',
    initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1 },
  },
  scaleOut: {
    id: 'scaleOut', label: 'Scale Out', directional: false,
    keyframes: 'from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.6); }',
    initial: { opacity: 1, scale: 1 }, animate: { opacity: 0, scale: 0.6 },
  },
  rotateIn: {
    id: 'rotateIn', label: 'Rotate In', directional: false,
    keyframes: 'from { opacity: 0; transform: rotate(-180deg); } to { opacity: 1; transform: rotate(0); }',
    initial: { opacity: 0, rotate: -180 }, animate: { opacity: 1, rotate: 0 },
  },
  bounceIn: {
    id: 'bounceIn', label: 'Bounce In', directional: false,
    keyframes: '0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.1); } 100% { transform: scale(1); }',
    initial: { opacity: 0, scale: 0.3 }, animate: { opacity: 1, scale: 1 },
  },
  flipIn: {
    id: 'flipIn', label: 'Flip In', directional: false,
    keyframes: 'from { opacity: 0; transform: perspective(400px) rotateY(90deg); } to { opacity: 1; transform: perspective(400px) rotateY(0); }',
    initial: { opacity: 0, rotateY: 90 }, animate: { opacity: 1, rotateY: 0 },
  },
  pulse: {
    id: 'pulse', label: 'Pulse', directional: false,
    keyframes: '0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); }',
    initial: { scale: 1 }, animate: { scale: [1, 1.05, 1] },
  },
  shake: {
    id: 'shake', label: 'Shake', directional: false,
    keyframes: '0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); }',
    initial: { x: 0 }, animate: { x: [0, -6, 6, -6, 6, 0] },
  },
  glow: {
    id: 'glow', label: 'Glow', directional: false,
    keyframes: '0%, 100% { box-shadow: 0 0 8px rgba(168,85,247,0.4); } 50% { box-shadow: 0 0 24px rgba(168,85,247,0.9); }',
    initial: { boxShadow: '0 0 8px rgba(168,85,247,0.4)' },
    animate: { boxShadow: ['0 0 8px rgba(168,85,247,0.4)', '0 0 24px rgba(168,85,247,0.9)', '0 0 8px rgba(168,85,247,0.4)'] },
  },
  typewriter: {
    id: 'typewriter', label: 'Typewriter', directional: false,
    keyframes: 'from { width: 0; } to { width: 100%; }',
    initial: { width: 0 }, animate: { width: '100%' },
  },
  blur: {
    id: 'blur', label: 'Blur In', directional: false,
    keyframes: 'from { opacity: 0; filter: blur(18px); } to { opacity: 1; filter: blur(0); }',
    initial: { opacity: 0, filter: 'blur(18px)' },
    animate: { opacity: 1, filter: 'blur(0)' },
  },
  reveal: {
    id: 'reveal', label: 'Reveal', directional: true,
    keyframes: 'from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); }',
    initial: { clipPath: 'inset(0 0 100% 0)' },
    animate: { clipPath: 'inset(0 0 0 0)' },
  },
  parachute: {
    id: 'parachute', label: 'Parachute', directional: false,
    keyframes: 'from { opacity: 0; transform: translateY(-100px) scale(1.2); } to { opacity: 1; transform: translateY(0) scale(1); }',
    initial: { opacity: 0, y: -100, scale: 1.2 },
    animate: { opacity: 1, y: 0, scale: 1 },
  },
  perspectiveFlip: {
    id: 'perspectiveFlip', label: '3D Perspective Flip', directional: false,
    keyframes: 'from { opacity: 0; transform: perspective(1000px) rotateX(-90deg); } to { opacity: 1; transform: perspective(1000px) rotateX(0); }',
    initial: { opacity: 0, rotateX: -90 },
    animate: { opacity: 1, rotateX: 0 },
  },
  tilt: {
    id: 'tilt', label: 'Tilt', directional: false,
    keyframes: '0% { transform: rotate(0); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } 100% { transform: rotate(0); }',
    initial: { rotate: 0 },
    animate: { rotate: [0, 5, -5, 0] },
  },
  custom: {
    id: 'custom', label: 'Custom Keyframes', directional: false,
    keyframes: 'from { opacity: 1; } to { opacity: 1; }',
    initial: {}, animate: {},
  },
};

export const PRESET_LIST: AnimationPreset[] = Object.values(PRESETS);

/* --------------------------------- helpers --------------------------------- */

function easingFor(e: Animation['easing']): string {
  switch (e) {
    case 'spring': return 'cubic-bezier(0.2, 1.2, 0.3, 1)';
    case 'bounce': return 'cubic-bezier(0.36, 0, 0.66, -0.56)';
    default: return e;
  }
}

/**
 * Build a CSS string that defines a unique @keyframes rule + an `animation`
 * shorthand for the given animation config. Use the returned `className` on
 * the element once the style tag is mounted in the DOM.
 */
export function getAnimationCSS(animation: Animation): { css: string; className: string } {
  const className = `anim-${animation.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const preset = PRESETS[animation.type];

  let keyframes = preset.keyframes;
  if (animation.type === 'custom' && animation.keyframes?.length) {
    keyframes = animation.keyframes
      .map((k) => {
        const pct = Math.round(Math.max(0, Math.min(1, k.offset)) * 100);
        const props = Object.entries(k.style)
          .map(([p, v]) => `${p}: ${v};`)
          .join(' ');
        return `${pct}% { ${props} }`;
      })
      .join(' ');
  }

  if (animation.type === 'slideIn' || animation.type === 'slideOut') {
    const { x, y } = directionalOffset(animation.direction);
    keyframes = keyframes
      .replace('var(--slide-x, 0)', `${x}px`)
      .replace('var(--slide-y, 40px)', `${y}px`);
  }
  if (animation.type === 'reveal') {
    // Reveal can be from any side: left (clip right), right (clip left), top (clip bottom), bottom (clip top)
    if (animation.direction === 'up' || !animation.direction) keyframes = 'from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); }';
    if (animation.direction === 'down') keyframes = 'from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); }';
    if (animation.direction === 'left') keyframes = 'from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); }';
    if (animation.direction === 'right') keyframes = 'from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); }';
  }

  // repeat: 0 = infinite; 1 = play once (no repeat); N>1 = play N times
  const repeat = animation.repeat === 0 ? 'infinite' : Math.max(1, animation.repeat);
  const css = `
@keyframes ${className} { ${keyframes} }
.${className} {
  animation-name: ${className};
  animation-duration: ${animation.duration}ms;
  animation-delay: ${animation.delay}ms;
  animation-timing-function: ${easingFor(animation.easing)};
  animation-iteration-count: ${repeat};
  animation-fill-mode: both;
}
  `.trim();

  return { css, className };
}

/**
 * Build Framer Motion props for the given animation config.
 * Pass `isTriggered` if the animation should start now (e.g. whileInView fired).
 */
export function getMotionProps(animation: Animation, isTriggered = true): MotionProps {
  const preset = PRESETS[animation.type];
  
  // Map CSS easing strings to Framer Motion easing types
  let ease: Transition['ease'] = 'easeInOut';
  switch (animation.easing) {
    case 'linear':
      ease = 'linear';
      break;
    case 'ease':
      ease = 'easeInOut';
      break;
    case 'ease-in':
      ease = 'easeIn';
      break;
    case 'ease-out':
      ease = 'easeOut';
      break;
    case 'ease-in-out':
      ease = 'easeInOut';
      break;
    case 'spring':
      ease = 'easeInOut';
      break;
    case 'bounce':
      ease = 'easeInOut';
      break;
  }
  
  const transition: Transition = {
    duration: animation.duration / 1000,
    delay: animation.delay / 1000,
    ease,
    repeat: animation.repeat === 0 ? Infinity : Math.max(0, animation.repeat - 1),
  };

  let initial = preset.initial;
  let animate = preset.animate;

  if (animation.type === 'slideIn' || animation.type === 'slideOut') {
    const { x, y } = directionalOffset(animation.direction);
    if (animation.type === 'slideIn') {
      initial = { opacity: 0, x, y };
      animate = { opacity: 1, x: 0, y: 0 };
    } else {
      initial = { opacity: 1, x: 0, y: 0 };
      animate = { opacity: 0, x, y };
    }
  }

  return {
    initial,
    animate: isTriggered ? animate : initial,
    transition,
  };
}

/**
 * Returns Framer Motion props appropriate for the animation's trigger type.
 *
 * - onLoad   → { initial, animate }  (fires immediately on mount)
 * - whileInView / onScroll → { initial, whileInView, viewport }
 * - onHover  → { whileHover }        (no initial/animate — element stays visible)
 * - onClick  → { initial, animate }  (caller must toggle `isTriggered` via state)
 */
export function getMotionTriggerProps(
  animation: Animation,
  isTriggered = false,
): MotionProps {
  const base = getMotionProps(animation, true);
  const { initial, animate, transition } = base;

  switch (animation.trigger) {
    case 'onLoad':
      return { initial, animate, transition };

    case 'whileInView':
    case 'onScroll':
      return {
        initial,
        whileInView: animate as MotionProps['whileInView'],
        viewport: { once: animation.repeat === 1, amount: 0.2 },
        transition,
      };

    case 'onHover':
      return {
        whileHover: animate as MotionProps['whileHover'],
        transition,
      };

    case 'onClick':
      // isTriggered is toggled by CanvasElement on click
      return { initial, animate: isTriggered ? animate : initial, transition };

    default:
      return { initial, animate, transition };
  }
}

/**
 * Inject / replace a <style> tag containing animation keyframes for the given
 * animation in `document.head`. Returns the className consumers should apply.
 */
export function injectAnimationStyle(animation: Animation): string {
  if (typeof document === 'undefined') return '';
  const { css, className } = getAnimationCSS(animation);
  const existing = document.getElementById(`style-${className}`);
  if (existing) {
    existing.textContent = css;
    return className;
  }
  const tag = document.createElement('style');
  tag.id = `style-${className}`;
  tag.textContent = css;
  document.head.appendChild(tag);
  return className;
}

/**
 * Returns a CSS block that emits ALL animation keyframes for a project. Used
 * by the HTML exporter so published pages mirror the editor preview.
 */
export function compileAllAnimationsToCss(animations: Animation[]): string {
  return animations.map((a) => getAnimationCSS(a).css).join('\n\n');
}

/**
 * Construct a fresh `Animation` object populated with sensible defaults for
 * the given preset id. Consumers (toolbar "auto-animate", property panel
 * "+ Add animation", AI stubs) all route through this so animation shape
 * stays consistent across call sites.
 */
export function defaultAnimation(type: AnimationPresetId = 'fadeIn'): Animation {
  const preset = PRESETS[type] ?? PRESETS.fadeIn;
  const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `anim-${Math.random().toString(36).slice(2, 10)}`;
  return {
    id,
    trigger: 'whileInView',
    type,
    direction: preset.directional ? 'up' : undefined,
    duration: 600,
    delay: 0,
    easing: 'ease-out',
    repeat: 1,
    stagger: 0,
  };
}

