import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Iconify API Proxy: Fetches icon metadata and SVGs from the Iconify API.
 */
export async function GET(request: NextRequest) {
  const rl = rateLimit(request, { limit: 60, windowMs: 60_000 });
  if (!rl.ok) return rl.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const prefix = searchParams.get('prefix') || ''; // e.g. 'lucide', 'mdi'

  if (!query) {
    return NextResponse.json({ icons: [] });
  }

  try {
    // Iconify Search API: https://api.iconify.design/search?query=home&prefix=lucide
    const apiUrl = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=100${prefix ? `&prefix=${encodeURIComponent(prefix)}` : ''}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Iconify search failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Map Iconify response to our AssetSearchResult format
    const icons = (data.icons || []).map((iconName: string) => {
      // Split by colon if prefix wasn't specific
      const [p, n] = iconName.includes(':')
        ? iconName.split(':')
        : [data.prefixes?.[0] || 'lucide', iconName];
      const svgUrl = `https://api.iconify.design/${p}/${n}.svg`;
      return {
        id: `icon-${p}-${n}`,
        url: svgUrl,
        thumb: svgUrl,
        alt: `${p}: ${n}`,
        source: 'iconify',
        metadata: {
          prefix: p,
          name: n,
        },
      };
    });

    return NextResponse.json({ icons });
  } catch (error) {
    console.error('Iconify proxy error:', error);
    return NextResponse.json({ error: 'Failed to search icons' }, { status: 500 });
  }
}
