import { Theme, ThemeTokens } from '@/types/theme';
import { THEME_LOADERS, ThemeId } from '@/data/themes/registry';

/**
 * Cache for loaded themes to avoid redundant disk/network reads.
 */
const themeCache = new Map<string, Theme>();

/**
 * Helper to fetch a theme JSON asynchronously.
 *
 * Uses a static import map (see registry.ts) so Turbopack can bundle each
 * theme as its own async chunk. Template-string dynamic imports like
 * `import(\`@/data/themes/${id}.json\`)` do not bundle reliably on Next 16.
 */
async function fetchTheme(themeId: string): Promise<Theme> {
  if (themeCache.has(themeId)) {
    return themeCache.get(themeId)!;
  }

  const loader = THEME_LOADERS[themeId as ThemeId];
  if (!loader) {
    throw new Error(`Unknown theme id: ${themeId}`);
  }

  try {
    const themeModule = await loader();
    const theme = (themeModule as { default?: Theme }).default ?? (themeModule as Theme);
    themeCache.set(themeId, theme);
    return theme;
  } catch (err) {
    console.error(`Failed to load theme: ${themeId}`, err);
    throw err;
  }
}

/**
 * Injects CSS Custom Properties onto the given target (default :root)
 * based on the provided token set.
 */
function applyTokensToRoot(tokens: ThemeTokens, isDark: boolean = false) {
  if (typeof document === 'undefined') return; // SSR guard
  const root = document.documentElement;

  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-color-${key}`, value);
  });

  // Fonts
  root.style.setProperty('--theme-font-heading', tokens.fonts.heading.family);
  root.style.setProperty('--theme-font-body', tokens.fonts.body.family);
  root.style.setProperty('--theme-font-mono', tokens.fonts.mono.family);

  // Spacing (append px)
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--theme-spacing-${key}`, `${value}px`);
  });

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--theme-shadow-${key}`, value);
  });

  // Radius (append px)
  Object.entries(tokens.radius).forEach(([key, value]) => {
    root.style.setProperty(`--theme-radius-${key}`, `${value}px`);
  });

  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

/**
 * Loads a theme by ID and applies its light or dark tokens to the CSS Variables.
 */
export async function loadTheme(themeId: string, mode: 'light' | 'dark' = 'light'): Promise<void> {
  const theme = await fetchTheme(themeId);
  const tokens = mode === 'dark' ? theme.tokens.dark : theme.tokens.light;
  applyTokensToRoot(tokens, mode === 'dark');
}

/**
 * Returns the raw token object for a specific mode from a theme.
 */
export async function getThemeTokens(themeId: string, mode: 'light' | 'dark' = 'light'): Promise<ThemeTokens> {
  const theme = await fetchTheme(themeId);
  return mode === 'dark' ? theme.tokens.dark : theme.tokens.light;
}

/**
 * Swaps between light and dark token sets for the currently active theme.
 */
export async function toggleDarkMode(themeId: string): Promise<void> {
  if (typeof document === 'undefined') return;
  const currentMode = document.documentElement.getAttribute('data-theme');
  const newMode = currentMode === 'dark' ? 'light' : 'dark';
  await loadTheme(themeId, newMode);
}

/**
 * Creates a custom theme by merging overrides over a base theme.
 */
export async function createCustomTheme(
  baseId: string,
  overrides: Partial<ThemeTokens>,
  mode: 'light' | 'dark' = 'light'
): Promise<ThemeTokens> {
  const baseTokens = await getThemeTokens(baseId, mode);

  const merged: ThemeTokens = {
    ...baseTokens,
    ...overrides,
    colors: { ...baseTokens.colors, ...overrides.colors },
    fonts: { ...baseTokens.fonts, ...overrides.fonts },
    spacing: { ...baseTokens.spacing, ...overrides.spacing },
    shadows: { ...baseTokens.shadows, ...overrides.shadows },
    radius: { ...baseTokens.radius, ...overrides.radius },
  };

  return merged;
}

/**
 * Uses node-vibrant to extract dominant colors from an image URL.
 *
 * IMPORTANT: node-vibrant@4 throws when imported from its root ("no default
 * export"). We must import the subpath build explicitly. We also defer the
 * import so the heavy ~700kb bundle only loads when this function is called.
 */
export async function extractPaletteFromImage(imageUrl: string): Promise<string[]> {
  try {
    const { Vibrant } = await import('node-vibrant/browser');
    const palette = await Vibrant.from(imageUrl).getPalette();
    const colors: string[] = [];

    if (palette.Vibrant) colors.push(palette.Vibrant.hex);
    if (palette.DarkVibrant) colors.push(palette.DarkVibrant.hex);
    if (palette.LightVibrant) colors.push(palette.LightVibrant.hex);
    if (palette.Muted) colors.push(palette.Muted.hex);
    if (palette.DarkMuted) colors.push(palette.DarkMuted.hex);

    return colors;
  } catch (err) {
    console.error('Failed to extract palette', err);
    return [];
  }
}
