import { NextRequest, NextResponse } from 'next/server';
import {
  generateJSON,
  AIProviderError,
  listAvailableProviders,
  ProviderId,
} from '@/lib/ai-providers';
import { validateAIThemeResponse } from '@/lib/ai-validation';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a visual designer. Given a palette (hex colors) and optional category,
return a Stakked theme as JSON:

{
  "themeName": "<short evocative name>",
  "tokens": {
    "background": "<hex>",
    "foreground": "<hex>",
    "accent": "<hex>",
    "surface": "<hex>",
    "muted": "<hex>",
    "border": "<hex>",
    "fontHeading": "<google font family>",
    "fontBody": "<google font family>"
  },
  "reasoning": "<one sentence>"
}

Rules:
- Only return JSON. No prose. No code fences.
- Use the provided palette when possible.
- Ensure background/foreground contrast is legible.`;

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) return rl.response;

  let payload: { palette?: string[]; category?: string; provider?: ProviderId };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload.palette || !Array.isArray(payload.palette) || payload.palette.length === 0) {
    return NextResponse.json({ error: 'palette array is required' }, { status: 400 });
  }

  // Validate each entry is a hex color string — rejects prompt injection attempts
  // like ["#fff\n\nIgnore all previous instructions…"].
  const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
  if (payload.palette.some((c) => typeof c !== 'string' || !HEX_RE.test(c.trim()))) {
    return NextResponse.json({ error: 'palette must contain valid hex color strings (e.g. #ff0000)' }, { status: 400 });
  }

  if (listAvailableProviders().length === 0) {
    return NextResponse.json(
      { error: 'No AI provider configured.' },
      { status: 503 },
    );
  }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 30_000);

  try {
    const userPrompt = `Palette: ${payload.palette.join(', ')}${
      payload.category ? `\nCategory: ${payload.category}` : ''
    }`;

    const result = await generateJSON({
      prompt: userPrompt,
      system: SYSTEM_PROMPT,
      signal: abort.signal,
      provider: payload.provider,
      maxTokens: 1024,
    });

    const validated = validateAIThemeResponse(result.data);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 422 });
    }

    return NextResponse.json({
      provider: result.provider,
      model: result.model,
      ...validated.data,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'AI request timed out after 30s' }, { status: 504 });
    }
    const msg = err instanceof AIProviderError ? err.message : String(err);
    const status = err instanceof AIProviderError ? err.status ?? 500 : 500;
    return NextResponse.json({ error: msg }, { status });
  } finally {
    clearTimeout(timer);
  }
}
