import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/system/ThemeProvider';
import { GlobalModals } from '@/components/system/GlobalModals';

export const metadata: Metadata = {
  title: 'Stakked · Creative OS for artists',
  description:
    'Stakked is a drag-and-drop visual canvas for musicians, photographers, designers, and creators — one editor, many moods.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Stakked',
  },
};

/**
 * `themeColor` + `viewport` live in a dedicated `viewport` export in
 * Next.js 16 — they were removed from the `metadata` object in Next 14.
 * See node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-viewport.md.
 */
export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Root layout.
 *
 * We hard-code the initial data attributes on <html> so the first paint
 * already matches the default design tokens (no FOUC). `ThemeProvider`
 * then takes over on the client and keeps them in sync with the UI store.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="ghost"
      data-mode="dark"
      data-density="cozy"
      data-chrome="balanced"
      data-font="geist"
    >
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <GlobalModals />
      </body>
    </html>
  );
}
