'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume?: number
      }) => SpotifySDKPlayer
    }
    onSpotifyWebPlaybackSDKReady: () => void
  }
}

interface SpotifySDKPlayer {
  connect(): Promise<boolean>
  disconnect(): void
  addListener(event: 'ready', cb: (data: { device_id: string }) => void): boolean
  addListener(event: 'not_ready', cb: (data: { device_id: string }) => void): boolean
  addListener(event: 'player_state_changed', cb: (state: SpotifySDKState | null) => void): boolean
  addListener(event: string, cb: (data: unknown) => void): boolean
  pause(): Promise<void>
  resume(): Promise<void>
  togglePlay(): Promise<void>
  nextTrack(): Promise<void>
  previousTrack(): Promise<void>
}

interface SpotifySDKState {
  paused: boolean
  track_window: {
    current_track: {
      id: string
      name: string
      artists: { name: string }[]
      album: { images: { url: string }[] }
    }
  }
}

export interface CurrentTrack {
  id: string
  name: string
  artist: string
  albumArt: string
}

export interface SpotifyPlayerAPI {
  isReady: boolean
  isPremium: boolean
  isPlaying: boolean
  currentTrack: CurrentTrack | null
  play(uri: string, type: 'playlist' | 'track'): Promise<void>
  togglePlay(): Promise<void>
  nextTrack(): Promise<void>
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

async function fetchAccessToken(): Promise<string | null> {
  const token = readCookie('spotify_access_token')
  if (token) return token
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST' })
    if (!res.ok) return null
    const data = await res.json()
    return (data.access_token as string) ?? null
  } catch {
    return null
  }
}

// 스크립트 중복 로드 방지
let sdkScriptLoaded = false

export function useSpotifyPlayer(): SpotifyPlayerAPI {
  const playerRef = useRef<SpotifySDKPlayer | null>(null)
  const deviceIdRef = useRef<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null)

  useEffect(() => {
    const userStr = readCookie('spotify_user')
    if (!userStr) return

    let user: { name: string; isPremium: boolean }
    try { user = JSON.parse(userStr) } catch { return }
    if (!user.isPremium) return

    setIsPremium(true)

    async function initPlayer() {
      const player = new window.Spotify.Player({
        name: 'Litune',
        getOAuthToken: async (cb) => {
          const t = await fetchAccessToken()
          if (t) cb(t)
        },
        volume: 0.7,
      })

      playerRef.current = player

      player.addListener('ready', ({ device_id }) => {
        deviceIdRef.current = device_id
        setIsReady(true)
      })

      player.addListener('not_ready', () => setIsReady(false))

      player.addListener('player_state_changed', (state) => {
        if (!state) return
        setIsPlaying(!state.paused)
        const t = state.track_window.current_track
        setCurrentTrack({
          id: t.id,
          name: t.name,
          artist: t.artists.map((a) => a.name).join(', '),
          albumArt: t.album.images[0]?.url ?? '',
        })
      })

      player.connect()
    }

    if (window.Spotify) {
      initPlayer()
    } else if (!sdkScriptLoaded) {
      sdkScriptLoaded = true
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      document.body.appendChild(script)
      window.onSpotifyWebPlaybackSDKReady = initPlayer
    }

    return () => {
      playerRef.current?.disconnect()
      playerRef.current = null
    }
  }, [])

  const play = useCallback(async (uri: string, type: 'playlist' | 'track') => {
    const deviceId = deviceIdRef.current
    if (!deviceId) return
    const token = await fetchAccessToken()
    if (!token) return

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        type === 'playlist' ? { context_uri: uri } : { uris: [uri] }
      ),
    })
  }, [])

  const togglePlay = useCallback(async () => {
    await playerRef.current?.togglePlay()
  }, [])

  const nextTrack = useCallback(async () => {
    await playerRef.current?.nextTrack()
  }, [])

  return { isReady, isPremium, isPlaying, currentTrack, play, togglePlay, nextTrack }
}
