# Stakked — Development Prompts

> **Copy-paste prompts for each phase and feature. Each prompt is self-contained with all context needed.**

---

## How to Use This Document

1. **Before ANY phase or feature prompt**, paste the **System Context Prompt** (Section 1) first
2. Then paste the specific **Phase Prompt** or **Feature Prompt** from the relevant section
3. Wait for acknowledgment before asking for code generation
4. After code is generated, run the relevant edge case checklist from `04_EDGE_CASES.md`

---

## 1. System Context Prompt (Paste This FIRST, Every Time)

> **Copy everything in the code block below and paste it at the start of every new session.**

```text
SYSTEM CONTEXT — STAKKED

You are building Stakked, a Next.js 15 visual website/GFX builder for artists. Here are the absolute rules:

PROJECT:
- Single Next.js 15 app (App Router, TypeScript strict, src/ directory). NO monorepo.
- Deploy target: Vercel. Database: Supabase (PostgreSQL + Auth + Storage).
- Styling: CSS Modules + CSS Custom Properties. NO Tailwind.

STATE MANAGEMENT:
- Zustand + Immer for project state. Three stores:
  1. projectStore (Immer): The document JSON (StakkedProject). Persisted to IndexedDB + Supabase. Has history stack (50 entries) for undo/redo.
  2. editorStore (plain): Transient state — selection, zoom, pan, isDragging, tool. NOT persisted.
  3. uiStore (plain): UI chrome — panel visibility, tabs. Persisted to localStorage.

PERFORMANCE RULES (NON-NEGOTIABLE):
1. Use Zustand SELECTORS only: useStore(state => state.elements[id]). NEVER subscribe to entire store.
2. Wrap CanvasElement in React.memo with custom equality comparator.
3. Canvas pan/zoom uses REFS + direct CSS transform manipulation. NEVER put pan/zoom in React state.
4. Auto-save debounced at 1000ms.
5. Dynamic imports (next/dynamic with ssr:false) for: TipTap, React Three Fiber, html-to-image, gif.js, Lottie, React Flow, chroma-js.
6. Undo commits ONLY on drag END. Transient moves during drag update position without creating history entries.
7. History stack capped at 50 entries. On commit: push to history, shift oldest if > 50, clear redo stack.

GOLDEN RULE:
If it's not in the StakkedProject JSON, it doesn't exist. ALL canvas interactions must mutate the JSON document via Zustand, not manipulate the DOM directly. The JSON is rendered → the user sees the result. Never the reverse.

CLIENT VS SERVER COMPONENTS:
- /editor/* — MUST be 'use client' entirely
- /workspace/ — Server Component with client islands for actions
- /pages/ (gallery), /docs/, /features/, / (landing) — Server Components for SEO
- /preview/[id]/ — Server fetch JSON, pass to client PreviewRenderer
- /api/* — Server route handlers only

ELEMENT TYPES (20 total):
Phase 1 (12): text, image, button, social-link, music-player, video, divider, embed, gallery, countdown, icon, shape
Phase 5 (8): container, navigation, form, map, testimonial, marquee, accordion, tabs

When generating code:
- Include ALL imports
- Include ALL TypeScript types
- Use CSS Modules (not inline styles) for persistent styling
- Use Framer Motion for UI animations
- Handle errors with try/catch and user-facing error states
- Use 'use client' directive only where required
- All external API calls go through /api/* routes, never client-side
- run tsc --noEmit and npm run build to catch errors and fix them
```

---

## 2. Phase 1 Prompts (Foundation & Canvas — Weeks 1–10)

### Prompt 1.1: Project Scaffolding

```text
PHASE 1 — TASK: Project Scaffolding

Initialize the Stakked Next.js 15 project with the following:

1. Create a Next.js 15 App Router project with TypeScript strict mode and src/ directory
2. Install these exact dependencies:
   - Core: zustand, immer, uuid
   - Canvas: @moveable/react (react-moveable), react-selecto
   - DnD: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
   - Text: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-text-style, @tiptap/extension-color
   - Animation: framer-motion, lottie-react
   - Icons: lucide-react
   - DB: idb, @supabase/supabase-js
   - Utils: zod, chroma-js, date-fns
   - Dev: @types/chroma-js

3. Create the directory structure under src/:
   - app/ (with routes: editor/[projectId], preview/[projectId], workspace, auth/login, auth/signup, auth/callback, api/*)
   - components/ (editor, elements, properties, ui, workspace, community, preview, workflow, landing)
   - stores/ (project-store.ts, editor-store.ts, ui-store.ts)
   - lib/ (db.ts, supabase.ts, keyboard.ts, oembed.ts, social-detect.ts, theme-engine.ts, asset-resolver.ts, color-utils.ts, sync.ts, export.ts, export-image.ts)
   - types/ (project.ts, element.ts, style.ts, animation.ts, theme.ts, assets.ts)
   - data/ (themes/, templates/, palettes.json, gradients.json, social-platforms.json, font-pairings.json)
   - styles/ (globals.css, editor.module.css, themes/)

4. Create globals.css with:
   - CSS reset (box-sizing, margin, padding)
   - CSS Custom Properties for the editor dark theme: --editor-bg, --editor-surface, --editor-border, --editor-text, --editor-text-muted, --editor-accent, --editor-accent-hover
   - Google Fonts import for Inter (body) and Space Grotesk (headings)
   - Base typography and color variables

5. Create .env.local template with placeholders for:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY
   - PEXELS_API_KEY

Only create the scaffolding, empty placeholder files with correct export signatures, and the CSS. Do NOT implement business logic yet.

Deliverable: I should be able to run `npm run dev` and see an empty page at localhost:3000 with the dark theme background.
```

### Prompt 1.2: TypeScript Type Definitions

