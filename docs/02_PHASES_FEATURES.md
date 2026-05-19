# Stakked — Phases & Features

> **Every phase broken into weekly tasks. Every feature detailed with its dependencies, files, and acceptance criteria.**

---

## Phase 1: Foundation & Canvas (Weeks 1–10)

> **Goal:** Buttery smooth canvas with 12 element types, full A-Z properties panel, undo/redo, and IndexedDB auto-save.

### Week 1–2: Project Scaffolding & Core Architecture

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 1.1 | Next.js 15 init (App Router, TypeScript strict, `src/` dir) | `package.json`, `tsconfig.json`, `next.config.ts` | Nothing |
| 1.2 | Install core dependencies (zustand, immer, react-moveable, react-selecto, @dnd-kit/core, @dnd-kit/sortable, framer-motion, idb, lucide-react) | `package.json` | 1.1 |
| 1.3 | TypeScript type definitions — `StakkedProject`, `StakkedPage`, `StakkedElement`, `ElementContent`, `StakkedElementFullStyle`, `Animation` | `src/types/project.ts`, `element.ts`, `style.ts`, `animation.ts`, `assets.ts`, `theme.ts` | 1.1 |
| 1.4 | Zustand project store with Immer (CRUD for elements, history stack capped at 50, undo/redo, transient move vs. committed move) | `src/stores/project-store.ts` | 1.3 |
| 1.5 | Zustand editor store (selection, zoom, pan, active tool, clipboard, isDragging, snapGuides) | `src/stores/editor-store.ts` | 1.3 |
| 1.6 | Zustand UI store (panel visibility, active tabs, preview mode) | `src/stores/ui-store.ts` | 1.1 |
| 1.7 | IndexedDB wrapper using `idb` library (save/load project, debounced auto-save at 1000ms, LRU cache for assets at 50MB cap) | `src/lib/db.ts` | 1.4 |
| 1.8 | Supabase client setup (auth client, database helpers, storage bucket config) | `src/lib/supabase.ts`, `.env.local` | 1.1 |
| 1.9 | Global CSS reset, CSS Custom Properties for editor theme, Google Fonts loading (Inter, Space Grotesk, Outfit) | `src/styles/globals.css` | 1.1 |
| 1.10 | Base editor layout — 3-panel: left tray, center canvas, right properties. Dark chrome theme. | `src/app/editor/[projectId]/page.tsx`, `src/styles/editor.module.css` | 1.6, 1.9 |
| 1.11 | Keyboard shortcut system (Cmd+Z, Cmd+Shift+Z, Cmd+S, Cmd+D, Delete, Cmd+C, Cmd+V, Cmd+A, Escape) | `src/lib/keyboard.ts` | 1.4, 1.5 |
| 1.12 | Supabase Auth pages (login, signup, OAuth callback) | `src/app/auth/login/page.tsx`, `signup/page.tsx`, `callback/route.ts` | 1.8 |

### Week 3–5: The Canvas (CRITICAL PATH)

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 1.13 | Canvas container with zoom/pan using refs + CSS transforms (NOT React state). Grid overlay. Rulers. | `src/components/editor/Canvas.tsx` | 1.10 |
| 1.14 | react-moveable integration — drag, resize, rotate, snap-to-grid (5px), minimum dimensions (per element type) | `src/components/editor/CanvasElement.tsx` | 1.13, 1.4 |
| 1.15 | react-selecto integration — multi-select via marquee drag on empty canvas area | (integrated into Canvas.tsx) | 1.14 |
| 1.16 | Element rendering from JSON — each element type maps to a React component wrapped in CanvasElement | `src/components/elements/*.tsx` (12 files) | 1.14 |
| 1.17 | dnd-kit — drag from ElementTray sidebar onto canvas. Ghost preview during drag. Drop creates element in JSON at correct position adjusted for zoom/pan. | `src/components/editor/ElementTray.tsx` | 1.13, 1.4 |
| 1.18 | Snap guides — edge + center alignment, 5px threshold, SVG overlay | `src/components/editor/SnapGuides.tsx` | 1.14 |
| 1.19 | Selection state — single click select, Shift+click multi-select, click empty canvas to deselect | (integrated into Canvas.tsx, editor-store) | 1.15, 1.5 |
| 1.20 | Z-index layer management — bring to front, send to back, bring forward, send backward | `src/components/editor/LayerList.tsx` | 1.4, 1.5 |
| 1.21 | Undo/Redo system — history stack with Immer, batch commits on drag end, locked during active drag | (integrated into project-store) | 1.4 |
| 1.22 | Copy/Paste/Duplicate elements — within page and across pages. Offset duplicates by +20px. | (integrated into keyboard.ts, project-store) | 1.11, 1.4 |
| 1.23 | Element locking — lock prevents move/resize/rotate. Lock icon in layer list. | (integrated into CanvasElement, LayerList) | 1.20 |

