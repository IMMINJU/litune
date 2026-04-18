export type Track = {
  name: string
  artist: string
  url: string
  tag: string
}

/** Last.fm 태그별 트랙 검색 — 각 태그마다 3개씩 */
export async function getTracksByTags(tags: string[], variation = 0): Promise<Track[]> {
  const len = tags.length
  const rotated = len > 0 ? tags.map((_, i) => tags[(i + variation) % len]) : tags
  const results = await Promise.allSettled(
    rotated.map((tag) => fetchTracksByTag(tag))
  )

  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}

async function fetchTracksByTag(tag: string): Promise<Track[]> {
  const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(tag)}&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=3`

  const res = await fetch(url)
  if (!res.ok) return []

  const data = await res.json()
  const tracks = data.tracks?.track ?? []

  return tracks
    .filter((t: { name?: string; artist?: { name?: string }; url?: string } | null) => t && t.name && t.artist?.name)
    .slice(0, 3)
    .map((t: { name: string; artist: { name: string }; url: string }) => ({
      name: t.name,
      artist: t.artist.name,
      url: t.url ?? '',
      tag,
    }))
}
