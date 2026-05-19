/**
 * Represents a result from an external asset search (Pexels, Iconify, etc.)
 */
export interface AssetSearchResult {
  id: string;
  /** High-quality source URL */
  url: string;
  /** Small preview/thumbnail URL */
  thumb: string;
  /** Descriptive alt text or name */
  alt: string;
  /** The API or collection this came from */
  source: AssetSource;
  /** Metadata like dimensions, artist name, or specific icons/colors */
  metadata?: {
    width?: number;
    height?: number;
    author?: string;
    license?: string;
    // Icon metadata
    name?: string;
    prefix?: string;
    // Color/Gradient metadata
    colors?: string[];
    value?: string;
    category?: string;
    // Escape hatch for provider-specific fields (photographer, avg_color, etc.)
    [key: string]: unknown;
  };
}

/** Supported external asset providers */
export type AssetSource =
  | 'pexels'
  | 'iconify'
  | 'lucide'
  | 'simpleicons'
  | 'google-fonts'
  | 'upload'
  | 'bundled';

/**
 * Metadata for an asset stored in the client-side IndexedDB cache.
 */
export interface CachedAsset {
  /** Original source URL (used as cache key) */
  url: string;
  /** The binary data */
  blob: Blob;
  /** When this was last requested (for LRU eviction) */
  lastAccessed: number;
  /** Estimated size in bytes */
  size: number;
  /** MIME type */
  contentType: string;
}
