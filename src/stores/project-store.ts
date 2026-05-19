import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StakkedProject } from '@/types/project';
import { StakkedElement } from '@/types/element';
import { StakkedElementFullStyle } from '@/types/style';
import type { Node, Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore } from './editor-store';
import { getCurrentUserId } from '@/lib/supabase';

interface ProjectState {
  // Document
  project: StakkedProject | null;
  activePageIndex: number;
  
  // History
  history: StakkedProject[];
  future: StakkedProject[];
  
  // Meta
  lastSavedAt: string | null;
  isDirty: boolean;

  // Actions - Document
  loadProject: (project: StakkedProject) => void;
  createProject: (title: string, category?: string, projectId?: string) => Promise<StakkedProject>;
  
  // Actions - History
  undo: () => void;
  redo: () => void;
  commit: () => void; // Helper to manually push current state to history

  // Actions - Pages
  setActivePageIndex: (index: number) => void;
  addPage: (title: string) => void;
  renamePage: (pageId: string, title: string) => void;
  updatePage: (pageId: string, updates: Partial<StakkedProject['pages'][0]>) => void;
  duplicatePage: (pageId: string) => void;
  removePage: (pageId: string) => void;
  reorderPages: (pageIds: string[]) => void;

  // Actions - Elements (Committed)
  addElement: (pageIndex: number, element: StakkedElement) => void;
  removeElement: (pageIndex: number, elementId: string) => void;
  /** Update a single element. Pass `skipCommit: true` when the caller has
   *  already called `commit()` for a batch (e.g. auto-animate, paste) so we
   *  don't create N separate undo entries. */
  updateElement: (pageIndex: number, elementId: string, updates: Partial<StakkedElement>, skipCommit?: boolean) => void;
  updateElementStyle: (pageIndex: number, elementId: string, style: Partial<StakkedElementFullStyle>) => void;
  clearElementResponsiveOverride: (
    pageIndex: number,
    elementId: string,
    breakpoint: 'tablet' | 'mobile' | 'custom',
    propertyPath?: string,
    customWidth?: number
  ) => void;
  toggleElementVisibility: (pageIndex: number, elementId: string) => void;
  toggleElementLock: (pageIndex: number, elementId: string) => void;
  moveElementBackward: (pageIndex: number, elementId: string) => void;
  moveElementForward: (pageIndex: number, elementId: string) => void;
  moveElementToFront: (pageIndex: number, elementId: string) => void;
  moveElementToBack: (pageIndex: number, elementId: string) => void;
  
  // Actions - Elements (Transient vs Committed Transform)
  moveElementTransient: (pageIndex: number, elementId: string, x: number, y: number) => void;
  commitElementMove: (
    pageIndex: number,
    elementId: string,
    previousPosition: { x: number; y: number },
    nextPosition: { x: number; y: number }
  ) => void;
  resizeElementTransient: (pageIndex: number, elementId: string, width: number, height: number) => void;
  commitElementResize: (
    pageIndex: number,
    elementId: string,
    previousSize: { width: number; height: number | 'auto' },
    nextSize: { width: number; height: number | 'auto' }
  ) => void;
  commitElementRotation: (
    pageIndex: number,
    elementId: string,
    previousRotation: number,
    nextRotation: number
  ) => void;

  // Batch / Clipboard
  duplicateSelection: (pageIndex: number, elementIds: string[]) => string[];
  pasteElements: (pageIndex: number, elements: StakkedElement[]) => string[];
  /** Add multiple elements in a single undo step (one commit + one set). */
  batchAddElements: (pageIndex: number, elements: StakkedElement[]) => string[];
  nudgeElements: (pageIndex: number, elementIds: string[], delta: { x: number; y: number }) => void;
  
  // Status and Resolution
  setProject: (project: StakkedProject) => void;
  mergeProjectData: (project: StakkedProject) => void;
  updateProject: (updates: Partial<StakkedProject>) => void;
  
  // Grouping
  groupElements: (pageIndex: number, elementIds: string[]) => string | null;
  ungroupElements: (pageIndex: number, groupId: string) => void;

  /** Reorder the layer stack by providing the desired order of element IDs
   *  (index 0 = top / highest zIndex). Reassigns clean integer zIndices. */
  reorderElements: (pageIndex: number, orderedIds: string[]) => void;