> **⛔ GATE CHECK (Week 5):**
> 1. Drag element from tray → canvas → JSON updates → element renders at correct position
> 2. Undo/Redo works (Cmd+Z reverts, Cmd+Shift+Z restores)
> 3. Multi-select 10 elements → group drag → all positions update correctly
> 4. Zoom to 50% → drag element → mouse stays attached (zoom math correct)
> 5. 50 elements on canvas → Chrome DevTools Performance tab shows >55fps

### Week 5–7: Element Types & Content

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 1.24 | Text element — TipTap rich text, double-click to edit inline, paste sanitization, exit on click outside. Disable moveable while editing. | `src/components/elements/TextElement.tsx` | 1.16 |
| 1.25 | Image element — upload to Supabase Storage, URL input, drag-to-resize with aspect ratio lock, alt text | `src/components/elements/ImageElement.tsx` | 1.16, 1.8 |
| 1.26 | Button element — label, URL/page link, hover state preview, style variants (filled, outline, ghost) | `src/components/elements/ButtonElement.tsx` | 1.16 |
| 1.27 | Social Link element — paste URL → auto-detect platform (50+ presets) → icon + brand color + label | `src/components/elements/SocialLinkElement.tsx`, `src/lib/social-detect.ts`, `src/data/social-platforms.json` | 1.16 |
| 1.28 | Music Player element — paste URL → oEmbed auto-detect (Spotify, SoundCloud, Apple Music, YouTube Music, Bandcamp, Deezer) → iframe embed | `src/components/elements/MusicPlayerElement.tsx`, `src/lib/oembed.ts`, `src/app/api/assets/oembed/route.ts` | 1.16 |
| 1.29 | Video element — YouTube, Vimeo, TikTok URL → oEmbed iframe, autoplay/loop toggles | `src/components/elements/VideoElement.tsx` | 1.28 |
| 1.30 | Divider element — line, gradient, pattern, animated variants, customizable thickness/color | `src/components/elements/DividerElement.tsx` | 1.16 |
| 1.31 | Embed element — raw HTML/iframe input with preview, sanitized output | `src/components/elements/EmbedElement.tsx` | 1.16 |
| 1.32 | Gallery element — grid/masonry layout of images, column count, gap, lightbox on click | `src/components/elements/GalleryElement.tsx` | 1.25 |
| 1.33 | Countdown element — date picker → live countdown timer, customizable labels and format | `src/components/elements/CountdownElement.tsx` | 1.16 |
| 1.34 | Icon element — search Lucide icons (bundled), render as SVG, customizable color/size | `src/components/elements/IconElement.tsx` | 1.16 |
| 1.35 | Shape element — rectangle, circle, triangle, blob (blobshape), custom SVG input | `src/components/elements/ShapeElement.tsx` | 1.16 |

