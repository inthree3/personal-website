'use client'
import { useState } from 'react'
import type { Project } from '@/lib/types'
import ProjectCard from './ProjectCard'
import TagFilter from './TagFilter'

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort()

  const filtered = activeTag
    ? projects.filter((p) => p.tags.includes(activeTag))
    : projects

  return (
    <>
      <TagFilter tags={allTags} active={activeTag} onChange={setActiveTag} />
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </>
  )
}
