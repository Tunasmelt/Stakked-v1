import { StakkedProject } from '@/types/project';
import {
  supabase,
  fetchProjectFromCloud,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { saveProject, loadProject } from '@/lib/db';
import { useUIStore } from '@/stores/ui-store';

export const canUseCloudSync = isSupabaseConfigured;

const LS_SYNC_KEY = 'stakked-sync-event';

export interface SyncMessage {
  type: 'project:updated' | 'project:saved';
  projectId: string;
  updatedAt: string;
  source?: string;
}

/**
 * Cross-tab sync channel.
 * Primary: BroadcastChannel (supported in Chrome/FF/Safari 15.4+).
 * Fallback: localStorage storage event (works on all browsers, including
 *           older Safari). Both paths carry the same SyncMessage payload.
 */
const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('stakked-sync')
    : null;

/** Subscribe to cross-tab sync messages. Returns an unsubscribe fn. */
export function onSyncMessage(cb: (msg: SyncMessage) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  if (syncChannel) {
    // BroadcastChannel path
    const handler = (e: MessageEvent<SyncMessage>) => cb(e.data);
    syncChannel.addEventListener('message', handler);
    return () => syncChannel.removeEventListener('message', handler);
  }

  // localStorage fallback path (fires in all tabs that share the same origin)
  const handler = (e: StorageEvent) => {
    if (e.key !== LS_SYNC_KEY || !e.newValue) return;
    try {
      cb(JSON.parse(e.newValue) as SyncMessage);
    } catch {
      // malformed payload — ignore
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/** Broadcast a change to sibling tabs. */
function broadcast(msg: SyncMessage) {
  try {
    if (syncChannel) {
      syncChannel.postMessage(msg);
    } else if (typeof window !== 'undefined') {
      // localStorage fallback: write then immediately delete so the next
      // identical message also fires the 'storage' event.
      localStorage.setItem(LS_SYNC_KEY, JSON.stringify(msg));
      setTimeout(() => localStorage.removeItem(LS_SYNC_KEY), 100);
    }
  } catch (err) {
    console.warn('[sync] broadcast failed:', err);
  }
}

/**
 * Push a project to Supabase. Uses `updated_at` as Last-Write-Wins key.
 * Returns true on success, false if skipped/failed.
 */
export async function syncToCloud(project: StakkedProject): Promise<boolean> {
  if (!supabase || !canUseCloudSync) return false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;

  // Only sync when the user is authenticated. Anonymous (guest) users stay
  // IndexedDB-only. This prevents silent RLS rejections from Supabase.
  let userId: string;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    userId = user.id;
  } catch {
    return false;
  }

  try {
    const updatedAt = new Date().toISOString();
    const row = {
      id: project.id,
      user_id: userId,
      data: { ...project, updatedAt, userId },
      updated_at: updatedAt,
    };

    const { error } = await supabase
      .from('projects')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('[sync] syncToCloud failed:', error.message);
      if (typeof window !== 'undefined') {
        useUIStore.getState().addToast('Cloud sync failed — changes saved locally.', 'warning', 5000);
      }
      return false;
    }

    broadcast({
      type: 'project:saved',
      projectId: project.id,
      updatedAt,
    });
    return true;
  } catch (err) {
    console.warn('[sync] syncToCloud threw:', err);
    if (typeof window !== 'undefined') {
      useUIStore.getState().addToast('Cloud sync error — changes saved locally.', 'error', 5000);
    }
    return false;
  }
}

/**
 * Pull latest project from cloud and, if newer than local, write it locally.
 * Returns the merged project (or null if unchanged / not configured).
 */
export async function pullFromCloud(
  projectId: string,
): Promise<StakkedProject | null> {
  if (!supabase || !canUseCloudSync) return null;

  const cloud = await fetchProjectFromCloud(projectId);
  if (!cloud) return null;

  const local = await loadProject(projectId);

  // Last-Write-Wins: compare ISO timestamps
  if (local && local.updatedAt && cloud.updatedAt && local.updatedAt >= cloud.updatedAt) {
    return null; // local is as fresh or fresher
  }

  await saveProject(cloud);
  broadcast({
    type: 'project:updated',
    projectId: cloud.id,
    updatedAt: cloud.updatedAt ?? new Date().toISOString(),
    source: 'cloud',
  });
  return cloud;
}

/** Alias for clarity — "fetchFromCloud" matches the spec terminology. */
export const fetchFromCloud = pullFromCloud;

/**
 * Resolve the latest project snapshot from the cloud (without writing locally).
 * Used by the persistence hook when deciding whether local or cloud is fresher.
 */
export async function resolveProjectSource(
  projectId: string,
): Promise<StakkedProject | null> {
  if (!canUseCloudSync) return null;
  return fetchProjectFromCloud(projectId);
}

/** Push a local-only change notification to sibling tabs (no cloud round-trip). */
export function broadcastLocalSync(project: StakkedProject): void {
  broadcast({
    type: 'project:updated',
    projectId: project.id,
    updatedAt: project.updatedAt ?? new Date().toISOString(),
    source: 'local',
  });
}

/**
 * Subscribe to incoming project updates from other tabs.
 * The callback receives the full project fetched from IndexedDB.
 */
export function subscribeToLocalSync(
  cb: (project: StakkedProject) => void,
): () => void {
  return onSyncMessage(async (msg) => {
    if (msg.type !== 'project:updated' && msg.type !== 'project:saved') return;
    try {
      const local = await loadProject(msg.projectId);
      if (local) cb(local);
    } catch (err) {
      console.warn('[sync] subscribeToLocalSync load failed:', err);
    }
  });
}

export interface AutoSyncController {
  stop: () => void;
  flushNow: () => Promise<void>;
}

/**
 * Start a 30s interval that pushes the project whenever it is dirty and online.
 * Also wires online/offline listeners so a reconnection triggers an immediate flush.
 *
 * @param getProject  Callback returning the latest project snapshot.
 * @param isDirty     Callback returning whether local state is dirty.
 * @param onSynced    Called after a successful cloud sync (to clear the dirty flag).
 */
export function startAutoSync(
  getProject: () => StakkedProject | null,
  isDirty: () => boolean,
  onSynced: () => void,
  intervalMs: number = 30_000,
): AutoSyncController {
  let stopped = false;

  const flush = async () => {
    if (stopped) return;
    if (!isDirty()) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    const project = getProject();
    if (!project) return;
    const ok = await syncToCloud(project);
    if (ok) onSynced();
  };

  const timer = typeof window !== 'undefined'
    ? window.setInterval(flush, intervalMs)
    : null;

  const onOnline = () => {
    void flush();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
  }

  return {
    stop: () => {
      stopped = true;
      if (timer !== null) clearInterval(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', onOnline);
      }
    },
    flushNow: flush,
  };
}
