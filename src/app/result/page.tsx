import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { normalizeNaverBook } from '@/lib/book'
import { extractMoodKeywords } from '@/lib/claude'
import { searchPlaylists } from '@/lib/spotify'
import { getTracksByTags } from '@/lib/lastfm'
import { getMood, saveMood, getRecommendation, saveRecommendation } from '@/lib/db'
import ResultClient from './ResultClient'

type Props = {
  searchParams: Promise<{ isbn?: string; title?: string; v?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { isbn, title } = await searchParams

  let bookTitle = title ? decodeURIComponent(title) : null

  if (isbn && !bookTitle) {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/book_adv.json?d_isbn=${encodeURIComponent(isbn)}`,
        {
          headers: {
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
          },
          next: { revalidate: 3600 },
        }
      )
      if (res.ok) {
        const data = await res.json()
        if (data.items?.[0]) bookTitle = normalizeNaverBook(data.items[0]).title
      }
    } catch {}
  }

  const label = bookTitle ?? '책'
  const ogImage = isbn
    ? `/api/og?isbn=${encodeURIComponent(isbn)}`
    : `/api/og`

  return {
    title: label,
    description: `${label}의 분위기에 어울리는 음악 플레이리스트`,
    openGraph: {
      title: `${label} — Litune`,
      description: `${label}의 분위기에 어울리는 음악 플레이리스트`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  }
}

export default async function ResultPage({ searchParams }: Props) {
  const { isbn, title, v } = await searchParams
  const variation = Math.max(0, parseInt(v ?? '0', 10) || 0)

  if (!isbn && !title) notFound()

  // 1. 책 정보 조회
  let book
  if (isbn) {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/book_adv.json?d_isbn=${encodeURIComponent(isbn)}`,
      {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
        },
        next: { revalidate: 3600 },
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.items?.[0]) book = normalizeNaverBook(data.items[0])
    }
  }

  if (!book && title) {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(title)}&display=1`,
      {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
        },
        next: { revalidate: 60 },
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.items?.[0]) book = normalizeNaverBook(data.items[0])
    }
  }

  if (!book) notFound()

  const bookIsbn = book.isbn || isbn || title!

  // 2. 무드 키워드 — DB 캐시 우선
  let mood = await getMood(bookIsbn)
  if (!mood) {
    mood = await extractMoodKeywords(book.title, book.description)
    await saveMood(bookIsbn, mood)
  }

  // 3. 음악 추천 — (isbn, variation) 캐시 우선
  let cached = await getRecommendation(bookIsbn, variation)
  if (cached) {
    return <ResultClient book={book} mood={mood} playlists={cached.playlists} tracks={cached.tracks} variation={variation} />
  }

  // 캐시 미스 — Spotify + Last.fm 병렬 호출
  const [playlistsResult, tracksResult] = await Promise.allSettled([
    searchPlaylists(mood.spotify, variation),
    getTracksByTags(mood.lastfm, variation),
  ])

  const playlists = playlistsResult.status === 'fulfilled' ? playlistsResult.value : []
  const tracks = tracksResult.status === 'fulfilled' ? tracksResult.value : []

  await saveRecommendation(bookIsbn, variation, playlists, tracks)

  return (
    <ResultClient
      book={book}
      mood={mood}
      playlists={playlists}
      tracks={tracks}
      variation={variation}
    />
  )
}
