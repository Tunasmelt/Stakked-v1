/**
 * POST /api/export/pdf
 *
 * PDF export is handled entirely client-side via jsPDF + html-to-image
 * (see src/lib/export-media.ts). This route exists so the endpoint resolves
 * correctly and to serve as a future hook for server-side rendering (e.g.
 * Puppeteer/Playwright) when headless capture is needed.
 *
 * Current behaviour: returns 200 with { clientSide: true } so any caller
 * knows to fall back to the in-browser export flow.
 */

import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) return rl.response;

  return NextResponse.json(
    {
      clientSide: true,
      message:
        'PDF export is rendered client-side via jsPDF. ' +
        'Call exportMedia(node, { format: "pdf" }) from src/lib/export-media.ts instead.',
    },
    { status: 200 },
  );
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 });
}
