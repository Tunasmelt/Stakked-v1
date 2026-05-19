import { NextResponse } from 'next/server';
import { generateJSON, ProviderId, AIProviderError, listAvailableProviders } from '@/lib/ai-providers';
import { validateAILayoutResponse } from '@/lib/ai-validation';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `
You are the Stakked AI Architect, a world-class UI/UX designer. Your goal is to generate high-fidelity, premium page layouts.
The user will provide a prompt describing their project (e.g., "Cyberpunk DJ portfolio").

### DESIGN GUIDELINES
1. **Layering**: Use 'shape' elements with low opacity behind text or images to create depth (Glassmorphism).
2. **Visual Hierarchy**: Large <h1> text for headlines, smaller <p> or <h2> for details.
3. **Responsive Spacing**: Assume a 1440px width. Center main content or use an asymmetric grid.
4. **Color Palettes**: Stick to a consistent theme (e.g., "Neon Dark", "Minimalist White", "Earth Tones").
5. **Element Variety**: Mix text, image placeholders, social links, and music players.

### RULES
1. Respond ONLY with a valid JSON object.
2. For 'text' elements, provide rich HTML in 'content.html'. Keep 'content.plainText' as a fallback.
3. For 'image' elements, use picsum.photos placeholder URLs with a unique seed per image (e.g. "https://picsum.photos/seed/hero1/800/500" for a hero, "https://picsum.photos/seed/portrait/400/600" for a portrait). Never use Unsplash URLs.
4. For 'shape' elements, use variants like 'rect', 'circle', 'triangle'. Provide a valid 'fill' color.
5. All positions (x, y) and sizes (width, height) must be integers.

### JSON SCHEMA
{
  "provider": "string",
  "model": "string",
  "reasoning": "Explain your design concept (tokens, layout, vibe).",
  "elements": [
    {
      "type": "string (text|image|button|social-link|music-player|video|divider|gallery|icon|shape)",
      "name": "string",
      "position": { "x": number, "y": number },
      "size": { "width": number, "height": number },
      "zIndex": number (1-100),
      "content": { ... matching the type ... }
    }
  ]
}

### CONTENT EXAMPLES
- social-link: { "type": "social-link", "platform": "instagram|twitter|github|spotify", "url": "...", "displayMode": "icon+text" }
- music-player: { "type": "music-player", "platform": "spotify|soundcloud", "url": "...", "displayMode": "full" }
`;

export async function POST(req: Request) {
  const rl = rateLimit(req, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) return rl.response;

  // Change 1a: 503 if no providers are configured
  if (listAvailableProviders().length === 0) {
    return NextResponse.json({ error: 'No AI provider configured.' }, { status: 503 });
  }

  try {
    const { prompt, category, provider } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const fullPrompt = `Category: ${category}\nUser Request: ${prompt}\n\nGenerate a stunning one-page layout.`;

    // Change 1b: 30-second AbortController timeout
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 30_000);

    let result: Awaited<ReturnType<typeof generateJSON>>;
    try {
      result = await generateJSON({
        prompt: fullPrompt,
        system: SYSTEM_PROMPT,
        provider: provider as ProviderId,
        maxTokens: 4096,
        signal: abort.signal,
        schemaHint: {
          type: "object",
          properties: {
            reasoning: { type: "string" },
            elements: {
              type: "array",
              items: {
                type: "object",
                required: ["type", "position", "size", "content"],
                properties: {
                  type: { type: "string" },
                  name: { type: "string" },
                  position: {
                    type: "object",
                    properties: { x: { type: "number" }, y: { type: "number" } }
                  },
                  size: {
                    type: "object",
                    properties: { width: { type: "number" }, height: { type: "number" } }
                  },
                  content: { type: "object" },
                  zIndex: { type: "number" },
                },
              },
            },
          },
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json({ error: 'AI request timed out after 30s' }, { status: 504 });
      }
      const msg    = err instanceof AIProviderError ? err.message : String(err);
      const status = err instanceof AIProviderError ? (err.status ?? 500) : 500;
      return NextResponse.json({ error: msg }, { status });
    } finally {
      clearTimeout(timer);
    }

    // Change 2: validate the result before returning
    const validated = validateAILayoutResponse(result.data);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 422 });
    }

    return NextResponse.json({ provider: result.provider, model: result.model, ...validated.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/ai/layout] failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