```text
PHASE 1 — TASK: TypeScript Type Definitions

Create the complete TypeScript type system for Stakked. These types are the contract that every component, store, and API route must follow.

Files to create:

1. src/types/project.ts — StakkedProject, StakkedPage, CanvasSettings, ProjectSettings, Background (union type)
2. src/types/element.ts — StakkedElement, ElementType (union of 20 strings), ElementContent (discriminated union with all 20 content types)
3. src/types/style.ts — StakkedElementFullStyle with ALL sections:
   - link (to, target, type)
   - position (type, x, y, constraints)
   - size (width, height, widthMode, heightMode, min/max, aspectRatio)
   - layout (type, direction, distribution, align, wrap, gap, padding with linked toggle, columns, rows, masonry)
   - typography (fontFamily, fontSize, fontWeight, fontStyle, color, textAlign, textDecoration, textTransform, lineHeight, letterSpacing, wordSpacing, textShadow, truncate, maxLines)
   - fills (array of: id, type, value, opacity, blendMode, fit, position, patternScale, patternColor)
   - border (per-side width with linked toggle, color, style)
   - borderRadius (per-corner with linked toggle, px/% unit)
   - effects (opacity, visible, overflow, cursor, shadows array, backdropFilter)
   - overlays (array of: id, type, value, opacity, blendMode)
   - transform (rotation, scaleX/Y, skewX/Y, translateX/Y, origin, perspective, rotateX/Y)
   - scrollSection (enabled, snapType, snapAlign)
   - parallax (enabled, speed, direction)
   - accessibility (tag, role, ariaLabel, tabIndex, alt)
   - responsive (tablet, mobile, custom overrides as Partial<Style>)
   - locked, lockedProperties
4. src/types/animation.ts — Animation interface (id, trigger, type, direction, duration, delay, easing, repeat, stagger, keyframes)
5. src/types/theme.ts — ThemeTokens (colors, fonts, spacing, shadows, effects for light and dark)
6. src/types/assets.ts — AssetSearchResult, AssetSource, CachedAsset

Also create a default factory function defaultElement(type: ElementType): StakkedElement that returns a properly typed element with sensible defaults for each type.

Every field must have a JSDoc comment explaining what it controls.
```

### Prompt 1.3: Zustand Stores

```text
PHASE 1 — TASK: Zustand Stores

Create three Zustand stores:

1. src/stores/project-store.ts (with Immer middleware):
   - State: project (StakkedProject | null), activePageIndex, history (StakkedProject[]), future (StakkedProject[]), lastSavedAt, isDirty
   - Actions:
     - loadProject(project: StakkedProject)
     - createProject(title: string, template?: string): StakkedProject
     - addElement(pageIndex: number, element: StakkedElement) — commits to history
     - removeElement(pageIndex: number, elementId: string) — commits to history
     - updateElement(pageIndex: number, elementId: string, updates: Partial<StakkedElement>) — commits to history
     - moveElementTransient(pageIndex: number, elementId: string, x: number, y: number) — NO history commit (used during drag)
     - commitElementMove(pageIndex: number, elementId: string, x: number, y: number) — commits to history (used on dragEnd)
     - resizeElementTransient / commitElementResize — same pattern
     - updateElementStyle(pageIndex: number, elementId: string, style: Partial<StakkedElementFullStyle>) — commits with 300ms debounce for sliders
     - undo() — pops history, pushes current to future
     - redo() — pops future, pushes current to history
     - addPage / removePage / reorderPages
     - setActivePageIndex
   - History logic: Cap at 50. On commit: push current snapshot, shift oldest if > 50, clear future. On undo: push current to future, pop history. Block undo if editor.isDragging.

2. src/stores/editor-store.ts (plain Zustand, no Immer):
   - State: selectedElementIds (string[]), zoom (number, default 1), pan ({x, y}), activeTool ('select' | 'hand' | 'text'), isDragging, isResizing, isEditingText, clipboard (StakkedElement[]), snapGuides ({x: number[], y: number[]})
   - Actions: setSelection, addToSelection, clearSelection, setZoom, setPan, setTool, etc.

3. src/stores/ui-store.ts (plain Zustand):
   - State: leftPanelOpen, rightPanelOpen, leftPanelTab ('elements' | 'layers' | 'pages' | 'assets'), rightPanelTab ('design' | 'style' | 'animate'), previewMode, darkMode
   - Persist to localStorage using Zustand persist middleware

CRITICAL: Include the custom equality selector pattern for CanvasElement:
const element = useProjectStore(
  state => state.project?.pages[state.activePageIndex]?.elements.find(e => e.id === id),
  (prev, next) => prev?.id === next?.id && prev?.position.x === next?.position.x && ...
);
```

### Prompt 1.4: IndexedDB Auto-Save

```text
PHASE 1 — TASK: IndexedDB Auto-Save

Create src/lib/db.ts using the `idb` library:

1. Database schema: stakked-db, version 1
   - Object store: projects (keyPath: id)
   - Object store: asset-cache (keyPath: url, with index on lastAccessed for LRU eviction)

2. Functions:
   - saveProject(project: StakkedProject): Promise<void> — saves full project JSON
   - loadProject(projectId: string): Promise<StakkedProject | undefined> — loads by ID
   - listProjects(): Promise<StakkedProject[]> — returns all saved projects
   - deleteProject(projectId: string): Promise<void>
   - cacheAsset(url: string, data: Blob): Promise<void> — with 50MB total cap
   - getCachedAsset(url: string): Promise<Blob | undefined> — updates lastAccessed
   - evictLRUAssets(targetBytes: number): Promise<void> — deletes oldest until under cap
   - getStorageEstimate(): Promise<{used: number, quota: number}> — wraps navigator.storage.estimate()

3. Auto-save hook: useAutoSave()
   - Subscribe to projectStore changes
   - Debounce saves at 1000ms after last change
   - Catch QuotaExceededError and show user-facing modal
   - Update lastSavedAt in project store

4. Error handling:
   - Wrap all IDB operations in try/catch
   - On read failure: log error, return undefined (caller falls back to Supabase)
   - On write failure: if QuotaExceeded, call evictLRUAssets then retry once
```

