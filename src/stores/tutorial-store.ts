/* src/stores/tutorial-store.ts */
import { create } from 'zustand';

export interface TutorialStep {
  /** CSS selector or element ID to spotlight. null = centered modal (no spotlight). */
  target: string | null;
  /** Short header shown in the tooltip */
  title: string;
  /** Main body copy */
  body: string;
  /** Optional secondary tip in a styled aside */
  tip?: string;
  /** Where to position the tooltip card relative to the target */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** If true, allow the user to interact with the highlighted area while the step is active */
  interactive?: boolean;
}

export type TourId = 'workspace' | 'editor';

interface TutorialState {
  isOpen: boolean;
  tourId: TourId | null;
  stepIndex: number;
  /** Start a named tour from step 0 */
  startTour: (id: TourId) => void;
  /** Advance to the next step, or close if on last step */
  nextStep: () => void;
  /** Go back one step */
  prevStep: () => void;
  /** Jump to a specific step */
  goToStep: (index: number) => void;
  /** Close the tutorial entirely */
  closeTour: () => void;
}

/** Workspace tour — shows how the dashboard is organised */
export const WORKSPACE_TOUR: TutorialStep[] = [
  {
    target: null,
    placement: 'center',
    title: 'Welcome to Stakked ✦',
    body: 'Stakked is a creative OS for musicians, artists, and creators. Build stunning link-in-bio pages, merch stores, EPKs, and editorial layouts — no code required.',
    tip: 'This tour takes about 2 minutes. You can skip it anytime.',
  },
  {
    target: '[data-tour="workspace-sidebar"]',
    placement: 'right',
    title: 'Your workspace',
    body: 'The sidebar gives you access to  your Projects, community Templates, the Community gallery, and Settings. Everything you create lives here locally — and optionally syncs to the cloud.',
  },
  {
    target: '[data-tour="workspace-projects"]',
    placement: 'bottom',
    title: 'Projects',
    body: 'Each project is a multi-page creator site. Click a project card to open it in the editor, or use the pencil icon to rename it. Projects auto-save as you work.',
    tip: 'Projects are stored in your browser via IndexedDB — no account required to get started.',
  },
  {
    target: '[data-tour="workspace-new"]',
    placement: 'bottom',
    title: 'Create a new project',
    body: 'Click "New project" to start from a blank canvas. You can also browse the Templates tab to kick off from a polished starting point.',
  },
  {
    target: '[data-tour="workspace-templates"]',
    placement: 'right',
    title: 'Templates',
    body: 'Professionally-designed starting points across four genres: music releases, portfolio, merch, and editorial. One click forks the template into your workspace.',
  },
  {
    target: '[data-tour="workspace-community"]',
    placement: 'right',
    title: 'Community gallery',
    body: 'Browse published projects from every creator in the Stakked ecosystem. Click Remix on any card to fork it into your own project.',
  },
  {
    target: '[data-tour="workspace-settings"]',
    placement: 'right',
    title: 'Settings & theme',
    body: 'Pick a theme in Settings to style the editor chrome itself — Ghost, Neon, Brutalist, Paper, or Sunset. Changes apply immediately, everywhere.',
  },
  {
    target: null,
    placement: 'center',
    title: "You're ready to build",
    body: 'Open any project or create a new one to launch the editor. Once inside, press ? to open the editor tour — it walks you through the canvas, properties panel, and workflow engine.',
    tip: 'Tip: The editor also has its own step-by-step guide accessible from the toolbar.',
  },
];

