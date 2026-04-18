import Anthropic from '@anthropic-ai/sdk'

export type MoodKeywords = {
  spotify: string[]
  lastfm: string[]
}

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const SYSTEM_PROMPT = `You are a music curator. Given a book's description, extract music style keywords that match the book's atmosphere and emotional tone.

Output ONLY valid JSON in this exact format:
{"spotify": ["keyword1", "keyword2", "keyword3"], "lastfm": ["tag1", "tag2", "tag3"]}

Rules:
- "spotify" array: 3 genre/style phrases for playlist search (e.g., "dark ambient piano", "melancholic indie folk", "minimalist orchestral")
- "lastfm" array: 3 mood/genre tags (e.g., "melancholic", "atmospheric", "introspective")
- Keywords must be MUSIC genre/style/mood — NOT book content (never use: korean, historical, fiction, science, literary, etc.)
- Match the emotional atmosphere, not the topic`

/** 소개글 → 음악 키워드 추출 */
export async function extractMoodKeywords(
  title: string,
  description: string
): Promise<MoodKeywords> {
  const message = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Book: "${title}"\nDescription: ${description}`,
      },
    ],
    system: SYSTEM_PROMPT,
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseMoodKeywords(text)
}

/** Claude 응답 텍스트 → MoodKeywords 파싱 (순수 함수 — 테스트 대상) */
export function parseMoodKeywords(text: string): MoodKeywords {
  const fallback: MoodKeywords = { spotify: [], lastfm: [] }

  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return fallback

    const parsed = JSON.parse(match[0])

    const spotify = Array.isArray(parsed.spotify)
      ? parsed.spotify.filter((v: unknown) => typeof v === 'string')
      : []
    const lastfm = Array.isArray(parsed.lastfm)
      ? parsed.lastfm.filter((v: unknown) => typeof v === 'string')
      : []

    return { spotify, lastfm }
  } catch {
    return fallback
  }
}