### Prompt 1.5: Canvas Container

```text
PHASE 1 — TASK: Canvas Container

Create src/components/editor/Canvas.tsx — the main canvas component:

1. Three layers:
   - Background layer: renders the canvas background (color/gradient/image/pattern)
   - Elements layer: renders all CanvasElements for the active page
   - Guides layer: SVG overlay for snap guides (rendered above elements)

2. Pan & Zoom (PERFORMANCE CRITICAL):
   - Use useRef for panX, panY, zoom — NOT React state
   - On mousewheel: update zoomRef, apply CSS transform directly to canvas container ref
   - On middle-mouse-drag or spacebar+drag: update panRefs, apply CSS transform
   - CSS transform: `translate(${panX}px, ${panY}px) scale(${zoom})`
   - No React re-renders during pan/zoom — only ref + style mutation

3. Grid overlay:
   - CSS background with repeating linear-gradient for grid lines
   - Grid spacing scales with zoom level
   - Toggle-able via toolbar

4. Click handling:
   - Click on empty canvas: clear selection (editorStore.clearSelection)
   - Click on element: select it (route through CanvasElement click handler)
   - Marquee selection: react-selecto integration for drag-to-select

5. Drop zone:
   - Accept drops from dnd-kit ElementTray
   - Calculate correct canvas position from drop event: canvasX = (dropX - canvasRect.left - panX) / zoom

6. Rulers:
   - Horizontal and vertical rulers along edges
   - Numbers scale with zoom

This component MUST be 'use client'. It renders inside /app/editor/[projectId]/page.tsx.
```

### Prompt 1.6: CanvasElement Wrapper

```text
PHASE 1 — TASK: CanvasElement Wrapper

Create src/components/editor/CanvasElement.tsx — wraps every element on the canvas with react-moveable:

1. Rendering:
   - Reads element data from Zustand via selector: useProjectStore(state => findElement(state, elementId))
   - Wrapped in React.memo with custom comparator that checks: id, position.x, position.y, size.width, size.height, rotation, zIndex, locked, visible, style (reference equality via Immer)
   - Renders the correct element component based on element.type (TextElement, ImageElement, etc.)
   - Applies element styles to a wrapper div (position absolute, transform for rotation, CSS properties from style object)

2. react-moveable integration:
   - Draggable, Resizable, Rotatable
   - On drag start: set editorStore.isDragging = true
   - On drag: call projectStore.moveElementTransient (NO history)
   - On drag end: call projectStore.commitElementMove, set isDragging = false
   - Same pattern for resize
   - Snap to grid (5px) and snap to other element edges/centers
   - Minimum dimensions per type: text=50x20, image=20x20, button=60x30, default=10x10
   - When element.locked === true: disable draggable, resizable, rotatable
   - When editorStore.isEditingText === true and this is the editing element: disable draggable

3. Selection:
   - On click: editorStore.setSelection([elementId])
   - On Shift+click: editorStore.addToSelection(elementId)
   - Selected elements show blue bounding box + handles

4. Zoom compensation:
   - ALL moveable calculations must account for current zoom:
     delta.x / zoom, delta.y / zoom for drag
     Math.max(minWidth, width) for resize after zoom division
```

### Prompt 1.7: Element Renderers (12 Core Elements)

```text
PHASE 1 — TASK: Element Renderers

Create 12 element renderer components in src/components/elements/:

Each component receives: { element: StakkedElement, isSelected: boolean, isEditing: boolean }

1. TextElement.tsx — Renders element.content.html. On double-click: dynamically import TipTap, enter edit mode. On click outside: save TipTap content to element.content.html, exit edit mode. Configure transformPastedHTML to strip ALL style/class/script attributes.

2. ImageElement.tsx — Renders <img> from element.content.src. Supports upload to Supabase Storage (compress to WebP, max 2MB). Shows broken-image placeholder on error. Uses element.content.objectFit for CSS object-fit.

3. ButtonElement.tsx — Renders styled button with element.content.label. Variants: filled, outline, ghost. In editor: click selects (no navigation). In preview: navigates to element.content.url.

4. SocialLinkElement.tsx — Uses src/lib/social-detect.ts to identify platform from URL. Renders platform icon (Simple Icons) + brand color. Display modes: icon-only, icon+text, text-only.

5. MusicPlayerElement.tsx — Paste URL → call /api/assets/oembed → render iframe. Transparent overlay in edit mode to prevent focus stealing. Skeleton loader while loading. Error state for invalid URLs.

6. VideoElement.tsx — Same oEmbed pattern as MusicPlayer. Autoplay/loop toggles. Transparent overlay in edit mode.

7. DividerElement.tsx — Horizontal line with variants: solid, dashed, dotted, gradient, pattern. Customizable thickness and color.

8. EmbedElement.tsx — Renders element.content.html inside a sandboxed iframe (srcdoc). Preview of embedded content. Warning about potential security risks.

9. GalleryElement.tsx — Renders image grid. Layout options: grid, masonry. Configurable columns and gap. Lightbox on click (in preview).

10. CountdownElement.tsx — Live countdown timer to element.content.targetDate. Format options: days/hours/minutes/seconds. Custom label. Shows "Expired" when past.

11. IconElement.tsx — Renders Lucide icon by name. Customizable color and size. Search functionality for icon selection (in properties panel).

12. ShapeElement.tsx — Variants: rectangle, circle, triangle, blob (uses blobshape npm). Custom fill color. SVG-based rendering.

CRITICAL: Every element must have sensible default styles. Every element must handle the case where content is missing/malformed gracefully (show placeholder, not crash).
```

