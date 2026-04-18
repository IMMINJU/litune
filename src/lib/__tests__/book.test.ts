import { describe, it, expect } from 'vitest'
import { normalizeNaverBook } from '../book'

describe('normalizeNaverBook', () => {
  it('정상 응답을 Book 타입으로 변환한다', () => {
    const item = {
      title: '<b>채식주의자</b>',
      author: '한강',
      publisher: '창비',
      isbn: '9788936434595',
      description: '한 여성이 채식주의자가 되면서 벌어지는 이야기.',
      image: 'https://example.com/cover.jpg',
      link: 'https://book.naver.com/bookdb/book_detail.nhn?bid=6490432',
    }

    const book = normalizeNaverBook(item)

    expect(book.title).toBe('채식주의자')
    expect(book.author).toBe('한강')
    expect(book.publisher).toBe('창비')
    expect(book.isbn).toBe('9788936434595')
    expect(book.description).toBe('한 여성이 채식주의자가 되면서 벌어지는 이야기.')
    expect(book.thumbnail).toBe('https://example.com/cover.jpg')
    expect(book.url).toBe('https://book.naver.com/bookdb/book_detail.nhn?bid=6490432')
  })

  it('isbn 필드에 공백 구분 여러 값이 있으면 마지막 값을 사용한다', () => {
    const item = { isbn: '8936434594 9788936434595' }
    const book = normalizeNaverBook(item)
    expect(book.isbn).toBe('9788936434595')
  })

  it('HTML 태그를 제거한다', () => {
    const item = {
      title: '<b>제목</b>',
      author: '<b>저자</b>',
      description: '<p>설명</p>',
    }
    const book = normalizeNaverBook(item)
    expect(book.title).toBe('제목')
    expect(book.author).toBe('저자')
    expect(book.description).toBe('설명')
  })

  it('누락된 필드는 빈 문자열로 처리한다', () => {
    const book = normalizeNaverBook({})
    expect(book.title).toBe('')
    expect(book.author).toBe('')
    expect(book.isbn).toBe('')
    expect(book.thumbnail).toBe('')
  })
})
