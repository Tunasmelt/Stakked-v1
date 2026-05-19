'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';

/**
 * ThemeProvider
 *
 * Mirrors the five design-token knobs onto `<html>` as `data-*` attributes
 * so all the CSS selectors in `globals.css` can reskin the entire chrome.
 *
 * Knobs: theme · mode · density · chrome intensity · font pairing
 *
 * Must be rendered inside a `"use client"` tree — mount it once in the root
 * layout (next to Zustand-backed components) and it will keep the html root
 * in sync with the UI store.
 */
export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);
  const mode = useUIStore((s) => s.mode);
  const density = useUIStore((s) => s.density);
  const chrome = useUIStore((s) => s.chrome);
  const fontPair = useUIStore((s) => s.fontPair);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-density', density);
    root.setAttribute('data-chrome', chrome);
    root.setAttribute('data-font', fontPair);
  }, [theme, mode, density, chrome, fontPair]);

  return <>{children}</>;
}