### Prompt 1.8: Properties Panel (All 13 Sections)

```text
PHASE 1 — TASK: Properties Panel

Create src/components/editor/PropertiesPanel.tsx and 13 section components in src/components/properties/:

PropertiesPanel.tsx:
- Shows when an element is selected (reads from editorStore.selectedElementIds)
- Context-sensitive: shows only relevant sections based on element.type
- All sections collapsible with smooth Framer Motion animation
- "No selection" state when nothing is selected
- Multi-select state: only shows shared properties

Section components (each reads element from Zustand selector, writes via updateElementStyle):

1. LinkSection.tsx — URL input, type select (url/page/section/email/phone), target toggle (_self/_blank)
2. PositionSection.tsx — Position type dropdown, X/Y number inputs
3. SizeSection.tsx — Width/Height with mode selects (fixed/fill/fit/relative), min/max expanders, aspect ratio lock toggle
4. LayoutSection.tsx — Only for container-type elements. Stack/Grid/Free buttons. Direction, distribution, alignment, wrap, gap (row/column), padding (4 inputs with linked toggle), columns/rows for grid
5. TypographySection.tsx — Only for text/button. Font family select (search), font size, weight selector (100-900), italic toggle, color picker, alignment buttons, decoration, transform, line-height, letter-spacing, word-spacing, text-shadow, truncate toggle, max-lines
6. FillSection.tsx — Multi-layer fill list (add/remove/reorder). Each fill: type select (color/gradient/image/pattern/video), value input (ColorPicker for color, GradientPicker for gradient, URL for image), opacity slider, blend mode dropdown
7. BorderSection.tsx — Width inputs (4 sides, linked toggle), color picker, style dropdown (solid/dashed/dotted/double/none). Separate radius section: 4 corners, linked toggle, px/% unit toggle
8. EffectsSection.tsx — Opacity slider (0-1), visible toggle, overflow select, cursor select. Shadows sub-section: add/remove multiple, type (drop/inner), X/Y/blur/spread/color. Backdrop filter sub-section: blur/saturate/brightness/contrast/hue sliders
9. OverlaysSection.tsx — Multi-layer overlay list. Each: type (color/gradient/noise/grain), value, opacity slider, blend mode
10. TransformsSection.tsx — Rotation dial/input, scaleX/Y sliders, skewX/Y sliders, translateX/Y inputs, transform-origin select, perspective input, rotateX/Y for 3D
11. AnimationSection.tsx — Will be fully implemented in Phase 3. For now: placeholder "Coming in Phase 3"
12. ScrollSection.tsx — Will be fully implemented in Phase 3. For now: placeholder
13. AccessibilitySection.tsx — Semantic tag dropdown, ARIA role input, aria-label input, tabIndex input, alt text input (for images)

Shared UI primitives needed (create in src/components/ui/):
- ColorPicker.tsx — HSL/HEX/RGB, eyedropper, opacity slider, recent colors, theme colors
- GradientPicker.tsx — Angle control, add/remove color stops, preset gradients
- FontPicker.tsx — Searchable list, preview text, grouped by category
- Slider.tsx — Value label, min/max, step, optional number input alongside
- Toggle.tsx — Boolean on/off with label
- NumberInput.tsx — Increment/decrement buttons, min/max constraints, unit label
- Select.tsx — Searchable dropdown with icons
- Modal.tsx — Portal-based, ESC to close, click-outside to close
- Tabs.tsx — Tab bar with active indicator
- Tooltip.tsx — Hover tooltip with delay
```

### Prompt 1.9: Keyboard Shortcuts & Toolbar

```
PHASE 1 — TASK: Keyboard Shortcuts & Toolbar

Create two components:

1. src/lib/keyboard.ts — Global keyboard shortcut handler
   - Cmd/Ctrl+Z: undo (blocked if isDragging or isEditingText)
   - Cmd/Ctrl+Shift+Z: redo (blocked if isDragging or isEditingText)
   - Cmd/Ctrl+S: manual save (prevent default browser save)
   - Cmd/Ctrl+D: duplicate selected elements (offset +20px +20px)
   - Cmd/Ctrl+C: copy selected to clipboard (editor clipboard, not OS)
   - Cmd/Ctrl+V: paste from clipboard (offset +20px)
   - Cmd/Ctrl+A: select all elements on active page
   - Delete/Backspace: delete selected elements (NOT when isEditingText — TipTap handles that)
   - Escape: clear selection, exit edit mode, close modals
   - Space (hold): switch to hand tool for panning
   - Cmd/Ctrl+0: reset zoom to 100%
   - Cmd/Ctrl++: zoom in by 10%
   - Cmd/Ctrl+-: zoom out by 10%
   - Arrow keys: nudge selected elements by 1px (10px with Shift held)

   CRITICAL: When TipTap has focus (isEditingText === true), ALL shortcuts except Escape must be passed through to TipTap, not intercepted by the editor.

   Implementation: useEffect on document.addEventListener('keydown'), cleanup on unmount.

2. src/components/editor/Toolbar.tsx
   - Left: Select tool, Hand tool
   - Center: Undo, Redo, Zoom slider + percentage label, Fit to Page
   - Right: Preview button (opens /preview/[id] in new tab), Save indicator (🟢 Saved / 🟡 Saving / 🔴 Error), Theme toggle
```

### Prompt 1.10: Editor Page Layout

