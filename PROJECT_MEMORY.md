# Project Memory: Stakked

**Last Updated:** 2026-04-19

## 🧠 System Architecture

### Stores (Zustand)
1. **`projectStore`**: The Ground Truth.
   - Contains `StakkedProject` (pages, elements).
   - Uses **Immer** for immutable updates.
   - **History**: Custom stack for Undo/Redo (capped at 50).
   - **Optimization**: Transient actions (e.g., `moveElementTransient`) update the state *without* pushing to history to prevent performance degradation during drag.

2. **`editorStore`**: High-Frequency UI State.
   - Transient data: `selection`, `zoom`, `pan`, `isDragging`.
   - **Performance Critical**: Pan and Zoom are primarily managed via **Refs** in `Canvas.tsx` for 60fps, then synced to the store for UI consumption.

3. **`uiStore`**: Layout Persistence.
   - Sidebar toggles, active tabs.
   - Persisted to `localStorage`.

### Performance Strategy
- **Direct CSS Manipulation**: Active drags/resizes/pans/zooms use direct DOM `style` manipulation via refs to bypass React's render cycle latency.
- **Selector Pattern**: Components subscribe to specific element IDs or properties to prevent global re-renders.

## 🎨 Visual Identity
- **Themes**: Dark-mode primary, using CSS Custom Properties (`--editor-bg`, etc.).
- **Typography**: Inter (UI), Space Grotesk (Headings).

## 🛠️ Tech Stack Constants
- **Next.js 15+** (App Router)
- **CSS Modules** (Strictly NO Tailwind)
- **Supabase** (Auth, DB, Storage)
- **Moveable** (Manipulation)
- **TipTap** (Rich Text)

## 📌 Implementation Status (Phase 1 COMPLETED)
- [x] Foundation (Stores, DB, Scaffolding)
- [x] Canvas Engine (Pan/Zoom/Drag/Resize/Rotate)
- [x] Layer & Page Management
- [x] Property Panels (All 13 Sections: Position, Layout, Typography, Fill, Border, Effects, Overlays, Transforms, Link, Animation, Scroll, Accessibility)
- [x] Element Factory (20+ Core Types)
- [x] Visual Rulers & Coordinate Feedback
- [x] Group Selection & Multi-Element Transforms
- [x] Smart Smapping & Alignment Guides

## 🛡️ Stability & Type Safety
- **Full Build Verified**: `npm run build` passes with zero errors.
- **Strictly Typed**: Removed all `any` and `as any` casting from components.
- **Linted**: All MD022/MD032 markdown warnings and unused variables resolved.

## 🚀 Phase 2: COMPLETED
- **Theme Engine** — `src/lib/theme-engine.ts`, 20 generated themes, `node-vibrant` palette extraction.
- **Asset System** — `src/lib/asset-resolver.ts` three-tier resolver + `src/components/editor/AssetPanel.tsx` with 7 tabs (Images, Icons, Colors, Gradients, Patterns, Shapes, Fonts). Bundled JSON: 50 palettes / 185 gradients / 20 font pairings / 50 social platforms; inline pattern + shape libraries.
- **API Routes** — `src/app/api/assets/{images,icons,oembed,proxy}/route.ts`. Iconify uses canonical `api.iconify.design/<prefix>/<name>.svg`; Pexels mapping typed; proxy rejects non-image content-types with 415.
- **Responsive Overrides** — `getEffectiveStyle()` consumed by `CanvasElement`; `updateElementStyle` branches on breakpoint; new `clearElementResponsiveOverride()` store action; `OverrideIndicator` now has a click-to-revert popover and takes `pageIndex`.
- **Cloud Sync** — `src/lib/sync.ts` exports `syncToCloud`, `pullFromCloud` / `fetchFromCloud`, `resolveProjectSource`, `startAutoSync` (30s interval, online/offline aware), `broadcastLocalSync`, `subscribeToLocalSync`, `onSyncMessage`. Uses `BroadcastChannel('stakked-sync')`, Last-Write-Wins via ISO `updatedAt`.
- **Verification** — `npx tsc --noEmit` and `npx eslint src/**/*.{ts,tsx}` both exit 0.

