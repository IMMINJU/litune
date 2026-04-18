import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const returnUrl = searchParams.get('returnUrl') ?? '/'

  const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: 'streaming user-read-private user-read-email',
    redirect_uri: `${origin}/api/auth/spotify/callback`,
    state,
  })

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )

  response.cookies.set('spotify_auth_state', state, {
    httpOnly: true,
    maxAge: 600,
    sameSite: 'lax',
    path: '/',
  })

  response.cookies.set('spotify_return_url', returnUrl, {
    httpOnly: true,
    maxAge: 600,
    sameSite: 'lax',
    path: '/',
  })

  return response
}
