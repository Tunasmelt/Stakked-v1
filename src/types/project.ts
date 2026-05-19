import { StakkedElement } from './element';
import { Animation } from './animation';
import type { Node, Edge } from 'reactflow';

/**
 * The top-level project object that represents a complete user creation.
 * This is the primary JSON document stored in Supabase and IndexedDB.
 */
export interface StakkedProject {
  /** Unique project ID */
  id: string;
  /** Owner ID — absent on guest/anonymous projects (guarded with ?? 'anon' at call sites) */
  userId?: string;
  /** Friendly project title */
  title: string;
  /** URL slug for the project */
  slug: string;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
  /** Whether the project is live */
  published: boolean;
  /** Discovery visibility */
  visibility: 'private' | 'public';
  /** Original project ID if this was forked */
  forkedFrom?: string;
  /** Number of times this project has been remixed */
  forkCount: number;
  /** Primary classification (music, art, etc.) */
  category?: string;
  /** SEO and discovery tags */
  tags: string[];
  /** List of pages in the project */
  pages: StakkedPage[];
  /** Global project settings */
  settings: ProjectSettings;
  /** Workflow node graph (Phase 5) */
  workflow?: {
    nodes: Node[];
    edges: Edge[];
  }
}

/**
 * A single page within a project.
 */
export interface StakkedPage {
  /** Unique page ID */
  id: string;
  /** Friendly page title */
  title: string;
  /** URL path segment for this page */
  slug: string;
  /** Sorting order in navigation */
  order: number;
  /** Canvas dimensions and background */
  canvas: CanvasSettings;
  /** Flat list of elements on this page */
  elements: StakkedElement[];
  /** Entry transition for this page */
  transition?: Animation['type'];
}

/**
 * Configuration for the page canvas.
 */
export interface CanvasSettings {
  /** Fixed width in pixels */
  width: number;
  /** Fixed height in pixels or 'auto' to grow with content */
  height: number | 'auto';
  /** Page-level background definition */
  background: Background;
  /** Internal padding for the canvas */
  padding: number;
}

/**
 * Multi-layer or single background type for the whole page.
 */
export type Background =
  | { type: 'color'; value: string }
  | { type: 'gradient'; value: string }
  | { type: 'image'; value: string; fit: 'cover' | 'contain' | 'fill' }
  | { type: 'pattern'; value: string; color: string; opacity: number };

/**
 * Global project configurations.
 */
export interface ProjectSettings {
  /** The active theme ID */
  theme: string;
  /** Project-wide color overrides */
  customColors?: Record<string, string>;
  /** Path to favicon image */
  favicon?: string;
  /** Path to default social sharing image */
  ogImage?: string;
  /** External analytics ID (e.g. GA4 measurement ID) */
  analyticsId?: string;
  /** Custom domain mapped to this project, if any */
  customDomain?: string;
  /** Variables accessible to workflow logic */
  variables?: Record<string, { value: string | number | boolean; type: 'string' | 'number' | 'boolean' }>;
  /** Published-site language (defaults to "en") */
  language?: string;
  /** SEO meta title override */
  metaTitle?: string;
  /** SEO meta description */
  metaDesc?: string;
  /** Robots meta tag value */
  robots?: string;
  /** Custom CSS injected into published site */
  customCss?: string;
  /** Scripts injected into <head> of published site */
  headCode?: string;
  /** Scripts injected before </body> of published site */
  bodyCode?: string;
  /** Plausible Analytics domain */
  plausible?: string;
}