```
PHASE 1 — TASK: Editor Page Layout

Create src/app/editor/[projectId]/page.tsx:

This is the main editor page that assembles all components:

1. 'use client' directive at top
2. On mount: load project from IndexedDB first (fast), then fetch latest from Supabase (if online).
   - If IndexedDB has newer timestamp, use local version
   - If Supabase has newer timestamp, use cloud version
   - If both missing, create new empty project with one blank page

3. Layout (CSS Grid or Flexbox):
   - Top: Toolbar (fixed, full width)
   - Left: ElementTray / LayerList / PageList / AssetPanel (switchable via tabs)
   - Center: Canvas (fills remaining space)
   - Right: PropertiesPanel (collapsible)

4. Initialize:
   - Keyboard shortcut listener
   - Auto-save hook
   - BroadcastChannel listener (for multi-tab sync)
   - beforeunload listener (warn on unsaved changes)

5. Responsive behavior:
   - < 1400px viewport: auto-collapse left panel
   - < 1200px viewport: auto-collapse both panels (toggle buttons available)

Deliverable: Full editor chrome visible with all panels. Canvas shows empty page. User can drag from tray, position elements, edit properties, undo/redo, and auto-save.
```

---

## 3. Phase 2 Prompts (Themes, Assets & Multi-Page — Weeks 10–16)

### Prompt 2.1: Theme Engine

```
PHASE 2 — TASK: Theme Engine

Create src/lib/theme-engine.ts and 20 theme files:

1. Theme engine:
   - loadTheme(themeId: string): void — injects CSS Custom Properties onto :root or [data-theme]
   - getThemeTokens(themeId: string): ThemeTokens — returns the raw token object
   - toggleDarkMode(themeId: string): void — swaps between light and dark token sets
   - createCustomTheme(base: string, overrides: Partial<ThemeTokens>): ThemeTokens
   - extractPaletteFromImage(imageUrl: string): Promise<string[]> — uses node-vibrant to extract 5 dominant colors

2. Theme token structure (per theme):
   - Colors: primary, secondary, accent, background, surface, border, text, textMuted (light + dark variants)
   - Fonts: heading (family + weight), body (family + weight), mono (family + weight)
   - Spacing: xs, sm, md, lg, xl, 2xl
   - Shadows: sm, md, lg, glow
   - Radius: sm, md, lg, full

3. Create 20 theme JSON files in src/data/themes/:
   Neon Cyberpunk, Ghost, Minimal Light, Minimal Dark, Sunset, Luxury Gold, Ocean Deep, Forest, Pastel Dream, Brutalist, Retro Arcade, Monochrome, Vaporwave, Nordic, Terracotta, Electric Blue, Midnight, Rose Gold, Paper, Earthtone

4. Create corresponding CSS files in src/styles/themes/ (one per theme)

Theme behavior in the editor:
- Switching theme changes CSS Custom Properties used by theme-aware elements
- Elements with explicit (user-set) colors are NOT affected by theme changes
- Only elements using theme token references (var(--primary), var(--bg), etc.) respond to theme switches
```

### Prompt 2.2: Asset Panel & API Routes

```
PHASE 2 — TASK: Asset Panel & API Routes

Create the asset browsing system:

1. src/components/editor/AssetPanel.tsx
   - Tabbed interface: Icons | Colors | Gradients | Patterns | Shapes | Images | Fonts
   - Search bar at top (filters current tab)
   - Grid view with previews
   - Click to add to canvas (creates appropriate element type) or apply to selected element

2. src/lib/asset-resolver.ts — 3-tier resolution:
   - checkBundled(query, type) → returns from src/data/ JSON files
   - checkCache(query, type) → returns from IndexedDB asset-cache store
   - fetchExternal(query, type) → calls /api/assets/* routes

3. API Routes (all server-side, keys in env vars):
   - src/app/api/assets/images/route.ts — Proxies Pexels API. Params: query, page, per_page. Returns: {images: [{url, thumb, alt, photographer}]}
   - src/app/api/assets/icons/route.ts — Proxies Iconify API. Params: query, prefix. Returns: {icons: [{name, svg, set}]}
   - src/app/api/assets/oembed/route.ts — Universal oEmbed resolver. Params: url. Tries oEmbed discovery first, then platform-specific regex. Returns: {html, provider, title, thumbnail}
   - src/app/api/assets/proxy/route.ts — Image proxy for CORS. Params: url. Validates it's an image content-type. Returns the image with proper CORS headers + caching.

4. Bundled data files:
   - src/data/palettes.json — 50 curated color palettes (5-7 colors each), categorized
   - src/data/gradients.json — 180+ CSS gradients with names and preview colors
   - src/data/social-platforms.json — 50+ platforms with: name, domain regex, brandColor, iconName (Simple Icons)
   - src/data/font-pairings.json — 20 heading+body font combinations with preview text

CRITICAL: Never expose API keys to the client. All external calls go through API routes.
```

### Prompt 2.3: Multi-Page & Breakpoints

