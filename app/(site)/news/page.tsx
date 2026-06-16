import { getAllNews } from '@/sanity/lib/queries'
import NewsItemRow from '@/components/NewsItem'

export const revalidate = 3600

export default async function NewsPage() {
  let items: Awaited<ReturnType<typeof getAllNews>> = []
  try {
    items = await getAllNews()
  } catch {
    // Sanity unavailable (e.g. placeholder credentials at build time)
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-8">News</h1>
      {items.length === 0 ? (
        <p className="text-text-muted font-mono text-sm">
          No news yet. Add one in{' '}
          <a href="/studio" className="text-accent hover:underline">Sanity Studio</a>.
        </p>
      ) : (
        <ul className="space-y-5">
          {items.map((item) => (
            <NewsItemRow key={item._id} item={item} />
          ))}
        </ul>
      )}
    </div>
  )
}
