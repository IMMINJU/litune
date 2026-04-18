import { describe, it, expect, vi } from 'vitest'
import { rgbToHex, extractDominantColor, COLOR_FALLBACK } from '../color'

describe('rgbToHex', () => {
  it('RGB를 hex로 변환한다', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
  })

  it('검정과 흰색을 변환한다', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
  })

  it('두 자리 미만은 0으로 패딩한다', () => {
    expect(rgbToHex(1, 2, 3)).toBe('#010203')
  })
})

describe('extractDominantColor', () => {
  it('이미지 로드 실패 시 폴백을 반환한다', async () => {
    // jsdom은 이미지를 실제 로드하지 않으므로 Image를 mock
    vi.stubGlobal('Image', class MockImage {
      crossOrigin = ''
      onload: (() => void) | null = null
      onerror: ((e: unknown) => void) | null = null
      set src(_url: string) {
        Promise.resolve().then(() => this.onerror?.(new Error('load failed')))
      }
    })

    const color = await extractDominantColor('https://example.com/cover.jpg')
    expect(color).toBe(COLOR_FALLBACK)

    vi.unstubAllGlobals()
  })

  it('window가 없는 환경(서버)이면 폴백을 반환한다', async () => {
    const original = global.window
    // @ts-expect-error window를 undefined로 설정
    delete global.window

    const color = await extractDominantColor('https://example.com/cover.jpg')
    expect(color).toBe(COLOR_FALLBACK)

    // @ts-expect-error restore
    global.window = original
  })
})
