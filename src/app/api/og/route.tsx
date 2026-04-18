import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'
import { normalizeNaverBook } from '@/lib/book'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const isbn = searchParams.get('isbn')
  const title = searchParams.get('title')

  let book: { title: string; author: string; thumbnail?: string } | null = null

  if (isbn) {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/book_adv.json?d_isbn=${encodeURIComponent(isbn)}`,
        {
          headers: {
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID ?? '',
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET ?? '',
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
  const truncatedTitle = bookTitle.length > 30 ? bookTitle.slice(0, 30) + '…' : bookTitle

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
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse 80% 70% at 20% 30%, rgba(26,26,62,0.25) 0%, rgba(0,0,0,0) 60%)',
          }}
        />

        {/* 책 표지 */}
        {thumbnail && (
          <div
            style={{
              display: 'flex',
              width: 280,
              height: 420,
              marginLeft: 80,
              marginTop: 105,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
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
          <div
            style={{
              display: 'flex',
              fontSize: truncatedTitle.length > 20 ? 42 : 52,
              fontWeight: 300,
              color: '#ffffff',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            {truncatedTitle}
          </div>

          {author && (
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                color: '#a1a1aa',
                fontWeight: 300,
                marginBottom: 48,
              }}
            >
              {author}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: '#52525b',
              letterSpacing: '0.2em',
            }}
          >
            LITUNE
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
