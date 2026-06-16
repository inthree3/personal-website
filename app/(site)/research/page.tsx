import { getAllResearch } from '@/sanity/lib/queries'
import ResearchEntryRow from '@/components/ResearchEntry'

export const revalidate = 3600

export default async function ResearchPage() {
  let entries: Awaited<ReturnType<typeof getAllResearch>> = []
  try {
    entries = await getAllResearch()
  } catch {
    // Sanity unavailable (e.g. placeholder credentials at build time)
  }
  const years = [...new Set(entries.map((e) => new Date(e.date).getFullYear()))].sort((a, b) => b - a)

  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-8">Research</h1>
      {entries.length === 0 ? (
        <p className="text-text-muted font-mono text-sm">
          No research entries yet. Add one in{' '}
          <a href="/studio" className="text-accent hover:underline">Sanity Studio</a>.
        </p>
      ) : (
        years.map((year) => (
          <section key={year} className="mb-10">
            <h2 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
              {year}
            </h2>
            <ul className="space-y-5">
              {entries
                .filter((e) => new Date(e.date).getFullYear() === year)
                .map((entry) => (
                  <ResearchEntryRow key={entry._id} entry={entry} />
                ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
