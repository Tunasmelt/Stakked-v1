/**
 * Asset Resolver: Three-tier search strategy for external assets.
 *   1. Bundled     — in-app JSON for colors / gradients / fonts / patterns / shapes
 *   2. Cache       — IndexedDB-backed blob cache (db.ts)
 *   3. External    — proxied API routes (Pexels, Iconify)
 *
 * All calls return AssetSearchResult[] so the AssetPanel renders uniformly.
 */
import { AssetSearchResult, AssetSource } from '@/types/assets';
import { getCachedAsset } from '@/lib/db';

import palettesData from '@/data/palettes.json';
import gradientsData from '@/data/gradients.json';
import fontPairingsData from '@/data/font-pairings.json';

export type AssetTab =
  | 'images'
  | 'icons'
  | 'colors'
  | 'gradients'
  | 'fonts'
  | 'patterns'
  | 'shapes'
  | 'gfx';

interface BundledPalette {
  id: string;
  name: string;
  category?: string;
  colors: string[];
}

interface BundledGradient {
  id: string;
  name: string;
  value: string;
  previewColor?: string;
}

interface BundledFontPairing {
  id: string;
  name: string;
  heading: { family: string; weight: number };
  body: { family: string; weight: number };
  preview?: string;
}

/* ------------------------------ Tier 1: Bundled ---------------------------- */

function matches(q: string, ...fields: (string | undefined)[]): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return fields.some(f => f && f.toLowerCase().includes(needle));
}

function searchBundledColors(query: string): AssetSearchResult[] {
  const palettes = palettesData as BundledPalette[];
  return palettes
    .filter(p => matches(query, p.name, p.category, ...(p.colors || [])))
    .map<AssetSearchResult>(p => ({
      id: p.id,
      url: '',
      thumb: '',
      alt: p.name,
      source: 'bundled' as AssetSource,
      metadata: {
        colors: p.colors,
        category: p.category,
      },
    }));
}

function searchBundledGradients(query: string): AssetSearchResult[] {
  const gradients = gradientsData as BundledGradient[];
  return gradients
    .filter(g => matches(query, g.name, g.value))
    .map<AssetSearchResult>(g => ({
      id: g.id,
      url: '',
      thumb: '',
      alt: g.name,
      source: 'bundled' as AssetSource,
      metadata: {
        value: g.value,
      },
    }));
}

function searchBundledFonts(query: string): AssetSearchResult[] {
  const pairings = fontPairingsData as BundledFontPairing[];
  return pairings
    .filter(p => matches(query, p.name, p.heading?.family, p.body?.family))
    .map<AssetSearchResult>(p => ({
      id: p.id,
      url: '',
      thumb: '',
      alt: p.name,
      source: 'google-fonts' as AssetSource,
      metadata: {
        name: p.name,
        value: p.preview,
        // store the pairing under a known key so the panel can read it back
        heading: p.heading,
        body: p.body,
      },
    }));
}

/* ------------------------ Tier 1b: bundled patterns/shapes ------------------ */
// Minimal in-memory libraries so the tabs work without additional JSON.

const PATTERN_LIBRARY = [
  { id: 'dots', name: 'Dots', svg: 'radial-gradient(#00000022 1px, transparent 1px) 0 0/12px 12px' },
  { id: 'grid', name: 'Grid', svg: 'linear-gradient(#00000010 1px, transparent 1px) 0 0/24px 24px, linear-gradient(90deg, #00000010 1px, transparent 1px) 0 0/24px 24px' },
  { id: 'stripes', name: 'Stripes', svg: 'repeating-linear-gradient(45deg, #00000011 0 8px, transparent 8px 16px)' },
  { id: 'waves', name: 'Waves', svg: 'radial-gradient(circle at 10px 10px, #00000015 2px, transparent 3px) 0 0/20px 20px' },
  { id: 'noise', name: 'Noise', svg: 'radial-gradient(#00000022 0.5px, transparent 0.5px) 0 0/4px 4px' },
  { id: 'checker', name: 'Checker', svg: 'conic-gradient(#00000014 25%, transparent 0 50%, #00000014 0 75%, transparent 0) 0 0/24px 24px' },
];

