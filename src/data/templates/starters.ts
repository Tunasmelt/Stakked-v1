import { StakkedProject } from '@/types/project';
import { v4 as uuidv4 } from 'uuid';

export const STARTER_TEMPLATES: Record<string, Partial<StakkedProject>> = {
  'neon-arcade': {
    title: 'Neon Arcade',
    category: 'music',
    pages: [
      {
        id: uuidv4(),
        title: 'Home',
        slug: 'index',
        order: 0,
        canvas: {
          width: 1440,
          height: 1024,
          background: { type: 'color', value: '#07000f' },
          padding: 0
        },
        elements: []
      }
    ],
    settings: {
      theme: 'neon-cyberpunk'
    }
  },
  'static-bloom': {
    title: 'Static Bloom',
    category: 'portfolio',
    pages: [
      {
        id: uuidv4(),
        title: 'Work',
        slug: 'work',
        order: 0,
        canvas: {
          width: 1440,
          height: 900,
          background: { type: 'color', value: '#1a1a1e' },
          padding: 40
        },
        elements: []
      }
    ],
    settings: {
      theme: 'ghost'
    }
  },
  'photographer-portfolio': {
    title: 'Photographer Portfolio',
    category: 'portfolio',
    tags: ['photography', 'portfolio', 'dark'],
    pages: [
      {
        id: 'pp-page-home',
        title: 'Home',
        slug: 'index',
        order: 0,
        canvas: {
          width: 1440,
          height: 1200,
          background: { type: 'color', value: '#0a0a0a' },
          padding: 0
        },
        elements: [
          {
            id: 'pp-hero-image',
            type: 'image',
            name: 'Hero Image',
            position: { x: 0, y: 0 },
            size: { width: 1440, height: 500 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'image',
              src: 'https://picsum.photos/seed/photography-hero/1440/500',
              alt: 'Hero photograph',
              objectFit: 'cover'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 0, y: 0 },
              size: { width: 1440, height: 500, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'pp-hi-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 0, color: '#000000', style: 'none' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: true
              },
              borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'hidden', cursor: 'default', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'pp-name-text',
            type: 'text',
            name: 'Photographer Name',
            position: { x: 80, y: 200 },
            size: { width: 700, height: 120 },
            rotation: 0,
            zIndex: 2,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<h1>Alex Monroe</h1>',
              plainText: 'Alex Monroe'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 80, y: 200 },
              size: { width: 700, height: 120, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'pp-nt-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Georgia, serif',
                fontSize: 72,
                fontWeight: 700,
                fontStyle: 'normal',
                color: '#ffffff',
                textAlign: 'left',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.1,
                letterSpacing: -2,
                wordSpacing: 0,
                textShadow: '0 2px 24px rgba(0,0,0,0.7)',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'pp-subtitle-text',
            type: 'text',
            name: 'Subtitle',
            position: { x: 80, y: 330 },
            size: { width: 500, height: 50 },
            rotation: 0,
            zIndex: 2,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<p>Documentary &amp; Landscape Photography</p>',
              plainText: 'Documentary & Landscape Photography'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 80, y: 330 },
              size: { width: 500, height: 50, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'pp-st-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 20,
                fontWeight: 400,
                fontStyle: 'normal',
                color: '#d4d4d4',
                textAlign: 'left',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.4,
                letterSpacing: 0.5,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'pp-gallery',
            type: 'gallery',
            name: 'Photo Gallery',
            position: { x: 80, y: 580 },
            size: { width: 1280, height: 380 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'gallery',
              images: [
                { src: 'https://picsum.photos/seed/photo-g1/420/380', alt: 'Gallery photo 1' },
                { src: 'https://picsum.photos/seed/photo-g2/420/380', alt: 'Gallery photo 2' },
                { src: 'https://picsum.photos/seed/photo-g3/420/380', alt: 'Gallery photo 3' }
              ],
              layout: 'grid',
              columns: 3
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 80, y: 580 },
              size: { width: 1280, height: 380, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'pp-gal-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 0, color: '#000000', style: 'none' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: true
              },
              borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'hidden', cursor: 'default', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'pp-social-instagram',
            type: 'social-link',
            name: 'Instagram Link',
            position: { x: 80, y: 1020 },
            size: { width: 200, height: 52 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'social-link',
              platform: 'instagram',
              url: 'https://instagram.com/',
              displayMode: 'icon+text'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 80, y: 1020 },
              size: { width: 200, height: 52, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'pp-si-fill', type: 'color', value: '#18181b', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#3f3f46', style: 'solid' },
                right: { width: 1, color: '#3f3f46', style: 'solid' },
                bottom: { width: 1, color: '#3f3f46', style: 'solid' },
                left: { width: 1, color: '#3f3f46', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'pp-social-twitter',
            type: 'social-link',
            name: 'Twitter Link',
            position: { x: 296, y: 1020 },
            size: { width: 200, height: 52 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'social-link',
              platform: 'twitter',
              url: 'https://twitter.com/',
              displayMode: 'icon+text'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 296, y: 1020 },
              size: { width: 200, height: 52, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'pp-st2-fill', type: 'color', value: '#18181b', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#3f3f46', style: 'solid' },
                right: { width: 1, color: '#3f3f46', style: 'solid' },
                bottom: { width: 1, color: '#3f3f46', style: 'solid' },
                left: { width: 1, color: '#3f3f46', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          }
        ]
      }
    ],
    settings: {
      theme: 'ghost'
    }
  },
  'event-landing': {
    title: 'Event Landing Page',
    category: 'music',
    tags: ['event', 'music', 'landing'],
    pages: [
      {
        id: 'el-page-home',
        title: 'Home',
        slug: 'index',
        order: 0,
        canvas: {
          width: 1440,
          height: 1000,
          background: { type: 'color', value: '#1a0026' },
          padding: 0
        },
        elements: [
          {
            id: 'el-bg-shape',
            type: 'shape',
            name: 'Background Shape',
            position: { x: 0, y: 0 },
            size: { width: 1440, height: 1000 },
            rotation: 0,
            zIndex: 0,
            visible: true,
            locked: false,
            content: {
              type: 'shape',
              variant: 'rect',
              fill: '#2d0050'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 0, y: 0 },
              size: { width: 1440, height: 1000, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'el-bg-fill', type: 'gradient', value: 'linear-gradient(135deg, #1a0026 0%, #4a0080 50%, #1a0040 100%)', opacity: 1, blendMode: 'normal' }],
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
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'el-event-title',
            type: 'text',
            name: 'Event Title',
            position: { x: 220, y: 120 },
            size: { width: 1000, height: 140 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<h1>NEON FESTIVAL 2026</h1>',
              plainText: 'NEON FESTIVAL 2026'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 220, y: 120 },
              size: { width: 1000, height: 140, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'el-et-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: 96,
                fontWeight: 900,
                fontStyle: 'normal',
                color: '#f0e0ff',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'uppercase',
                lineHeight: 1.0,
                letterSpacing: 4,
                wordSpacing: 0,
                textShadow: '0 0 40px rgba(180,80,255,0.8)',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'el-date-venue',
            type: 'text',
            name: 'Date and Venue',
            position: { x: 420, y: 280 },
            size: { width: 600, height: 60 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<p>August 14–16, 2026 · Madison Square Garden, NYC</p>',
              plainText: 'August 14–16, 2026 · Madison Square Garden, NYC'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 420, y: 280 },
              size: { width: 600, height: 60, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'el-dv-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 22,
                fontWeight: 400,
                fontStyle: 'normal',
                color: '#c084fc',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.4,
                letterSpacing: 1,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'el-countdown',
            type: 'countdown',
            name: 'Event Countdown',
            position: { x: 420, y: 380 },
            size: { width: 600, height: 200 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'countdown',
              targetDate: '2026-08-14T20:00:00.000Z',
              label: 'Until Showtime',
              format: 'dd:hh:mm:ss'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 420, y: 380 },
              size: { width: 600, height: 200, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'el-cd-fill', type: 'color', value: 'rgba(80,0,120,0.5)', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#7c3aed', style: 'solid' },
                right: { width: 1, color: '#7c3aed', style: 'solid' },
                bottom: { width: 1, color: '#7c3aed', style: 'solid' },
                left: { width: 1, color: '#7c3aed', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 20, topRight: 20, bottomRight: 20, bottomLeft: 20, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'default', shadows: [], backdropFilter: 'blur(10px)' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'el-cta-button',
            type: 'button',
            name: 'Get Tickets Button',
            position: { x: 570, y: 640 },
            size: { width: 300, height: 64 },
            rotation: 0,
            zIndex: 2,
            visible: true,
            locked: false,
            content: {
              type: 'button',
              label: 'Get Tickets',
              url: '#',
              variant: 'filled'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 570, y: 640 },
              size: { width: 300, height: 64, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'el-btn-fill', type: 'color', value: '#9333ea', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 0, color: '#000000', style: 'none' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: true
              },
              borderRadius: { topLeft: 999, topRight: 999, bottomRight: 999, bottomLeft: 999, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [{ id: 'el-btn-shadow', type: 'drop', x: 0, y: 8, blur: 32, spread: 0, color: 'rgba(147,51,234,0.6)' }], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 20,
                fontWeight: 700,
                fontStyle: 'normal',
                color: '#ffffff',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'uppercase',
                lineHeight: 1.2,
                letterSpacing: 2,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 1
              }
            },
            animations: [],
            behaviors: []
          }
        ]
      }
    ],
    settings: {
      theme: 'velvet'
    }
  },
  'podcast-home': {
    title: 'Podcast Home',
    category: 'media',
    tags: ['podcast', 'audio', 'media'],
    pages: [
      {
        id: 'ph-page-home',
        title: 'Home',
        slug: 'index',
        order: 0,
        canvas: {
          width: 1440,
          height: 1000,
          background: { type: 'color', value: '#fafaf9' },
          padding: 0
        },
        elements: [
          {
            id: 'ph-show-title',
            type: 'text',
            name: 'Show Title',
            position: { x: 200, y: 80 },
            size: { width: 800, height: 120 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<h1>Deep Dive Podcast</h1>',
              plainText: 'Deep Dive Podcast'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 200, y: 80 },
              size: { width: 800, height: 120, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ph-st-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Georgia, serif',
                fontSize: 72,
                fontWeight: 700,
                fontStyle: 'normal',
                color: '#1c1917',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.1,
                letterSpacing: -2,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ph-description',
            type: 'text',
            name: 'Episode Description',
            position: { x: 320, y: 220 },
            size: { width: 800, height: 80 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<p>Weekly conversations with founders, scientists, and artists exploring the edge of what\'s possible.</p>',
              plainText: "Weekly conversations with founders, scientists, and artists exploring the edge of what's possible."
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 320, y: 220 },
              size: { width: 800, height: 80, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ph-desc-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 20,
                fontWeight: 400,
                fontStyle: 'normal',
                color: '#57534e',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.6,
                letterSpacing: 0,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ph-player',
            type: 'music-player',
            name: 'Spotify Player',
            position: { x: 360, y: 340 },
            size: { width: 720, height: 232 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'music-player',
              platform: 'spotify',
              url: 'https://open.spotify.com/show/example',
              embedHtml: '',
              displayMode: 'full'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 360, y: 340 },
              size: { width: 720, height: 232, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ph-pl-fill', type: 'color', value: '#1c1917', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 0, color: '#000000', style: 'none' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: true
              },
              borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'hidden', cursor: 'default', shadows: [{ id: 'ph-pl-shadow', type: 'drop', x: 0, y: 8, blur: 32, spread: 0, color: 'rgba(0,0,0,0.15)' }], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ph-subscribe-btn',
            type: 'button',
            name: 'Subscribe Button',
            position: { x: 570, y: 620 },
            size: { width: 300, height: 56 },
            rotation: 0,
            zIndex: 2,
            visible: true,
            locked: false,
            content: {
              type: 'button',
              label: 'Subscribe Now',
              url: '#',
              variant: 'filled'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 570, y: 620 },
              size: { width: 300, height: 56, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ph-sub-fill', type: 'color', value: '#1c1917', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 0, color: '#000000', style: 'none' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: true
              },
              borderRadius: { topLeft: 999, topRight: 999, bottomRight: 999, bottomLeft: 999, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 18,
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
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ph-social-spotify',
            type: 'social-link',
            name: 'Spotify Social',
            position: { x: 480, y: 740 },
            size: { width: 200, height: 52 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'social-link',
              platform: 'spotify',
              url: 'https://open.spotify.com/',
              displayMode: 'icon+text'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 480, y: 740 },
              size: { width: 200, height: 52, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ph-sp-fill', type: 'color', value: '#f5f5f4', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#d6d3d1', style: 'solid' },
                right: { width: 1, color: '#d6d3d1', style: 'solid' },
                bottom: { width: 1, color: '#d6d3d1', style: 'solid' },
                left: { width: 1, color: '#d6d3d1', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ph-social-apple',
            type: 'social-link',
            name: 'Apple Podcasts Social',
            position: { x: 696, y: 740 },
            size: { width: 200, height: 52 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'social-link',
              platform: 'apple',
              url: 'https://podcasts.apple.com/',
              displayMode: 'icon+text'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 696, y: 740 },
              size: { width: 200, height: 52, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ph-ap-fill', type: 'color', value: '#f5f5f4', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#d6d3d1', style: 'solid' },
                right: { width: 1, color: '#d6d3d1', style: 'solid' },
                bottom: { width: 1, color: '#d6d3d1', style: 'solid' },
                left: { width: 1, color: '#d6d3d1', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          }
        ]
      }
    ],
    settings: {
      theme: 'chalk'
    }
  },
  'link-in-bio': {
    title: 'Link in Bio',
    category: 'social',
    tags: ['links', 'social', 'minimal'],
    pages: [
      {
        id: 'lib-page-home',
        title: 'Home',
        slug: 'index',
        order: 0,
        canvas: {
          width: 1440,
          height: 1000,
          background: { type: 'color', value: '#09090b' },
          padding: 0
        },
        elements: [
          {
            id: 'lib-avatar',
            type: 'image',
            name: 'Avatar',
            position: { x: 620, y: 60 },
            size: { width: 200, height: 200 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'image',
              src: 'https://picsum.photos/seed/avatar-lib/200/200',
              alt: 'Profile photo',
              objectFit: 'cover'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 620, y: 60 },
              size: { width: 200, height: 200, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'lib-av-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 3, color: '#52525b', style: 'solid' },
                right: { width: 3, color: '#52525b', style: 'solid' },
                bottom: { width: 3, color: '#52525b', style: 'solid' },
                left: { width: 3, color: '#52525b', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 999, topRight: 999, bottomRight: 999, bottomLeft: 999, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'hidden', cursor: 'default', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'lib-name',
            type: 'text',
            name: 'Name',
            position: { x: 420, y: 280 },
            size: { width: 600, height: 64 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<h2>Your Name</h2>',
              plainText: 'Your Name'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 420, y: 280 },
              size: { width: 600, height: 64, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'lib-nm-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 40,
                fontWeight: 700,
                fontStyle: 'normal',
                color: '#fafafa',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.1,
                letterSpacing: -1,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'lib-tagline',
            type: 'text',
            name: 'Tagline',
            position: { x: 420, y: 356 },
            size: { width: 600, height: 44 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<p>Creator · Designer · Builder</p>',
              plainText: 'Creator · Designer · Builder'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 420, y: 356 },
              size: { width: 600, height: 44, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'lib-tg-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 18,
                fontWeight: 400,
                fontStyle: 'normal',
                color: '#a1a1aa',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.4,
                letterSpacing: 0,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'lib-link-1',
            type: 'button',
            name: 'Link 1',
            position: { x: 470, y: 440 },
            size: { width: 500, height: 60 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: { type: 'button', label: 'My Portfolio', url: '#', variant: 'outline' },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 470, y: 440 },
              size: { width: 500, height: 60, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'lib-l1-fill', type: 'color', value: '#18181b', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#3f3f46', style: 'solid' },
                right: { width: 1, color: '#3f3f46', style: 'solid' },
                bottom: { width: 1, color: '#3f3f46', style: 'solid' },
                left: { width: 1, color: '#3f3f46', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 14, topRight: 14, bottomRight: 14, bottomLeft: 14, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: { fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, fontStyle: 'normal', color: '#fafafa', textAlign: 'center', textDecoration: 'none', textTransform: 'none', lineHeight: 1.2, letterSpacing: 0, wordSpacing: 0, textShadow: 'none', truncate: false, maxLines: 1 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'lib-link-2',
            type: 'button',
            name: 'Link 2',
            position: { x: 470, y: 516 },
            size: { width: 500, height: 60 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: { type: 'button', label: 'Latest Project', url: '#', variant: 'outline' },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 470, y: 516 },
              size: { width: 500, height: 60, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'lib-l2-fill', type: 'color', value: '#18181b', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#3f3f46', style: 'solid' },
                right: { width: 1, color: '#3f3f46', style: 'solid' },
                bottom: { width: 1, color: '#3f3f46', style: 'solid' },
                left: { width: 1, color: '#3f3f46', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 14, topRight: 14, bottomRight: 14, bottomLeft: 14, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: { fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, fontStyle: 'normal', color: '#fafafa', textAlign: 'center', textDecoration: 'none', textTransform: 'none', lineHeight: 1.2, letterSpacing: 0, wordSpacing: 0, textShadow: 'none', truncate: false, maxLines: 1 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'lib-link-3',
            type: 'button',
            name: 'Link 3',
            position: { x: 470, y: 592 },
            size: { width: 500, height: 60 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: { type: 'button', label: 'Newsletter', url: '#', variant: 'outline' },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 470, y: 592 },
              size: { width: 500, height: 60, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'lib-l3-fill', type: 'color', value: '#18181b', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#3f3f46', style: 'solid' },
                right: { width: 1, color: '#3f3f46', style: 'solid' },
                bottom: { width: 1, color: '#3f3f46', style: 'solid' },
                left: { width: 1, color: '#3f3f46', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 14, topRight: 14, bottomRight: 14, bottomLeft: 14, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: { fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, fontStyle: 'normal', color: '#fafafa', textAlign: 'center', textDecoration: 'none', textTransform: 'none', lineHeight: 1.2, letterSpacing: 0, wordSpacing: 0, textShadow: 'none', truncate: false, maxLines: 1 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'lib-link-4',
            type: 'button',
            name: 'Link 4',
            position: { x: 470, y: 668 },
            size: { width: 500, height: 60 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: { type: 'button', label: 'Book a Call', url: '#', variant: 'outline' },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 470, y: 668 },
              size: { width: 500, height: 60, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'lib-l4-fill', type: 'color', value: '#18181b', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#3f3f46', style: 'solid' },
                right: { width: 1, color: '#3f3f46', style: 'solid' },
                bottom: { width: 1, color: '#3f3f46', style: 'solid' },
                left: { width: 1, color: '#3f3f46', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 14, topRight: 14, bottomRight: 14, bottomLeft: 14, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: { fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, fontStyle: 'normal', color: '#fafafa', textAlign: 'center', textDecoration: 'none', textTransform: 'none', lineHeight: 1.2, letterSpacing: 0, wordSpacing: 0, textShadow: 'none', truncate: false, maxLines: 1 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'lib-social-row',
            type: 'social-link',
            name: 'Instagram',
            position: { x: 620, y: 800 },
            size: { width: 200, height: 52 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'social-link',
              platform: 'instagram',
              url: 'https://instagram.com/',
              displayMode: 'icon'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 620, y: 800 },
              size: { width: 200, height: 52, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'lib-sr-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 0, color: '#000000', style: 'none' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: true
              },
              borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          }
        ]
      }
    ],
    settings: {
      theme: 'ghost'
    }
  },
  'product-showcase': {
    title: 'Product Showcase',
    category: 'shop',
    tags: ['product', 'shop', 'design'],
    pages: [
      {
        id: 'ps-page-home',
        title: 'Home',
        slug: 'index',
        order: 0,
        canvas: {
          width: 1440,
          height: 1100,
          background: { type: 'color', value: '#1c0a00' },
          padding: 0
        },
        elements: [
          {
            id: 'ps-hero-image',
            type: 'image',
            name: 'Product Hero Image',
            position: { x: 720, y: 80 },
            size: { width: 600, height: 560 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'image',
              src: 'https://picsum.photos/seed/product-hero/600/560',
              alt: 'Product image',
              objectFit: 'cover'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 720, y: 80 },
              size: { width: 600, height: 560, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ps-hi-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 0, color: '#000000', style: 'none' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: true
              },
              borderRadius: { topLeft: 20, topRight: 20, bottomRight: 20, bottomLeft: 20, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'hidden', cursor: 'default', shadows: [{ id: 'ps-hi-shadow', type: 'drop', x: 0, y: 20, blur: 60, spread: 0, color: 'rgba(0,0,0,0.5)' }], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ps-product-name',
            type: 'text',
            name: 'Product Name',
            position: { x: 120, y: 160 },
            size: { width: 540, height: 120 },
            rotation: 0,
            zIndex: 2,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<h1>The Artisan Tote</h1>',
              plainText: 'The Artisan Tote'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 120, y: 160 },
              size: { width: 540, height: 120, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ps-pn-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Georgia, serif',
                fontSize: 64,
                fontWeight: 700,
                fontStyle: 'normal',
                color: '#fef3c7',
                textAlign: 'left',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.1,
                letterSpacing: -1,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ps-description',
            type: 'text',
            name: 'Product Description',
            position: { x: 120, y: 300 },
            size: { width: 540, height: 140 },
            rotation: 0,
            zIndex: 2,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<p>Handcrafted from full-grain vegetable-tanned leather, each tote is uniquely yours. Designed to age beautifully over decades of daily use.</p>',
              plainText: 'Handcrafted from full-grain vegetable-tanned leather, each tote is uniquely yours. Designed to age beautifully over decades of daily use.'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 120, y: 300 },
              size: { width: 540, height: 140, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ps-desc-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 18,
                fontWeight: 400,
                fontStyle: 'normal',
                color: '#d4a96a',
                textAlign: 'left',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.6,
                letterSpacing: 0,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ps-price',
            type: 'text',
            name: 'Price',
            position: { x: 120, y: 460 },
            size: { width: 300, height: 80 },
            rotation: 0,
            zIndex: 2,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<p>$285 USD</p>',
              plainText: '$285 USD'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 120, y: 460 },
              size: { width: 300, height: 80, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ps-pr-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 44,
                fontWeight: 700,
                fontStyle: 'normal',
                color: '#fbbf24',
                textAlign: 'left',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.2,
                letterSpacing: 0,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ps-buy-button',
            type: 'button',
            name: 'Buy Now Button',
            position: { x: 120, y: 560 },
            size: { width: 280, height: 60 },
            rotation: 0,
            zIndex: 2,
            visible: true,
            locked: false,
            content: {
              type: 'button',
              label: 'Buy Now',
              url: '#',
              variant: 'filled'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 120, y: 560 },
              size: { width: 280, height: 60, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ps-btn-fill', type: 'color', value: '#b45309', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 0, color: '#000000', style: 'none' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: true
              },
              borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 20,
                fontWeight: 700,
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
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'ps-secondary-desc',
            type: 'text',
            name: 'Secondary Description',
            position: { x: 120, y: 720 },
            size: { width: 1200, height: 80 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<p>Free shipping worldwide · 30-day returns · Lifetime repair guarantee</p>',
              plainText: 'Free shipping worldwide · 30-day returns · Lifetime repair guarantee'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 120, y: 720 },
              size: { width: 1200, height: 80, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'ps-sd-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#3b1a00', style: 'solid' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: false
              },
              borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'default', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                fontWeight: 400,
                fontStyle: 'normal',
                color: '#92400e',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.6,
                letterSpacing: 0.5,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          }
        ]
      }
    ],
    settings: {
      theme: 'copper'
    }
  },
  'coming-soon': {
    title: 'Coming Soon',
    category: 'launch',
    tags: ['launch', 'waitlist', 'minimal'],
    pages: [
      {
        id: 'cs-page-home',
        title: 'Home',
        slug: 'index',
        order: 0,
        canvas: {
          width: 1440,
          height: 1000,
          background: { type: 'color', value: '#f0f4f8' },
          padding: 0
        },
        elements: [
          {
            id: 'cs-brand-text',
            type: 'text',
            name: 'Brand Name',
            position: { x: 220, y: 120 },
            size: { width: 1000, height: 160 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<h1>Something Big Is Coming</h1>',
              plainText: 'Something Big Is Coming'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 220, y: 120 },
              size: { width: 1000, height: 160, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'cs-bt-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 80,
                fontWeight: 800,
                fontStyle: 'normal',
                color: '#0f172a',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.05,
                letterSpacing: -3,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'cs-countdown',
            type: 'countdown',
            name: 'Launch Countdown',
            position: { x: 420, y: 320 },
            size: { width: 600, height: 160 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'countdown',
              targetDate: '2026-09-01T00:00:00.000Z',
              label: 'Until Launch',
              format: 'dd:hh:mm:ss'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 420, y: 320 },
              size: { width: 600, height: 160, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'cs-cd-fill', type: 'color', value: '#e2eaf2', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#cbd5e1', style: 'solid' },
                right: { width: 1, color: '#cbd5e1', style: 'solid' },
                bottom: { width: 1, color: '#cbd5e1', style: 'solid' },
                left: { width: 1, color: '#cbd5e1', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 20, topRight: 20, bottomRight: 20, bottomLeft: 20, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'default', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'cs-tagline',
            type: 'text',
            name: 'Tagline',
            position: { x: 380, y: 510 },
            size: { width: 680, height: 56 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'text',
              html: '<p>Join the waitlist and be the first to know when we launch.</p>',
              plainText: 'Join the waitlist and be the first to know when we launch.'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 380, y: 510 },
              size: { width: 680, height: 56, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'cs-tg-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
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
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 },
              typography: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 20,
                fontWeight: 400,
                fontStyle: 'normal',
                color: '#475569',
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'none',
                lineHeight: 1.5,
                letterSpacing: 0,
                wordSpacing: 0,
                textShadow: 'none',
                truncate: false,
                maxLines: 0
              }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'cs-email-form',
            type: 'form',
            name: 'Email Capture Form',
            position: { x: 470, y: 590 },
            size: { width: 500, height: 180 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'form',
              fields: [
                { label: 'Email Address', fieldType: 'email', required: true }
              ],
              action: ''
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 470, y: 590 },
              size: { width: 500, height: 180, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'cs-ef-fill', type: 'color', value: 'transparent', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 0, color: '#000000', style: 'none' },
                right: { width: 0, color: '#000000', style: 'none' },
                bottom: { width: 0, color: '#000000', style: 'none' },
                left: { width: 0, color: '#000000', style: 'none' },
                linked: true
              },
              borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'default', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'cs-social-twitter',
            type: 'social-link',
            name: 'Twitter',
            position: { x: 580, y: 820 },
            size: { width: 200, height: 52 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'social-link',
              platform: 'twitter',
              url: 'https://twitter.com/',
              displayMode: 'icon+text'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 580, y: 820 },
              size: { width: 200, height: 52, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'cs-soc-fill', type: 'color', value: '#e2eaf2', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#cbd5e1', style: 'solid' },
                right: { width: 1, color: '#cbd5e1', style: 'solid' },
                bottom: { width: 1, color: '#cbd5e1', style: 'solid' },
                left: { width: 1, color: '#cbd5e1', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          },
          {
            id: 'cs-social-instagram',
            type: 'social-link',
            name: 'Instagram',
            position: { x: 796, y: 820 },
            size: { width: 200, height: 52 },
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: {
              type: 'social-link',
              platform: 'instagram',
              url: 'https://instagram.com/',
              displayMode: 'icon+text'
            },
            style: {
              responsive: {},
              position: { type: 'absolute', x: 796, y: 820 },
              size: { width: 200, height: 52, widthMode: 'px', heightMode: 'px' },
              fills: [{ id: 'cs-soci-fill', type: 'color', value: '#e2eaf2', opacity: 1, blendMode: 'normal' }],
              border: {
                top: { width: 1, color: '#cbd5e1', style: 'solid' },
                right: { width: 1, color: '#cbd5e1', style: 'solid' },
                bottom: { width: 1, color: '#cbd5e1', style: 'solid' },
                left: { width: 1, color: '#cbd5e1', style: 'solid' },
                linked: true
              },
              borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px', linked: true },
              effects: { opacity: 1, visible: true, overflow: 'visible', cursor: 'pointer', shadows: [], backdropFilter: 'none' },
              overlays: [],
              transform: { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0, origin: 'center', perspective: 1000, rotateX: 0, rotateY: 0 }
            },
            animations: [],
            behaviors: []
          }
        ]
      }
    ],
    settings: {
      theme: 'glacier'
    }
  }
};
