'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import SearchBar from '@/components/SearchBar'
import type { Book } from '@/lib/book'

export default function Home() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const detectedRef = useRef(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)

  function handleBookSelect(book: Book) {
    router.push(`/result?isbn=${encodeURIComponent(book.isbn)}&title=${encodeURIComponent(book.title)}`)
  }

  const handleBarcodeDetected = useCallback(async (isbn: string) => {
    const res = await fetch(`/api/book/isbn?isbn=${encodeURIComponent(isbn)}`)
    if (res.ok) {
      const book: Book = await res.json()
      router.push(`/result?isbn=${encodeURIComponent(book.isbn)}&title=${encodeURIComponent(book.title)}`)
    } else {
      setScanError(`"${isbn}" 에 해당하는 책을 찾을 수 없습니다`)
      detectedRef.current = false
    }
  }, [router])

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()

    reader.decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
      if (result && !detectedRef.current) {
        const text = result.getText()
        if (/^97[89]\d{10}$/.test(text)) {
          detectedRef.current = true
          BrowserMultiFormatReader.releaseAllStreams()
          handleBarcodeDetected(text)
        }
      }
      if (err && !(err instanceof NotFoundException)) {
        setCameraError('카메라를 사용할 수 없습니다')
      }
    }).catch(() => {
      setCameraError('카메라 권한이 필요합니다')
    })

    return () => { BrowserMultiFormatReader.releaseAllStreams() }
  }, [handleBarcodeDetected])

  return (
    <div className="min-h-dvh bg-black text-white relative overflow-hidden">
      {/* Atmospheric gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />

      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

      {/* Film grain — A24 style */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.2\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative z-10 min-h-dvh flex flex-col">
        {/* Header */}
        <header className="px-5 pt-14 pb-5 md:px-10 md:pt-16 lg:px-16 space-y-5">
          <h1 className="text-xl md:text-2xl tracking-[0.2em] uppercase font-light">
            LITUNE
          </h1>
          <div className="max-w-3xl">
            <SearchBar onSelect={handleBookSelect} />
          </div>
        </header>

        {/* Viewfinder — primary UI */}
        <main className="flex-1 flex flex-col items-center justify-center px-5 md:px-10 lg:px-16 pb-16">
          <div className="w-full max-w-lg space-y-8 text-center">
            {/* Camera area — landscape for barcode scanning */}
            <div className="relative mx-auto w-full">
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-zinc-950/40 border border-zinc-800/50 shadow-2xl">
                {cameraError ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-zinc-600 text-sm">{cameraError}</p>
                  </div>
                ) : (
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                )}

                {/* Vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-10 h-10 border-t-[2px] border-l-[2px] border-zinc-300/80 pointer-events-none" />
                <div className="absolute top-3 right-3 w-10 h-10 border-t-[2px] border-r-[2px] border-zinc-300/80 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-10 h-10 border-b-[2px] border-l-[2px] border-zinc-300/80 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-10 h-10 border-b-[2px] border-r-[2px] border-zinc-300/80 pointer-events-none" />

                {/* Crosshair guides */}
                <div className="absolute left-1/2 top-1/4 bottom-1/4 w-px bg-zinc-700/40 -translate-x-1/2 pointer-events-none" />
                <div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-zinc-700/40 -translate-y-1/2 pointer-events-none" />

                {/* Scan line */}
                {!cameraError && (
                  <div
                    className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-zinc-300/60 to-transparent pointer-events-none animate-[scan_3s_ease-in-out_infinite]"
                  />
                )}
              </div>
            </div>

            {scanError && (
              <p className="text-xs text-zinc-500">{scanError}</p>
            )}

            <div className="space-y-1.5">
              <p className="text-base text-zinc-300 tracking-wide font-light">
                바코드를 프레임 안에 위치시키세요
              </p>
              <p className="text-xs text-zinc-600 uppercase tracking-widest">
                또는 위에서 제목으로 검색
              </p>
            </div>
          </div>
        </main>

        <footer className="px-5 py-5 text-center">
          <p className="text-zinc-700 text-[10px] tracking-[0.2em] uppercase">
            © 2026 LITUNE
          </p>
        </footer>
      </div>
    </div>
  )
}
