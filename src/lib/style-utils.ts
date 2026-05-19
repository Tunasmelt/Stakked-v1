import { StakkedElementFullStyle, StakkedElementStyleBase } from '@/types/style';

/**
 * Merges the base style with responsive overrides for the current breakpoint.
 *
 * Cascade order mirrors standard CSS media-query specificity:
 *   desktop (base)
 *     → tablet  overrides applied when breakpoint is 'tablet' OR 'mobile'
 *     → mobile  overrides applied (on top of tablet) only when breakpoint is 'mobile'
 *     → custom  overrides applied when breakpoint is 'custom'
 *
 * This means a mobile view inherits any tablet override the author set, unless
 * the author also set an explicit mobile override for that same property.
 *
 * Nested objects (borderRadius, border, effects, typography, transform) are
 * deep-merged so a breakpoint override of a single field (e.g. topLeft radius)
 * does not wipe unrelated sibling fields.
 */

/** Keys whose values are plain objects that should be deep-merged (one level). */
const DEEP_MERGE_KEYS = new Set([
  'borderRadius', 'border', 'effects', 'typography', 'transform',
  'position', 'size', 'layout', 'scrollSection', 'parallax', 'link', 'accessibility',
]);

function applyOverride(
  target: StakkedElementStyleBase,
  override: Partial<StakkedElementStyleBase>,
): void {
  for (const key of Object.keys(override) as (keyof StakkedElementStyleBase)[]) {
    const overrideVal = override[key];
    const targetVal   = target[key];
    if (
      DEEP_MERGE_KEYS.has(key) &&
      overrideVal !== null &&
      typeof overrideVal === 'object' &&
      !Array.isArray(overrideVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      // @ts-expect-error — generic object merge; types are compatible at runtime
      target[key] = { ...targetVal, ...overrideVal };
    } else {
      // @ts-expect-error — safe assignment
      target[key] = overrideVal;
    }
  }
}

export function getEffectiveStyle(
  style: StakkedElementFullStyle,
  breakpoint: 'desktop' | 'tablet' | 'mobile' | 'custom',
  canvasWidth?: number,
): StakkedElementStyleBase {
  // Strip meta keys (responsive, hover, active) to produce a clean CSS-only base.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { responsive, hover: _hover, active: _active, ...base } = style;

  const effective: StakkedElementStyleBase = { ...base } as StakkedElementStyleBase;

  // Tablet overrides — applied for both tablet AND mobile viewports
  if ((breakpoint === 'tablet' || breakpoint === 'mobile') && responsive?.tablet) {
    applyOverride(effective, responsive.tablet);
  }

  // Mobile overrides — applied only for mobile, on top of any tablet overrides
  if (breakpoint === 'mobile' && responsive?.mobile) {
    applyOverride(effective, responsive.mobile);
  }

  // Custom breakpoint — keyed by canvas pixel width
  if (breakpoint === 'custom' && canvasWidth && responsive?.custom) {
    const widthKey = canvasWidth.toString();
    if (responsive.custom[widthKey]) {
      applyOverride(effective, responsive.custom[widthKey]);
    }
  }

  return effective;
}
