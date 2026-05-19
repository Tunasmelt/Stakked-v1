import { NextResponse } from 'next/server';
import { listAvailableProviders, getDefaultProvider } from '@/lib/ai-providers';

export const runtime = 'nodejs';

/** Returns which AI providers are configured on the server. No secrets leaked. */
export async function GET() {
  const providers = listAvailableProviders();
  return NextResponse.json({
    providers,
    default: getDefaultProvider(),
    labels: {
      gemini: 'Google Gemini 2.0 Flash (free tier)',

      groq: 'Groq — Llama 3.3 70B (free)',
    },
  });
}
