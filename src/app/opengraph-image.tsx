import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 배경 그라데이션 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, #1a1a2e55 0%, transparent 70%)',
          }}
        />

        {/* 로고 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 300,
            letterSpacing: '0.3em',
            color: '#ffffff',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          LITUNE
        </div>

        {/* 태그라인 */}
        <div
          style={{
            fontSize: 24,
            color: '#71717a',
            fontWeight: 300,
            letterSpacing: '0.05em',
          }}
        >
          책의 분위기에 어울리는 음악
        </div>
      </div>
    ),
    { ...size }
  )
}
