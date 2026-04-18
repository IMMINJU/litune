import { NextRequest, NextResponse } from 'next/server'
import { normalizeNaverBook } from '@/lib/book'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.trim() === '') {
    return NextResponse.json({ error: '검색어를 입력하세요' }, { status: 400 })
  }

  const url = `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(q)}&display=10`

  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
      'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Naver API 오류' }, { status: res.status })
  }

  const data = await res.json()
  const items = (data.items ?? []).map(normalizeNaverBook)

  return NextResponse.json({ items })
}
