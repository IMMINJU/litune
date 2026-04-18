'use client'

import type { SpotifyPlayerAPI } from '@/hooks/useSpotifyPlayer'

type Props = {
  player: SpotifyPlayerAPI
}

export default function NowPlayingBar({ player }: Props) {
  const { isReady, currentTrack, isPlaying, togglePlay, nextTrack } = player

  if (!isReady || !currentTrack) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900">
      <div className="px-4 py-3 flex items-center gap-3 max-w-7xl mx-auto">
        {currentTrack.albumArt && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentTrack.albumArt}
            alt={currentTrack.name}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-100 font-light truncate">{currentTrack.name}</p>
          <p className="text-xs text-zinc-500 truncate">{currentTrack.artist}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label={isPlaying ? '일시정지' : '재생'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-black ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={nextTrack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="다음 트랙"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
