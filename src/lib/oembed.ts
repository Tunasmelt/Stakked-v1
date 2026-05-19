/**
 * Fetches oEmbed data from the Stakked API.
 */
export async function fetchOEmbed(url: string) {
  try {
    const response = await fetch(`/api/assets/oembed?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Failed to fetch oEmbed data');
    return await response.ok ? response.json() : null;
  } catch (error) {
    console.error('oEmbed error:', error);
    return null;
  }
}
