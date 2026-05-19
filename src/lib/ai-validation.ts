/**
 * AI validation — Zod schemas that mirror every StakkedElement shape.
 *
 * The AI is untrusted: anything coming back from Gemini / Groq is
 * funneled through `validateAILayoutResponse()` before reaching Zustand.
 * Malformed output is rejected with a user-friendly error so the canvas
 * cannot be corrupted by an hallucinated payload.
 */
import { z } from 'zod';

/* ------------------------------- primitives -------------------------------- */

const nonEmpty = z.string().min(1);

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const sizeSchema = z.object({
  width: z.number().min(1).max(10000),
  height: z.number().min(1).max(10000),
});

const animationSchema = z.object({
  id: z.string(),
  trigger: z.enum(['onLoad', 'onScroll', 'onHover', 'onClick', 'whileInView']),
  type: z.enum([
    'fadeIn', 'fadeOut',
    'slideIn', 'slideOut',
    'scaleIn', 'scaleOut',
    'rotateIn',
    'bounceIn',
    'flipIn',
    'pulse', 'shake', 'glow', 'typewriter', 'blur',
    'reveal', 'parachute', 'perspectiveFlip', 'tilt',
    'custom',
  ]),
  direction: z.enum(['up', 'down', 'left', 'right']).optional(),
  duration: z.number().min(0).max(20_000),
  delay: z.number().min(0).max(20_000),
  easing: z.enum(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'spring', 'bounce']),
  repeat: z.number().min(0).max(1_000),
  stagger: z.number().optional(),
  keyframes: z
    .array(
      z.object({
        offset: z.number().min(0).max(1),
        style: z.record(z.string(), z.union([z.string(), z.number()])),
      }),
    )
    .optional(),
});

/* --------------------------------- content --------------------------------- */

/** Loose style schema — we don't force AI to emit every style field. */
const styleSchema = z.record(z.string(), z.unknown()).optional();

/** Minimal content discriminator — strictness lives on the type key. */
const contentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), html: z.string(), plainText: z.string() }),
  z.object({ type: z.literal('image'), src: z.string(), alt: z.string().default(''), objectFit: z.string().default('cover') }),
  z.object({ type: z.literal('button'), label: z.string(), url: z.string().default('#'), variant: z.string().default('primary') }),
  z.object({ type: z.literal('social-link'), platform: z.string(), url: z.string(), displayMode: z.string().default('icon') }),
  z.object({ type: z.literal('music-player'), platform: z.string(), url: z.string(), embedHtml: z.string().default(''), displayMode: z.string().default('embed') }),
  z.object({ type: z.literal('video'), platform: z.string(), url: z.string(), embedHtml: z.string().default(''), autoplay: z.boolean().default(false), loop: z.boolean().default(false) }),
  z.object({ type: z.literal('divider'), variant: z.string().default('solid'), color: z.string().default('#ccc') }),
  z.object({ type: z.literal('embed'), html: z.string() }),
  z.object({ type: z.literal('gallery'), images: z.array(z.object({ src: z.string(), alt: z.string() })), layout: z.string().default('grid'), columns: z.number().default(3) }),
  z.object({ type: z.literal('countdown'), targetDate: z.string(), label: z.string().default(''), format: z.string().default('DHMS') }),
  z.object({ type: z.literal('icon'), name: z.string(), set: z.string().default('lucide'), color: z.string().default('#000'), size: z.number().default(24) }),
  z.object({ type: z.literal('shape'), variant: z.string(), fill: z.string().default('#3b82f6'), svg: z.string().optional() }),
  z.object({ type: z.literal('container'), children: z.array(z.string()).default([]), layoutType: z.string().default('free') }),
  z.object({ type: z.literal('navigation'), links: z.array(z.object({ label: z.string(), href: z.string() })), navStyle: z.string().default('horizontal') }),
  z.object({ type: z.literal('form'), fields: z.array(z.object({ label: z.string(), fieldType: z.string(), required: z.boolean() })), action: z.string().default('') }),
  z.object({ type: z.literal('map'), lat: z.number(), lng: z.number(), zoom: z.number().default(14), provider: z.string().default('google') }),
  z.object({ type: z.literal('testimonial'), quote: z.string(), author: z.string(), role: z.string().default(''), avatar: z.string().optional() }),
  z.object({ type: z.literal('marquee'), items: z.array(z.string()), speed: z.number().default(40), direction: z.enum(['left', 'right']).default('left') }),
  z.object({ type: z.literal('accordion'), sections: z.array(z.object({ title: z.string(), content: z.string() })) }),
  z.object({ type: z.literal('tabs'), tabs: z.array(z.object({ label: z.string(), content: z.string() })) }),
]);

/* --------------------------------- element --------------------------------- */

export const aiElementSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    'text', 'image', 'button', 'social-link', 'music-player',
    'video', 'divider', 'embed', 'gallery', 'countdown',
    'icon', 'shape', 'container', 'navigation', 'form',
    'map', 'testimonial', 'marquee', 'accordion', 'tabs',
  ]),
  name: nonEmpty.default('Element'),
  position: positionSchema,
  size: sizeSchema,
  rotation: z.number().default(0),
  zIndex: z.number().default(1),
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
  content: contentSchema,
  style: styleSchema,
  animations: z.array(animationSchema).default([]),
});

export const aiLayoutSchema = z.object({
  elements: z.array(aiElementSchema).min(1).max(50),
  theme: z.string().optional(),
  reasoning: z.string().optional(),
});

export const aiThemeSchema = z.object({
  themeName: z.string(),
  tokens: z.record(z.string(), z.unknown()),
  reasoning: z.string().optional(),
});

export const aiSummarySchema = z.object({
  summary: z.string(),
});

/* -------------------------------- public API ------------------------------- */

export type AILayoutResponse = z.infer<typeof aiLayoutSchema>;
export type AIThemeResponse = z.infer<typeof aiThemeSchema>;
export type AISummaryResponse = z.infer<typeof aiSummarySchema>;

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function summarizeZodError(err: z.ZodError): string {
  const issues = err.issues.slice(0, 3).map((i) => {
    const path = i.path.join('.') || '<root>';
    return `${path}: ${i.message}`;
  });
  const suffix = err.issues.length > 3 ? ` (+${err.issues.length - 3} more)` : '';
  return `AI response failed validation — ${issues.join('; ')}${suffix}`;
}

export function validateAILayoutResponse(raw: unknown): ValidationResult<AILayoutResponse> {
  const parsed = aiLayoutSchema.safeParse(raw);
  if (parsed.success) return { success: true, data: parsed.data };
  return { success: false, error: summarizeZodError(parsed.error) };
}

export function validateAIThemeResponse(raw: unknown): ValidationResult<AIThemeResponse> {
  const parsed = aiThemeSchema.safeParse(raw);
  if (parsed.success) return { success: true, data: parsed.data };
  return { success: false, error: summarizeZodError(parsed.error) };
}

export function validateAISummaryResponse(raw: unknown): ValidationResult<AISummaryResponse> {
  const parsed = aiSummarySchema.safeParse(raw);
  if (parsed.success) return { success: true, data: parsed.data };
  return { success: false, error: summarizeZodError(parsed.error) };
}
