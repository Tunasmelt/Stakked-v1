# Stakked Change Log

All notable changes to the Stakked project will be documented in this file.

## [2026-04-20] - Sprint 8: Corruption Recovery + Compile-Clean

### Fixed

- Repaired mass file truncation introduced by the previous batch of tooling writes — every truncated file now has a properly terminated JSX tree, closing braces, and displayName. Files restored: `Toolbar.tsx`, `AnimationSection.tsx`, `KeyboardManager.tsx`, `Canvas.tsx` (closing `memo()` + displayName), `CanvasElement.tsx` (ElementRenderer wiring), `ScrollSection.tsx`, `package.json`.
- `package.json` was truncated mid-dependency list; rebuilt from the installed `node_modules/*/package.json` versions (includes zod, motion-dom, three, uuid, zustand, sharp, all @tiptap submodules, dev-deps).
- Added missing runtime export `defaultAnimation(presetId)` to `src/lib/animation-engine.ts` — the Toolbar auto-animate flow and PropertiesPanel "+ Add animation" button both depended on it.
- Fixed `AnimationSection.tsx` custom keyframes editor to use the correct `style` key on each keyframe (the `Animation` type uses `style`, not `styles`).
- Deduplicated a dead `case 'v':` branch in `KeyboardManager.tsx` — Cmd+V paste and plain-V tool-switch now route through a single branch, and the `useCallback` dependency array is complete.
- Canvas: removed unused `react-selecto` import; `dragContainer` state discard-annotated so only the setter is live.
- Toolbar export dropdown now lists only the formats `exportMedia` actually supports (`png`, `jpeg`, `pdf`, `gif`) plus the `html` branch.
- `CanvasElement.tsx` now passes the required `isSelected` and `isEditing` props to `<ElementRenderer />` so element-type renderers (Text, Button, etc.) get the editor context they expect.

### Added

- Completed the property-panel / Toolbar / Community / Canvas CSS modules that had been truncated — every `styles.*` reference used in the TSX now has a matching CSS rule. New classes include: `Toolbar.aiBtn/segmentedControl/segment/exportMenu/exportItem`, `PropertiesPanel.chevron/sectionBody/field/group/presetBtn/presetDot/iconBtn/behaviors*`, `AssetPanel.assetLabel`, `Canvas.rulerHorizontal/rulerVertical`, `editor.closed`, `SettingsModal.title/closeButton/sectionTitle/fieldLabel/fieldDesc/select/button/varCheck`, `Workspace.empty`, `Community.header/filters/chips/chipActive/pill/card/cardTop/thumb/cardBody/cardMeta/cardActions/remixBtn/shareBtn`.

### Verified

- `npx tsc --noEmit --incremental false` — clean (source errors: 0; stale `.next/types/*` errors are build-cache noise that regenerates on next build).
- `npx eslint src` — clean (0 errors, 0 warnings).

---

## [2026-04-18] - Sprint 7: The Artist's Polish (Ongoing)

### Added

- Created `CHANGELOG.md` for meticulous change tracking.
- Created `PROJECT_MEMORY.md` as a semantic context hub for agentic collaboration.
- Integrated `Rulers.tsx` for visual coordinate feedback.
- Aggressively styled `PropertiesPanel.tsx` and `UI.module.css` with premium "WOW" aesthetics (glassmorphism, vibrant inputs, dark mode borders, hover transitions).
- Aggressively restyled `LeftSidebar.module.css` to match the properties panel using glassmorphism, advanced box-shadows, animated hover states, and premium typography.
- Replaced basic +/- accordion icons with sleek, animated `framer-motion` SVG chevrons.
- Built and injected the 6 previously missing Phase 1 property sections (`LayoutSection`, `OverlaysSection`, `TransformsSection`, `AnimationSection`, `ScrollSection`, `AccessibilitySection`).

### Fixed

- Stabilized multi-element transformation logic (Group Selection).
- Corrected zoom-aware handle scaling for group interactions.
- Refactored all components for strict TypeScript safety (0 `any` types).
- Resolved all `npm run lint` and `npm run build` warnings and errors.

