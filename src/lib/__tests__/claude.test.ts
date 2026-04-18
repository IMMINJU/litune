import { describe, it, expect } from 'vitest'
import { parseMoodKeywords } from '../claude'

describe('parseMoodKeywords', () => {
  it('정상 JSON을 파싱한다', () => {
    const text = '{"spotify": ["dark ambient", "melancholic indie"], "lastfm": ["atmospheric", "sad"]}'
    const result = parseMoodKeywords(text)
    expect(result.spotify).toEqual(['dark ambient', 'melancholic indie'])
    expect(result.lastfm).toEqual(['atmospheric', 'sad'])
  })

  it('JSON 앞뒤에 텍스트가 있어도 파싱한다', () => {
    const text = 'Here are the keywords:\n{"spotify": ["ambient"], "lastfm": ["calm"]}\nDone.'
    const result = parseMoodKeywords(text)
    expect(result.spotify).toEqual(['ambient'])
    expect(result.lastfm).toEqual(['calm'])
  })

  it('유효하지 않은 JSON이면 빈 배열을 반환한다', () => {
    const result = parseMoodKeywords('not valid json at all')
    expect(result.spotify).toEqual([])
    expect(result.lastfm).toEqual([])
  })

  it('JSON이 없으면 빈 배열을 반환한다', () => {
    const result = parseMoodKeywords('')
    expect(result.spotify).toEqual([])
    expect(result.lastfm).toEqual([])
  })

  it('spotify 키가 없으면 빈 배열로 처리한다', () => {
    const result = parseMoodKeywords('{"lastfm": ["melancholic"]}')
    expect(result.spotify).toEqual([])
    expect(result.lastfm).toEqual(['melancholic'])
  })

  it('배열 요소 중 string이 아닌 값은 제거한다', () => {
    const result = parseMoodKeywords('{"spotify": ["valid", 123, null], "lastfm": ["ok"]}')
    expect(result.spotify).toEqual(['valid'])
  })
})
