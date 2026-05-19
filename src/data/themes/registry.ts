import type { Theme } from '@/types/theme';

/**
 * Static import map for theme JSON files.
 *
 * IMPORTANT: Template-string dynamic imports (e.g. `import(`./${id}.json`)`)
 * do not bundle reliably in Next.js 16 / Turbopack. Each theme must be listed
 * explicitly here so the bundler can emit a separate async chunk per theme.
 *
 * Each loader returns a Promise resolving to the module namespace. Consumers
 * should read `.default` (or treat the whole module as the Theme object, as a
 * fallback) — handled in theme-engine.ts.
 */
export const THEME_LOADERS = {
  'neon-cyberpunk': () => import('./neon-cyberpunk.json'),
  'ghost': () => import('./ghost.json'),
  'minimal-light': () => import('./minimal-light.json'),
  'minimal-dark': () => import('./minimal-dark.json'),
  'sunset': () => import('./sunset.json'),
  'luxury-gold': () => import('./luxury-gold.json'),
  'ocean-deep': () => import('./ocean-deep.json'),
  'forest': () => import('./forest.json'),
  'pastel-dream': () => import('./pastel-dream.json'),
  'brutalist': () => import('./brutalist.json'),
  'retro-arcade': () => import('./retro-arcade.json'),
  'monochrome': () => import('./monochrome.json'),
  'vaporwave': () => import('./vaporwave.json'),
  'nordic': () => import('./nordic.json'),
  'terracotta': () => import('./terracotta.json'),
  'electric-blue': () => import('./electric-blue.json'),
  'midnight': () => import('./midnight.json'),
  'rose-gold': () => import('./rose-gold.json'),
  'paper': () => import('./paper.json'),
  'earthtone': () => import('./earthtone.json'),
} as const satisfies Record<string, () => Promise<{ default: Theme } | Theme>>;

export type ThemeId = keyof typeof THEME_LOADERS;

export const THEME_IDS: ThemeId[] = Object.keys(THEME_LOADERS) as ThemeId[];