## 🧬 Phase 3: COMPLETED
- **AI Providers (free tier only)** — `src/lib/ai-providers.ts` wraps **Gemini 2.0 Flash**, **Grok 3 Mini**, and **Groq Llama 3.3 70B** behind a single `generateJSON()` helper with automatic fallback. No OpenAI / ChatGPT. Required env: one of `GEMINI_API_KEY`, `GROK_API_KEY`, `GROQ_API_KEY`. Optional `AI_DEFAULT_PROVIDER`.
- **AI Validation** — Zod discriminated union in `src/lib/ai-validation.ts` mirrors every `StakkedElement` content shape; AI output never hits Zustand unvalidated.
- **AI API Routes** — `POST /api/ai/{layout,summary,theme}` (30s abort) + `GET /api/ai/providers` for runtime discovery. All return JSON with `provider` + `model` fields.
- **Generate Modal** — `src/components/editor/AIGenerateModal.tsx` (opened from Toolbar). Provider chips, category dropdown, prompt box, skeleton shimmer, Accept / Regenerate / Cancel. Regenerate rolls back staged elements before re-fetching; Cancel strips the entire preview.
- **Animation Engine** — `src/lib/animation-engine.ts`: 15 presets, CSS keyframe builder, Framer Motion `getMotionProps` / `getMotionTriggerProps` converters. `defaultAnimation(type)` factory.
- **AnimationSection UI** — `src/components/properties/AnimationSection.tsx`: full preset grid, direction control, duration/delay/repeat/stagger, 7 easings (incl. spring/bounce), live "▶ Test" via scoped `<style>` injection + reflow, Custom Keyframes JSON editor.
- **Auto Animate** — Toolbar button sorts visible elements by Y, applies cascading `fadeIn` with 100ms stagger under a single undo checkpoint.
- **ScrollSection** — `src/components/properties/ScrollSection.tsx`: parallax enable + speed slider + direction, per-element scroll-snap axis & alignment, wired to `style.parallax` and `style.scrollSection`.
- **PreviewRenderer** — `src/components/preview/PreviewRenderer.tsx` used by `/preview/[projectId]`. Read-only, reuses `getMotionTriggerProps`, uses `useScroll` + `useTransform` for parallax, applies `scrollSnapAlign` / `scroll-snap-type: y mandatory` when any element enables a snap zone.
- **Preview Page** — `src/app/preview/[projectId]/page.tsx` unwraps the Next.js 16 `params` Promise via `use()`, loads the project from IndexedDB, renders via PreviewRenderer.

### Phase 3 Pitfalls Learned
- **Framer Motion 12 types**: `Target`, `Transition`, and `TargetAndTransition` are no longer part of framer-motion's public type surface — import them from `motion-dom` instead.
- **MotionProps.animate widening**: `MotionProps["animate"]` widens to `boolean | TargetAndTransition | VariantLabels | LegacyAnimationControls`. Before passing to `whileInView` / `whileHover` / `whileTap`, narrow with `as TargetAndTransition`.
- **AI never mutates state**: every AI response must pass `validateAI*Response` before any `addElement()` call; otherwise a malformed JSON can corrupt the canvas.

## ⚠️ Important Pitfalls
- **Zoom Dividers**: Every manipulation delta must be divided by `zoom` to keep mouse coordinates attached to elements.
- **History Commits**: Always commit on `End` events (DragEnd, ResizeEnd), never during the event.
- **Type Casting**: Avoid `as any` at all costs; use `Partial<T>` or explicit union types for state updates.
- **Hook Order**: All `useStore(...)` calls must precede any early return (`if (!element) return null`) — see `CanvasElement.tsx`.
- **File Truncation**: Several files were corrupted mid-edit with trailing NULs / partial JSDoc; always rewrite the final block in full when saving large stores.