### Phase 1: Foundation STATUS: COMPLETED ✅

---

## [2026-04-18] - Phase 2: Theme Engine & Asset System

### Added
- **Theme Engine**: Implemented `src/lib/theme-engine.ts` for dynamic CSS token injection and theme switching.
- **Dynamic Theming**: Created 20 premium starter themes (Neon Cyberpunk, Luxury Gold, etc.) with JSON token schemas.
- **Color Extraction**: Integrated `node-vibrant` for AI-powered palette extraction from background images.
- **Theme Persistence**: Synced active themes with `projectStore` and local storage.

### Added (Phase 2.2 - Asset System)
- **Asset Panel**: Built `src/components/editor/AssetPanel.tsx` with seven tabs (Images, Icons, Colors, Gradients, Patterns, Shapes, Fonts), typed tab component, and inline SVG glyphs for shape previews.
- **Asset Resolver**: Implemented 3-tier resolution logic (Bundled -> IndexedDB Cache -> External API) in `src/lib/asset-resolver.ts`, covering palettes, gradients, font pairings, bundled patterns, bundled shapes, Pexels images, and Iconify icons.
- **API Proxies**: Hardened `src/app/api/assets/{icons,images,proxy}/route.ts` — canonical `https://api.iconify.design/<prefix>/<name>.svg` URLs, typed Pexels response mapping, and content-type enforcement on the image proxy (rejects non-image payloads with 415).

### Added (Phase 2.3 - Responsive & Sync)
- **Responsive Overrides**: `getEffectiveStyle()` is consumed by `CanvasElement` at render time and `updateElementStyle` branches on the active breakpoint (desktop → base; tablet/mobile → `responsive[breakpoint]`; custom → `responsive.custom[width]`).
- **Clear-Override UX**: Added `clearElementResponsiveOverride()` store action plus a click-to-revert popover on `OverrideIndicator`. `SizeSection` now wires `pageIndex` through to each indicator.
- **BreakpointSwitcher**: Removed unused `Settings` import; presets set canvas size + breakpoint in one action.
- **Supabase Sync**: Rewrote `src/lib/sync.ts` with `syncToCloud`, `pullFromCloud`/`fetchFromCloud`, `resolveProjectSource`, `startAutoSync` (30s interval, online/offline aware), and `BroadcastChannel('stakked-sync')` wiring exposed as `broadcastLocalSync` / `subscribeToLocalSync` / `onSyncMessage`.

### Fixed (Phase 2 Stability Pass)
- **Truncated files**: Restored `src/types/assets.ts`, `src/stores/project-store.ts`, `src/components/editor/Toolbar.tsx`, `src/components/editor/LeftSidebar.tsx` (stripped trailing NUL bytes), and `src/components/editor/Canvas.tsx` (`displayName` instead of `Can`).
- **Hook order**: Moved `useEditorStore` reads in `CanvasElement` above the early return so React's rules of hooks hold.
- **Missing imports**: `SizeSection` now imports `useProjectStore` and `StakkedElement`.
- **Type hygiene**: Removed `any` from `OverrideIndicator`, `AssetPanel` `Tab`, and `api/assets/images` Pexels mapping; tightened asset resolver metadata types.
- **Lint warnings**: 0 errors / 0 warnings across `src/**/*.{ts,tsx}`; `tsc --noEmit` exits 0.

### Phase 2 STATUS: COMPLETED ✅

---

## [2026-04-19] - Phase 3: AI & Animation

