import { openDB, IDBPDatabase } from 'idb';
import { StakkedProject } from '@/types/project';
import { CachedAsset } from '@/types/assets';
import { useEffect, useRef } from 'react';
import { useProjectStore } from '@/stores/project-store';

const DB_NAME = 'stakked-db';
const DB_VERSION = 1;
const ASSET_CAP_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Initialize the client-side IndexedDB for projects and asset caching.
 */
export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Storage for full project JSONs
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      
      // Storage for cached assets (images, fonts, icon blobs)
      if (!db.objectStoreNames.contains('asset-cache')) {
        const assetStore = db.createObjectStore('asset-cache', { keyPath: 'url' });
        assetStore.createIndex('lastAccessed', 'lastAccessed');
      }
    },
  });
}

/**
 * Save a project snapshot to local storage.
 */
export async function saveProject(project: StakkedProject): Promise<void> {
  try {
    const db = await initDB();
    await db.put('projects', project);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      await evictLRUAssets(ASSET_CAP_BYTES / 2); // Evict 50% of assets
      const db = await initDB();
      await db.put('projects', project); // Retry
    } else {
      console.error('Failed to save project to IndexedDB:', error);
      throw error;
    }
  }
}

/**
 * Load a project from local storage.
 */
export async function loadProject(projectId: string): Promise<StakkedProject | undefined> {
  try {
    const db = await initDB();
    return await db.get('projects', projectId);
  } catch (error) {
    console.error(`Failed to load project ${projectId} from IndexedDB:`, error);
    return undefined;
  }
}

/**
 * List all locally saved projects.
 */
export async function listProjects(): Promise<StakkedProject[]> {
  try {
    const db = await initDB();
    return await db.getAll('projects');
  } catch (error) {
    console.error('Failed to list projects from IndexedDB:', error);
    return [];
  }
}

/**
 * Delete a project from local storage.
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const db = await initDB();
    await db.delete('projects', projectId);
  } catch (error) {
    console.error(`Failed to delete project ${projectId} from IndexedDB:`, error);
  }
}

/**
 * Cache an asset blob to prevent redundant network requests.
 * Updates lastAccessed for LRU logic.
 */
export async function cacheAsset(url: string, blob: Blob): Promise<void> {
  try {
    const db = await initDB();
    const asset: CachedAsset = {
      url,
      blob,
      lastAccessed: Date.now(),
      size: blob.size,
      contentType: blob.type
    };
    
    await db.put('asset-cache', asset);
    
    // Check if we need to evict
    const estimate = await getStorageEstimate();
    if (estimate.usage !== undefined && estimate.usage > ASSET_CAP_BYTES) {
      await evictLRUAssets(ASSET_CAP_BYTES * 0.2); // Clean 20%
    }
  } catch (error) {
    console.warn('Asset caching failed:', error);
  }
}

/**
 * Retrieve a cached asset.
 */
export async function getCachedAsset(url: string): Promise<Blob | undefined> {
  try {
    const db = await initDB();
    const asset = await db.get('asset-cache', url);
    if (asset) {
      // Update access time for LRU
      asset.lastAccessed = Date.now();
      await db.put('asset-cache', asset);
      return asset.blob;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Delete the oldest assets until we reach the target reduction.
 */
export async function evictLRUAssets(reductionBytes: number): Promise<void> {
  try {
    const db = await initDB();
    let cursor = await db.transaction('asset-cache', 'readwrite')
      .store.index('lastAccessed').openCursor();
      
    let deletedBytes = 0;
    while (cursor && deletedBytes < reductionBytes) {
      deletedBytes += cursor.value.size;
      await cursor.delete();
      cursor = await cursor.continue();
    }
  } catch (error) {
    console.error('LRU Eviction failed:', error);
  }
}

/**
 * Get current browser storage statistics.
 */
export async function getStorageEstimate() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    return await navigator.storage.estimate();
  }
  return { usage: 0, quota: 0 };
}

/**
 * Hook to automatically synchronize the Zustand project state with IndexedDB.
 * Debounced at 1000ms.
 */
export function useAutoSave() {
  const project = useProjectStore(state => state.project);
  const isDirty = useProjectStore(state => state.isDirty);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!project || !isDirty) return;

    // Clear existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Set new debounce timer
    timerRef.current = setTimeout(async () => {
      if (!mountedRef.current) return; // Component unmounted — skip stale write
      try {
        // Re-read the latest snapshot from the store; the closure-captured `project`
        // may be up to 1 s stale if edits continued during the debounce window.
        const latest = useProjectStore.getState().project ?? project;
        await saveProject(latest);
        
        if (!mountedRef.current) return; // Check again after async operation
        // Update store metadata after successful save
        useProjectStore.setState({ 
          lastSavedAt: new Date().toISOString(),
          isDirty: false 
        });
        
        if (process.env.NODE_ENV === 'development') console.log('Stakked: Project auto-saved to IndexedDB.');
      } catch (error) {
        // Here we could trigger a UI modal for "Storage Full"
        console.error('Auto-save error:', error);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [project, isDirty]);
}