```
PHASE 2 — TASK: Multi-Page & Breakpoints

1. src/components/editor/PageList.tsx
   - Shows all pages in the project
   - Add page button (creates new blank page with auto-generated slug)
   - Drag to reorder pages (dnd-kit/sortable)
   - Right-click context menu: Rename, Duplicate, Delete
   - Cannot delete last remaining page
   - Click page to switch active page (updates activePageIndex in project store)

2. src/components/editor/BreakpointSwitcher.tsx
   - Preset buttons: Desktop (1440), Tablet (1024), Mobile (390)
   - Custom input: width × height number inputs
   - Switching breakpoint resizes the canvas width
   - When on non-desktop breakpoint: show override indicators on properties that have responsive overrides

3. Responsive override logic:
   - When editing on tablet/mobile breakpoint: property changes are stored in element.responsive.tablet or element.responsive.mobile as Partial<StakkedElementFullStyle>
   - When rendering: merge base style with active breakpoint overrides (breakpoint overrides win)
   - "Clear override" button per property to revert to base value
   - Visual indicator (dot) on properties that have an override for current breakpoint

4. src/lib/sync.ts — Supabase cloud sync:
   - syncToCloud(project: StakkedProject): Promise<void> — upserts to Supabase
   - fetchFromCloud(projectId: string): Promise<StakkedProject | null>
   - Auto-sync every 30 seconds if online + dirty
   - Manual save button triggers immediate sync
   - On conflict: Last-Write-Wins by updatedAt timestamp
   - BroadcastChannel for multi-tab local sync
   - Online/offline detection via navigator.onLine + online/offline events
```

---

## 4. Phase 3 Prompts (AI & Animation — Weeks 16–22)

### Prompt 3.1: AI Integration (GPT-4o)

```
PHASE 3 — TASK: AI Layout Generation & Intelligence

Create the AI integration layer:

1. src/app/api/ai/layout/route.ts
   - Accepts: { prompt: string, category?: string, existingElements?: StakkedElement[] }
   - System prompt includes: the StakkedElement type definition, list of valid element types, example layouts, constraints (max 50 elements)
   - Uses OpenAI Structured Outputs (response_format: { type: "json_schema" }) to force schema compliance
   - Returns: { elements: StakkedElement[], theme?: string }
   - Streaming response for progress indication
   - 30-second timeout with AbortController

2. src/app/api/ai/summary/route.ts
   - Accepts: { elements: StakkedElement[], pageTitle: string }
   - Returns: { summary: string } — markdown description of the page

3. src/app/api/ai/theme/route.ts
   - Accepts: { palette: string[], category?: string }
   - Returns: { themeName: string, tokens: Partial<ThemeTokens>, reasoning: string }

4. src/lib/ai-validation.ts
   - Zod schemas that mirror every StakkedElement type
   - validateAIResponse(response: unknown): { success: boolean, data?: StakkedElement[], error?: string }
   - On validation failure: return user-friendly error message, log raw response for debugging
   - NEVER apply unvalidated AI output to Zustand

5. UI integration:
   - "Generate with AI" button in toolbar opens modal
   - Text input for natural language prompt
   - Skeleton loader on canvas while generating
   - Generated elements appear on canvas with "Accept" / "Regenerate" / "Cancel" buttons
   - If AI is unavailable (key missing, API down, timeout): graceful fallback, all manual features still work
```

### Prompt 3.2: Animation System

```
PHASE 3 — TASK: Per-Element Animation System

1. src/components/properties/AnimationSection.tsx (replace Phase 1 placeholder):
   - Trigger select: onLoad, onScroll, onHover, onClick, whileInView
   - Animation type preset grid (15 presets): fadeIn, fadeOut, slideIn, slideOut, scaleIn, scaleOut, rotateIn, bounceIn, flipIn, pulse, shake, glow, typewriter, blur, custom
   - Direction (for slide-type): up, down, left, right
   - Duration slider (100ms — 5000ms)
   - Delay slider (0ms — 3000ms)
   - Easing select: linear, ease, ease-in, ease-out, ease-in-out, spring, bounce
   - Repeat: number input or "infinite" toggle
   - Stagger: delay between child elements (for containers)
   - "Test" button: plays animation in the editor on the selected element
   - "Custom Keyframes" expander: add/remove keyframes with offset (0-1) and CSS properties

2. src/lib/animation-engine.ts
   - getAnimationCSS(animation: Animation): string — converts animation config to CSS @keyframes + animation shorthand
   - getMotionProps(animation: Animation): MotionProps — converts to Framer Motion props for preview/live
   - PRESET_ANIMATIONS: Record<string, Keyframe[]> — all 15 presets defined

3. Auto-animate:
   - Button in toolbar: "Auto Animate ✨"
   - Applies staggered entrance animations to all visible elements
   - Algorithm: sort elements by Y position (top-to-bottom), assign fadeIn with 100ms stagger
   - User can undo the entire auto-animate with single Cmd+Z

4. Preview integration:
   - In preview mode: animations trigger based on their trigger type
   - whileInView: uses Intersection Observer
   - onScroll: parallax effect via scroll position calculations
   - onHover/onClick: Framer Motion whileHover/whileTap props
```

---

## 5. Phase 4 Prompts (Export, Publishing & Community — Weeks 22–28)

### Prompt 4.1: Export System

```
PHASE 4 — TASK: Export System (PNG/JPEG/PDF/GIF/HTML)

1. src/lib/export-image.ts — Client-side image export:
   - exportAsPNG(canvasElement: HTMLElement, options: {scale: number}): Promise<Blob>
   - exportAsJPEG(canvasElement: HTMLElement, options: {quality: number}): Promise<Blob>
   - Pre-export steps: await document.fonts.ready, add 500ms delay, ensure all images are loaded
   - Uses html-to-image library (dynamically imported)
   - Handle CORS: verify all images use proxy URLs or Supabase URLs

2. GIF export:
   - exportAsGIF(canvasElement: HTMLElement, animations: Animation[], options: {fps: number, duration: number}): Promise<Blob>
   - Captures frames using html2canvas during animation playback
   - Encode with gif.js Web Worker
   - Cap at 5 seconds / 60 frames max
   - Show progress bar during encoding

3. src/app/api/export/pdf/route.ts — Server-side PDF:
   - Accepts project JSON
   - Renders preview page with Puppeteer (serverless chrome)
   - Injects @font-face with base64 font data
   - Returns PDF blob
   - 60-second timeout

4. src/lib/export.ts — HTML compiler:
   - compileToHTML(project: StakkedProject): string
   - Outputs self-contained HTML file with:
     - Inlined CSS (all styles, theme tokens, element-specific)
     - Viewport meta tag + responsive media queries
     - Base64 encoded small images (<100KB)
     - Absolute URLs for large images (Supabase Storage)
     - @font-face declarations with Google Fonts CSS
     - NO external dependencies, NO /_next/ paths
   - Include basic SEO: title, meta description, OG tags

5. Download trigger:
   - Export modal with format options (PNG, JPEG, PDF, GIF, HTML)
   - PNG/JPEG: scale option (1x, 2x, 3x)
   - JPEG: quality slider (0.1 — 1.0)
   - PDF: page size (A4, Letter, Custom)
   - GIF: FPS (10, 15, 30), duration (1-5s)
   - HTML: "Download as ZIP" with index.html + assets folder
```

