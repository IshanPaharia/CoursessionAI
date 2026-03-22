const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';
const API_KEY = () => process.env.YOUTUBE_API_KEY;

class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export function extractPlaylistId(url) {
  const patterns = [
    /[?&]list=([a-zA-Z0-9_-]+)/,
    /\/playlist\?list=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(url)) return url;

  return null;
}

export async function fetchPlaylistDetails(playlistId) {
  const res = await fetch(
    `${YT_API_BASE}/playlists?part=snippet&id=${playlistId}&key=${API_KEY()}`
  );
  const data = await res.json();

  if (!data.items?.length) {
    throw new ApiError('Playlist not found. It may be private or deleted.', 404);
  }

  const snippet = data.items[0].snippet;
  return {
    title: snippet.title,
    description: snippet.description,
    thumbnailUrl: snippet.thumbnails?.maxres?.url
      || snippet.thumbnails?.high?.url
      || snippet.thumbnails?.medium?.url
      || '',
  };
}

export async function fetchPlaylistItems(playlistId) {
  const items = [];
  let nextPageToken = null;

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: API_KEY(),
    });
    if (nextPageToken) params.set('pageToken', nextPageToken);

    const res = await fetch(`${YT_API_BASE}/playlistItems?${params}`);
    const data = await res.json();

    if (data.error) {
      throw new ApiError(data.error.message || 'YouTube API error', 502);
    }

    for (const item of data.items || []) {
      const s = item.snippet;
      if (s.resourceId?.videoId) {
        items.push({
          youtubeId: s.resourceId.videoId,
          title: s.title,
          description: s.description || '',
          thumbnailUrl: s.thumbnails?.medium?.url || s.thumbnails?.default?.url || '',
          position: s.position,
        });
      }
    }

    nextPageToken = data.nextPageToken || null;
  } while (nextPageToken);

  return items;
}

export async function fetchVideoDurations(videoIds) {
  const durations = {};
  const batches = [];

  for (let i = 0; i < videoIds.length; i += 50) {
    batches.push(videoIds.slice(i, i + 50));
  }

  for (const batch of batches) {
    const res = await fetch(
      `${YT_API_BASE}/videos?part=contentDetails&id=${batch.join(',')}&key=${API_KEY()}`
    );
    const data = await res.json();

    for (const item of data.items || []) {
      durations[item.id] = parseDuration(item.contentDetails.duration);
    }
  }

  return durations;
}

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  return h * 3600 + m * 60 + s;
}
