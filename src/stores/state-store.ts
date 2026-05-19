/* src/stores/state-store.ts
 *
 * Purpose: runtime key-value state for global variables.
 * This is NOT a legacy duplicate of project-store / editor-store / ui-store.
 * It owns a distinct concern: ephemeral runtime values that drive workflow
 * logic nodes and element interactivity conditions (e.g. "isMenuOpen = true").
 * These values are never persisted — they reset on page load.
 */
import { create } from 'zustand';

type StateValue = string | number | boolean;

interface GlobalState {
  values: Record<string, StateValue>;
  setValue: (key: string, value: StateValue) => void;
  reset: (initialValues?: Record<string, StateValue>) => void;
}

const SESSION_KEY = 'stakked:globalState';

function loadFromSession(): Record<string, StateValue> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let sessionSaveTimer: ReturnType<typeof setTimeout> | null = null;

function saveToSession(values: Record<string, StateValue>) {
  if (typeof window === 'undefined') return;
  // Debounce so rapid setGlobalState calls (e.g. from interval behaviors)
  // don't serialize and write JSON on every tick.
  if (sessionSaveTimer) clearTimeout(sessionSaveTimer);
  sessionSaveTimer = setTimeout(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(values));
    } catch {
      // ignore quota errors
    }
    sessionSaveTimer = null;
  }, 300);
}

/**
 * State Store: Manages the RUNTIME values of global variables.
 * Used during Preview and in the production build to drive logic nodes.
 * Values survive hot-reload (sessionStorage) but reset when the tab closes.
 */
export const useGlobalState = create<GlobalState>((set) => ({
  values: loadFromSession(),
  setValue: (key, value) =>
    set((state) => {
      const next = { ...state.values, [key]: value };
      saveToSession(next);
      return { values: next };
    }),
  reset: (initialValues = {}) => {
    saveToSession(initialValues);
    set({ values: initialValues });
  },
}));
