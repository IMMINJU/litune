import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const cookieStore = await cookies()
  const storedState = cookieStore.get('spotify_auth_state')?.value
  const returnUrl = cookieStore.get('spotify_return_url')?.value ?? '/'

  if (error || !code || state !== storedState) {
    return NextResponse.redirect(`${origin}/?error=spotify_auth_failed`)
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${origin}/api/auth/spotify/callback`,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/?error=spotify_token_failed`)
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json()

  const profileRes = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const profile = await profileRes.json()

  const response = NextResponse.redirect(`${origin}${returnUrl}`)

  // access_token: non-httpOnly — Web Playback SDK가 클라이언트에서 직접 읽어야 함
  response.cookies.set('spotify_access_token', access_token, {
    httpOnly: false,
    maxAge: expires_in,
    sameSite: 'lax',
    path: '/',
  })

  // refresh_token: httpOnly — 서버에서만 사용
  response.cookies.set('spotify_refresh_token', refresh_token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set(
    'spotify_user',
    JSON.stringify({
      name: profile.display_name ?? profile.id,
      isPremium: profile.product === 'premium',
    }),
    {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      path: '/',
    }
  )

  response.cookies.delete('spotify_auth_state')
  response.cookies.delete('spotify_return_url')

  return response
}
