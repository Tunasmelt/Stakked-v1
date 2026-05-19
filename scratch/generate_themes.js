/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const THEME_NAMES = [
  'Neon Cyberpunk', 'Ghost', 'Minimal Light', 'Minimal Dark', 'Sunset',
  'Luxury Gold', 'Ocean Deep', 'Forest', 'Pastel Dream', 'Brutalist',
  'Retro Arcade', 'Monochrome', 'Vaporwave', 'Nordic', 'Terracotta',
  'Electric Blue', 'Midnight', 'Rose Gold', 'Paper', 'Earthtone'
];

const dataPath = path.join(__dirname, '..', '..', 'src', 'data', 'themes');
const cssPath = path.join(__dirname, '..', '..', 'src', 'styles', 'themes');

fs.mkdirSync(dataPath, { recursive: true });
fs.mkdirSync(cssPath, { recursive: true });

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// Fixed color palettes for a selection of themes for premium aesthetics:
const palettes = {
  'neon-cyberpunk': {
    primary: '#FF0055', secondary: '#00F0FF', accent: '#FFE600',
    bgLight: '#120024', surfaceLight: '#230046', textLight: '#FFFFFF',
    bgDark: '#0A0014', surfaceDark: '#120024', textDark: '#FFFFFF'
  },
  'ghost': {
    primary: '#FFFFFF', secondary: '#E0E0E0', accent: '#BDBDBD',
    bgLight: '#FAFAFA', surfaceLight: '#FFFFFF', textLight: '#000000',
    bgDark: '#121212', surfaceDark: '#1E1E1E', textDark: '#FFFFFF'
  },
  'minimal-light': {
    primary: '#000000', secondary: '#424242', accent: '#757575',
    bgLight: '#FFFFFF', surfaceLight: '#F5F5F5', textLight: '#212121',
    bgDark: '#1F1F1F', surfaceDark: '#2C2C2C', textDark: '#EEEEEE'
  },
  'minimal-dark': {
    primary: '#FFFFFF', secondary: '#BDBDBD', accent: '#757575',
    bgLight: '#212121', surfaceLight: '#303030', textLight: '#FFFFFF',
    bgDark: '#121212', surfaceDark: '#1E1E1E', textDark: '#E0E0E0'
  },
  'luxury-gold': {
    primary: '#D4AF37', secondary: '#FFFDD0', accent: '#C5B358',
    bgLight: '#1C1C1C', surfaceLight: '#2B2B2B', textLight: '#F0E6D2',
    bgDark: '#000000', surfaceDark: '#111111', textDark: '#E5D3A3'
  },
  'brutalist': {
    primary: '#FF0000', secondary: '#0000FF', accent: '#FFFF00',
    bgLight: '#FFFFFF', surfaceLight: '#EEEEEE', textLight: '#000000',
    bgDark: '#000000', surfaceDark: '#111111', textDark: '#FFFFFF'
  },
  'vaporwave': {
    primary: '#FF71CE', secondary: '#01CDFE', accent: '#05FFA1',
    bgLight: '#2B00FF', surfaceLight: '#B967FF', textLight: '#FFFFFF',
    bgDark: '#170066', surfaceDark: '#3A0088', textDark: '#FFF0F5'
  }
};

function generateThemeJson(name, slug) {
  const p = palettes[slug] || {
    primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B',
    bgLight: '#FFFFFF', surfaceLight: '#F3F4F6', textLight: '#111827',
    bgDark: '#1F2937', surfaceDark: '#374151', textDark: '#F9FAFB'
  };

  return {
    id: slug,
    name: name,
    previewColor: p.primary,
    tokens: {
      light: {
        colors: {
          primary: p.primary,
          secondary: p.secondary,
          accent: p.accent,
          background: p.bgLight,
          surface: p.surfaceLight,
          border: p.accent,
          text: p.textLight,
          textMuted: p.secondary
        },
        fonts: {
          heading: { family: "Inter, sans-serif", weight: 700 },
          body: { family: "Inter, sans-serif", weight: 400 },
          mono: { family: "Fira Code, monospace", weight: 400 }
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 64 },
        shadows: { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.1)", lg: "0 10px 15px rgba(0,0,0,0.1)", glow: `0 0 15px ${p.primary}` },
        radius: { sm: 4, md: 8, lg: 16, full: 9999 }
      },
      dark: {
        colors: {
          primary: p.primary,
          secondary: p.secondary,
          accent: p.accent,
          background: p.bgDark,
          surface: p.surfaceDark,
          border: p.accent,
          text: p.textDark,
          textMuted: p.secondary
        },
        fonts: {
          heading: { family: "Inter, sans-serif", weight: 700 },
          body: { family: "Inter, sans-serif", weight: 400 },
          mono: { family: "Fira Code, monospace", weight: 400 }
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 64 },
        shadows: { sm: "0 1px 2px rgba(0,0,0,0.3)", md: "0 4px 6px rgba(0,0,0,0.4)", lg: "0 10px 15px rgba(0,0,0,0.5)", glow: `0 0 15px ${p.primary}` },
        radius: { sm: 4, md: 8, lg: 16, full: 9999 }
      }
    }
  };
}

function generateCss(slug) {
  return `
/* ${slug} Theme Override Class */
.${slug} {
  /* This file can be used to inject static CSS classes for themes if needed, 
     though the engine operates primarily on JS-injected custom properties. */
}
`;
}

for (const name of THEME_NAMES) {
  const slug = slugify(name);
  const jsonContent = JSON.stringify(generateThemeJson(name, slug), null, 2);
  const cssContent = generateCss(slug);
  
  fs.writeFileSync(path.join(dataPath, `${slug}.json`), jsonContent, 'utf-8');
  fs.writeFileSync(path.join(cssPath, `${slug}.module.css`), cssContent, 'utf-8');
}

console.log('20 Themes Successfully Generated!');
