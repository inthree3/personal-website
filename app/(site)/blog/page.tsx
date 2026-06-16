import Link from 'next/link'
import { getAllPosts } from '@/sanity/lib/queries'

export const revalidate = 3600

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getAllPosts>> = []
  try {
    posts = await getAllPosts()
  } catch {
    // Sanity unavailable (e.g. placeholder credentials at build time)
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-8">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-text-muted font-mono text-sm">
          No posts yet. Add one in{' '}
          <a href="/studio" className="text-accent hover:underline">Sanity Studio</a>.
        </p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post._id}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <article className="border border-border rounded-lg p-5 bg-surface hover:border-accent-hover transition-colors">
                  <time className="font-mono text-xs text-text-muted">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </time>
                  <h2 className="font-serif text-xl text-text-primary mt-1 group-hover:text-accent-hover transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-text-muted text-sm mt-2 leading-relaxed">
                    {post.summary}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {post.tags.map((tag) => (
                        <span key={tag} className="font-mono text-xs text-text-muted border border-border rounded px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
