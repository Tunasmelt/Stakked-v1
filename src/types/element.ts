import { StakkedElementFullStyle } from './style';
import { Animation } from './animation';
import { v4 as uuidv4 } from 'uuid';

/**
 * Logic and Interactivity
 */
export type InteractionTrigger = 'onClick' | 'onMouseEnter' | 'onMouseLeave' | 'onScrollIntoView' | 'onInterval';
export type InteractionAction = 'navigate' | 'playPause' | 'showHide' | 'animate' | 'setGlobalState' | 'emitEvent';

export interface ElementBehavior {
  id: string;
  trigger: InteractionTrigger;
  action: InteractionAction;
  targetId?: string; // If affecting another element
  params: Record<string, string | number | boolean | undefined>;
}


/**
 * All possible element types in the Stakked ecosystem.
 */
export type ElementType =
  | 'text' | 'image' | 'button' | 'social-link' | 'music-player'
  | 'video' | 'divider' | 'embed' | 'gallery' | 'countdown'
  | 'icon' | 'shape' | 'container' | 'navigation' | 'form'
  | 'map' | 'testimonial' | 'marquee' | 'accordion' | 'tabs'
  | 'line' | 'drawing';

export interface StakkedTextContent { type: 'text'; html: string; plainText: string }
export interface StakkedImageContent { type: 'image'; src: string; alt: string; objectFit: string }
export interface StakkedButtonContent { type: 'button'; label: string; url: string; variant: string }
export interface StakkedSocialContent { type: 'social-link'; platform: string; url: string; displayMode: string }
export interface StakkedMusicContent { type: 'music-player'; platform: string; url: string; embedHtml: string; displayMode: string }
export interface StakkedVideoContent { type: 'video'; platform: string; url: string; embedHtml: string; autoplay: boolean; loop: boolean }
export interface StakkedDividerContent { type: 'divider'; variant: string; color: string }
export interface StakkedEmbedContent { type: 'embed'; html: string }
export interface StakkedGalleryContent { type: 'gallery'; images: { src: string; alt: string }[]; layout: string; columns: number }
export interface StakkedCountdownContent { type: 'countdown'; targetDate: string; label: string; format: string }
export interface StakkedIconContent { type: 'icon'; name: string; set: string; color: string; size: number }
export interface StakkedShapeContent { type: 'shape'; variant: string; fill: string; svg?: string }
export interface StakkedContainerContent { type: 'container'; children: string[]; layoutType: string }
export interface StakkedNavContent { type: 'navigation'; links: { label: string; href: string }[]; navStyle: string }
export interface StakkedFormContent { type: 'form'; fields: { label: string; fieldType: string; required: boolean }[]; action: string }
export interface StakkedMapContent { type: 'map'; lat: number; lng: number; zoom: number; provider: string }
export interface StakkedTestimonialContent { type: 'testimonial'; quote: string; author: string; role: string; avatar?: string }
export interface StakkedMarqueeContent { type: 'marquee'; items: string[]; speed: number; direction: 'left' | 'right' }
export interface StakkedAccordionContent { type: 'accordion'; sections: { title: string; content: string }[] }
export interface StakkedTabsContent { type: 'tabs'; tabs: { label: string; content: string }[] }

export interface StakkedLineContent {
  type: 'line';
  /** stroke colour */
  color: string;
  /** stroke width in px */
  thickness: number;
  /** 'solid' | 'dashed' | 'dotted' */
  style: 'solid' | 'dashed' | 'dotted';
  /** optional arrow heads: 'none' | 'start' | 'end' | 'both' */
  arrows: 'none' | 'start' | 'end' | 'both';
  /** angle in degrees (0 = horizontal, 90 = vertical) */
  angle: number;
}

export interface DrawingPath {
  /** Stable unique ID for React keying */
  id?: string;
  /** SVG path data string */
  d: string;
  color: string;
  width: number;
  /** 'pencil' | 'pen' | 'highlighter' */
  tool: 'pencil' | 'pen' | 'highlighter';
  opacity: number;
}

export interface StakkedDrawingContent {
  type: 'drawing';
  paths: DrawingPath[];
  /** SVG viewBox: "0 0 W H" matching element size */
  viewBox: string;
}

/**
 * Discriminated union for element content data.
 */
export type ElementContent =
  | StakkedTextContent
  | StakkedImageContent
  | StakkedButtonContent
  | StakkedSocialContent
  | StakkedMusicContent
  | StakkedVideoContent
  | StakkedDividerContent
  | StakkedEmbedContent
  | StakkedGalleryContent
  | StakkedCountdownContent
  | StakkedIconContent
  | StakkedShapeContent
  | StakkedContainerContent
  | StakkedNavContent
  | StakkedFormContent
  | StakkedMapContent
  | StakkedTestimonialContent
  | StakkedMarqueeContent
  | StakkedAccordionContent
  | StakkedTabsContent
  | StakkedLineContent
  | StakkedDrawingContent;

