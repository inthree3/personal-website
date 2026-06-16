import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import TerminalCursor from '@/components/TerminalCursor'
import { getSiteSettings } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export const revalidate = 3600

export default async function AboutPage() {
  let s = null
  try {
    s = await getSiteSettings()
  } catch {
    // Sanity unavailable (e.g. placeholder credentials at build time)
  }

  if (!s) {
    return (
      <p className="text-text-muted font-mono text-sm">
        No site settings found. Add them in{' '}
        <a href="/studio" className="text-accent hover:underline">Sanity Studio</a>.
      </p>
    )
  }

  return (
    <div className="space-y-12">

      {/* Hero */}
      <section className="flex items-start gap-6">
        <div className="flex-1">
          <h1 className="font-serif text-5xl text-text-primary mb-3">
            {s.name}<TerminalCursor />
          </h1>
          <p className="font-mono text-sm text-accent">{s.tagline}</p>
        </div>
        {s.profileImage && (
          <Image
            src={urlFor(s.profileImage).width(96).height(96).fit('crop').url()}
            alt={s.name}
            width={96}
            height={96}
            className="rounded-full border border-border shrink-0"
          />
        )}
      </section>

      {/* Bio */}
      {s.bio && s.bio.length > 0 && (
        <section>
          <h2 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
            Background
          </h2>
          <div className="prose prose-invert prose-sm max-w-none
            prose-p:text-text-muted prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-primary">
            <PortableText value={s.bio} />
          </div>
        </section>
      )}

      {/* Links */}
      {s.links && s.links.length > 0 && (
        <section>
          <h2 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
            Find Me
          </h2>
          <div className="flex flex-wrap gap-3">
            {s.links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="font-mono text-sm border border-border text-text-muted px-3 py-1.5 rounded hover:border-accent hover:text-accent transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
