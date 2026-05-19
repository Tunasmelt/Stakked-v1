import { NextRequest, NextResponse } from 'next/server';
import {
  generateJSON,
  AIProviderError,
  listAvailableProviders,
  ProviderId,
} from '@/lib/ai-providers';
import { validateAISummaryResponse } from '@/lib/ai-validation';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a concise copywriter. Given a Stakked page (JSON of elements + title),
return: { "summary": "<markdown description, 120-220 words>" }
Write in present tense. Highlight the artist's hook, the key sections, and the call-to-action.
No prose outside the JSON. No code fences.`;

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) return rl.response;

  let payload: { elements?: unknown[]; pageTitle?: string; provider?: ProviderId };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload.elements || !Array.isArray(payload.elements)) {
    return NextResponse.json({ error: 'Missing elements array' }, { status: 400 });
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
    const userPrompt = `Page title: ${payload.pageTitle ?? 'Untitled'}\n\nElements JSON:\n${JSON.stringify(payload.elements).slice(0, 12_000)}`;

    const result = await generateJSON({
      prompt: userPrompt,
      system: SYSTEM_PROMPT,
      signal: abort.signal,
      provider: payload.provider,
      maxTokens: 1024,
    });

    const validated = validateAISummaryResponse(result.data);
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