### Week 7–10: Properties Panel (A-Z Customization)

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 1.36 | Properties panel shell — collapsible sections, context-sensitive (shows only relevant sections for selected element type) | `src/components/editor/PropertiesPanel.tsx` | 1.5 |
| 1.37 | **Link Section** — URL, page, section, email, phone target. Open in new tab toggle. | `src/components/properties/LinkSection.tsx` | 1.36 |
| 1.38 | **Position Section** — type (relative/absolute/fixed/sticky), X/Y inputs, constraint controls | `src/components/properties/PositionSection.tsx` | 1.36 |
| 1.39 | **Size Section** — width/height (fixed/fill/fit/relative), min/max, aspect ratio lock | `src/components/properties/SizeSection.tsx` | 1.36 |
| 1.40 | **Layout Section** — type (stack/grid/free), direction, distribution, align, wrap, gap, padding (linked/individual sides), columns, rows, masonry | `src/components/properties/LayoutSection.tsx` | 1.36 |
| 1.41 | **Typography Section** — font family, size, weight, style, color, text-align, text-decoration, text-transform, line-height, letter-spacing, word-spacing, text-shadow, truncation, max-lines | `src/components/properties/TypographySection.tsx` | 1.36 |
| 1.42 | **Fill Section** — multi-layer fills (color, gradient, image, pattern, video), opacity per layer, blend modes, reorder layers | `src/components/properties/FillSection.tsx`, `src/components/ui/ColorPicker.tsx`, `src/components/ui/GradientPicker.tsx` | 1.36 |
| 1.43 | **Border Section** — per-side width (linked toggle), color, style, per-corner radius (linked toggle), px/% unit | `src/components/properties/BorderSection.tsx` | 1.36 |
| 1.44 | **Effects Section** — opacity slider, visible toggle, overflow (visible/hidden/scroll/auto), cursor picker, multi-shadow (drop/inner with X/Y/blur/spread/color), backdrop-filter (blur/saturate/brightness/contrast/hue) | `src/components/properties/EffectsSection.tsx` | 1.36 |
| 1.45 | **Overlays Section** — multi-layer overlays (color, gradient, noise, grain), opacity, blend modes | `src/components/properties/OverlaysSection.tsx` | 1.36 |
| 1.46 | **Transforms Section** — rotation, scaleX/Y, skewX/Y, translateX/Y, transform-origin, perspective, rotateX/Y (3D) | `src/components/properties/TransformsSection.tsx` | 1.36 |
| 1.47 | **Scroll Section** — scroll-snap-type, scroll-snap-align, parallax (speed/direction) | `src/components/properties/ScrollSection.tsx` | 1.36 |
| 1.48 | **Accessibility Section** — semantic tag (div/section/article/nav/header/footer/main/aside), ARIA role, aria-label, tabIndex, alt text | `src/components/properties/AccessibilitySection.tsx` | 1.36 |
| 1.49 | Shared UI primitives — Slider, Toggle, NumberInput, Select, Modal, Tabs, Tooltip | `src/components/ui/*.tsx` (7 files) | 1.1 |
| 1.50 | Auto-sort basics — stack (flexbox) and grid layout modes within Container elements | (integrated into LayoutSection + ContainerElement logic) | 1.40 |
| 1.51 | Toolbar — undo, redo, zoom slider, zoom %, hand tool, select tool, preview button, save indicator | `src/components/editor/Toolbar.tsx` | 1.5, 1.21 |

> **⛔ GATE CHECK (Week 10):**
> 1. Double-click text → TipTap opens → paste from Word → HTML sanitized → click outside → back to drag mode
> 2. Paste Spotify URL into Music Player → oEmbed resolves → player renders and plays audio
> 3. Upload 25MB image → client compresses → Supabase stores → renders on canvas
> 4. Change any property in Properties Panel → JSON updates → element visually updates immediately
> 5. Close browser → reopen → navigate to project → IndexedDB restores exact state
> 6. All 12 element types render correctly from JSON

---

## Phase 2: Themes, Assets & Multi-Page (Weeks 10–16)

> **Goal:** Theme engine with 20 themes, full asset library, multiple pages per project, responsive breakpoints.

### Week 10–12: Theme Engine

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 2.1 | Theme engine — CSS Custom Properties system, `[data-theme]` attribute swapping, theme → CSS token injection | `src/lib/theme-engine.ts` | Phase 1 |
| 2.2 | Create 20 curated theme JSON files with full token sets (colors, fonts, spacing, shadows, effects) | `src/data/themes/*.json` (20 files) | 2.1 |
| 2.3 | Theme CSS files — one per theme, defining all custom properties | `src/styles/themes/*.css` (20 files) | 2.2 |
| 2.4 | Light/Dark mode toggle per theme | (integrated into theme-engine.ts) | 2.1 |
| 2.5 | Theme switcher in Page settings panel | (integrated into PropertiesPanel page-level settings) | 2.1 |
| 2.6 | User custom themes — create from scratch or override any theme token | (integrated into theme-engine.ts, settings) | 2.1 |
| 2.7 | node-vibrant integration — upload image → extract dominant palette → suggest matching theme | `src/lib/color-utils.ts` (uses node-vibrant + chroma-js) | 2.1 |

