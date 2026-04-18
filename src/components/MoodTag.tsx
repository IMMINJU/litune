type Props = { tag: string }

export default function MoodTag({ tag }: Props) {
  return (
    <span className="inline-block px-4 py-1.5 rounded-md text-sm text-zinc-300 bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-sm font-light hover:bg-zinc-800/60 hover:border-zinc-700/60 transition-all">
      {tag}
    </span>
  )
}
