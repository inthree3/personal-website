import { PortableText } from '@portabletext/react'
import { getPostBySlug, getPostSlugs } from '@/sanity/lib/queries'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const slugs = await getPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.summary }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <article>
      <header className="mb-8">
        <time className="font-mono text-xs text-text-muted">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </time>
        <h1 className="font-serif text-4xl text-text-primary mt-2 mb-3">{post.title}</h1>
        {post.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span key={tag} className="font-mono text-xs text-text-muted border border-border rounded px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-sm max-w-none
        prose-headings:font-serif prose-headings:text-text-primary
        prose-p:text-text-muted prose-p:leading-relaxed
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-code:font-mono prose-code:text-accent-warm prose-code:text-sm
        prose-pre:bg-surface prose-pre:border prose-pre:border-border
        prose-strong:text-text-primary">
        <PortableText value={post.body} />
      </div>
    </article>
  )
}