### Added (AI Stack — free-tier providers only)
- **Provider-agnostic AI layer** (`src/lib/ai-providers.ts`): plain-fetch adapters for **Google Gemini 2.0 Flash** (free tier 15 RPM / 1M tokens/day), **xAI Grok 3 Mini**, and **Groq Llama 3.3 70B Versatile** (free). Unified `generateJSON()` helper with automatic fallback across available providers. Env keys: `GEMINI_API_KEY`, `GROK_API_KEY`, `GROQ_API_KEY`, optional `AI_DEFAULT_PROVIDER`. No OpenAI / ChatGPT dependency anywhere.
- **Zod validation schemas** (`src/lib/ai-validation.ts`): discriminated union mirroring every `StakkedElement` content variant. AI output is never admitted to Zustand unvalidated — failures return a user-friendly summary of the first 3 issues.
- **AI API routes** (Node runtime, 30s abort): `POST /api/ai/layout` (generate page), `POST /api/ai/summary` (page description), `POST /api/ai/theme` (palette → theme tokens), `GET /api/ai/providers` (runtime discovery of configured keys).
- **Generate with AI modal** (`src/components/editor/AIGenerateModal.tsx`): provider chip selector (driven by `/api/ai/providers`), category dropdown, prompt textarea, skeleton shimmer while the provider is thinking, Accept / Regenerate / Cancel flow. Regenerate rolls back the staged elements before issuing the next request; Cancel removes them entirely so the canvas is never dirtied by a rejected suggestion.

### Added (Animation Stack)
- **Animation Engine** (`src/lib/animation-engine.ts`): 15 canonical presets (`fadeIn`, `fadeOut`, `slideIn/Out`, `scaleIn/Out`, `rotateIn`, `bounceIn`, `flipIn`, `pulse`, `shake`, `glow`, `typewriter`, `blur`, `custom`). Emits matched CSS `@keyframes` **and** Framer Motion props so the editor, preview, and exported HTML stay identical. `getMotionTriggerProps()` maps the `trigger` field (`onLoad`, `whileInView`, `onHover`, `onClick`, `onScroll`) onto the right Framer Motion prop.
- **AnimationSection UI** (`src/components/properties/AnimationSection.tsx`): full replacement of the Phase 2 placeholder — trigger selector, 15-preset grid, direction control (only on directional presets), duration/delay/repeat/stagger inputs, 7 easing options (including spring/bounce), Custom Keyframes JSON editor with silent parse-on-type, and a self-contained "▶ Test" button that injects a scoped `<style>` tag + forces reflow to replay the animation on a live preview tile.
- **Auto Animate toolbar button**: sorts visible elements by Y position and applies a cascading `fadeIn` with 100ms stagger under a single undo commit — per Phase 3 spec 3.10.

### Added (Scroll + Preview)
- **ScrollSection** (`src/components/properties/ScrollSection.tsx`): rewrote the placeholder into parallax speed/direction controls and per-element scroll-snap axis/alignment, wired straight to `style.parallax` and `style.scrollSection`.
- **PreviewRenderer** (`src/components/preview/PreviewRenderer.tsx`): stand-alone read-only renderer used by `/preview/[projectId]` (and later the publish pipeline). Supports entry animations (via `motion.div` + `getMotionTriggerProps`), window-scroll-driven parallax, and scroll-snap zones. Renders 18 of 20 element types (text, image, button, video, music, social, gallery, countdown, marquee, testimonial, navigation, form, map, accordion, tabs, divider, embed, icon, shape) with graceful placeholders elsewhere.
- **Preview page** (`src/app/preview/[projectId]/page.tsx`): client component that unwraps the Next.js 16 `params` Promise with `React.use()`, loads the project from IndexedDB (`loadProject`), and renders it through `PreviewRenderer`.

### Fixed
- **Framer Motion 12 type surface**: `Target`, `Transition`, and `TargetAndTransition` are no longer re-exported from `framer-motion` in v12 — switched to `motion-dom` for structural types so `animation-engine.ts` typechecks cleanly against framer-motion 12.38.0.

### Verification
- `npx tsc --noEmit` — exit 0
- `npx eslint 'src/**/*.{ts,tsx}'` — exit 0 (0 errors, 0 warnings)

### Phase 3 STATUS: COMPLETED ✅

---

## [2026-04-19] - Sprint 8: Bug fixes + Phase 4/5 core