  /** Rename an element's display name in the layers panel. */
  renameElement: (pageIndex: number, elementId: string, name: string) => void;

  // Workflow Logic
  updateWorkflowNodes: (nodes: Node[]) => void;
  updateWorkflowEdges: (edges: Edge[]) => void;
}

const HISTORY_LIMIT = 50;

/** Debounce window for style edits (slider scrubbing, colour picker, etc.).
 *  Within this window we coalesce commits so we don't flood the 50-entry
 *  history stack with every mouse-move frame. */
const STYLE_COMMIT_DEBOUNCE_MS = 300;

/** Debounce window for arrow-key nudge. Coalesces rapid repeated presses
 *  into a single undo entry (e.g. holding an arrow key). */
const NUDGE_DEBOUNCE_MS = 400;
let nudgeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let nudgeHasPendingCommit = false;

/** Safe deep-clone for the project JSON shape.
 *
 *  We intentionally use JSON round-trip rather than `structuredClone` because
 *  most call sites here run INSIDE an Immer `set((state) => …)` block where
 *  `state.project` is a Proxy-backed draft. `structuredClone` throws a
 *  DataCloneError on such Proxies (they carry internal WeakMaps and getters
 *  that aren't cloneable). JSON round-trip sees the proxy's own enumerable
 *  values and produces a plain, snapshot-safe object — which is exactly what
 *  history frames need. The project shape is JSON-safe by design (no Date,
 *  Map, Set, cycles, or DOM refs live on it), so nothing is lost.
 */
function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Per-element timer bookkeeping for style-commit debounce.
const styleCommitTimers = new Map<string, ReturnType<typeof setTimeout>>();
// Keys of elements whose next style mutation is "the first in a burst" and
// must therefore push a history snapshot.
const pendingStyleCommitKeys = new Set<string>();

/**
 * Project Store: The single source of truth for the document JSON.
 * Implements a robust history system (undo/redo) and optimized mutation patterns.
 */
