import { create } from 'zustand';
import { StakkedElement } from '@/types/element';

export type Tool = 'select' | 'hand' | 'text' | 'shape';

interface EditorState {
  // Tooling
  activeTool: Tool;
  setTool: (tool: Tool) => void;

  // Selection
  selectedElementIds: string[];
  setSelection: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  clearSelection: () => void;
  clipboard: StakkedElement[];
  copySelection: (elements: StakkedElement[]) => void;
  clearClipboard: () => void;

  // Flags
  isDragging: boolean;
  setDragging: (isDragging: boolean) => void;
  isResizing: boolean;
  setResizing: (isResizing: boolean) => void;
  isRotating: boolean;
  setRotating: (isRotating: boolean) => void;
  isEditingText: boolean;
  setEditingText: (isEditing: boolean) => void;

  // Viewport (Transient but shared)
  zoom: number;
  setZoom: (zoom: number) => void;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;

  // Responsive Design
  breakpoint: 'desktop' | 'tablet' | 'mobile' | 'custom';
  setBreakpoint: (breakpoint: 'desktop' | 'tablet' | 'mobile' | 'custom') => void;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;

  // Sync state
  isDirty: boolean;
  setDirty: (isDirty: boolean) => void;
  isSyncing: boolean;
  setSyncing: (isSyncing: boolean) => void;
}

/**
 * Editor Store: Manages transient state that doesn't need to be persisted
 * to the project document (selection, current tool, UI flags).
 */
export const useEditorStore = create<EditorState>((set) => ({
  activeTool: 'select',
  selectedElementIds: [],
  clipboard: [],
  isDragging: false,
  isResizing: false,
  isRotating: false,
  isEditingText: false,
  
  zoom: 1,
  pan: { x: 100, y: 100 },

  setTool: (activeTool) => set({ activeTool }),
  
  setSelection: (selectedElementIds) => set({ selectedElementIds }),
  
  addToSelection: (id) => set((state) => ({ 
    selectedElementIds: state.selectedElementIds.includes(id) 
      ? state.selectedElementIds 
      : [...state.selectedElementIds, id] 
  })),
  
  clearSelection: () => set({ selectedElementIds: [], isEditingText: false }),
  // JSON round-trip instead of structuredClone — avoids DataCloneError when
  // elements are Immer Proxy drafts (structuredClone fails on them).
  copySelection: (elements) => set({ clipboard: JSON.parse(JSON.stringify(elements)) }),
  clearClipboard: () => set({ clipboard: [] }),
  
  setDragging: (isDragging) => set({ isDragging }),
  setResizing: (isResizing) => set({ isResizing }),
  setRotating: (isRotating) => set({ isRotating }),
  setEditingText: (isEditingText) => set({ isEditingText }),

  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),

  breakpoint: 'desktop',
  setBreakpoint: (breakpoint) => set({ breakpoint }),
  canvasSize: { width: 1440, height: 2500 },
  setCanvasSize: (canvasSize) => set({ canvasSize }),

  isDirty: false,
  setDirty: (isDirty) => set({ isDirty }),
  isSyncing: false,
  setSyncing: (isSyncing) => set({ isSyncing })
}));
