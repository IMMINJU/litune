import { NextRequest, NextResponse } from 'next/server'
import { normalizeNaverBook } from '@/lib/book'

export async function GET(request: NextRequest) {
  const isbn = request.nextUrl.searchParams.get('isbn')
  if (!isbn || isbn.trim() === '') {
    return NextResponse.json({ error: 'ISBN을 입력하세요' }, { status: 400 })
  }

  const url = `https://openapi.naver.com/v1/search/book_adv.json?d_isbn=${encodeURIComponent(isbn)}`

  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
      'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Naver API 오류' }, { status: res.status })
  }

  const data = await res.json()
  const item = data.items?.[0]
  if (!item) {
    return NextResponse.json({ error: '책을 찾을 수 없습니다' }, { status: 404 })
  }

  return NextResponse.json(normalizeNaverBook(item))
}
