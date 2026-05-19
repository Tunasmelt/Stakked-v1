# Stakked — Master Strategy

> **Single source of truth. Product vision, tech stack, architecture, and JSON schema.**

---

## 1. Product Vision

Stakked is an **artist-first, drag-and-drop creative platform** where any creator — music artists, digital artists, social media influencers, photographers, designers — can build dynamic pages, GFX cards, portfolios, and interactive profiles without writing code.

**What makes Stakked different:**
- AI-native: NLP layout generation, auto-animate, design language understanding
- Professional-grade element customization (120+ CSS properties per element, matching Framer)
- Offline-first: IndexedDB auto-save, full PWA when online
- You own your work: export as PNG, JPEG, PDF, GIF, or clean HTML
- Community pages: publish, fork, remix — creative pages are social objects
- Dynamic theme + asset provider library with 3-tier strategy (Bundled → Cache → API)
- Workflow builder for multi-page logic and routing
- Page hosting at `username.stakked.io` with custom domain support

**Stakked is NOT:** a generic website builder. It competes by being the samurai sword to Framer's Swiss Army knife — focused depth for creatives, not broad features for everyone.

---

## 2. Tech Stack (Final)

| Layer | Technology | Rationale |
|:---|:---|:---|
| **Framework** | Next.js 15 (App Router) | SSR for preview/export, API routes for proxying, React 19 |
| **Language** | TypeScript (strict) | Non-negotiable for this complexity |
| **State** | Zustand + Immer | Zustand for speed, Immer for immutable updates (undo system) |
| **Canvas Drag** | react-moveable + react-selecto | Free-form Framer-style drag + multi-select |
| **Tray → Canvas Drag** | @dnd-kit/core | Dragging elements from sidebar to canvas |
| **Panel Sorting** | @dnd-kit/sortable | Reordering layers, pages |
| **Rich Text** | TipTap (ProseMirror) | Best inline text editor for React |
| **Animation (UI)** | Framer Motion | Editor UI transitions, layout animations |
| **Animation (User)** | Lottie (lottie-react) | User-facing animation blocks |
| **Icons (Bundled)** | Lucide React | 1,500+ icons, tree-shaken, offline |
| **Icons (Extended)** | Iconify API | 275k+ via dynamic fetch with cache |
| **Brand Icons** | Simple Icons | 3,200+ social/tech brand SVGs |
| **Colors** | chroma-js | Palette generation, contrast checking |
| **Color Extraction** | node-vibrant | Image → palette for theme suggestion |
| **Fonts** | Google Fonts API + @fontsource/* | Search + bundled fallbacks |
| **Images** | Pexels API (via API route) | Proxied server-side, one provider at launch |
| **Gradients** | Bundled JSON (180+) + chroma-js | Stakked IS the gradient source |
| **Patterns** | hero-patterns (npm) | 87 patterns, pure functions, tiny |
| **Shapes** | blobshape (npm) | Algorithmic SVG blobs |
| **Auth** | Supabase Auth | Email/password + social login |
| **Database** | Supabase (PostgreSQL) | Projects, user profiles, page metadata |
| **Storage** | Supabase Storage | User-uploaded images, exports |
| **AI** | OpenAI GPT-4o (API) | Page summary, NLP layout, theme matching |
| **Offline Cache** | idb (IndexedDB) | Auto-save, asset caching with LRU eviction (50MB cap) |
| **Export (Images)** | html-to-image | Client-side DOM → PNG/JPEG |
| **Export (PDF)** | Puppeteer (serverless) | Server-side headless rendering |
| **Export (GIF)** | gif.js + html2canvas | Frame capture → animated GIF |
| **Export (HTML)** | Custom JSON→HTML renderer | Compile JSON to clean static HTML/CSS |
| **3D (Landing)** | React Three Fiber | Marketing site 3D hero section |
| **Workflow** | React Flow | Node-based visual workflow builder |
| **Styling** | CSS Modules + CSS Custom Properties | Theme tokens, no CSS-in-JS runtime |
| **Deploy** | Vercel | Edge deployment, serverless API routes |

---

## 3. Architecture Directives

### Client vs. Server Component Split

| Route | Rendering | Why |
|:---|:---|:---|
| `/` (Landing) | **Server Component** | SEO, minimal JS, 3D loaded via dynamic import |
| `/docs/` | **Server Component** | Static content, SEO-critical |
| `/features/` | **Server Component** | Marketing page, SEO-critical |
| `/workspace/` | **Server Component** with client islands | Project list is a DB query; actions are client |
| `/editor/[id]/` | **`'use client'` entirely** | Canvas, DOM manipulation, Zustand, window |
| `/preview/[id]/` | **Server fetch → client render** | Fetch JSON server-side, pass to client PreviewRenderer |
| `/pages/` (gallery) | **Server Component** | Browse public pages, SEO for discoverability |
| `/pages/[slug]/` | **Server Component** | View public page, fully server-rendered |
| `/api/*` | **Server (Route Handlers)** | All API proxying, CRUD, AI endpoints |

### Zustand Architecture (Three Stores)

```
projectStore (Immer)     — THE document. StakkedProject JSON. Persisted to IndexedDB + Supabase.
                           History stack (50 entries) for undo/redo.

editorStore (plain)      — Transient editor state. NOT persisted.
                           Selection, zoom, pan, active tool, clipboard, isDragging, snapGuides.

uiStore (plain)          — UI chrome state. Persisted to localStorage only.
                           Panel visibility, active tabs, preview mode.
```

### Performance Rules

1. **Zustand selectors only** — `useStore(state => state.elements[id])`, never subscribe to the whole store
2. **React.memo with custom comparators** on every CanvasElement
3. **Pan/zoom via refs + CSS transforms** — never in React state
4. **Auto-save debounced at 1000ms** after last change
5. **Dynamic imports** for TipTap, React Three Fiber, html-to-image, gif.js, Lottie, React Flow, chroma-js
6. **Undo commits only on drag END** — transient moves don't create history entries

---

## 4. JSON Schema (Source of Truth)

```typescript
// types/project.ts
interface StakkedProject {
  id: string;
  userId: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  visibility: 'private' | 'public';
  forkedFrom?: string;
  forkCount: number;
  category?: string;
  tags: string[];
  pages: StakkedPage[];
  settings: ProjectSettings;
}

interface ProjectSettings {
  theme: string;
  customColors?: Record<string, string>;
  favicon?: string;
  ogImage?: string;
  analytics?: { gaId?: string };
  customDomain?: string;
}

interface StakkedPage {
  id: string;
  title: string;
  slug: string;
  order: number;
  canvas: CanvasSettings;
  elements: StakkedElement[];
}

interface CanvasSettings {
  width: number;
  height: number | 'auto';
  background: Background;
  padding: number;
}

type Background =
  | { type: 'color'; value: string }
  | { type: 'gradient'; value: string }
  | { type: 'image'; value: string; fit: 'cover' | 'contain' | 'fill' }
  | { type: 'pattern'; value: string; color: string; opacity: number };
```

```typescript
// types/element.ts
interface StakkedElement {
  id: string;
  type: ElementType;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  content: ElementContent;
  style: StakkedElementFullStyle;
  animations: Animation[];
  responsive: {
    tablet?: Partial<StakkedElementFullStyle>;
    mobile?: Partial<StakkedElementFullStyle>;
    custom?: Record<string, Partial<StakkedElementFullStyle>>;
  };
}

type ElementType =
  | 'text' | 'image' | 'button' | 'social-link' | 'music-player'
  | 'video' | 'divider' | 'embed' | 'gallery' | 'countdown'
  | 'icon' | 'shape' | 'container' | 'navigation' | 'form'
  | 'map' | 'testimonial' | 'marquee' | 'accordion' | 'tabs';

type ElementContent =
  | { type: 'text'; html: string; plainText: string }
  | { type: 'image'; src: string; alt: string; objectFit: string }
  | { type: 'button'; label: string; url: string; variant: string }
  | { type: 'social-link'; platform: string; url: string; displayMode: string }
  | { type: 'music-player'; platform: string; url: string; embedHtml: string; displayMode: string }
  | { type: 'video'; platform: string; url: string; embedHtml: string; autoplay: boolean; loop: boolean }
  | { type: 'divider'; variant: string; color: string }
  | { type: 'embed'; html: string }
  | { type: 'gallery'; images: { src: string; alt: string }[]; layout: string; columns: number }
  | { type: 'countdown'; targetDate: string; label: string; format: string }
  | { type: 'icon'; name: string; set: string; color: string; size: number }
  | { type: 'shape'; variant: string; fill: string; svg?: string }
  | { type: 'container'; children: string[]; layoutType: string }
  | { type: 'navigation'; links: { label: string; href: string }[]; style: string }
  | { type: 'form'; fields: { label: string; type: string; required: boolean }[]; action: string }
  | { type: 'map'; lat: number; lng: number; zoom: number; provider: string }
  | { type: 'testimonial'; quote: string; author: string; role: string; avatar?: string }
  | { type: 'marquee'; items: string[]; speed: number; direction: string }
  | { type: 'accordion'; sections: { title: string; content: string }[] }
  | { type: 'tabs'; tabs: { label: string; content: string }[] };
```

The full `StakkedElementFullStyle` interface covers 120+ properties: Link, Position, Size, Layout, Typography, Fill (multi-layer), Border (per-side + per-corner radius), Effects (opacity, overflow, cursor, multi-shadow, backdrop-filter), Overlays (noise/grain/gradient), Transforms (2D + 3D), Scroll effects, Accessibility (semantic tags + ARIA), and per-element Animation (15 presets + custom keyframes).

See `02_PHASES_FEATURES.md` for the full style interface.

---

## 5. Project Structure

```
stakked/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout + font loading
│   │   ├── page.tsx                      # 3D Landing page
│   │   ├── docs/page.tsx                 # Documentation
│   │   ├── features/page.tsx             # Features showcase
│   │   ├── workspace/                    # Dashboard
│   │   │   ├── page.tsx                  # Projects list
│   │   │   └── settings/page.tsx         # User settings
│   │   ├── editor/[projectId]/page.tsx   # Main editor
│   │   ├── preview/[projectId]/page.tsx  # Preview renderer
│   │   ├── pages/                        # Community gallery
│   │   │   ├── page.tsx                  # Browse public pages
│   │   │   └── [pageSlug]/page.tsx       # View public page
│   │   ├── api/                          # Backend API routes
│   │   │   ├── assets/{images,icons,oembed}/route.ts
│   │   │   ├── projects/route.ts
│   │   │   ├── projects/[id]/route.ts
│   │   │   ├── ai/{summary,layout,theme}/route.ts
│   │   │   ├── publish/route.ts
│   │   │   └── community/{route,fork/route}.ts
│   │   └── auth/{login,signup,callback}/
│   ├── components/
│   │   ├── landing/                      # Hero3D, FeatureCards, Footer
│   │   ├── editor/                       # Canvas, ElementTray, Toolbar, etc.
│   │   ├── properties/                   # 13 property panel sections
│   │   ├── elements/                     # 20 element renderers
│   │   ├── workspace/                    # ProjectCard, ProjectGrid, AssetManager
│   │   ├── community/                    # PageCard, PageGrid, ForkButton
│   │   ├── preview/                      # PreviewRenderer
│   │   ├── workflow/                     # WorkflowCanvas, PageNode, LogicNode
│   │   └── ui/                           # 11 shared UI primitives
│   ├── stores/                           # project-store, editor-store, ui-store
│   ├── lib/                              # db, supabase, export, oembed, theme-engine, etc.
│   ├── data/                             # Bundled themes, palettes, gradients, templates
│   ├── types/                            # project, element, style, theme, animation, assets
│   └── styles/                           # globals.css, editor.module.css, themes/*.css
├── public/                               # fonts, illustrations, og images, sw.js
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local
```

---

## 6. Database Schema (Supabase)

```sql
-- Users (managed by Supabase Auth, extended with profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  data JSONB NOT NULL,                    -- The full StakkedProject JSON
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  forked_from UUID REFERENCES projects(id),
  fork_count INTEGER DEFAULT 0,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  hosted_url TEXT,
  custom_domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- Indexes
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_visibility ON projects(visibility) WHERE visibility = 'public';
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);
```

---

## 7. Asset Strategy (Three-Tier)

| Tier | Source | Storage | When Used |
|:---|:---|:---|:---|
| **1. Bundled** | Shipped with app | `src/data/` + `public/` | Always available, offline-first |
| **2. Cached** | Fetched once → stored | IndexedDB (LRU, 50MB cap) | After first search/use |
| **3. Live API** | External APIs via Next.js API routes | Never stored permanently | On-demand user search |

**Bundled inventory:** 1,500 icons (Lucide), 50 palettes, 180+ gradients, 87 patterns, 3,200 brand icons (Simple Icons), 20 themes, 50 Lottie animations, 20 font pairings, 5 page templates.

**Live APIs (all proxied server-side):** Pexels (images), Iconify (275k icons), Google Fonts API, oEmbed providers (Spotify, YouTube, SoundCloud, Vimeo, TikTok, Apple Music, Bandcamp, Deezer).

---

## 8. Timeline Summary

| Phase | Weeks | Focus |
|:---|:---|:---|
| **Phase 1** | 1–10 | Foundation, Canvas, 12 Elements, Properties Panel, Auto-save |
| **Phase 2** | 10–16 | Themes, Assets, Multi-Page, Breakpoints, Cloud Sync |
| **Phase 3** | 16–22 | AI (NLP, Auto-animate, Summary), Animation System, Scroll Effects |
| **Phase 4** | 22–28 | Export (PNG/JPEG/PDF/GIF/HTML), Hosting, Community, GFX Gallery |
| **Phase 5** | 28–34 | Workflow Builder, Full Offline, Advanced Elements, Landing Page, Docs |

**Total: 34 weeks (~8.5 months)**

See `02_PHASES_FEATURES.md` for detailed breakdowns.