**20 Themes List:** Neon Cyberpunk, Ghost, Minimal Light, Minimal Dark, Sunset, Luxury Gold, Ocean Deep, Forest, Pastel Dream, Brutalist, Retro Arcade, Monochrome, Vaporwave, Nordic, Terracotta, Electric Blue, Midnight, Rose Gold, Paper, Custom (user-created).

### Week 12–14: Asset Library

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 2.8 | Asset panel sidebar — tabbed interface (Icons, Colors, Gradients, Patterns, Shapes, Images, Fonts) | `src/components/editor/AssetPanel.tsx` | Phase 1 |
| 2.9 | 3-tier asset resolver — check bundled first → IndexedDB cache → API fetch | `src/lib/asset-resolver.ts` | 1.7 |
| 2.10 | Icon tab — search Lucide (bundled 1,500) + Iconify API (275k, proxied) + Simple Icons (3,200 brands). Click → adds Icon element to canvas. | (integrated into AssetPanel) | 2.8, 2.9 |
| 2.11 | Iconify API proxy route | `src/app/api/assets/icons/route.ts` | 2.10 |
| 2.12 | Color palette tab — 50 bundled palettes + live generation via chroma-js. Click color → applies to selected element's fill. | (integrated into AssetPanel) | 2.8 |
| 2.13 | Gradient picker — 180 bundled gradients + custom generator (angle, stops). Click → applies. | (integrated into AssetPanel, GradientPicker.tsx) | 2.8 |
| 2.14 | Pattern selector — 87 hero-patterns. Preview grid. Click → applies as fill. | (integrated into AssetPanel) | 2.8 |
| 2.15 | Image search — Pexels API (proxied via API route), search + pagination, click → adds Image element | `src/app/api/assets/images/route.ts` | 2.8 |
| 2.16 | Font picker — Google Fonts search, preview text, click → applies font-family to selected text element | `src/components/ui/FontPicker.tsx` | 2.8 |
| 2.17 | Bundled asset JSON files | `src/data/palettes.json`, `gradients.json`, `social-platforms.json`, `font-pairings.json` | 2.8 |

### Week 14–16: Multi-Page & Breakpoints

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 2.18 | Multi-page support — `pages[]` array in JSON, page CRUD (add/rename/delete/reorder), page navigation sidebar | `src/components/editor/PageList.tsx` | 1.4 |
| 2.19 | Breakpoint presets — Desktop (1440), Tablet (1024), Mobile (390), Custom (user input width×height) | `src/components/editor/BreakpointSwitcher.tsx` | 1.13 |
| 2.20 | Per-element responsive overrides — modify position/size/visibility/style per breakpoint, stored in `element.responsive` | (integrated into PropertiesPanel) | 2.19 |
| 2.21 | Cross-device preview — toggle breakpoints in editor, canvas width adjusts | (integrated into Canvas.tsx, BreakpointSwitcher) | 2.19 |
| 2.22 | Supabase cloud sync — periodic auto-sync (30s interval), manual save button, Last-Write-Wins by timestamp | `src/lib/sync.ts` | 1.7, 1.8 |
| 2.23 | Sync status indicator — 🟢 Saved / 🟡 Syncing / 🔴 Offline | (integrated into Toolbar.tsx) | 2.22 |
| 2.24 | Template preloads — 5 starter page templates (Music Artist, Photographer, Designer, Influencer, Business) | `src/data/templates/*.json` (5 files) | 2.18 |
| 2.25 | BroadcastChannel tab sync — sync project state between browser tabs | (integrated into sync.ts) | 2.22 |

> **⛔ GATE CHECK (Week 16):**
> 1. Switch theme → all elements visually update immediately via CSS Custom Properties
> 2. Search "mountain" in asset panel → Pexels returns results → click adds image to canvas
> 3. Create Page 2 → add elements → switch back to Page 1 → elements are preserved
> 4. Switch to Mobile breakpoint → override an element's position → switch back to Desktop → original position remains
> 5. Open two browser tabs → edit in Tab A → Tab B reflects changes within 2 seconds

