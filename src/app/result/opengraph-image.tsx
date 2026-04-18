import { ImageResponse } from 'next/og'
import { normalizeNaverBook } from '@/lib/book'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = {
  searchParams: Promise<{ isbn?: string; title?: string }>
}

export default async function Image({ searchParams }: Props) {
  const { isbn, title } = await searchParams

  let book: { title: string; author: string; thumbnail?: string } | null = null

  if (isbn) {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/book_adv.json?d_isbn=${encodeURIComponent(isbn)}`,
        {
          headers: {
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
          },
        }
      )
      if (res.ok) {
        const data = await res.json()
        if (data.items?.[0]) book = normalizeNaverBook(data.items[0])
      }
    } catch {}
  }

  const bookTitle = book?.title ?? (title ? decodeURIComponent(title) : 'Litune')
  const author = book?.author ?? ''
  const thumbnail = book?.thumbnail

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#000000',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* 배경 그라데이션 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 70% at 20% 30%, #1a1a3e40 0%, transparent 60%)',
          }}
        />

        {/* 책 표지 */}
        {thumbnail && (
          <div
            style={{
              width: 280,
              height: 420,
              marginLeft: 80,
              marginTop: 105,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt={bookTitle}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* 텍스트 영역 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: thumbnail ? 64 : 100,
            paddingRight: 80,
            flex: 1,
          }}
        >
          {/* 책 제목 */}
          <div
            style={{
              fontSize: bookTitle.length > 20 ? 42 : 52,
              fontWeight: 300,
              color: '#ffffff',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: 16,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {bookTitle}
          </div>

          {/* 저자 */}
          {author && (
            <div
              style={{
                fontSize: 24,
                color: '#a1a1aa',
                fontWeight: 300,
                marginBottom: 48,
              }}
            >
              {author}
            </div>
          )}

          {/* LITUNE 브랜딩 */}
          <div
            style={{
              fontSize: 14,
              color: '#52525b',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            LITUNE
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
