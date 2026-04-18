export type Playlist = {
  name: string
  url: string
  tracks: number
  source: 'spotify'
}

let _tokenCache: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.token
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error('Spotify 인증 실패')

  const data = await res.json()
  _tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return _tokenCache.token
}

/** 곡명 + 아티스트로 Spotify 트랙 ID 검색 */
export async function findTrackId(name: string, artist: string): Promise<string | null> {
  const token = await getAccessToken()
  const q = `track:${name} artist:${artist}`
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=1&market=KR`

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return null

  const data = await res.json()
  return data.tracks?.items?.[0]?.id ?? null
}

/** Spotify 키워드로 플레이리스트 검색 (최대 4개, KR 접근 가능한 것만) */
export async function searchPlaylists(keywords: string[], variation = 0): Promise<Playlist[]> {
  if (keywords.length === 0) return []

  const token = await getAccessToken()
  const len = keywords.length
  const i = variation % len
  const j = (variation + 1) % len
  const query = i === j ? keywords[i] : `${keywords[i]} ${keywords[j]}`

  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=8&market=KR`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return []

  const data = await res.json()
  const items: Array<{ id: string; name: string; public: boolean | null; external_urls: { spotify: string }; tracks?: { total?: number } }> =
    (data.playlists?.items ?? []).filter(
      (p: { name?: string; public?: boolean | null; external_urls?: { spotify?: string } } | null) =>
        p && p.name && p.external_urls?.spotify && p.public !== false
    )

  // KR market에서 실제 재생 가능한 트랙이 있는지 병렬 확인
  const validated = await Promise.all(
    items.slice(0, 8).map(async (p) => {
      try {
        const check = await fetch(
          `https://api.spotify.com/v1/playlists/${p.id}/tracks?market=KR&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!check.ok) return null
        const trackData = await check.json()
        return (trackData.items?.length ?? 0) > 0 ? p : null
      } catch {
        return null
      }
    })
  )

  return validated
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .slice(0, 4)
    .map((p) => ({
      name: p.name,
      url: p.external_urls.spotify,
      tracks: p.tracks?.total ?? 0,
      source: 'spotify' as const,
    }))
}
