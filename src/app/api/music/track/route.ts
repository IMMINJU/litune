import { NextRequest, NextResponse } from 'next/server'
import { findTrackId } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')
  const artist = request.nextUrl.searchParams.get('artist')

  if (!name || !artist) {
    return NextResponse.json({ error: 'name과 artist가 필요합니다' }, { status: 400 })
  }

  const id = await findTrackId(name, artist)
  if (!id) {
    return NextResponse.json({ error: '트랙을 찾을 수 없습니다' }, { status: 404 })
  }

  return NextResponse.json({ id })
}
