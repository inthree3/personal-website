import { getAllProjects } from '@/sanity/lib/queries'
import ProjectsClient from '@/components/ProjectsClient'

export const revalidate = 3600

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getAllProjects>> = []
  try {
    projects = await getAllProjects()
  } catch {
    // Sanity unavailable (e.g. placeholder credentials at build time)
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-6">Projects</h1>
      {projects.length === 0 ? (
        <p className="text-text-muted font-mono text-sm">
          No projects yet. Add one in{' '}
          <a href="/studio" className="text-accent hover:underline">Sanity Studio</a>.
        </p>
      ) : (
        <ProjectsClient projects={projects} />
      )}
    </div>
  )
}
