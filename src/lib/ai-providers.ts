/**
 * AI Providers: server-side adapters for free-tier chat models.
 *
 * Supported providers:
 *   - "gemini" — Google Gemini 2.0 Flash (AI Studio free tier, 15 RPM, 1M tokens/day).
 *   - "groq"   — Groq's hosted open-source models (llama-3.3, mixtral) — free inference tier.
 *
 * ChatGPT / OpenAI is intentionally **not** supported — Phase 3 uses only free-capable models.
 *
 * All adapters share one interface: `generateJSON({prompt, system, schema, signal, maxTokens})`.
 * They return a parsed JSON object conforming to the requested schema.
 *
 * Keys (optional — if unset, the provider is simply skipped):
 *   - GEMINI_API_KEY  (get at https://aistudio.google.com/apikey)
 *   - GROQ_API_KEY    (get at https://console.groq.com/keys)
 */

export type ProviderId = 'gemini' | 'groq';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateJSONOptions {
  /** The actual user ask. */
  prompt: string;
  /** Additional system instructions (schema hints, role). */
  system?: string;
  /** A structural hint — shown to the model as a JSON Schema string. */
  schemaHint?: Record<string, unknown>;
  /** Abort signal so upstream routes can enforce timeouts. */
  signal?: AbortSignal;
  /** Max output tokens. Default 2048. */
  maxTokens?: number;
  /** Model slug override; falls back to provider default. */
  model?: string;
}

export interface AIResult<T = unknown> {
  provider: ProviderId;
  model: string;
  data: T;
  raw: string;
}

export class AIProviderError extends Error {
  readonly provider: ProviderId | null;
  readonly status?: number;
  constructor(message: string, provider: ProviderId | null = null, status?: number) {
    super(message);
    this.name = 'AIProviderError';
    this.provider = provider;
    this.status = status;
  }
}

/* ---------------------------- provider detection --------------------------- */

export function listAvailableProviders(): ProviderId[] {
  const out: ProviderId[] = [];
  if (process.env.GEMINI_API_KEY) out.push('gemini');
  if (process.env.GROQ_API_KEY) out.push('groq');
  return out;
}

export function getDefaultProvider(): ProviderId | null {
  const preference = (process.env.AI_DEFAULT_PROVIDER || '').toLowerCase() as ProviderId;
  const available = listAvailableProviders();
  if (preference && available.includes(preference)) return preference;
  return available[0] ?? null;
}

const DEFAULT_MODEL: Record<ProviderId, string> = {
  gemini: 'gemini-2.0-flash',
  groq: 'llama-3.3-70b-versatile',
};

/* ------------------------------ JSON extraction ---------------------------- */

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    const firstNewline = trimmed.indexOf('\n');
    const fenceEnd = trimmed.lastIndexOf('```');
    if (firstNewline !== -1 && fenceEnd > firstNewline) {
      return trimmed.slice(firstNewline + 1, fenceEnd).trim();
    }
  }
  return trimmed;
}

function parseJSON<T>(raw: string, provider: ProviderId): T {
  const cleaned = stripCodeFence(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Try to salvage the first {...} or [...] block
    const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // fall through
      }
    }
    throw new AIProviderError(
      `Failed to parse JSON from ${provider}: ${(err as Error).message}`,
      provider,
    );
  }
}

/* --------------------------------- Gemini ---------------------------------- */

async function generateWithGemini<T>(opts: GenerateJSONOptions): Promise<AIResult<T>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AIProviderError('GEMINI_API_KEY not set', 'gemini');

  const model = opts.model ?? DEFAULT_MODEL.gemini;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const systemInstruction = opts.system
    ? { role: 'user', parts: [{ text: opts.system }] }
    : undefined;

  const body = {
    contents: [
      ...(systemInstruction ? [systemInstruction] : []),
      { role: 'user', parts: [{ text: opts.prompt }] },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: opts.maxTokens ?? 2048,
      responseMimeType: 'application/json',
      ...(opts.schemaHint ? { responseSchema: opts.schemaHint } : {}),
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new AIProviderError(`Gemini ${res.status}: ${msg.slice(0, 200)}`, 'gemini', res.status);
  }

  interface GeminiResponse {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  }
  const json = (await res.json()) as GeminiResponse;
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text) throw new AIProviderError('Gemini returned empty text', 'gemini');

  return { provider: 'gemini', model, raw: text, data: parseJSON<T>(text, 'gemini') };
}

/* -------------------- OpenAI-compatible helper (Groq) ---------------------- */

async function generateOpenAICompatible<T>(
  provider: ProviderId,
  endpoint: string,
  apiKey: string,
  opts: GenerateJSONOptions,
): Promise<AIResult<T>> {
  const model = opts.model ?? DEFAULT_MODEL[provider];
  const systemText = [
    opts.system ?? '',
    'Respond ONLY with a single valid JSON document matching the requested shape. Do not wrap it in prose or code fences.',
  ]
    .filter(Boolean)
    .join('\n\n');

  const body = {
    model,
    messages: [
      { role: 'system', content: systemText },
      { role: 'user', content: opts.prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: opts.maxTokens ?? 2048,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new AIProviderError(`${provider} ${res.status}: ${msg.slice(0, 200)}`, provider, res.status);
  }

  interface ChatResponse {
    choices?: Array<{ message?: { content?: string } }>;
  }
  const json = (await res.json()) as ChatResponse;
  const text = json.choices?.[0]?.message?.content ?? '';
  if (!text) throw new AIProviderError(`${provider} returned empty content`, provider);

  return { provider, model, raw: text, data: parseJSON<T>(text, provider) };
}


async function generateWithGroq<T>(opts: GenerateJSONOptions): Promise<AIResult<T>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new AIProviderError('GROQ_API_KEY not set', 'groq');
  return generateOpenAICompatible<T>(
    'groq',
    'https://api.groq.com/openai/v1/chat/completions',
    apiKey,
    opts,
  );
}

/* ---------------------------- public dispatch ------------------------------ */

/**
 * Generate a JSON response. Attempts the requested provider first, then falls
 * back to any other configured free provider if the first fails.
 */
export async function generateJSON<T = unknown>(
  opts: GenerateJSONOptions & { provider?: ProviderId; allowFallback?: boolean },
): Promise<AIResult<T>> {
  const available = listAvailableProviders();
  if (available.length === 0) {
    throw new AIProviderError(
      'No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY.',
    );
  }

  const order: ProviderId[] = [];
  const first = opts.provider && available.includes(opts.provider)
    ? opts.provider
    : getDefaultProvider()!;
  order.push(first);
  if (opts.allowFallback !== false) {
    for (const p of available) if (p !== first) order.push(p);
  }

  let lastError: unknown;
  for (const p of order) {
    try {
      if (p === 'gemini') return await generateWithGemini<T>(opts);
      if (p === 'groq') return await generateWithGroq<T>(opts);
    } catch (err) {
      lastError = err;
      // If the call was aborted upstream, don't try the next provider.
      if (err instanceof Error && err.name === 'AbortError') throw err;
      // Otherwise try the next one.
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new AIProviderError('All providers failed');
}
