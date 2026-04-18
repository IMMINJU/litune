import type { Book } from '@/lib/book'

type Props = {
  book: Book
  onClick?: () => void
}

export default function BookCard({ book, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full bg-surface rounded-2xl p-4 border border-border-col hover:bg-surface-high transition-colors active:scale-[0.98] text-left"
    >
      {book.thumbnail ? (
        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-14 h-20 object-cover rounded-lg flex-shrink-0 shadow-md"
        />
      ) : (
        <div className="w-14 h-20 bg-surface-high rounded-lg flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">{book.title}</h3>
        <p className="text-xs text-text-secondary mt-1 truncate">{book.author}</p>
        <p className="text-xs text-text-muted mt-0.5 truncate">{book.publisher}</p>
      </div>
    </button>
  )
}