const SHAPE_LIBRARY = [
  { id: 'rect', name: 'Rectangle' },
  { id: 'circle', name: 'Circle' },
  { id: 'triangle', name: 'Triangle' },
  { id: 'star', name: 'Star' },
  { id: 'diamond', name: 'Diamond' },
  { id: 'hexagon', name: 'Hexagon' },
  { id: 'arrow', name: 'Arrow' },
  { id: 'line', name: 'Line' },
];

function searchBundledPatterns(query: string): AssetSearchResult[] {
  return PATTERN_LIBRARY
    .filter(p => matches(query, p.name, p.id))
    .map<AssetSearchResult>(p => ({
      id: `pattern-${p.id}`,
      url: '',
      thumb: '',
      alt: p.name,
      source: 'bundled' as AssetSource,
      metadata: { name: p.id, value: p.svg, category: 'pattern' },
    }));
}

function searchBundledShapes(query: string): AssetSearchResult[] {
  return SHAPE_LIBRARY
    .filter(s => matches(query, s.name, s.id))
    .map<AssetSearchResult>(s => ({
      id: `shape-${s.id}`,
      url: '',
      thumb: '',
      alt: s.name,
      source: 'bundled' as AssetSource,
      metadata: { name: s.id, category: 'shape' },
    }));
}

const GFX_LIBRARY = [
  { id: 'glass-card', name: 'Glass Card', type: 'container', description: 'Frosted glass container with soft border' },
  { id: 'glow-pulse', name: 'Neon Glow', type: 'shape', description: 'Circle with animated outer glow' },
  { id: 'floating-img', name: 'Floating Image', type: 'image', description: 'Image with subtle up/down float' },
  { id: 'glass-btn', name: 'Glass Button', type: 'button', description: 'Translucent button for dark modes' },
  { id: 'spotlight', name: 'Spotlight', type: 'shape', description: 'Large radial gradient light source' },
];

function searchBundledGfx(query: string): AssetSearchResult[] {
  return GFX_LIBRARY
    .filter(g => matches(query, g.name, g.id, g.description))
    .map<AssetSearchResult>(g => ({
      id: `gfx-${g.id}`,
      url: '',
      thumb: '',
      alt: g.name,
      source: 'bundled' as AssetSource,
      metadata: { 
        name: g.id, 
        baseType: g.type,
        category: 'gfx',
        description: g.description
      },
    }));
}


/* -------------------------------- Tier 2: Cache ---------------------------- */

async function hydrateFromCache(
  results: AssetSearchResult[],
): Promise<AssetSearchResult[]> {
  if (typeof window === 'undefined') return results;
  return Promise.all(
    results.map(async r => {
      if (!r.url) return r;
      try {
        const blob = await getCachedAsset(r.url);
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          return { ...r, thumb: objectUrl };
        }
      } catch {
        // ignore cache errors and keep the remote thumb
      }
      return r;
    }),
  );
}

/* ------------------------------- Tier 3: Remote ---------------------------- */

async function fetchImages(query: string, page = 1): Promise<AssetSearchResult[]> {
  if (!query) return [];
  try {
    const res = await fetch(
      `/api/assets/images?query=${encodeURIComponent(query)}&per_page=24&page=${page}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.images || []) as AssetSearchResult[];
  } catch (err) {
    console.warn('[asset-resolver] image fetch failed:', err);
    return [];
  }
}

async function fetchIcons(query: string, page = 1): Promise<AssetSearchResult[]> {
  if (!query) return [];
  try {
    const res = await fetch(
      `/api/assets/icons?query=${encodeURIComponent(query)}&page=${page}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.icons || []) as AssetSearchResult[];
  } catch (err) {
    console.warn('[asset-resolver] icon fetch failed:', err);
    return [];
  }
}

/* ------------------------------- Public API -------------------------------- */

export async function searchAssets(
  tab: AssetTab,
  query: string,
  page = 1,
): Promise<AssetSearchResult[]> {
  switch (tab) {
    case 'colors':
      return searchBundledColors(query);
    case 'gradients':
      return searchBundledGradients(query);
    case 'fonts':
      return searchBundledFonts(query);
    case 'patterns':
      return searchBundledPatterns(query);
    case 'shapes':
      return searchBundledShapes(query);
    case 'gfx':
      return searchBundledGfx(query);
    case 'images': {
      const fresh = await fetchImages(query, page);
      return hydrateFromCache(fresh);
    }
    case 'icons': {
      const fresh = await fetchIcons(query, page);
      return hydrateFromCache(fresh);
    }
    default:
      return [];
  }
}
