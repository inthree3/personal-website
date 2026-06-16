import type { ResearchEntry } from '@/lib/types'

const VENUE_COLORS: Record<ResearchEntry['venueType'], string> = {
  conference: 'text-accent',
  workshop:   'text-accent-warm',
  preprint:   'text-text-muted',
}

export default function ResearchEntryRow({ entry }: { entry: ResearchEntry }) {
  return (
    <li className="border-b border-border pb-5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {entry.url ? (
            <a href={entry.url} target="_blank" rel="noopener noreferrer"
              className="font-serif text-lg text-text-primary hover:text-accent-hover transition-colors">
              {entry.title}
            </a>
          ) : (
            <span className="font-serif text-lg text-text-primary">{entry.title}</span>
          )}
          <p className="font-mono text-xs text-text-muted mt-1">{entry.authors}</p>
        </div>
        <span className={['font-mono text-xs shrink-0 mt-1', VENUE_COLORS[entry.venueType]].join(' ')}>
          {entry.venue}
        </span>
      </div>
      {(entry.pdf || entry.poster) && (
        <div className="flex gap-4 mt-2">
          {entry.pdf && (
            <a href={entry.pdf} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-text-muted hover:text-accent-hover">[PDF]</a>
          )}
          {entry.poster && (
            <a href={entry.poster} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-text-muted hover:text-accent-hover">[Poster]</a>
          )}
        </div>
      )}
    </li>
  )
}
