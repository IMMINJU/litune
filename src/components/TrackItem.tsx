'use client'

import { useState } from 'react'
import type { Track } from '@/lib/lastfm'

type Props = {
  track: Track
  index?: number
  isOpen: boolean
  onToggle: () => void
}

export default function TrackItem({ track, index = 0, isOpen, onToggle }: Props) {
  const [spotifyId, setSpotifyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!isOpen && !spotifyId) {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/music/track?name=${encodeURIComponent(track.name)}&artist=${encodeURIComponent(track.artist)}`
        )
        if (res.ok) {
          const data = await res.json()
          setSpotifyId(data.id)
        }
      } finally {
        setLoading(false)
      }
    }
    onToggle()
  }

  return (
    <div className="rounded-md overflow-hidden">
      <button
        onClick={handleToggle}
        className="group w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-900/40 transition-all text-left"
      >
        <div className="w-7 text-center flex-shrink-0">
          {loading ? (
            <svg className="w-3.5 h-3.5 text-zinc-500 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <>
              <span className="text-zinc-600 group-hover:hidden text-sm tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={`hidden group-hover:flex w-5 h-5 rounded-full border border-zinc-600 items-center justify-center mx-auto`}>
                {isOpen ? (
                  <svg className="w-2.5 h-2.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-2.5 h-2.5 text-zinc-400 ml-px" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-200 font-light truncate mb-0.5">{track.name}</p>
          <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
        </div>

        <span className="text-[10px] text-zinc-600 bg-zinc-900/60 px-2 py-0.5 rounded flex-shrink-0">
          {track.tag}
        </span>
      </button>

      {/* Spotify embed */}
      {isOpen && spotifyId && (
        <div className="px-4 pb-4">
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0&autoplay=1`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
            style={{ border: 'none' }}
          />
        </div>
      )}

      {/* Spotify에서 못 찾은 경우 — Last.fm 링크로 fallback */}
      {isOpen && !loading && spotifyId === null && (
        <div className="px-4 pb-4">
          <a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Last.fm에서 보기
          </a>
        </div>
      )}
    </div>
  )
}
