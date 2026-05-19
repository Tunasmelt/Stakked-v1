/**
 * Simple helper to detect social platforms from URLs.
 */
export function detectPlatform(url: string) {
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) return { name: 'Instagram', color: '#E4405F' };
  if (u.includes('twitter.com') || u.includes('x.com')) return { name: 'X', color: '#000000' };
  if (u.includes('spotify.com')) return { name: 'Spotify', color: '#1DB954' };
  if (u.includes('soundcloud.com')) return { name: 'SoundCloud', color: '#FF3300' };
  if (u.includes('youtube.com') || u.includes('youtu.be')) return { name: 'YouTube', color: '#FF0000' };
  if (u.includes('tiktok.com')) return { name: 'TikTok', color: '#000000' };
  if (u.includes('discord.gg')) return { name: 'Discord', color: '#5865F2' };
  if (u.includes('github.com')) return { name: 'GitHub', color: '#181717' };
  return { name: 'Link', color: '#3b82f6' };
}