/**
 * The core element object stored in the StakkedProject JSON.
 */
export interface StakkedElement {
  id: string;
  type: ElementType;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number | 'auto' };
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  /** Parallax scroll factor (Phase 6) */
  parallax?: {
    speed: number;
    direction: 'vertical' | 'horizontal';
  };
  layoutTransition?: boolean;
  content: ElementContent;
  style: StakkedElementFullStyle;
  animations: Animation[];
  behaviors: ElementBehavior[];
}

/**
 * Factory function to create a new element with sensible defaults.
 */
export function defaultElement(type: ElementType): StakkedElement {
  const id = uuidv4();
  
  const baseStyle: StakkedElementFullStyle = {
    responsive: {},
    position: { type: 'absolute', x: 0, y: 0 },
    size: { width: 200, height: 200, widthMode: 'px', heightMode: 'px' },
    fills: [{ id: uuidv4(), type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
    border: {
      top: { width: 0, color: '#000000', style: 'none' },
      right: { width: 0, color: '#000000', style: 'none' },
      bottom: { width: 0, color: '#000000', style: 'none' },
      left: { width: 0, color: '#000000', style: 'none' },
      linked: true
    },
    borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px', linked: true },
    effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'default', shadows: [], backdropFilter: 'none' },
    overlays: [],
    transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
  };

  let content: ElementContent;
  switch (type) {
    case 'text':
      content = { type: 'text', html: '<h1>Double click to edit</h1>', plainText: 'Double click to edit' };
      baseStyle.size.width = 400;
      baseStyle.size.height = 100;
      baseStyle.typography = {
        fontFamily: 'Inter, sans-serif',
        fontSize: 48,
        fontWeight: 700,
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'left',
        textDecoration: 'none',
        textTransform: 'none',
        lineHeight: 1.1,
        letterSpacing: -1,
        wordSpacing: 0,
        textShadow: 'none',
        truncate: false,
        maxLines: 0
      };
      break;
    case 'image':
      content = { type: 'image', src: 'https://picsum.photos/seed/stakked/400/300', alt: 'Placeholder image', objectFit: 'cover' };
      baseStyle.size.width = 320;
      baseStyle.size.height = 240;
      baseStyle.borderRadius.topLeft = 16;
      baseStyle.borderRadius.topRight = 16;
      baseStyle.borderRadius.bottomRight = 16;
      baseStyle.borderRadius.bottomLeft = 16;
      break;
    case 'button':
      content = { type: 'button', label: 'Click Me', url: '#', variant: 'filled' };
      baseStyle.size = { width: 160, height: 48, widthMode: 'px', heightMode: 'px' };
      baseStyle.fills[0].value = '#3b82f6';
      baseStyle.borderRadius.topLeft = 999;
      baseStyle.borderRadius.topRight = 999;
      baseStyle.borderRadius.bottomRight = 999;
      baseStyle.borderRadius.bottomLeft = 999;
      baseStyle.typography = {
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 600,
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'center',
        textDecoration: 'none',
        textTransform: 'none',
        lineHeight: 1.2,
        letterSpacing: 0,
        wordSpacing: 0,
        textShadow: 'none',
        truncate: false,
        maxLines: 1
      };
      break;
    case 'social-link':
      content = {
        type: 'social-link',
        platform: 'instagram',
        url: 'https://instagram.com/stakked',
        displayMode: 'icon+text'
      };
      baseStyle.size.width = 220;
      baseStyle.size.height = 56;
      baseStyle.fills[0].value = '#18181b';
      baseStyle.border.top.width = 1;
      baseStyle.border.right.width = 1;
      baseStyle.border.bottom.width = 1;
      baseStyle.border.left.width = 1;
      baseStyle.border.top.color = '#27272a';
      baseStyle.border.right.color = '#27272a';
      baseStyle.border.bottom.color = '#27272a';
      baseStyle.border.left.color = '#27272a';
      baseStyle.border.top.style = 'solid';
      baseStyle.border.right.style = 'solid';
      baseStyle.border.bottom.style = 'solid';
      baseStyle.border.left.style = 'solid';
      baseStyle.borderRadius.topLeft = 14;
      baseStyle.borderRadius.topRight = 14;
      baseStyle.borderRadius.bottomRight = 14;
      baseStyle.borderRadius.bottomLeft = 14;
      break;
    case 'music-player':
      content = {
        type: 'music-player',
        platform: 'spotify',
        url: '',
        embedHtml: '',
        displayMode: 'full'
      };
      baseStyle.size.width = 320;
      baseStyle.size.height = 180;
      baseStyle.fills[0].value = '#111827';
      baseStyle.borderRadius.topLeft = 16;
      baseStyle.borderRadius.topRight = 16;
      baseStyle.borderRadius.bottomRight = 16;
      baseStyle.borderRadius.bottomLeft = 16;
      break;
    case 'video':
      content = {
        type: 'video',
        platform: 'youtube',
        url: '',
        embedHtml: '',
        autoplay: false,
        loop: false
      };
      baseStyle.size.width = 360;
      baseStyle.size.height = 220;
      baseStyle.fills[0].value = '#000000';
      baseStyle.borderRadius.topLeft = 16;
      baseStyle.borderRadius.topRight = 16;
      baseStyle.borderRadius.bottomRight = 16;
      baseStyle.borderRadius.bottomLeft = 16;
      break;
    case 'divider':
      content = { type: 'divider', variant: 'solid', color: '#27272a' };
      baseStyle.size.width = 320;
      baseStyle.size.height = 2;
      break;
    case 'embed':
      content = {
        type: 'embed',
        html: '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#111827;color:white;font-family:sans-serif;">Embed Preview</div>'
      };
      baseStyle.size.width = 320;
      baseStyle.size.height = 220;
      baseStyle.borderRadius.topLeft = 16;
      baseStyle.borderRadius.topRight = 16;
      baseStyle.borderRadius.bottomRight = 16;
      baseStyle.borderRadius.bottomLeft = 16;
      break;
    case 'gallery':
      content = {
        type: 'gallery',
        images: [
          { src: 'https://picsum.photos/seed/g1/300/300', alt: 'Gallery image 1' },
          { src: 'https://picsum.photos/seed/g2/300/300', alt: 'Gallery image 2' },
          { src: 'https://picsum.photos/seed/g3/300/300', alt: 'Gallery image 3' },
        ],
        layout: 'grid',
        columns: 3
      };
      baseStyle.size.width = 420;
      baseStyle.size.height = 240;
      baseStyle.borderRadius.topLeft = 16;
      baseStyle.borderRadius.topRight = 16;
      baseStyle.borderRadius.bottomRight = 16;
      baseStyle.borderRadius.bottomLeft = 16;
      break;
    case 'countdown':
      content = {
        type: 'countdown',
        targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        label: 'Launch',
        format: 'dd:hh:mm:ss'
      };
      baseStyle.size.width = 320;
      baseStyle.size.height = 96;
      break;
    case 'icon':
      content = { type: 'icon', name: 'Star', set: 'lucide', color: '#ffffff', size: 48 };
      baseStyle.size.width = 96;
      baseStyle.size.height = 96;
      break;
    case 'shape':
      content = { type: 'shape', variant: 'rect', fill: '#3b82f6' };
      baseStyle.size.width = 220;
      baseStyle.size.height = 160;
      baseStyle.fills[0].value = 'transparent';
      break;
    case 'container':
      content = { type: 'container', children: [], layoutType: 'free' };
      baseStyle.size.width = 480;
      baseStyle.size.height = 320;
      baseStyle.fills[0].value = 'transparent';
      baseStyle.effects.overflow = 'hidden';
      baseStyle.borderRadius.topLeft = 12;
      baseStyle.borderRadius.topRight = 12;
      baseStyle.borderRadius.bottomRight = 12;
      baseStyle.borderRadius.bottomLeft = 12;
      break;
    case 'navigation':
      content = {
        type: 'navigation',
        links: [
          { label: 'Home', href: '#' },
          { label: 'Work', href: '#' },
          { label: 'About', href: '#' },
          { label: 'Contact', href: '#' },
        ],
        navStyle: 'horizontal',
      };
      baseStyle.size.width = 640;
      baseStyle.size.height = 56;
      baseStyle.fills[0].value = 'rgba(17, 24, 39, 0.8)';
      baseStyle.typography = {
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'left',
        textDecoration: 'none',
        textTransform: 'none',
        lineHeight: 1.2,
        letterSpacing: 0,
        wordSpacing: 0,
        textShadow: 'none',
        truncate: false,
        maxLines: 1,
      };
      break;
    case 'form':
      content = {
        type: 'form',
        fields: [
          { label: 'Name', fieldType: 'text', required: true },
          { label: 'Email', fieldType: 'email', required: true },
          { label: 'Message', fieldType: 'textarea', required: false },
        ],
        action: '',
      };
      baseStyle.size.width = 360;
      baseStyle.size.height = 320;
      baseStyle.fills[0].value = 'rgba(24, 24, 27, 0.95)';
      baseStyle.borderRadius.topLeft = 12;
      baseStyle.borderRadius.topRight = 12;
      baseStyle.borderRadius.bottomRight = 12;
      baseStyle.borderRadius.bottomLeft = 12;
      break;
    case 'map':
      content = {
        type: 'map',
        lat: 40.7128,
        lng: -74.006,
        zoom: 12,
        provider: 'google',
      };
      baseStyle.size.width = 360;
      baseStyle.size.height = 240;
      baseStyle.borderRadius.topLeft = 12;
      baseStyle.borderRadius.topRight = 12;
      baseStyle.borderRadius.bottomRight = 12;
      baseStyle.borderRadius.bottomLeft = 12;
      baseStyle.effects.overflow = 'hidden';
      break;
    case 'testimonial':
      content = {
        type: 'testimonial',
        quote: 'Stakked let me ship my portfolio in a weekend.',
        author: 'Jane Doe',
        role: 'Photographer',
      };
      baseStyle.size.width = 360;
      baseStyle.size.height = 180;
      baseStyle.fills[0].value = 'rgba(24, 24, 27, 0.9)';
      baseStyle.borderRadius.topLeft = 12;
      baseStyle.borderRadius.topRight = 12;
      baseStyle.borderRadius.bottomRight = 12;
      baseStyle.borderRadius.bottomLeft = 12;
      baseStyle.typography = {
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 400,
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'left',
        textDecoration: 'none',
        textTransform: 'none',
        lineHeight: 1.4,
        letterSpacing: 0,
        wordSpacing: 0,
        textShadow: 'none',
        truncate: false,
        maxLines: 0,
      };
      break;
    case 'marquee':
      content = {
        type: 'marquee',
        items: ['NEW ALBUM OUT NOW', 'TOUR 2026', 'LIMITED MERCH DROP'],
        speed: 40,
        direction: 'left',
      };
      baseStyle.size.width = 640;
      baseStyle.size.height = 48;
      baseStyle.fills[0].value = '#000000';
      baseStyle.typography = {
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 700,
        fontStyle: 'normal',
        color: '#ffffff',
        textAlign: 'left',
        textDecoration: 'none',
        textTransform: 'uppercase',
        lineHeight: 1,
        letterSpacing: 1,
        wordSpacing: 0,
        textShadow: 'none',
        truncate: false,
        maxLines: 1,
      };
      break;
    case 'accordion':
      content = {
        type: 'accordion',
        sections: [
          { title: 'What is Stakked?', content: 'A drag-and-drop visual OS for creators.' },
          { title: 'How do I get started?', content: 'Pick a template and drop in your links, images, and music.' },
          { title: 'Can I export?', content: 'Yes — PNG, PDF, HTML, and more.' },
        ],
      };
      baseStyle.size.width = 420;
      baseStyle.size.height = 260;
      baseStyle.fills[0].value = 'rgba(24, 24, 27, 0.9)';
      baseStyle.borderRadius.topLeft = 12;
      baseStyle.borderRadius.topRight = 12;
      baseStyle.borderRadius.bottomRight = 12;
      baseStyle.borderRadius.bottomLeft = 12;
      break;
    case 'tabs':
      content = {
        type: 'tabs',
        tabs: [
          { label: 'Overview', content: 'Welcome to Stakked.' },
          { label: 'Details', content: 'Details go here.' },
          { label: 'FAQ', content: 'Frequently asked questions.' },
        ],
      };
      baseStyle.size.width = 420;
      baseStyle.size.height = 220;
      baseStyle.fills[0].value = 'rgba(24, 24, 27, 0.9)';
      baseStyle.borderRadius.topLeft = 10;
      baseStyle.borderRadius.topRight = 10;
      baseStyle.borderRadius.bottomRight = 10;
      baseStyle.borderRadius.bottomLeft = 10;
      break;
    case 'line':
      content = {
        type: 'line',
        color: '#ffffff',
        thickness: 2,
        style: 'solid',
        arrows: 'none',
        angle: 0,
      };
      baseStyle.size.width = 320;
      baseStyle.size.height = 2;
      baseStyle.fills[0].value = 'transparent';
      break;
    case 'drawing':
      content = {
        type: 'drawing',
        paths: [],
        viewBox: '0 0 400 300',
      };
      baseStyle.size.width = 400;
      baseStyle.size.height = 300;
      baseStyle.fills[0].value = 'transparent';
      break;
    default:
      content = { type: 'divider', variant: 'solid', color: '#ffffff' };
      break;
  }

  return {
    id,
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${Date.now().toString(36).slice(-4)}`,
    position: { x: 40, y: 40 },
    size: { width: baseStyle.size.width, height: baseStyle.size.height },
    rotation: 0,
    zIndex: 1,
    visible: true,
    locked: false,
    content,
    style: baseStyle,
    animations: [],
    behaviors: [],
  };
}
