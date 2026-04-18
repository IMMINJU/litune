'use client'

import type { Playlist } from '@/lib/spotify'
import type { SpotifyPlayerAPI } from '@/hooks/useSpotifyPlayer'

type Props = {
  playlist: Playlist
  isOpen: boolean
  onToggle: () => void
  player?: SpotifyPlayerAPI
  isActive?: boolean
}

function getSpotifyId(url: string): string | null {
  return url.match(/playlist\/([a-zA-Z0-9]+)/)?.[1] ?? null
}

export default function PlaylistCard({ playlist, isOpen, onToggle, player, isActive }: Props) {
  const spotifyId = getSpotifyId(playlist.url)
  const useSdk = player?.isReady && player?.isPremium

  function handleClick() {
    if (useSdk && spotifyId) {
      player.play(`spotify:playlist:${spotifyId}`, 'playlist')
    }
    onToggle()
  }

  return (
    <div className="rounded-md overflow-hidden">
      <button
        onClick={handleClick}
        className="group w-full flex items-center gap-5 py-3 px-4 hover:bg-zinc-900/40 transition-all text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-base font-light text-zinc-200 truncate group-hover:text-white transition-colors">
            {playlist.name}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">{playlist.tracks} tracks</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
<div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
            isActive
              ? 'border-[#1DB954]/60 bg-[#1DB954]/10'
              : 'border-zinc-700 group-hover:border-zinc-500'
          }`}>
            {isActive && player?.isPlaying ? (
              /* 재생 중 — 멈춤 아이콘 */
              <svg className="w-3 h-3 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : isOpen ? (
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

      {!useSdk && isOpen && spotifyId && (
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