---

## Phase 3: AI & Animation (Weeks 16–22)

> **Goal:** NLP layout generation, per-element animation system, auto-animate, scroll effects.

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 3.1 | GPT-4o API integration — system prompt with StakkedProject schema, JSON mode output, streaming responses | `src/app/api/ai/layout/route.ts` | Phase 2 |
| 3.2 | NLP → Layout generation — user describes page → GPT returns component-ID JSON array → Zustand assembles elements on canvas | (integrated into editor UI, project-store) | 3.1 |
| 3.3 | Zod validation schema — validates ALL GPT output before applying to Zustand. Rejects malformed JSON with user-friendly error. | `src/lib/ai-validation.ts` (uses Zod) | 3.1 |
| 3.4 | AI theme matching — user uploads image/assets → node-vibrant extracts palette → GPT suggests best theme + customizations | `src/app/api/ai/theme/route.ts` | 2.7, 3.1 |
| 3.5 | AI page summary — one-click: send current page JSON to GPT → returns markdown summary/description | `src/app/api/ai/summary/route.ts` | 3.1 |
| 3.6 | AI Layout Sequencer — analyzes current page, suggests reordering/grouping elements for better visual hierarchy | (integrated into ai/layout/route.ts) | 3.1 |
| 3.7 | AI Asset Suggestions — "Based on your music page, you might want: equalizer icon, waveform divider, vinyl shape..." | (integrated into AssetPanel) | 3.1 |
| 3.8 | **Animation Section** in Properties Panel — trigger (onLoad/onScroll/onHover/onClick/whileInView), type (15 presets), direction, duration, delay, easing, repeat, stagger | `src/components/properties/AnimationSection.tsx` | 1.36 |
| 3.9 | Animation preset engine — 15 built-in presets: fadeIn, fadeOut, slideIn, slideOut, scaleIn, scaleOut, rotateIn, bounceIn, flipIn, pulse, shake, glow, typewriter, blur, custom keyframes | `src/lib/animation-engine.ts` | 3.8 |
| 3.10 | Auto-animate CTA button — one-click applies tasteful entrance animation sequence to all visible elements with automatic stagger delays | (integrated into Toolbar.tsx) | 3.9 |
| 3.11 | Scroll-triggered animations — elements animate when they enter the viewport (Intersection Observer) | (integrated into PreviewRenderer) | 3.9 |
| 3.12 | Parallax effect — per-element or per-section speed multiplier on scroll | (integrated into ScrollSection.tsx, PreviewRenderer) | 3.8 |
| 3.13 | Scroll snap sections — page-level scroll-snap zones | (integrated into ScrollSection.tsx) | 3.8 |

> **⛔ GATE CHECK (Week 22):**
> 1. Type "dark music portfolio with album art grid and social links" → AI generates layout → elements appear on canvas
> 2. AI output that doesn't match schema → Zod rejects → user sees error message → editor doesn't crash
> 3. Set fadeIn animation on element → preview mode → element fades in on load
> 4. Click Auto-animate → all elements get staggered entrance animations
> 5. AI timeout (>30s) → AbortController cancels → skeleton loader shows → user can retry

---

## Phase 4: Export, Publishing & Community (Weeks 22–28)

