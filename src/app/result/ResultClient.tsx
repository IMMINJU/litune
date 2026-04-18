'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { extractDominantColor } from '@/lib/color'
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer'
import MoodTag from '@/components/MoodTag'
import PlaylistCard from '@/components/PlaylistCard'
import TrackItem from '@/components/TrackItem'
import SpotifyAuth from '@/components/SpotifyAuth'
import NowPlayingBar from '@/components/NowPlayingBar'
import type { Book } from '@/lib/book'
import type { MoodKeywords } from '@/lib/claude'
import type { Playlist } from '@/lib/spotify'
import type { Track } from '@/lib/lastfm'

type Props = {
  book: Book
  mood: MoodKeywords
  playlists: Playlist[]
  tracks: Track[]
  variation: number
}

export default function ResultClient({ book, mood, playlists, tracks, variation }: Props) {
  const router = useRouter()
  const player = useSpotifyPlayer()
  const [dominantColor, setDominantColor] = useState('#1e1e1e')
  const [openPlaylist, setOpenPlaylist] = useState<string | null>(null)
  const [openTrack, setOpenTrack] = useState<string | null>(null)
  const [activeUri, setActiveUri] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleRecommendAgain() {
    const params = new URLSearchParams()
    if (book.isbn) params.set('isbn', book.isbn)
    params.set('title', book.title)
    params.set('v', String(variation + 1))
    router.push(`/result?${params.toString()}`)
  }

  useEffect(() => {
    if (!book.thumbnail) return
    extractDominantColor(book.thumbnail).then(setDominantColor)
    return () => { document.documentElement.style.removeProperty('--dynamic-color') }
  }, [book.thumbnail])

  // player.currentTrack 변화로 activeUri 동기화
  useEffect(() => {
    if (player.currentTrack) {
      setActiveUri(`spotify:track:${player.currentTrack.id}`)
    }
  }, [player.currentTrack])

  const allKeywords = [...mood.spotify, ...mood.lastfm]
  const hasNowPlaying = player.isReady && player.currentTrack

  return (
    <div className="min-h-dvh bg-black text-white relative overflow-x-hidden">
      {/* Cinematic color bleed */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 25% 15%, ${dominantColor}55 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 75% 35%, ${dominantColor}30 0%, transparent 50%),
            linear-gradient(to bottom, ${dominantColor}18 0%, #000000 65%)
          `
        }}
      />

      {/* Vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />

      {/* Film grain */}
      <div
        className="fixed inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.2\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative z-10">
        {/* Fixed header */}
        <header className="fixed top-0 inset-x-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm">
          <div className="px-5 py-5 md:px-10 lg:px-16 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-zinc-800/50 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs tracking-[0.2em] uppercase text-zinc-500 font-light flex-1">
              LITUNE
            </span>
            <SpotifyAuth />
          </div>
        </header>

        {/* Hero */}
        <section className="pt-24 md:pt-28 pb-12 px-5 md:px-10 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-[360px_1fr] lg:grid-cols-[440px_1fr] gap-10 md:gap-16 lg:gap-24 items-start">
              <div className="relative mx-auto md:mx-0 w-full max-w-[280px] md:max-w-none">
                <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5">
                  {book.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900" />
                  )}
                </div>
                <div
                  className="absolute -inset-12 -z-10 blur-[80px] opacity-35 transition-colors duration-700"
                  style={{ backgroundColor: dominantColor }}
                />
              </div>

              <div className="space-y-8 pt-0 md:pt-4">
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1] font-light">
                    {book.title}
                  </h1>
                  <p className="text-lg md:text-xl text-zinc-400 font-light">{book.author}</p>
                  {book.publisher && (
                    <p className="text-sm text-zinc-600">{book.publisher}</p>
                  )}
                </div>

                {allKeywords.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-light">
                      MOOD
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {allKeywords.map((tag) => (
                        <MoodTag key={tag} tag={tag} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Playlists */}
        {playlists.length > 0 && (
          <section className="px-5 md:px-10 lg:px-16 pb-16">
            <div className="max-w-7xl mx-auto space-y-10">
              <div className="flex items-end justify-between border-b border-zinc-900 pb-4">
                <h2 className="text-xl md:text-2xl tracking-tight font-light">플레이리스트</h2>
                <span className="text-xs text-zinc-600 uppercase tracking-widest">
                  {playlists.length} MIX{playlists.length > 1 ? 'ES' : ''}
                </span>
              </div>
              <div className="flex flex-col">
                {playlists.map((pl) => {
                  const plId = pl.url.match(/playlist\/([a-zA-Z0-9]+)/)?.[1]
                  const plUri = plId ? `spotify:playlist:${plId}` : null
                  return (
                    <PlaylistCard
                      key={pl.url}
                      playlist={pl}
                      isOpen={openPlaylist === pl.url}
                      onToggle={() => {
                        setOpenPlaylist(openPlaylist === pl.url ? null : pl.url)
                        if (plUri) setActiveUri(plUri)
                      }}
                      player={player}
                      isActive={!!plUri && activeUri === plUri}
                    />
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Tracks */}
        {tracks.length > 0 && (
          <section className="px-5 md:px-10 lg:px-16 pb-16">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-end justify-between border-b border-zinc-900 pb-4">
                <h2 className="text-xl md:text-2xl tracking-tight font-light">트랙</h2>
              </div>
              <div>
                {tracks.map((track, i) => {
                  const key = `${track.name}-${track.artist}`
                  const isActive = !!(player.currentTrack && player.currentTrack.name === track.name)
                  return (
                    <TrackItem
                      key={key}
                      track={track}
                      index={i}
                      isOpen={openTrack === key}
                      onToggle={() => setOpenTrack(openTrack === key ? null : key)}
                      player={player}
                      isActive={isActive}
                    />
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Empty state */}
        {playlists.length === 0 && tracks.length === 0 && (
          <section className="px-5 md:px-10 lg:px-16 pb-16">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-zinc-500 text-sm font-light">이 책에 어울리는 음악을 찾지 못했어요</p>
              <p className="text-zinc-700 text-xs">다른 음악을 추천받아보세요</p>
            </div>
          </section>
        )}

        {/* 액션 버튼 */}
        <section className={`px-5 md:px-10 lg:px-16 ${hasNowPlaying ? 'pb-40' : 'pb-24'}`}>
          <div className="max-w-7xl mx-auto flex justify-center gap-3">
            <button
              onClick={handleRecommendAgain}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full border border-zinc-800 text-zinc-400 text-sm font-light hover:border-zinc-600 hover:text-zinc-200 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              다른 음악 추천받기
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full border border-zinc-800 text-zinc-400 text-sm font-light hover:border-zinc-600 hover:text-zinc-200 transition-all"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  복사됨
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  공유하기
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      <NowPlayingBar player={player} />
    </div>
  )
}
