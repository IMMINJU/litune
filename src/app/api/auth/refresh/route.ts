import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('spotify_refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'no_refresh_token' }, { status: 401 })
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'refresh_failed' }, { status: 401 })
  }

  const { access_token, expires_in } = await res.json()

  const response = NextResponse.json({ access_token })
  response.cookies.set('spotify_access_token', access_token, {
    httpOnly: false,
    maxAge: expires_in,
    sameSite: 'lax',
    path: '/',
  })

  return response
}