### Prompt 4.2: Publishing & Hosting

```
PHASE 4 — TASK: Page Publishing & Hosting

1. src/app/api/publish/route.ts
   - Accepts: projectId
   - Fetches project from Supabase
   - Compiles to HTML using src/lib/export.ts
   - Uploads compiled HTML to Supabase Storage bucket: published-pages/{userId}/{slug}/index.html
   - Updates project record: published = true, hosted_url = computed URL
   - Returns: { url: string }

2. Hosted page serving:
   - Configure Supabase Storage for public access with CDN
   - URL pattern: https://{username}.stakked.io/{slug} (requires DNS wildcard or Vercel rewrites)
   - Fallback pattern for MVP: https://stakked.io/p/{username}/{slug}

3. Custom domain support:
   - User adds CNAME record pointing to stakked.io
   - API route validates CNAME resolution
   - Store custom_domain in projects table
   - For MVP: document the manual process. Full automation comes post-launch.

4. Unpublish:
   - Delete HTML from Supabase Storage
   - Set published = false
   - hosted_url returns 404 page or "This page has been unpublished"

5. Re-publish:
   - User edits page → clicks Publish again → recompiles and overwrites
```

### Prompt 4.3: Community Pages & Fork

```
PHASE 4 — TASK: Community Pages Gallery & Fork System

1. src/app/pages/page.tsx (Server Component):
   - Fetch public projects from Supabase (visibility = 'public', published = true)
   - Category filter tabs: All, Music, Art, Photography, Design, Business, GFX
   - Tag filter: clickable tags for narrowing results
   - Sort: Popular (fork_count DESC), Recent (created_at DESC)
   - Pagination: 20 per page, server-side
   - Each card shows: thumbnail, title, creator name, fork count, category tag

2. src/app/pages/[pageSlug]/page.tsx (Server Component):
   - Fetch project by slug
   - Render the compiled HTML in an iframe or render from JSON server-side
   - Show: creator profile, description, fork count, date
   - "Use This Template" / "Fork" button (requires auth)
   - "Report" button for moderation

3. src/app/api/community/route.ts — List public pages:
   - GET: query params for category, tags, sort, page, per_page
   - Returns paginated project list with metadata

4. src/app/api/community/fork/route.ts — Fork a page:
   - POST: { projectId: string }
   - Deep-clone the full StakkedProject JSON (structuredClone)
   - Assign new UUID, set userId to current user, set visibility = 'private'
   - Set forked_from = original project ID
   - Increment fork_count on original project
   - Insert new project into database
   - Return new project ID → redirect to /editor/{newId}

5. Template/GFX preloads:
   - 10+ template JSON files in src/data/templates/
   - Templates appear in "New Project" modal and in community gallery with category 'template'
   - GFX templates: card-sized (1080x1080, 1080x1350) projects for social media graphics
```

---

## 6. Phase 5 Prompts (Workflow, Offline & Advanced — Weeks 28–34)

### Prompt 5.1: Workflow Builder

```
PHASE 5 — TASK: Workflow Builder

Create the node-based workflow builder using React Flow (dynamically imported):

1. src/components/workflow/WorkflowCanvas.tsx
   - React Flow canvas with page nodes and logic nodes
   - Each page in the project = one node
   - Users can connect nodes with edges (navigation flow)
   - Drag to pan, scroll to zoom

2. src/components/workflow/PageNode.tsx
   - Shows page title + thumbnail preview
   - Click to navigate to that page in the editor
   - Input/output handles for edge connections

3. src/components/workflow/LogicNode.tsx
   - Conditional routing: if [condition] → Page A, else → Page B
   - Conditions: user logged in, time of day, referral source, custom flag
   - Configurable via dropdown + value input

4. Workflow data stored in project JSON as:
   project.workflow = { nodes: [{id, type, position, data}], edges: [{id, source, target, condition?}] }

5. Visual sitemap mode:
   - Toggle to see all pages as a bird's eye graph
   - Auto-layout algorithm positions nodes based on navigation hierarchy

6. Cycle detection:
   - If user creates A→B→C→A loop, show warning: "Circular navigation detected"
   - Allow it but cap redirects at 10 in preview to prevent infinite loops
```

### Prompt 5.2: Full Offline Mode

