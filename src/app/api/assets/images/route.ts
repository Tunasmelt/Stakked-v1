import { NextRequest, NextResponse } from 'next/server';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

/**
 * Pexels API Proxy: Search high-resolution photos.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  // Clamp to a valid positive integer — non-numeric or negative values would
  // cause Pexels to return an error and the route to 500.
  const page = String(Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1));
  // Clamp per_page: minimum 1, maximum 80 (Pexels hard cap is 80).
  // Without a ceiling an attacker could request arbitrarily large payloads.
  const perPage = String(Math.min(80, Math.max(1, parseInt(searchParams.get('per_page') ?? '20', 10) || 20)));

  if (!query) {
    return NextResponse.json({ images: [] });
  }

  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'your-pexels-api-key') {
    // Soft-fail: return 200 with empty results so the UI shows a clean
    // "no results" state instead of spamming 500s into the dev console.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[api/assets/images] PEXELS_API_KEY not configured — returning empty results. ' +
          'Set PEXELS_API_KEY in .env.local to enable image search.'
      );
    }
    return NextResponse.json({
      images: [],
      warning: 'PEXELS_API_KEY not configured',
    });
  }

  try {
    const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API failed: ${response.statusText}`);
    }

    const data = await response.json();

    interface PexelsPhoto {
      id: number | string;
      alt?: string;
      photographer?: string;
      photographer_url?: string;
      avg_color?: string;
      src: {
        original?: string;
        large2x?: string;
        large?: string;
        medium?: string;
        small?: string;
      };
    }

    // Map to AssetSearchResult format — and drop any photos that don't carry
    // a usable URL, otherwise <img src=""> would trigger React's empty-src
    // warning downstream.
    const images = ((data.photos || []) as PexelsPhoto[])
      .map((photo) => {
        const url = photo.src.large2x ?? photo.src.large ?? photo.src.original ?? '';
        const thumb = photo.src.medium ?? photo.src.small ?? photo.src.large ?? url;
        return {
          id: `img-${photo.id}`,
          url,
          thumb,
          alt: photo.alt || `Photo by ${photo.photographer ?? 'Pexels'}`,
          source: 'pexels' as const,
          metadata: {
            photographer: photo.photographer,
            photographer_url: photo.photographer_url,
            avg_color: photo.avg_color,
          },
        };
      })
      .filter((p) => p.url && p.thumb);

    return NextResponse.json({ 
      images,
      total_results: data.total_results,
      next_page: data.next_page 
    });
  } catch (error) {
    console.error('Pexels proxy error:', error);
    return NextResponse.json({ error: 'Failed to search images' }, { status: 500 });
  }
}
