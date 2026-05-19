/**
 * Defines the exhaustive style system for any element on the Stakked canvas.
 * This object is stored per-element and supports responsive overrides.
 */

export interface StakkedElementFullStyle extends StakkedElementStyleBase {
  /** Hover and active state overrides (optional) */
  hover?: Partial<StakkedElementStyleBase>;
  active?: Partial<StakkedElementStyleBase>;
  
  /** Responsive overrides for the element */
  responsive: {
    /** Styles applied when on tablet breakpoint */
    tablet?: Partial<StakkedElementStyleBase>;
    /** Styles applied when on mobile breakpoint */
    mobile?: Partial<StakkedElementStyleBase>;
    /** Styles applied to custom user-defined breakpoints (key is width in px) */
    custom?: Record<string, Partial<StakkedElementStyleBase>>;
  };

  /** Properties that are currently locked and cannot be changed via UI */
  lockedProperties?: string[];
}

/** 
 * Common style properties shared between base states and overrides 
 */
export interface StakkedElementStyleBase {
  /** Linking and interaction */
  link?: {
    /** Target URL or page ID */
    to: string;
    /** Open in _blank or _self */
    target: '_blank' | '_self';
    /** Link type: external, page, scroll, email, phone */
    type: 'external' | 'page' | 'scroll' | 'email' | 'phone';
  };

  /** 2D position on the canvas or within a container */
  position: {
    /** CSS positioning type */
    type: 'relative' | 'absolute' | 'fixed' | 'sticky';
    /** X coordinate (left) */
    x: number;
    /** Y coordinate (top) */
    y: number;
    /** Constraint rules for scaling */
    constraints?: {
      horizontal: 'left' | 'right' | 'center' | 'stretch';
      vertical: 'top' | 'bottom' | 'center' | 'stretch';
    };
  };

  /** Physical dimensions */
  size: {
    /** Width in px or % */
    width: number;
    /** Height in px or % or 'auto' */
    height: number | 'auto';
    /** Unit for width */
    widthMode: 'px' | '%' | 'vw' | 'auto';
    /** Unit for height */
    heightMode: 'px' | '%' | 'vh' | 'auto';
    /** Minimum and maximum bounds */
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    /** Constraint to maintain specific aspect ratio (e.g., 1, 1.5) */
    aspectRatio?: number | 'none';
  };

  /** Flex and Grid layout controls (primarily for Container elements) */
  layout?: {
    /** Layout engine type */
    type: 'stack' | 'grid' | 'free';
    /** Flex direction */
    direction: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    /** Alignment on main axis */
    distribution: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    /** Alignment on cross axis */
    align: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    /** Whether children should wrap */
    wrap: boolean;
    /** Gap between elements (multi-unit) */
    gap: number;
    /** Grid specific columns */
    columns?: number;
    /** Grid specific rows */
    rows?: number;
    /** Masonry flow toggle */
    masonry?: boolean;
    /** Individual side padding */
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
      linked: boolean;
    };
  };

  /** Comprehensive typography system */
  typography?: StakkedTypographyStyle;

  /** Stackable fill layers (backgrounds) */
  fills: ElementFill[];

  /** Per-side border system */
  border: {
    top: BorderStyle;
    right: BorderStyle;
    bottom: BorderStyle;
    left: BorderStyle;
    linked: boolean;
  };

  /** Per-corner radius system */
  borderRadius: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
    unit: 'px' | '%';
    linked: boolean;
  };

  /** Visual and interaction effects */
  effects: {
    /** 0 to 1 opacity */
    opacity: number;
    /** Visible toggle */
    visible: boolean;
    /** CSS overflow behavior */
    overflow: 'visible' | 'hidden' | 'scroll' | 'auto';
    /** Cursor style on hover */
    cursor: string;
    /** Stackable box shadows */
    shadows: BoxShadow[];
    /** Backdrop filter (blur, saturate, etc.) */
    backdropFilter: string;
  };

  /** Stackable image/color overlays (noise, grain, vignettes) */
  overlays: ElementOverlay[];

  /** 2D and 3D transforms */
  transform: {
    rotation: number;
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
    translateX: number;
    translateY: number;
    /** CSS transform-origin */
    origin: string;
    /** 3D perspective in px */
    perspective: number;
    /** 3D rotation in degrees */
    rotateX: number;
    rotateY: number;
  };

  /** Page behavior for the element */
  scrollSection?: {
    enabled: boolean;
    /** y, x, or both */
    snapType: 'none' | 'y' | 'x' | 'both';
    /** start, center, end */
    snapAlign: 'none' | 'start' | 'center' | 'end';
  };

  /** Parallax movement on scroll */
  parallax?: {
    enabled: boolean;
    /** Intensity multiplier */
    speed: number;
    /** up, down, left, right */
    direction: 'vertical' | 'horizontal';
  };

  /** Search engine and accessibility metadata */
  accessibility?: {
    /** Semantic HTML tag (div, section, article, etc.) */
    tag: string;
    /** ARIA role */
    role: string;
    /** Descriptive text for screen readers */
    ariaLabel: string;
    /** Focus order */
    tabIndex: number;
    /** Image descriptive text */
    alt: string;
  };
}

/** Individual background fill layer */
export interface ElementFill {
  id: string;
  type: 'color' | 'gradient' | 'image' | 'pattern' | 'video';
  value: string;
  opacity: number;
  blendMode: string;
  /** Image/Video specific fit */
  fit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Background position */
  position?: string;
  /** Pattern specific scale */
  patternScale?: number;
  /** Pattern specific color tint */
  patternColor?: string;
}

/** Specific border style */
export interface BorderStyle {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
}

/** Specific box shadow definition */
export interface BoxShadow {
  id: string;
  type: 'drop' | 'inner';
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

/** Visual overlay layer (noise, grain) */
export interface ElementOverlay {
  id: string;
  type: 'color' | 'gradient' | 'noise' | 'grain';
  value: string;
  opacity: number;
  blendMode: string;
}

export interface StakkedTypographyStyle {
    /** Font family string (Google Fonts or system) */
    fontFamily: string;
    /** Font size in px */
    fontSize: number;
    /** 100-900 weight */
    fontWeight: number;
    /** Normal, italic */
    fontStyle: 'normal' | 'italic';
    /** Hex or CSS variable */
    color: string;
    /** Text alignment */
    textAlign: 'left' | 'center' | 'right' | 'justify';
    /** Decoration: none, underline, line-through, overline */
    textDecoration: 'none' | 'underline' | 'line-through' | 'overline';
    /** Transform: none, uppercase, lowercase, capitalize */
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    /** Line height multiplier or px */
    lineHeight: number;
    /** Letter spacing in px */
    letterSpacing: number;
    /** Word spacing in px */
    wordSpacing: number;
    /** CSS text shadow string */
    textShadow: string;
    /** Whether to show ellipsis (...) on overflow */
    truncate: boolean;
    /** Max lines before truncation */
    maxLines: number;
}
