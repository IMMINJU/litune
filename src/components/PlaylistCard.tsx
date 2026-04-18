'use client'

import { useState } from 'react'
import type { Playlist } from '@/lib/spotify'

type Props = {
  playlist: Playlist
  isOpen: boolean
  onToggle: () => void
}

function getSpotifyId(url: string): string | null {
  return url.match(/playlist\/([a-zA-Z0-9]+)/)?.[1] ?? null
}

export default function PlaylistCard({ playlist, isOpen, onToggle }: Props) {
  const spotifyId = getSpotifyId(playlist.url)

  return (
    <div className="rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="group w-full flex items-center gap-5 py-3 px-4 hover:bg-zinc-900/40 transition-all text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-base font-light text-zinc-200 truncate group-hover:text-white transition-colors">
            {playlist.name}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">{playlist.tracks} tracks</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[10px] px-2.5 py-1 rounded font-light uppercase tracking-wider bg-[#1DB954]/15 text-[#1DB954]">
            Spotify
          </span>
          {/* Play / Collapse icon */}
          <div className={`w-7 h-7 rounded-full border border-zinc-700 flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-zinc-800 border-zinc-600' : 'group-hover:border-zinc-500'}`}>
            {isOpen ? (
              <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-zinc-400 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Spotify embed */}
      {isOpen && spotifyId && (
        <div className="px-4 pb-4">
          <iframe
            src={`https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0&autoplay=1`}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
            style={{ border: 'none' }}
          />
        </div>
      )}
    </div>
  )
}
