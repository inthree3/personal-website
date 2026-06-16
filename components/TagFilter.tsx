interface TagFilterProps {
  tags: string[]
  active: string | null
  onChange: (tag: string | null) => void
}

export default function TagFilter({ tags, active, onChange }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onChange(null)}
        className={[
          'font-mono text-xs px-3 py-1.5 rounded border transition-colors',
          active === null
            ? 'border-accent text-accent bg-accent/10'
            : 'border-border text-text-muted hover:border-text-muted',
        ].join(' ')}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tag)}
          className={[
            'font-mono text-xs px-3 py-1.5 rounded border transition-colors',
            active === tag
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border text-text-muted hover:border-text-muted',
          ].join(' ')}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