> **Goal:** All export formats, page hosting, community pages gallery, GFX gallery.

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 4.1 | PNG export — html-to-image captures canvas as PNG, custom Google Fonts pre-loaded + 500ms delay after document.fonts.ready | `src/lib/export-image.ts` | Phase 3 |
| 4.2 | JPEG export — same as PNG with quality parameter | (integrated into export-image.ts) | 4.1 |
| 4.3 | PDF export API route — Puppeteer serverless renders the preview page to PDF | `src/app/api/export/pdf/route.ts` | Phase 3 |
| 4.4 | GIF export — html2canvas captures frames during animation playback → gif.js encodes | (integrated into export-image.ts, uses gif.js) | 4.1, 3.9 |
| 4.5 | HTML export — JSON → clean static HTML/CSS compiler. All assets inlined (CSS) or base64 (small images). Zero external dependencies. | `src/lib/export.ts` | Phase 3 |
| 4.6 | Page hosting — Publish button → API compiles JSON to HTML → stores in Supabase Storage → serves at `username.stakked.io/page-slug` | `src/app/api/publish/route.ts` | 4.5, 2.22 |
| 4.7 | Custom domain support — user adds CNAME record → Stakked validates → provisions SSL | (integrated into publish/route.ts, workspace settings) | 4.6 |
| 4.8 | Public/Private toggle — per-project visibility setting, stored in database | (integrated into project settings UI, project-store) | 2.22 |
| 4.9 | Community Pages gallery — server-rendered browse page with category filters, tag search, sort by popular/recent | `src/app/pages/page.tsx`, `src/components/community/PageCard.tsx`, `PageGrid.tsx` | 4.8 |
| 4.10 | Fork/Copy — click "Use This Template" on any public page → deep-clone JSON → assign new ID + userId → redirect to editor | `src/app/api/community/fork/route.ts`, `src/components/community/ForkButton.tsx` | 4.9 |
| 4.11 | GFX gallery — pre-made cards/graphics (card-sized projects) that users can fork | (integrated into /pages/ gallery with category filter for 'gfx') | 4.9 |
| 4.12 | Template preloads expansion — 10+ starter pages by profession | `src/data/templates/*.json` (5 more files) | 2.24 |
| 4.13 | Image CORS proxy — all external images proxied via API route to prevent tainted canvas on export | `src/app/api/assets/proxy/route.ts` | 4.1 |

> **⛔ GATE CHECK (Week 28):**
> 1. Export PNG with custom Google Font → font renders correctly in the image
> 2. Export HTML → open in browser → page looks identical to editor preview → works offline
> 3. Click Publish → page live at `username.stakked.io/slug` → loads in <2s
> 4. User A publishes public page → User B finds it in gallery → forks it → edits their copy → User A's original unchanged
> 5. Export GIF of animated page → animations play correctly in the GIF

---

## Phase 5: Workflow Builder, Offline & Advanced Elements (Weeks 28–34)

> **Goal:** Node-based workflow builder, full PWA offline mode, remaining 8 element types, 3D landing page, docs.

| # | Task | Files Created | Depends On |
|:---|:---|:---|:---|
| 5.1 | Workflow Builder — React Flow canvas, page nodes, logic nodes, edge connections | `src/components/workflow/WorkflowCanvas.tsx`, `PageNode.tsx`, `LogicNode.tsx` | Phase 4 |
| 5.2 | Logic nodes — conditional routing (if condition → page A, else → page B) | (integrated into workflow components) | 5.1 |
| 5.3 | Visual sitemap — bird's eye view of all pages + their relationships | (integrated into WorkflowCanvas) | 5.1 |
| 5.4 | Full offline mode — Service Worker (Workbox) caches app shell, IndexedDB stores all project data, works fully without internet | `public/sw.js`, Workbox config | 2.22 |
| 5.5 | Sync conflict resolution — Last-Write-Wins with timestamp + offline queue that replays on reconnect | (integrated into sync.ts) | 5.4, 2.22 |
| 5.6 | beforeunload + visibilitychange protection — warn user if closing with unsaved changes | (integrated into editor page) | 2.22 |
| 5.7 | Container/Frame element — groups child elements, its own layout (stack/grid/free), clipping | `src/components/elements/ContainerElement.tsx` | ✅ Done |
| 5.8 | Navigation/Menu element — header nav with links, mobile hamburger toggle, sticky option | `src/components/elements/NavigationElement.tsx` | ✅ Done |
| 5.9 | Form element — email capture, contact form, field types (text/email/textarea/checkbox), submit → Supabase | `src/components/elements/FormElement.tsx` | ✅ Done |
| 5.10 | Map element — Google Maps / Mapbox embed, lat/lng/zoom configuration | `src/components/elements/MapElement.tsx` | ✅ Done |
| 5.11 | Testimonial/Quote element — styled quote block with avatar, author, role | `src/components/elements/TestimonialElement.tsx` | ✅ Done |
| 5.12 | Marquee/Ticker element — scrolling text/image strip, speed/direction controls | `src/components/elements/MarqueeElement.tsx` | ✅ Done |
| 5.13 | Accordion/FAQ element — expandable sections with smooth Framer Motion animation | `src/components/elements/AccordionElement.tsx` | ✅ Done |
| 5.14 | Tabs element — tabbed content containers, customizable tab bar | `src/components/elements/TabsElement.tsx` | ✅ Done |
| 5.15 | 3D animated landing page — React Three Fiber hero, interactive model, scroll-triggered camera | `src/app/page.tsx`, `src/components/landing/Hero3D.tsx` | ⚠️ Pending |
| 5.16 | Documentation pages | `src/app/docs/page.tsx` + subpages | ✅ Done |
| 5.17 | Features showcase page | `src/app/features/page.tsx` | ✅ Done |
| 5.18 | Workspace dashboard — projects grid, asset manager, create/import/delete projects | `src/app/workspace/page.tsx` | ⚠️ Pending |
| 5.19 | User settings page — profile, preferences, connected services, theme preference | `src/app/workspace/settings/page.tsx` | ⚠️ Pending |
| 5.20 | Light/Dark mode for marketing site | (integrated into layout.tsx, ThemeToggle.tsx) | ✅ Done |
| 5.21 | PWA manifest + install prompt | `public/manifest.json` | ✅ Done |

