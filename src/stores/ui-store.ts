import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type LeftPanelTab = 'elements' | 'layers' | 'pages' | 'assets';
export type RightPanelTab = 'design' | 'style' | 'animate';

export type ChromeTheme = 'ghost' | 'neon' | 'brutal' | 'paper' | 'sunset';
export type ChromeMode = 'dark' | 'light';
export type ChromeDensity = 'compact' | 'cozy' | 'spacious';
export type ChromeIntensity = 'minimal' | 'balanced' | 'edgy';
export type FontPairing = 'geist' | 'jb' | 'space';
export type ViewMode = 'canvas' | 'workflow';

export type ToastKind = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
  /** Auto-dismiss after this many ms (default 4000). 0 = persistent. */
  duration?: number;
}

export const CHROME_THEMES: { id: ChromeTheme; name: string; k: string; sw: [string, string, string, string] }[] = [
  { id: 'ghost',  name: 'Ghost',     k: 'neutral / default',  sw: ['#1a1a1e', '#141417', '#f1f1f2', '#d6ff3d'] },
  { id: 'neon',   name: 'Neon',      k: 'cyber / magenta',    sw: ['#07000f', '#130327', '#f6eaff', '#ff2e9a'] },
  { id: 'brutal', name: 'Brutalist', k: 'high contrast',      sw: ['#000000', '#0f0f0f', '#ffffff', '#ffee00'] },
  { id: 'paper',  name: 'Paper',     k: 'warm editorial',     sw: ['#1e1b15', '#2c2822', '#e8e2d0', '#d4a574'] },
  { id: 'sunset', name: 'Sunset',    k: 'dusk / coral',       sw: ['#1c0f14', '#331e1f', '#ffe8d6', '#ff8e53'] },
];

interface UIState {
  // Panel layout
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftPanelTab: LeftPanelTab;
  rightPanelTab: RightPanelTab;
  previewMode: boolean;
  viewMode: ViewMode;

  // Claude Design token selection
  theme: ChromeTheme;
  mode: ChromeMode;
  density: ChromeDensity;
  chrome: ChromeIntensity;
  fontPair: FontPairing;

  // Tweaks panel visibility
  tweaksOpen: boolean;

  // Modals
  commandPaletteOpen: boolean;
  settingsModalOpen: boolean;

  // Custom Dialogs (replacing native alert/confirm/prompt)
  confirmDialog: {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  } | null;

  promptDialog: {
    open: boolean;
    title: string;
    defaultValue: string;
    placeholder?: string;
    onConfirm: (val: string) => void;
  } | null;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, kind?: ToastKind, duration?: number) => void;
  removeToast: (id: string) => void;

  // Actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelTab: (tab: LeftPanelTab) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setPreviewMode: (mode: boolean) => void;
  setViewMode: (mode: ViewMode) => void;

  setTheme: (t: ChromeTheme) => void;
  setMode: (m: ChromeMode) => void;
  setDensity: (d: ChromeDensity) => void;
  setChrome: (c: ChromeIntensity) => void;
  setFontPair: (f: FontPairing) => void;
  toggleTweaks: () => void;
  setTweaksOpen: (v: boolean) => void;

  setCommandPaletteOpen: (v: boolean) => void;
  setSettingsModalOpen: (v: boolean) => void;

  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
  showPrompt: (title: string, defaultValue: string, onConfirm: (val: string) => void, placeholder?: string) => void;
  closeDialogs: () => void;
}

/**
 * UI Store: Manages the configuration of the editor chrome and panels.
 * Persisted to localStorage to remember user layout + theme preferences.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      leftPanelOpen: true,
      rightPanelOpen: true,
      leftPanelTab: 'elements',
      rightPanelTab: 'design',
      previewMode: false,
      viewMode: 'canvas',

      theme: 'ghost',
      mode: 'dark',
      density: 'cozy',
      chrome: 'balanced',
      fontPair: 'geist',
      tweaksOpen: false,
      commandPaletteOpen: false,
      settingsModalOpen: false,

      toasts: [],
      addToast: (message, kind = 'info', duration = 4000) => {
        const id = uuidv4();
        set((state) => ({ toasts: [...state.toasts, { id, message, kind, duration }] }));
        if (duration > 0) {
          setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
          }, duration);
        }
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
      toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
      setLeftPanelTab: (tab) => set({ leftPanelTab: tab, leftPanelOpen: true }),
      setRightPanelTab: (tab) => set({ rightPanelTab: tab, rightPanelOpen: true }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      setViewMode: (mode) => set({ viewMode: mode }),

      setTheme: (t) => set({ theme: t }),
      setMode: (m) => set({ mode: m }),
      setDensity: (d) => set({ density: d }),
      setChrome: (c) => set({ chrome: c }),
      setFontPair: (f) => set({ fontPair: f }),
      toggleTweaks: () => set((s) => ({ tweaksOpen: !s.tweaksOpen })),
      setTweaksOpen: (v) => set({ tweaksOpen: v }),

      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      setSettingsModalOpen: (v) => set({ settingsModalOpen: v }),

      confirmDialog: null,
      promptDialog: null,

      showConfirm: (title, message, onConfirm, confirmText, cancelText) => 
        set({ confirmDialog: { open: true, title, message, onConfirm, confirmText, cancelText } }),
      
      showPrompt: (title, defaultValue, onConfirm, placeholder) =>
        set({ promptDialog: { open: true, title, defaultValue, onConfirm, placeholder } }),

      closeDialogs: () => set({ confirmDialog: null, promptDialog: null }),
    }),
    {
      name: 'stakked-ui-store',
      partialize: (state) => ({
        theme: state.theme,
        mode: state.mode,
        density: state.density,
        chrome: state.chrome,
        fontPair: state.fontPair,
        leftPanelOpen: state.leftPanelOpen,
        rightPanelOpen: state.rightPanelOpen,
        leftPanelTab: state.leftPanelTab,
        rightPanelTab: state.rightPanelTab,
      }),
    }
  )
);
