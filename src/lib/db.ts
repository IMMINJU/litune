import { neon } from '@neondatabase/serverless'
import type { MoodKeywords } from '@/lib/claude'
import type { Playlist } from '@/lib/spotify'
import type { Track } from '@/lib/lastfm'

function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL이 설정되지 않았습니다')
  return neon(process.env.DATABASE_URL)
}

// ── book_moods ────────────────────────────────────────────────

export async function getMood(isbn: string): Promise<MoodKeywords | null> {
  const sql = getDb()
  const rows = await sql.query(
    'SELECT mood FROM book_moods WHERE isbn = $1',
    [isbn]
  )
  return (rows[0]?.mood as MoodKeywords) ?? null
}

export async function saveMood(isbn: string, mood: MoodKeywords): Promise<void> {
  const sql = getDb()
  await sql.query(
    `INSERT INTO book_moods (isbn, mood)
     VALUES ($1, $2)
     ON CONFLICT (isbn) DO NOTHING`,
    [isbn, JSON.stringify(mood)]
  )
}

// ── book_recommendations ──────────────────────────────────────

export async function getRecommendation(
  isbn: string,
  variation: number
): Promise<{ playlists: Playlist[]; tracks: Track[] } | null> {
  const sql = getDb()
  const rows = await sql.query(
    'SELECT playlists, tracks FROM book_recommendations WHERE isbn = $1 AND variation = $2',
    [isbn, variation]
  )
  if (!rows[0]) return null
  return {
    playlists: rows[0].playlists as Playlist[],
    tracks: rows[0].tracks as Track[],
  }
}

export async function saveRecommendation(
  isbn: string,
  variation: number,
  playlists: Playlist[],
  tracks: Track[]
): Promise<void> {
  const sql = getDb()
  await sql.query(
    `INSERT INTO book_recommendations (isbn, variation, playlists, tracks)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (isbn, variation) DO NOTHING`,
    [isbn, variation, JSON.stringify(playlists), JSON.stringify(tracks)]
  )
}
