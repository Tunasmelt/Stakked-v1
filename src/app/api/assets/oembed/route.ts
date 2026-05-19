import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Universal oEmbed Resolver: Detects provider from URL and returns embed metadata.
 */
export async function GET(request: NextRequest) {
  const rl = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (!rl.ok) return rl.response;

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const provider = getProvider(targetUrl);
    
    if (provider) {
      const oembedUrl = `${provider.endpoint}?url=${encodeURIComponent(targetUrl)}&format=json`;
      const response = await fetch(oembedUrl);
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          html: data.html,
          title: data.title,
          thumbnail: data.thumbnail_url,
          provider: data.provider_name,
          width: data.width,
          height: data.height
        });
      }
    }

    // Fallback: Generic iframe detection or error
    return NextResponse.json({ 
      error: 'Unsupported or private URL',
      html: null 
    }, { status: 422 });

  } catch (error) {
    console.error('oEmbed resolver error:', error);
    return NextResponse.json({ error: 'Failed to resolve embed' }, { status: 500 });
  }
}

/**
 * Map of popular music/video providers and their oEmbed endpoints.
 */
function getProvider(url: string) {
  const providers = [
    { name: 'youtube', regex: /youtube\.com|youtu\.be/i, endpoint: 'https://www.youtube.com/oembed' },
    { name: 'spotify', regex: /spotify\.com/i, endpoint: 'https://open.spotify.com/oembed' },
    { name: 'soundcloud', regex: /soundcloud\.com/i, endpoint: 'https://soundcloud.com/oembed' },
    { name: 'vimeo', regex: /vimeo\.com/i, endpoint: 'https://vimeo.com/api/oembed.json' },
    { name: 'tiktok', regex: /tiktok\.com/i, endpoint: 'https://www.tiktok.com/oembed' },
    { name: 'apple-music', regex: /music\.apple\.com/i, endpoint: 'https://embed.music.apple.com/oembed' }
  ];

  return providers.find(p => p.regex.test(url));
}
