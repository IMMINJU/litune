export type Book = {
  title: string
  author: string
  publisher: string
  isbn: string
  description: string
  thumbnail: string
  url: string
}

type NaverBookItem = {
  title?: string
  author?: string
  publisher?: string
  isbn?: string
  description?: string
  image?: string
  link?: string
}

/** Naver API 응답 아이템 → Book 타입으로 정규화 */
export function normalizeNaverBook(item: NaverBookItem): Book {
  return {
    title: stripHtml(item.title ?? ''),
    author: stripHtml(item.author ?? ''),
    publisher: stripHtml(item.publisher ?? ''),
    isbn: (item.isbn ?? '').trim().split(' ').at(-1) ?? '',
    description: stripHtml(item.description ?? ''),
    thumbnail: item.image ?? '',
    url: item.link ?? '',
  }
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}