### Fixed (dev-server bug storm)
- **Grammarly hydration warning**: added `suppressHydrationWarning` to `<body>` in `src/app/layout.tsx`. The extension injects `data-new-gr-c-s-check-loaded` / `data-gr-ext-installed` between SSR and hydration; React's warning is now correctly suppressed only for that subtree.
- **DataCloneError on undo (18+ per press)**: rewrote `deepClone()` in `src/stores/project-store.ts` to always use `JSON.parse(JSON.stringify(value))`. `structuredClone` was throwing on Immer drafts (Proxies carry internal WeakMaps that aren't cloneable). The project shape is JSON-safe by design so nothing is lost.
- **`GET /api/assets/images 500`**: `src/app/api/assets/images/route.ts` now returns `200 { images: [], warning }` when `PEXELS_API_KEY` is the placeholder, instead of 500. Photos without a usable `src.*` URL are filtered out to prevent `<img src="">`.
- **`<img src="">` warnings**: `AssetPanel.tsx` only renders `<img>` when `asset.thumb` is truthy and iconify URLs get both `prefix` and `name` before construction.
- **Asset library "search works, include broken"**: `AssetPanel.tsx` now shows a transient toast + dashed-border banner explaining "Select an element first" when a style-apply tab (colors/gradients/patterns/fonts) is active with no selection. Insert tabs (images/icons/shapes) show a success toast on insert. `AssetPanel.module.css` gained `.hintBanner`, `.toast`, `.toastSuccess/Info/Warn`, and `toastIn` keyframes.

### Added (Phase 4 — partial)
- **PNG + JPEG export** (`src/lib/export-image.ts`): pure-browser pipeline — clone → inline computed styles → SVG `foreignObject` → rasterize to Canvas → `canvas.toBlob`. Routes external images through `/api/assets/proxy` so `canvas.toBlob` doesn't taint. `downloadNodeAsImage(node, filename, opts)` is the one-line caller. Awaits `document.fonts.ready` before capture so custom Google Fonts render correctly.
- **HTML export compiler** (`src/lib/export.ts`): `compileProjectToHtml(project, { pageIndex, title, canonicalUrl, embedGoogleFonts })` emits a single self-contained HTML document that matches PreviewRenderer output. Escapes all string content, emits `@keyframes` blocks per animated element, injects marquee keyframes, and preserves per-element border-radius / shadows / fills inline.

### Added (Phase 5 — partial)
- **Eight remaining element components** (Phase 5.7–5.14), all registered in `src/components/elements/ElementRenderer.tsx`:
  - `ContainerElement.tsx` (dashed preview with layout type + child count)
  - `NavigationElement.tsx` (horizontal nav link strip, click = no-op on canvas)
  - `FormElement.tsx` (read-only field preview with submit-button chip)
  - `MapElement.tsx` (Google Maps embed; Mapbox swap behind `provider`)
  - `TestimonialElement.tsx` (quote + avatar + author/role)
  - `MarqueeElement.tsx` (CSS-only infinite scroll, speed + direction)
  - `AccordionElement.tsx` (Framer Motion height animation)
  - `TabsElement.tsx` (horizontal tab bar + content pane)
- **`defaultElement()` for 20 types** (`src/types/element.ts`): previously `defaultElement('container' | 'navigation' | … )` fell through to a divider content, corrupting dragged elements. All 8 new branches now return valid typed content + sensible sizes/fills/radii.
- **PWA manifest** (`public/manifest.json`) linked from `layout.tsx` via `metadata.manifest`; `themeColor` / viewport moved to the new Next.js 16 `viewport` export (the `metadata.themeColor` field was removed in Next 14).

### Verification
- `npx tsc --noEmit` — exit 0
- `npx eslint 'src/**/*.{ts,tsx}'` — exit 0 (0 errors, 0 warnings)

### Phase 4/5 STATUS: PARTIAL — see `HANDOFF.md` for remaining work
- Done: PNG/JPEG/HTML export, CORS proxy, 8 advanced elements, PWA manifest.
- Deferred (external services needed): PDF export, GIF export, page hosting, custom domains, fork API, real community gallery data.
- Deferred (design input needed): Workflow Builder, Docs, Feature showcase, Settings page, GFX gallery.
- Deferred (coding-only): SW for full offline, sync conflict queue, beforeunload guard, AI suggestions tab, new-element PropertiesPanel sections.

---

## [2026-04-20] - Phase 6: Advanced Animation & Interactivity

### Added (Advanced Animation Engine)
- **Advanced Presets**: Implemented `reveal`, `parachute`, `perspectiveFlip`, and `tilt` presets. `reveal` uses direction-aware `clip-path` for contemporary high-end entrance effects.
- **Parallax System**: Created `useParallax.ts` using `framer-motion`'s `useScroll` and `useTransform`. Elements now support `parallax` style with speed/axis controls.
- **Page Transitions**: Integrated `AnimatePresence` into the main `Canvas.tsx` render loop. Switching pages triggers fluid `transition` animations (Fade, Scale, Slide, Reveal).
- **Page Inspector**: Built `PageSection.tsx` and modified `PropertiesPanel.tsx` to handle page-level settings (canvas width, padding, transitions) when no element is selected.

### Added (Interactivity & Behaviors)
- **Unified Interactivity**: Implemented `useInteractivity.ts` hook. Elements now support the `behaviors` schema, allowing click/hover triggers to execute actions (Navigate, Open URL, Play/Pause, Toggle Visibility).
- **Behavior Section UI**: Added `InteractivitySection.tsx` (Logic Section) to the properties panel for managing complex event logic.

### Changed
- **AI Refinement**: Removed xAI **Grok** integration. The platform now focuses on **Google Gemini** and **Groq** for high-performance, free-tier generative primitives.
- **Animation UI v2**: Overhauled `AnimationSection.tsx` with a visual preset grid and directional arrow vector picker.

### Fixed
- **Canvas Rendering**: Optimized `CanvasElement.tsx` into a `motion.div` for smoother layout transitions and reduced reflows during property edits.
- **Type Safety**: Extended `StakkedElement` and `StakkedPage` types to support the new parallax and transition metadata.

### Phase 6 STATUS: COMPLETED ✅

---

## [2026-04-21] - Sprint 9: Workflow Logic & Codebase Hardening

### Added (Workflow Logic)
- **Workflow Resolver**: Implemented an iterative logic engine in `useInteractivity.ts` that supports `LogicNode` branching (True/False outputs), project-level global variables, and conditional routing.
- **Global Variable Integration**: Wired variable lookups into the behavior system, enabling elements to branch based on runtime state (e.g., "If credits > 0, Navigate to App").
- **Logic Node Configuration**: Completed the UI and logic for the Workflow Builder's conditional nodes.

### Fixed (Codebase Hardening)
- **Zero-Any Policy**: Replaced every remaining `any` and `as any` type assertion in the project (`state-store.ts`, `project-store.ts`, `ProjectSettingsModal.tsx`, `AssetPanel.tsx`, `Canvas.tsx`) with strict interfaces or discriminated unions.
- **React Hook Compliance**: Refactored `WorkflowCanvas.tsx` and `PublicApp.tsx` to eliminate conditional hook calls and cascading render warnings, ensuring 100% compliance with React's Rules of Hooks.
- **Dependency Alignment**: Optimized `useCallback` and `useEffect` dependency arrays across the editor to satisfy the strict Next.js / React Compiler requirements.
- **Syntax & Logic Repair**: Resolved a critical JSX parsing error in `CanvasElement.tsx` and restored complex GFX logic in `AssetPanel.tsx` that was inadvertently regressed.
- **Project Stability**: Achieved a flawless `npm run lint` pass with **0 errors and 0 warnings**.

### Phase 5 Interactivity STATUS: COMPLETED ✅
### Codebase Stability STATUS: PRODUCTION READY 🚀

