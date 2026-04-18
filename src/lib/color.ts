export const COLOR_FALLBACK = '#1e1e1e'

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

/** 이미지 URL에서 평균 색상을 추출해 hex로 반환. 실패 시 폴백 반환 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  if (typeof window === 'undefined') return COLOR_FALLBACK

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 50
        canvas.height = 50
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(COLOR_FALLBACK)
          return
        }
        ctx.drawImage(img, 0, 0, 50, 50)
        const { data } = ctx.getImageData(0, 0, 50, 50)

        let r = 0, g = 0, b = 0
        const pixels = data.length / 4
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }
        resolve(rgbToHex(
          Math.round(r / pixels),
          Math.round(g / pixels),
          Math.round(b / pixels)
        ))
      } catch {
        resolve(COLOR_FALLBACK)
      }
    }
    img.onerror = () => resolve(COLOR_FALLBACK)
    img.src = imageUrl
  })
}