```
PHASE 5 — TASK: Full Offline PWA

1. Service Worker (public/sw.js):
   - Use Workbox for caching strategy
   - Cache app shell (HTML, CSS, JS) with StaleWhileRevalidate
   - Cache API responses (fonts, icons) with CacheFirst + expiration
   - Cache user assets with CacheFirst + LRU
   - Handle offline fallback page

2. Sync conflict resolution (update src/lib/sync.ts):
   - Offline change queue: array of {action, data, timestamp} stored in IndexedDB
   - On reconnect (navigator.onLine event): replay queue in order
   - For each action: compare timestamps with server version
   - Last-Write-Wins: if local timestamp > server timestamp, push local. Otherwise, show conflict dialog.
   - Conflict dialog: "Your version" vs "Cloud version" with visual diff and merge options

3. Protection:
   - beforeunload: warn if isDirty and changes haven't reached cloud
   - visibilitychange: on document.hidden, trigger immediate IndexedDB save (fallback for mobile Safari where beforeunload doesn't fire)

4. PWA manifest (public/manifest.json):
   - name: "Stakked"
   - short_name: "Stakked"
   - start_url: "/workspace"
   - display: "standalone"
   - theme_color matches editor dark theme
   - Icons: 192x192, 512x512

5. Install prompt:
   - Detect `beforeinstallprompt` event
   - Show "Install Stakked" banner in workspace after 3rd visit
```

### Prompt 5.3: Advanced Elements (8 Remaining)

```
PHASE 5 — TASK: Advanced Elements

Create 8 remaining element renderer components:

1. ContainerElement.tsx — Groups child elements. Has its own layout engine (stack/grid/free). Children stored as element IDs in content.children[]. Renders children relative to container position. Overflow clipping. Max nesting depth: 3 levels.

2. NavigationElement.tsx — Header navigation bar. Links array in content. Style options: horizontal, dropdown, hamburger (mobile). Sticky option. Active link highlighting in preview.

3. FormElement.tsx — Form builder. Fields: text, email, textarea, checkbox, select. Required toggle per field. Submit action → POST to Supabase Edge Function. Success/error messages. Honeypot spam field + rate limiting (5/IP/hour).

4. MapElement.tsx — Embeds Google Maps or Mapbox. Configure: latitude, longitude, zoom level. Provider select. Renders as iframe with constructed URL.

5. TestimonialElement.tsx — Quote block with: quote text, author name, author role/company, avatar image URL. Style variants: card, minimal, centered.

6. MarqueeElement.tsx — Scrolling horizontal strip. Items: text strings or small images. Speed slider. Direction: left/right. Pause on hover. CSS animation-based (no JavaScript).

7. AccordionElement.tsx — Expandable sections. Array of {title, content} in content. Smooth expand/collapse with Framer Motion. Only one section open at a time (optional).

8. TabsElement.tsx — Tabbed content container. Array of {label, content} in content. Tab bar on top. Click tab to switch visible content. Customizable tab bar styling.

Each element:
- Uses the existing CanvasElement wrapper for drag/resize
- Reads from and writes to the Zustand project store
- Has proper TypeScript types matching element.ts definitions
- Handles missing/malformed content gracefully
- Has sensible default dimensions and content
```

### Prompt 5.4: Landing Page & Marketing Site

```
PHASE 5 — TASK: Landing Page, Docs & Features Pages

1. src/app/page.tsx (Server Component with dynamic 3D):
   - Hero section with React Three Fiber animated 3D scene (dynamic import, ssr: false)
   - WebGL fallback: if no support, show static branded image
   - "Start Building" CTA button → /workspace
   - Feature highlights section (what Stakked does)
   - "Powered by Artists" section (showcase community pages)
   - Footer with links
   - Fully responsive (mobile-friendly)
   - SEO: proper title, meta description, OG tags, structured data

2. src/components/landing/Hero3D.tsx
   - Interactive 3D scene related to creativity/design
   - Scroll-triggered camera movement
   - Low poly count for performance
   - Loading skeleton while Three.js initializes

3. src/app/features/page.tsx (Server Component):
   - Feature grid with icons and descriptions
   - Animated on scroll (CSS animations only, no heavy JS)
   - Screenshots/GIFs of the editor in action
   - Comparison table vs. Framer/Webflow/Linktree

4. src/app/docs/page.tsx (Server Component):
   - Getting started guide
   - Element types documentation
   - Theme customization guide
   - Keyboard shortcuts reference
   - FAQ

5. src/app/workspace/page.tsx (Server Component with client islands):
   - Fetch user's projects from Supabase (server-side)
   - Project grid with cards (thumbnail, title, last edited, published badge)
   - "New Project" button → modal with template selection
   - "Import Template" → fork from community gallery
   - Delete project (with confirmation dialog)
   - Client island for project actions (create, delete, settings)

6. Light/Dark mode toggle for marketing pages (separate from editor theme)
```

---

## Quick Reference: Prompt Order

```
Session 1:  System Context → 1.1 (Scaffolding) → 1.2 (Types)
Session 2:  System Context → 1.3 (Stores) → 1.4 (IndexedDB)
Session 3:  System Context → 1.5 (Canvas) → 1.6 (CanvasElement)
Session 4:  System Context → 1.7 (12 Elements)
Session 5:  System Context → 1.8 (Properties Panel)
Session 6:  System Context → 1.9 (Keyboard) → 1.10 (Editor Page)
--- GATE CHECK: Phase 1 ---
Session 7:  System Context → 2.1 (Theme Engine)
Session 8:  System Context → 2.2 (Asset Panel + APIs)
Session 9:  System Context → 2.3 (Multi-Page + Breakpoints)
--- GATE CHECK: Phase 2 ---
Session 10: System Context → 3.1 (AI Integration)
Session 11: System Context → 3.2 (Animation System)
--- GATE CHECK: Phase 3 ---
Session 12: System Context → 4.1 (Export System)
Session 13: System Context → 4.2 (Publishing) → 4.3 (Community)
--- GATE CHECK: Phase 4 ---
Session 14: System Context → 5.1 (Workflow) → 5.2 (Offline)
Session 15: System Context → 5.3 (Advanced Elements)
Session 16: System Context → 5.4 (Landing + Docs + Workspace)
--- GATE CHECK: Phase 5 → LAUNCH ---
```