---

## Phase 6: Adv. Animation & Interactivity (Weeks 34-40)

| # | Task | Files Created | Status |
|:---|:---|:---|:---|
| 6.1 | **Advanced Presets** — reveal, parachute, perspectiveFlip, tilt | `src/lib/animation-engine.ts` | ✅ Done |
| 6.2 | **Parallax System** — useTransform scroll mapping | `src/hooks/useParallax.ts` | ✅ Done |
| 6.3 | **Page Transitions** — AnimatePresence orchestration | `src/components/editor/Canvas.tsx` | ✅ Done |
| 6.4 | **Unified Interactivity** — behaviors / actions system | `src/hooks/useInteractivity.ts` | ✅ Done |
| 6.5 | **Page Inspector** — canvas dimensions + page transitions | `src/components/properties/PageSection.tsx` | ✅ Done |
| 6.6 | **Animation UI v2** — Visual preset grid + vector arrows | `src/components/properties/AnimationSection.tsx` | ✅ Done |

> **⛔ GATE CHECK (Week 34):**
> 1. Open Workflow Builder → see all pages as nodes → connect with edges → logic routes work in preview
> 2. Turn off Wi-Fi → create new project → add elements → turn Wi-Fi on → auto-syncs to Supabase
> 3. Accordion element → click header → content expands with smooth animation
> 4. Landing page → 3D hero loads → scroll animations trigger → Lighthouse score >90 (Performance)
> 5. Workspace → see all projects → create new from template → fork a public page → delete a project

---

## Full Element Type Summary (20 Total)

| # | Element | Phase | Core Use Case |
|:---|:---|:---|:---|
| 1 | Text | 1 | Artist name, bio, lyrics, headings |
| 2 | Image | 1 | Album art, portfolio pieces, photos |
| 3 | Button | 1 | "Listen Now", "Book Me", CTAs |
| 4 | Social Link | 1 | Link-in-bio replacement (50+ platforms) |
| 5 | Music Player | 1 | Spotify/SoundCloud/Apple embeds |
| 6 | Video | 1 | YouTube/Vimeo/TikTok embeds |
| 7 | Divider | 1 | Section breaks, visual separators |
| 8 | Embed | 1 | Custom HTML/iframe widgets |
| 9 | Gallery | 1 | Image grid/masonry portfolio |
| 10 | Countdown | 1 | Album drops, event timers |
| 11 | Icon | 1 | Decorative, functional icons |
| 12 | Shape | 1 | Rectangles, circles, blobs, custom SVG |
| 13 | Container | 5 | Groups children with own layout |
| 14 | Navigation | 5 | Header nav + mobile hamburger |
| 15 | Form | 5 | Email capture, contact forms |
| 16 | Map | 5 | Event locations |
| 17 | Testimonial | 5 | Press quotes, reviews |
| 18 | Marquee | 5 | Scrolling announcement bars |
| 19 | Accordion | 5 | FAQ, expandable sections |
| 20 | Tabs | 5 | Tabbed content (discography etc.) |
