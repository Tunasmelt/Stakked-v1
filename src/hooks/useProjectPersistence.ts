import { useEffect, useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { useEditorStore } from '@/stores/editor-store';
import { loadProject, saveProject } from '@/lib/db';
import { resolveProjectSource, startAutoSync, broadcastLocalSync, subscribeToLocalSync } from '@/lib/sync';

/**
 * useProjectPersistence: Logic for resolving initial project state
 * between local IndexedDB and cloud storage, plus auto-sync.
 */
export function useProjectPersistence(projectId: string) {
  const [isInitializing, setIsInitializing] = useState(true);
  const setProject = useProjectStore(state => state.setProject);
  const mergeProjectData = useProjectStore(state => state.mergeProjectData);
  const createProject = useProjectStore(state => state.createProject);
  const { setSyncing } = useEditorStore.getState();

  // 1. Initial Load Logic
  useEffect(() => {
    const resolve = async () => {
      try {
        const local = await loadProject(projectId);
        const remote = await resolveProjectSource(projectId);

        if (local && remote) {
          const localTime = new Date(local.updatedAt).getTime();
          const remoteTime = new Date(remote.updatedAt).getTime();
          
          if (localTime >= remoteTime) {
            setProject(local);
          } else {
            setProject(remote);
          }
        } else if (local) {
          setProject(local);
        } else if (remote) {
          setProject(remote);
          await saveProject(remote);
        } else {
          const createdProject = await createProject('Untitled Project', 'music', projectId);
          await saveProject(createdProject);
        }
      } catch (error) {
        console.error('Project initialization failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    resolve();
  }, [projectId, setProject, createProject]);

  // 2. Auto-Sync Loop (Local & Cloud)
  // IndexedDB is already handled by useAutoSave (1s debounce) — this loop
  // handles cloud sync only. startAutoSync also wires an 'online' listener
  // so a reconnect triggers an immediate flush instead of waiting up to 30s.
  useEffect(() => {
    if (isInitializing || !projectId) return;

    const controller = startAutoSync(
      () => useProjectStore.getState().project,
      () => useProjectStore.getState().isDirty,
      () => {
        // Stamp updatedAt and clear dirty flag WITHOUT calling setProject — that
        // action resets history = [] which would wipe the entire undo stack on
        // every sync.  Mutate only the fields we need via Immer.
        useProjectStore.setState((s) => {
          if (s.project) s.project.updatedAt = new Date().toISOString();
          s.isDirty = false;
          s.lastSavedAt = new Date().toISOString();
        });
      },
      30000,
      { onSyncStart: () => setSyncing(true), onSyncSettled: () => setSyncing(false) },
    );

    return () => controller.stop();
  }, [projectId, isInitializing, setSyncing]);

  // 3. Multi-Tab Sync (BroadcastChannel)
  useEffect(() => {
    if (isInitializing || !projectId) return;

    // Listen for updates from other tabs
    const unsubscribeLocal = subscribeToLocalSync((incoming) => {
      if (incoming.id !== projectId) return;
      const current = useProjectStore.getState().project;
      
      if (!current || new Date(incoming.updatedAt).getTime() > new Date(current.updatedAt).getTime()) {
        useProjectStore.getState().mergeProjectData(incoming);
      }
    });

    // Broadcast our updates to other tabs — debounced so rapid element edits
    // don't storm the BroadcastChannel with a message per keystroke.
    let broadcastTimer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribeStore = useProjectStore.subscribe((state) => {
      if (!state.project || !state.isDirty) return;
      const project = state.project;
      if (broadcastTimer) clearTimeout(broadcastTimer);
      broadcastTimer = setTimeout(() => {
        broadcastLocalSync(project);
        broadcastTimer = null;
      }, 1000);
    });

    return () => {
      unsubscribeLocal();
      unsubscribeStore();
    };
  }, [projectId, isInitializing, mergeProjectData]);

  // 4. Online/Offline & Unload handling
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useProjectStore.getState().isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return { isInitializing };
}

