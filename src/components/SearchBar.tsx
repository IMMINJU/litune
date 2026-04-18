'use client'

import { useState, useRef } from 'react'
import type { Book } from '@/lib/book'

type Props = {
  onSelect: (book: Book) => void
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/book/search?q=${encodeURIComponent(val)}`)
        const data = await res.json()
        setResults(data.items ?? [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  function handleSelect(book: Book) {
    setQuery(book.title)
    setOpen(false)
    setResults([])
    onSelect(book)
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 bg-surface rounded-xl px-4 h-12 border border-border-col focus-within:border-text-secondary transition-colors">
        {loading ? (
          <svg
            className="w-4 h-4 text-text-muted flex-shrink-0 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-text-muted flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="책 제목이나 저자를 검색하세요"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
        {query && (
          <button
            onMouseDown={(e) => { e.preventDefault(); setQuery(''); setOpen(false); setResults([]) }}
            className="text-text-muted hover:text-text-secondary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-col rounded-xl overflow-hidden z-50 shadow-xl">
          {results.map((book) => (
            <li key={book.isbn || book.title}>
              <button
                onMouseDown={() => handleSelect(book)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-high transition-colors text-left"
              >
                {book.thumbnail ? (
                  <img src={book.thumbnail} alt="" className="w-9 h-12 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-9 h-12 bg-surface-high rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{book.title}</p>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{book.author}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
