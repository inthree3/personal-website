import type { Project } from '@/lib/types'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className={[
      'rounded-lg border bg-surface p-5 flex flex-col gap-3 transition-colors',
      project.highlight
        ? 'border-accent-warm/40 hover:border-accent-warm'
        : 'border-border hover:border-accent',
    ].join(' ')}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-lg text-text-primary">{project.title}</h3>
        {project.date && (
          <time className="font-mono text-xs text-text-muted shrink-0 mt-1">
            {new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </time>
        )}
      </div>
      <p className="text-text-muted text-sm leading-relaxed flex-1">{project.summary}</p>
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="font-mono text-xs text-text-muted border border-border rounded px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>
      {(project.url || project.repo) && (
        <div className="flex gap-3 pt-1">
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-accent hover:underline">
              Demo ↗
            </a>
          )}
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-text-muted hover:text-text-primary">
              GitHub ↗
            </a>
          )}
        </div>
      )}
    </div>
  )
}