export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    project: null,
    activePageIndex: 0,
    history: [],
    future: [],
    lastSavedAt: null,
    isDirty: false,

    loadProject: (project) => {
      set((state) => {
        state.project = project;
        state.history = [];
        state.future = [];
        state.isDirty = false;
      });
    },

    createProject: async (title, category = 'music', projectId) => {
      const userId = await getCurrentUserId();
      const newProject: StakkedProject = {
        id: projectId ?? uuidv4(),
        userId,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: false,
        visibility: 'private',
        forkCount: 0,
        category,
        tags: [],
        pages: [
          {
            id: uuidv4(),
            title: 'Home',
            slug: 'home',
            order: 0,
            canvas: { width: 1440, height: 'auto', background: { type: 'color', value: '#0f0f10' }, padding: 0 },
            elements: []
          }
        ],
        settings: { theme: 'minimal-dark' }
      };
      
      set((state) => {
        state.project = newProject;
        state.history = [];
        state.future = [];
        state.isDirty = true;
      });
      
      return newProject;
    },

    setActivePageIndex: (index) => set({ activePageIndex: index }),

    /** 
     * Core history helper. Captures current state before mutation.
     * Clears the redo stack whenever a new change is committed.
     */
    commit: () => {
      const { project } = get();
      if (!project) return;
      
      set((state) => {
        state.history.push(deepClone(project));
        if (state.history.length > HISTORY_LIMIT) {
          state.history.shift();
        }
        state.future = [];
        state.isDirty = true;
        if (state.project) {
          state.project.updatedAt = new Date().toISOString();
        }
      });
    },

    undo: () => {
      const { isDragging } = useEditorStore.getState();
      if (isDragging) return; // Block undo during active manipulation

      set((state) => {
        // Guard both conditions before popping — if project is null the popped
        // entry would be silently discarded, permanently shrinking the history.
        if (state.history.length === 0 || !state.project) return;

        const previous = state.history.pop()!;
        state.future.push(deepClone(state.project));
        state.project = previous;
      });
    },

    redo: () => {
      const { isDragging } = useEditorStore.getState();
      if (isDragging) return;

      set((state) => {
        if (state.future.length === 0 || !state.project) return;

        const next = state.future.pop()!;
        state.history.push(deepClone(state.project));
        state.project = next;
      });
    },

    // Elements
    addElement: (pageIndex, element) => {
      get().commit();
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (!page) return;
        // Assign z-index based on current layer count rather than trusting the
        // hardcoded `zIndex: 1` from defaultElement(). New elements always
        // land on top of the existing stack.
        const maxZ = page.elements.reduce((m, el) => Math.max(m, el.zIndex ?? 0), 0);
        page.elements.push({ ...element, zIndex: maxZ + 1 });
      });
    },

    removeElement: (pageIndex, elementId) => {
      get().commit();
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (page) {
          page.elements = page.elements.filter((e) => e.id !== elementId);
          // Clear any behavior targetIds that pointed to the deleted element
          page.elements.forEach((el) => {
            el.behaviors?.forEach((b) => {
              if (b.targetId === elementId) b.targetId = undefined;
            });
          });
        }
      });
    },

    updateElement: (pageIndex, elementId, updates, skipCommit = false) => {
      if (!skipCommit) {
        // Debounce content commits (e.g. TipTap keystroke bursts) using the
        // same style-debounce mechanism so rapid typing coalesces into one
        // undo entry instead of flooding the 50-entry history stack.
        const key = `content:${pageIndex}:${elementId}`;
        const existing = styleCommitTimers.get(key);
        if (!existing && !pendingStyleCommitKeys.has(key)) {
          get().commit();
          pendingStyleCommitKeys.add(key);
        } else if (existing) {
          clearTimeout(existing);
        }
        const timer = setTimeout(() => {
          styleCommitTimers.delete(key);
          pendingStyleCommitKeys.delete(key);
        }, STYLE_COMMIT_DEBOUNCE_MS);
        styleCommitTimers.set(key, timer);
      }
      set((state) => {
        const element = state.project?.pages[pageIndex]?.elements.find((e) => e.id === elementId);
        if (element) {
          Object.assign(element, updates);
          // Keep style.position and style.size in sync when legacy fields are updated
          if (updates.position && element.style.position) {
            element.style.position.x = element.position.x;
            element.style.position.y = element.position.y;
          }
          if (updates.size && element.style.size) {
            element.style.size.width = element.size.width;
            element.style.size.height = element.size.height;
          }
          state.isDirty = true;
        }
      });
    },

    updateElementStyle: (pageIndex, elementId, styleUpdates) => {
      const { breakpoint, canvasSize } = useEditorStore.getState();
      const key = `${pageIndex}:${elementId}`;
      const existingTimer = styleCommitTimers.get(key);

      if (!existingTimer && !pendingStyleCommitKeys.has(key)) {
        get().commit();
        pendingStyleCommitKeys.add(key);
      } else if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        styleCommitTimers.delete(key);
        pendingStyleCommitKeys.delete(key);
      }, STYLE_COMMIT_DEBOUNCE_MS);
      styleCommitTimers.set(key, timer);

      set((state) => {
        const element = state.project?.pages[pageIndex]?.elements.find((e) => e.id === elementId);
        if (element) {
          if (breakpoint === 'desktop') {
            Object.assign(element.style, styleUpdates);
          } else if (breakpoint === 'tablet' || breakpoint === 'mobile') {
            if (!element.style.responsive[breakpoint]) {
              element.style.responsive[breakpoint] = {};
            }
            Object.assign(element.style.responsive[breakpoint]!, styleUpdates);
          } else if (breakpoint === 'custom') {
             // Optional: handle custom breakpoint width as key
             const widthKey = canvasSize.width.toString();
             if (!element.style.responsive.custom) element.style.responsive.custom = {};
             if (!element.style.responsive.custom[widthKey]) element.style.responsive.custom[widthKey] = {};
             Object.assign(element.style.responsive.custom[widthKey], styleUpdates);
          }
          state.isDirty = true;
        }
      });
    },

    /**
     * Clear a responsive override so the element falls back to the desktop
     * base style. Pass a dotted `propertyPath` (e.g. "size.width") to clear a
     * single property, or omit it to drop the whole override object for that
     * breakpoint.
     */
    clearElementResponsiveOverride: (pageIndex, elementId, breakpoint, propertyPath, customWidth) => {
      get().commit();
      set((state) => {
        const element = state.project?.pages[pageIndex]?.elements.find((e) => e.id === elementId);
        if (!element) return;

        const responsive = element.style.responsive;
        let bucket: Record<string, unknown> | undefined;
        if (breakpoint === 'custom') {
          const widthKey = (customWidth ?? useEditorStore.getState().canvasSize.width).toString();
          bucket = responsive.custom?.[widthKey] as Record<string, unknown> | undefined;
          if (!bucket) return;
          if (!propertyPath) {
            delete responsive.custom![widthKey];
          }
        } else {
          bucket = responsive[breakpoint] as Record<string, unknown> | undefined;
          if (!bucket) return;
          if (!propertyPath) {
            delete responsive[breakpoint];
          }
        }

        if (propertyPath && bucket) {
          const segments = propertyPath.split('.');
          let cursor: Record<string, unknown> | undefined = bucket;
          for (let i = 0; i < segments.length - 1; i += 1) {
            const next = cursor?.[segments[i]];
            if (next && typeof next === 'object') {
              cursor = next as Record<string, unknown>;
            } else {
              cursor = undefined;
              break;
            }
          }
          if (cursor) {
            delete cursor[segments[segments.length - 1]];
          }
        }

        state.isDirty = true;
      });
    },

    // Transform Logic (Transient vs Committed)
    moveElementTransient: (pageIndex, elementId, x, y) => {
      set((state) => {
        const element = state.project?.pages[pageIndex]?.elements.find((e) => e.id === elementId);
        if (element) {
          element.position.x = x;
          element.position.y = y;
          state.isDirty = true;
        }
      });
    },

    commitElementMove: (pageIndex, elementId, previousPosition, nextPosition) => {
      if (
        previousPosition.x === nextPosition.x &&
        previousPosition.y === nextPosition.y
      ) {
        return;
      }
      
      get().commit();
      set((state) => {
        const el = state.project?.pages[pageIndex]?.elements.find((e) => e.id === elementId);
        if (el) {
          el.position.x = nextPosition.x;
          el.position.y = nextPosition.y;
          // Keep style.position in sync so CSS export and responsive system stay consistent
          if (el.style.position) {
            el.style.position.x = nextPosition.x;
            el.style.position.y = nextPosition.y;
          }
        }
      });
    },

    resizeElementTransient: (pageIndex, elementId, width, height) => {
      set((state) => {
        const element = state.project?.pages[pageIndex]?.elements.find((e) => e.id === elementId);
        if (element) {
          element.size.width = width;
          element.size.height = height;
          state.isDirty = true;
        }
      });
    },

    commitElementResize: (pageIndex, elementId, previousSize, nextSize) => {
      if (
        previousSize.width === nextSize.width &&
        previousSize.height === nextSize.height
      ) {
        return;
      }

      get().commit();
      set((state) => {
        const el = state.project?.pages[pageIndex]?.elements.find((e) => e.id === elementId);
        if (el) {
          el.size.width = nextSize.width;
          el.size.height = nextSize.height;
          // Keep style.size in sync so CSS export and responsive system stay consistent
          if (el.style.size) {
            el.style.size.width = nextSize.width;
            el.style.size.height = nextSize.height;
          }
        }
      });
    },

    commitElementRotation: (pageIndex, elementId, previousRotation, nextRotation) => {
      if (previousRotation === nextRotation) return;

      get().commit();
      set((state) => {
        const element = state.project?.pages[pageIndex]?.elements.find((e) => e.id === elementId);
        if (element) {
          element.rotation = nextRotation;
        }
      });
    },

    duplicateSelection: (pageIndex, elementIds) => {
      const page = get().project?.pages[pageIndex];
      if (!page) return [];

      const sourceElements = elementIds
        .map((id) => page.elements.find((element) => element.id === id))
        .filter((element): element is StakkedElement => Boolean(element));

      return get().pasteElements(pageIndex, sourceElements);
    },

    pasteElements: (pageIndex, elements) => {
      if (elements.length === 0) return [];

      const clonedElements = elements.map((element) => {
        const clone = deepClone(element);
        clone.id = uuidv4();
        clone.position.x += 20;
        clone.position.y += 20;
        // Keep style.position in sync with element.position
        if (clone.style.position) {
          clone.style.position.x = clone.position.x;
          clone.style.position.y = clone.position.y;
        }
        clone.name = `${element.name} Copy`;
        return clone;
      });

      get().commit();
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (!page) return;

        page.elements.push(...clonedElements);
      });

      return clonedElements.map((element) => element.id);
    },

    batchAddElements: (pageIndex, elements) => {
      if (elements.length === 0) return [];
      get().commit(); // single undo step for the whole batch
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (!page) return;
        const maxZ = page.elements.reduce((m, el) => Math.max(m, el.zIndex ?? 0), 0);
        elements.forEach((el, i) => {
          page.elements.push({ ...el, zIndex: maxZ + i + 1 });
        });
        state.isDirty = true;
      });
      return elements.map((el) => el.id);
    },

    nudgeElements: (pageIndex, elementIds, delta) => {
      if (elementIds.length === 0) return;

      const page = get().project?.pages[pageIndex];
      if (!page) return;

      const changedIds = elementIds.filter((id) =>
        page.elements.some((element) => element.id === id)
      );

      if (changedIds.length === 0) return;

      // Commit only once per burst of arrow-key presses, not per keypress.
      if (!nudgeHasPendingCommit) {
        get().commit();
        nudgeHasPendingCommit = true;
      }
      if (nudgeDebounceTimer) clearTimeout(nudgeDebounceTimer);
      nudgeDebounceTimer = setTimeout(() => {
        nudgeHasPendingCommit = false;
        nudgeDebounceTimer = null;
      }, NUDGE_DEBOUNCE_MS);

      set((state) => {
        const currentPage = state.project?.pages[pageIndex];
        if (!currentPage) return;

        changedIds.forEach((id) => {
          const element = currentPage.elements.find((entry) => entry.id === id);
          if (!element) return;

          element.position.x += delta.x;
          element.position.y += delta.y;
          if (element.style.position) {
            element.style.position.x = element.position.x;
            element.style.position.y = element.position.y;
          }
        });
      });
    },

    // Pages
    addPage: (title) => {
      get().commit();
      set((state) => {
        if (!state.project) return;
        state.project.pages.push({
          id: uuidv4(),
          title,
          slug: title.toLowerCase().replace(/\s+/g, '-'),
          order: state.project.pages.length,
          canvas: { ...(state.project.pages[0]?.canvas ?? { width: 1440, height: 900, background: { type: 'color', value: '#09090b' } }) }, // Copy canvas settings from first page
          elements: []
        });
      });
    },

    renamePage: (pageId, title) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return;

      get().commit();
      set((state) => {
        const page = state.project?.pages.find((entry) => entry.id === pageId);
        if (!page) return;

        page.title = trimmedTitle;
        page.slug = trimmedTitle.toLowerCase().replace(/\s+/g, '-');
      });
    },

    updatePage: (pageId, updates) => {
      get().commit();
      set((state) => {
        const page = state.project?.pages.find((p) => p.id === pageId);
        if (page) {
          Object.assign(page, updates);
        }
      });
    },

    duplicatePage: (pageId) => {
      get().commit();
      set((state) => {
        if (!state.project) return;

        const sourcePage = state.project.pages.find((entry) => entry.id === pageId);
        if (!sourcePage) return;

        const duplicatedPage = deepClone(sourcePage);
        duplicatedPage.id = uuidv4();
        duplicatedPage.title = `${sourcePage.title} Copy`;
        duplicatedPage.slug = `${sourcePage.slug}-copy`;
        duplicatedPage.order = state.project.pages.length;
        duplicatedPage.elements = duplicatedPage.elements.map((element) => ({
          ...element,
          id: uuidv4(),
        }));

        state.project.pages.push(duplicatedPage);
      });
    },

    removePage: (pageId) => {
      const { project } = get();
      if (!project || project.pages.length <= 1) return; // Prevent deleting last page

      get().commit();
      set((state) => {
        if (state.project) {
          state.project.pages = state.project.pages.filter((p) => p.id !== pageId);
          // Adjust active page if removed
          if (state.activePageIndex >= state.project.pages.length) {
            state.activePageIndex = Math.max(0, state.project.pages.length - 1);
          }
        }
      });
    },

    reorderPages: (pageIds) => {
      get().commit();
      set((state) => {
        if (!state.project) return;
        const subPages = state.project.pages;
        state.project.pages = pageIds
          .map((id) => subPages.find((p) => p.id === id))
          .filter((p): p is (typeof subPages)[number] => p !== undefined);
        state.project.pages.forEach((p, i) => (p.order = i));
      });
    },

    setProject: (project) => {
      set((state) => {
        state.project = project;
        state.history = [];
        state.future = [];
        state.isDirty = false;
      });
    },

    mergeProjectData: (project) => {
      // Patches the active project from cloud sync without resetting undo/redo history.
      // Only used when syncing a remote save that shouldn't disrupt the local edit stack.
      set((state) => {
        if (!state.project || state.project.id !== project.id) {
          // Different project — full reset is correct here
          state.project = project;
          state.history = [];
          state.future = [];
          state.isDirty = false;
        } else {
          // Same project — patch data but preserve history
          state.project = { ...project };
        }
      });
    },

    updateProject: (updates) => {
      set((state) => {
        if (state.project) {
          Object.assign(state.project, updates);
          state.isDirty = true;
          state.project.updatedAt = new Date().toISOString();
        }
      });
    },

    toggleElementVisibility: (pageIndex, elementId) => {
      get().commit();
      set((state) => {
        const element = state.project?.pages[pageIndex].elements.find((entry) => entry.id === elementId);
        if (!element) return;

        element.visible = !element.visible;
      });
    },

    toggleElementLock: (pageIndex, elementId) => {
      get().commit();
      set((state) => {
        const element = state.project?.pages[pageIndex].elements.find((entry) => entry.id === elementId);
        if (!element) return;

        element.locked = !element.locked;
      });
    },

    moveElementBackward: (pageIndex, elementId) => {
      get().commit();
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (!page) return;
        const sorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
        const idx = sorted.findIndex((e) => e.id === elementId);
        if (idx <= 0) return;
        // Swap with the element below, then reindex cleanly
        [sorted[idx - 1], sorted[idx]] = [sorted[idx], sorted[idx - 1]];
        sorted.forEach((el, i) => { el.zIndex = i + 1; });
        state.isDirty = true;
      });
    },

    moveElementForward: (pageIndex, elementId) => {
      get().commit();
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (!page) return;
        const sorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
        const idx = sorted.findIndex((e) => e.id === elementId);
        if (idx === -1 || idx >= sorted.length - 1) return;
        [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]];
        sorted.forEach((el, i) => { el.zIndex = i + 1; });
        state.isDirty = true;
      });
    },

    moveElementToFront: (pageIndex, elementId) => {
      get().commit();
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (!page) return;
        // Move target to end of sorted array, then reassign clean 1..n zIndices
        const sorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
        const idx = sorted.findIndex(e => e.id === elementId);
        if (idx === -1) return;
        const [moved] = sorted.splice(idx, 1);
        sorted.push(moved); // highest z = last
        sorted.forEach((el, i) => { el.zIndex = i + 1; });
        state.isDirty = true;
      });
    },

    moveElementToBack: (pageIndex, elementId) => {
      get().commit();
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (!page) return;
        const sorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
        const idx = sorted.findIndex(e => e.id === elementId);
        if (idx === -1) return;
        const [moved] = sorted.splice(idx, 1);
        sorted.unshift(moved); // lowest z = first
        sorted.forEach((el, i) => { el.zIndex = i + 1; });
        state.isDirty = true;
      });
    },

    updateWorkflowNodes: (nodes) => {
      set((state) => {
        if (!state.project) return;
        if (!state.project.workflow) {
          state.project.workflow = { nodes: [], edges: [] };
        }
        // Strip non-serializable data (functions) before saving
        state.project.workflow.nodes = nodes.map(n => ({
          ...n,
          data: JSON.parse(JSON.stringify(n.data))
        }));
        state.isDirty = true;
      });
    },

    updateWorkflowEdges: (edges) => {
      set((state) => {
        if (!state.project) return;
        if (!state.project.workflow) {
          state.project.workflow = { nodes: [], edges: [] };
        }
        state.project.workflow.edges = edges;
        state.isDirty = true;
      });
    },

    groupElements: (pageIndex, elementIds) => {
      if (elementIds.length < 2) return null;
      const { project } = get();
      if (!project) return null;
      const page = project.pages[pageIndex];
      if (!page) return null;

      get().commit(); // must be before any mutation so undo restores pre-group state

      const targets = page.elements.filter(e => elementIds.includes(e.id));
      if (targets.length < 2) return null;

      // Compute bounding box of all selected elements
      const minX = Math.min(...targets.map(e => e.position.x));
      const minY = Math.min(...targets.map(e => e.position.y));
      const maxX = Math.max(...targets.map(e => e.position.x + (typeof e.size.width === 'number' ? e.size.width : 200)));
      const maxY = Math.max(...targets.map(e => e.position.y + (typeof e.size.height === 'number' ? e.size.height : 100)));

      const groupId = uuidv4();
      const group: StakkedElement = {
        id: groupId,
        type: 'container',
        name: `Group ${Date.now().toString(36).slice(-4)}`,
        position: { x: minX, y: minY },
        size: { width: maxX - minX, height: maxY - minY },
        rotation: 0,
        zIndex: Math.max(...targets.map(e => e.zIndex)) + 1,
        locked: false,
        visible: true,
        content: {
          type: 'container',
          children: elementIds,
          layoutType: 'free',
        },
        style: {
          responsive: {},
          position: { type: 'absolute', x: minX, y: minY },
          size: { width: maxX - minX, height: maxY - minY, widthMode: 'px', heightMode: 'px' },
          fills: [{ id: uuidv4(), type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
          border: {
            top: { width: 0, color: '#000', style: 'none' },
            right: { width: 0, color: '#000', style: 'none' },
            bottom: { width: 0, color: '#000', style: 'none' },
            left: { width: 0, color: '#000', style: 'none' },
            linked: true,
          },
          borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px', linked: true },
          effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'default', shadows: [], backdropFilter: 'none' },
          overlays: [],
          transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
        },
        animations: [],
        behaviors: [],
      };

      set((state) => {
        if (!state.project) return;
        const pg = state.project.pages[pageIndex];
        if (!pg) return;
        // Reposition children relative to group origin
        pg.elements = pg.elements.map(e => {
          if (!elementIds.includes(e.id)) return e;
          return {
            ...e,
            position: { x: e.position.x - minX, y: e.position.y - minY },
          };
        });
        pg.elements.push(group);
        state.isDirty = true;
      });

      useEditorStore.getState().setSelection([groupId]);
      return groupId;
    },

    ungroupElements: (pageIndex, groupId) => {
      const { project } = get();
      if (!project) return;
      const page = project.pages[pageIndex];
      const group = page?.elements.find(e => e.id === groupId);
      if (!group || group.content.type !== 'container') return;

      const childIds = group.content.children as string[];
      const gx = group.position.x;
      const gy = group.position.y;

      get().commit(); // ← history entry before mutation
      set((state) => {
        if (!state.project) return;
        const pg = state.project.pages[pageIndex];
        if (!pg) return;
        // Restore absolute positions for children
        pg.elements = pg.elements
          .filter(e => e.id !== groupId)
          .map(e => {
            if (!childIds.includes(e.id)) return e;
            return {
              ...e,
              position: { x: e.position.x + gx, y: e.position.y + gy },
            };
          });
        state.isDirty = true;
      });

      useEditorStore.getState().setSelection(childIds);
    },

    reorderElements: (pageIndex, orderedIds) => {
      get().commit();
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (!page) return;
        // orderedIds[0] = top of stack (highest zIndex), orderedIds[n-1] = bottom
        const n = orderedIds.length;
        orderedIds.forEach((id, i) => {
          const el = page.elements.find((e) => e.id === id);
          if (el) el.zIndex = n - i; // n = top, 1 = bottom
        });
        // Elements not in the list keep their zIndex untouched
        state.isDirty = true;
      });
    },

    renameElement: (pageIndex, elementId, name) => {
      set((state) => {
        const page = state.project?.pages[pageIndex];
        if (!page) return;
        const el = page.elements.find((e) => e.id === elementId);
        if (el) { el.name = name; state.isDirty = true; }
      });
    },
  }))
);