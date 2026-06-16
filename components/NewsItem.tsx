import type { NewsItem } from '@/lib/types'

export default function NewsItemRow({ item }: { item: NewsItem }) {
  return (
    <li className="flex gap-4 items-start">
      <time className="font-mono text-xs text-text-muted w-24 shrink-0 pt-0.5">
        {item.date}
      </time>
      <div className="flex items-start gap-3 flex-1">
        <span className="w-2 h-2 rounded-full bg-accent inline-block mt-1.5 shrink-0" />
        {item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="text-text-primary text-sm hover:text-accent-hover transition-colors">
            {item.text}
          </a>
        ) : (
          <span className="text-text-primary text-sm">{item.text}</span>
        )}
      </div>
    </li>
  )
}