/** Editor tour — explains every panel and feature */
export const EDITOR_TOUR: TutorialStep[] = [
  {
    target: null,
    placement: 'center',
    title: 'The Stakked Editor',
    body: 'This is where you build. The editor has five main areas: Toolbar (top), Left Sidebar, Canvas (centre), Properties Panel (right), and the Interactions view. Press → or click Next to explore each area.',
    tip: 'Press ? at any time to replay this tour.',
  },
  {
    target: '[data-tour="toolbar"]',
    placement: 'bottom',
    title: 'Toolbar',
    body: 'Project name, undo/redo, breakpoint switcher (desktop/tablet/mobile), preview toggle, zoom controls (− / + or scroll), and the Export menu. Everything you need, always in reach.',
    tip: 'Cmd/Ctrl+Z to undo · Cmd/Ctrl+Shift+Z to redo · Cmd/Ctrl+0 to reset zoom.',
  },
  {
    target: '[data-tour="toolbar-breakpoint"]',
    placement: 'bottom',
    title: 'Responsive breakpoints',
    body: 'Switch between Desktop, Tablet, and Mobile views. Changes you make in a non-desktop view are saved as responsive overrides — base styles stay untouched. Published sites adapt automatically.',
    tip: 'Responsive overrides cascade like CSS media queries.',
  },
  {
    target: '[data-tour="toolbar-export"]',
    placement: 'bottom',
    title: 'Export & Publish',
    body: 'Export your project as a self-contained HTML file (with all interactivity scripts), PNG screenshot, animated GIF, or WebM video. Or hit Publish to push it live with a public URL.',
  },
  {
    target: '[data-tour="toolbar-workflow"]',
    placement: 'bottom',
    title: 'Interactions view (W)',
    body: 'Press W or click this button to switch into the Interactions view. Every element on the page appears as a node — drag from one element\'s handle to another to create a trigger→action link.',
    tip: 'Supported triggers: Click, Hover In/Out, Scroll Into View, Interval. Actions: Animate, Show/Hide, Navigate, Play/Pause, Set Variable.',
  },
  {
    target: '[data-tour="left-sidebar"]',
    placement: 'right',
    title: 'Elements — what you can add',
    body: 'Click or drag any element onto the canvas: Text, Image, Button, Social Links, Music Player, Video, Gallery, Icon, Shape, Navigation, Form, Map, Testimonial, Marquee, Accordion, Tabs, Line, and Pen/Drawing.',
    tip: 'Shortcut: H = Hand tool · V = Select tool · / = open this help tour.',
  },
  {
    target: '[data-tour="left-sidebar"]',
    placement: 'right',
    title: 'Layers panel',
    body: 'Switch to the Layers tab to see a stacking order tree. Drag rows to reorder z-index. Click the eye to toggle visibility. Click the lock to prevent accidental edits. Supports nested containers.',
  },
  {
    target: '[data-tour="left-sidebar"]',
    placement: 'right',
    title: 'Pages panel',
    body: 'Add up to unlimited pages to your project — great for multi-step link-in-bio flows, EPKs, or mini-sites. Reorder by dragging. Link between pages using the Navigate interaction.',
  },
  {
    target: '[data-tour="left-sidebar"]',
    placement: 'right',
    title: 'Assets panel',
    body: 'Four tabs: Colors (apply palette swatches instantly), Gradients, Fonts (apply typography pairs), Shapes (quick SVG fills), and GFX (pre-built glass/glow/spotlight effects).',
  },
  {
    target: '[data-tour="canvas"]',
    placement: 'top',
    title: 'The Canvas',
    body: 'Click to select · Drag to move · Grab corners to resize · Shift+click for multi-select · Ctrl+G to group · Ctrl+Shift+G to ungroup. Smart guides snap automatically when elements align.',
  },
  {
    target: '[data-tour="canvas"]',
    placement: 'top',
    title: 'Canvas navigation & drawing tools',
    body: 'Scroll (or − / + buttons) to zoom · Space+drag to pan · Double-click a text to edit inline · Double-click a Drawing element to enter freehand mode and sketch paths directly on the canvas.',
    tip: 'Cmd/Ctrl+A selects all · Delete/Backspace removes selected elements · Cmd/Ctrl+D duplicates.',
  },
  {
    target: '[data-tour="right-panel"]',
    placement: 'left',
    title: 'Properties panel — Design',
    body: 'Every section is collapsible. Design: position (X/Y), size (W/H), fills (solid, gradient, image), border, border-radius, and effects (shadow, blur, backdrop-filter, opacity).',
  },
  {
    target: '[data-tour="right-panel"]',
    placement: 'left',
    title: 'Properties panel — Content',
    body: 'The Content section changes based on element type. Edit button labels, image URLs, gallery images, form fields, accordion sections, tab content, map coordinates, testimonial copy, and more.',
  },
  {
    target: '[data-tour="right-panel"]',
    placement: 'left',
    title: 'Properties panel — Animate',
    body: 'Add enter/exit animations per element: fadeIn, slideIn, bounce, pulse, zoom, and more. Set trigger (on load, on scroll into view), duration, delay, and repeat count.',
    tip: 'Animations are exported as real CSS @keyframes in the HTML export.',
  },
  {
    target: null,
    placement: 'center',
    title: "You're all set 🎉",
    body: "Drag in an element, style it in the Properties panel, wire up interactions in the Interactions view (W), and hit Publish. Your site is live in seconds. Press ? to replay this tour anytime.",
    tip: 'Settings (gear icon) → General & SEO tabs let you set site title, favicon, meta description, custom CSS, analytics, and more.',
  },
];

export const TOURS: Record<TourId, TutorialStep[]> = {
  workspace: WORKSPACE_TOUR,
  editor: EDITOR_TOUR,
};

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isOpen: false,
  tourId: null,
  stepIndex: 0,

  startTour: (id) => set({ isOpen: true, tourId: id, stepIndex: 0 }),

  nextStep: () => {
    const { stepIndex, tourId } = get();
    if (!tourId) return;
    const steps = TOURS[tourId];
    if (stepIndex >= steps.length - 1) {
      set({ isOpen: false, tourId: null, stepIndex: 0 });
    } else {
      set({ stepIndex: stepIndex + 1 });
    }
  },

  prevStep: () => {
    const { stepIndex } = get();
    if (stepIndex > 0) set({ stepIndex: stepIndex - 1 });
  },

  goToStep: (index) => set({ stepIndex: index }),

  closeTour: () => set({ isOpen: false, tourId: null, stepIndex: 0 }),
}));
