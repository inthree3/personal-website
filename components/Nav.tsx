'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/',          label: 'About'    },
  { href: '/blog',      label: 'Blog'     },
  { href: '/projects',  label: 'Projects' },
  { href: '/research',  label: 'Research' },
  { href: '/news',      label: 'News'     },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-content items-center px-4 py-4">
        <Link
          href="/"
          className="font-serif text-lg text-text-primary hover:text-accent-hover transition-colors"
        >
          Inseon Hwang
        </Link>

        <div className="hidden sm:flex gap-4 ml-auto">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                'font-mono text-sm transition-colors',
                isActive(href)
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary',
              ].join(' ')}
            >
              {label}
            </Link>
          ))}
        </div>

        <button
          className="sm:hidden ml-auto text-text-muted hover:text-text-primary p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {open ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="sm:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={[
                'font-mono text-sm transition-colors',
                isActive(href)
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary',
              ].join(' ')}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
