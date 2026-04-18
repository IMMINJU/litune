export default function ResultLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed header */}
      <header className="fixed top-0 inset-x-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="px-5 py-5 md:px-10 lg:px-16 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-900 animate-pulse" />
          <span className="text-xs tracking-[0.2em] uppercase text-zinc-500 font-light">LITUNE</span>
        </div>
      </header>

      <div className="relative z-10 pt-24 md:pt-28">
        {/* Hero skeleton */}
        <section className="pb-12 px-5 md:px-10 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-[360px_1fr] lg:grid-cols-[440px_1fr] gap-10 md:gap-16 lg:gap-24 items-start">
              {/* Book cover skeleton */}
              <div className="mx-auto md:mx-0 w-full max-w-[280px] md:max-w-none">
                <div className="aspect-[2/3] rounded-lg bg-zinc-900 animate-pulse" />
              </div>

              {/* Book info skeleton */}
              <div className="space-y-8 pt-0 md:pt-4">
                <div className="space-y-3">
                  <div className="h-10 bg-zinc-900 rounded animate-pulse w-3/4" />
                  <div className="h-6 bg-zinc-900 rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-zinc-900 rounded animate-pulse w-1/4" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-zinc-900 rounded animate-pulse w-12" />
                  <div className="flex gap-2">
                    <div className="h-6 w-24 bg-zinc-900 rounded-full animate-pulse" />
                    <div className="h-6 w-20 bg-zinc-900 rounded-full animate-pulse" />
                    <div className="h-6 w-28 bg-zinc-900 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Playlists skeleton */}
        <section className="px-5 md:px-10 lg:px-16 pb-12">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="border-b border-zinc-900 pb-4">
              <div className="h-6 bg-zinc-900 rounded animate-pulse w-24" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-5 py-3 px-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-zinc-900 rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-zinc-900 rounded animate-pulse w-16" />
                  </div>
                  <div className="h-6 w-14 bg-zinc-900 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tracks skeleton */}
        <section className="px-5 md:px-10 lg:px-16 pb-24">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="border-b border-zinc-900 pb-4">
              <div className="h-6 bg-zinc-900 rounded animate-pulse w-12" />
            </div>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-7 h-4 bg-zinc-900 rounded animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-zinc-900 rounded animate-pulse w-1/2" />
                    <div className="h-3 bg-zinc-900 rounded animate-pulse w-1/3" />
                  </div>
                  <div className="h-5 w-16 bg-zinc-900 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
