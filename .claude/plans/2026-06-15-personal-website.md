# Inseon Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a "Structured Curiosity" personal website for Inseon Hwang — CS researcher + fullstack engineer — targeting English-speaking AI/tech recruiters and Korean international students.

**Architecture:** Next.js 14 App Router with static generation (SSG) + ISR. All updatable content (bio, blog, projects, research, news) lives in Sanity CMS. Pages fetch via GROQ at build time. Sanity Studio is embedded at `/studio`. The only hardcoded content is structural UI (nav labels, page headings).

**Tech Stack:** Next.js 14, Tailwind CSS v3 + CSS custom properties, `sanity` + `next-sanity` + `@portabletext/react` + `@sanity/image-url`, TypeScript, Vercel deployment, Google Fonts (DM Serif Display, Inter, JetBrains Mono).

---

## Sanity Document Types

| Schema | Type | Description |
|---|---|---|
| `siteSettings` | Singleton | About page content — name, tagline, bio, links, profile image |
| `post` | Document | Blog post with Portable Text body |
| `project` | Document | Portfolio project |
| `researchEntry` | Document | Paper or poster |
| `newsItem` | Document | Timeline event (award, talk, publication notice) |

---

## File Map

```
personal-website/
├── app/
│   ├── layout.tsx                          # Bare HTML shell (no Nav — Studio needs full viewport)
│   ├── globals.css
│   ├── (site)/
│   │   ├── layout.tsx                      # Nav + max-width wrapper for all public pages
│   │   ├── page.tsx                        # About — fetches siteSettings from Sanity
│   │   ├── blog/
│   │   │   ├── page.tsx                    # Blog list
│   │   │   └── [slug]/page.tsx             # Blog post
│   │   ├── projects/
│   │   │   └── page.tsx                    # Fetches projects, passes to ProjectsClient
│   │   ├── research/
│   │   │   └── page.tsx                    # Fetches researchEntries
│   │   └── news/
│   │       └── page.tsx                    # Fetches newsItems
│   └── studio/
│       └── [[...tool]]/page.tsx            # Embedded Sanity Studio
├── components/
│   ├── Nav.tsx
│   ├── TerminalCursor.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectsClient.tsx                  # 'use client' — tag filter state
│   ├── TagFilter.tsx
│   ├── ResearchEntry.tsx
│   └── NewsItem.tsx
├── sanity/
│   ├── schemas/
│   │   ├── siteSettings.ts
│   │   ├── post.ts
│   │   ├── project.ts
│   │   ├── researchEntry.ts
│   │   ├── newsItem.ts
│   │   └── index.ts
│   └── lib/
│       ├── client.ts
│       ├── image.ts                        # urlFor() helper
│       └── queries.ts                      # All GROQ fetchers
├── lib/
│   └── types.ts                            # TypeScript interfaces matching GROQ projections
├── public/
├── .env.local
├── .env.local.example
├── sanity.config.ts
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

---

## Task 1: Bootstrap Next.js Project

**Files:**
- Create: `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `app/globals.css`

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/inseon-hwang/Dev/personal-website
npx create-next-app@14 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

Expected: Project files appear.

- [ ] **Step 2: Install all dependencies**

```bash
npm install sanity next-sanity @portabletext/react @portabletext/types @sanity/image-url @sanity/code-input
npm install -D @tailwindcss/typography
```

- [ ] **Step 3: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg:           #0F1117;
  --surface:      #1A1D27;
  --border:       #2A2D3A;
  --accent:       #6C8EFF;
  --accent-warm:  #FF8C5A;
  --text-primary: #E8EAF0;
  --text-muted:   #7A7F9A;
}

html {
  background-color: var(--bg);
  color: var(--text-primary);
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}

body {
  font-family: var(--font-inter), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background-color: var(--accent);
  color: #fff;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.cursor-blink {
  display: inline-block;
  animation: blink 1.2s step-start infinite;
  color: var(--accent);
  font-family: var(--font-jetbrains), monospace;
  font-weight: 400;
  margin-left: 2px;
}
```

- [ ] **Step 4: Configure `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:            'var(--bg)',
        surface:       'var(--surface)',
        border:        'var(--border)',
        accent:        'var(--accent)',
        'accent-warm': 'var(--accent-warm)',
        'text-primary':'var(--text-primary)',
        'text-muted':  'var(--text-muted)',
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-jetbrains)', 'monospace'],
      },
      maxWidth: { content: '768px' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
```

- [ ] **Step 5: Configure `next.config.mjs`**

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: `✓ Ready on http://localhost:3000`

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: bootstrap Next.js 14 with Tailwind and Sanity dependencies"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `lib/types.ts`

All types mirror the GROQ projection shapes returned from Sanity queries. There are no JSON data files — Sanity is the single source of truth.

- [ ] **Step 1: Create `lib/types.ts`**

```ts
import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export interface SiteSettings {
  name: string
  tagline: string
  bio: PortableTextBlock[]
  links: Array<{ label: string; href: string }>
  profileImage?: SanityImageSource
}

export interface Post {
  _id: string
  title: string
  slug: string
  date: string
  summary: string
  tags: string[]
}

export interface Project {
  _id: string
  title: string
  summary: string
  tags: string[]
  date?: string   // ISO date string: "2024-03-01"
  url?: string
  repo?: string
  highlight: boolean
  order: number
}

export interface ResearchEntry {
  _id: string
  title: string
  authors: string
  venue: string
  venueType: 'conference' | 'workshop' | 'preprint'
  date: string    // ISO date string: "2025-07-15" — year derived via new Date(date).getFullYear()
  url?: string
  pdf?: string
  poster?: string
}

export interface NewsItem {
  _id: string
  date: string
  text: string
  url?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: TypeScript types matching Sanity GROQ projections"
```

---

## Task 3: Root Layout with Fonts, Nav, and Route Group

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/(site)/layout.tsx`, `components/Nav.tsx`

The root layout has no Nav so that `/studio` gets a bare viewport. All public pages sit in the `(site)` route group which adds Nav and padding.

- [ ] **Step 1: Create `components/Nav.tsx`**

```tsx
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
          className="font-serif text-lg text-text-primary hover:text-accent transition-colors"
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
```

- [ ] **Step 2: Replace `app/layout.tsx` (bare shell, no Nav)**

```tsx
import type { Metadata } from 'next'
import { DM_Serif_Display, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Inseon Hwang',
  description: 'CS researcher & fullstack engineer',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-bg text-text-primary">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create `app/(site)/layout.tsx`**

```tsx
import Nav from '@/components/Nav'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-content px-4 py-12">
        {children}
      </main>
    </>
  )
}
```

- [ ] **Step 4: Create placeholder About page**

```bash
mkdir -p "app/(site)"
```

Write `app/(site)/page.tsx`:

```tsx
export default function AboutPage() {
  return <p className="text-text-muted">About page coming soon.</p>
}
```

- [ ] **Step 5: Verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: Dark background, sticky Nav, placeholder text.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx "app/(site)/layout.tsx" "app/(site)/page.tsx" components/Nav.tsx
git commit -m "feat: root layout with Google fonts, site route group, responsive nav"
```

---

## Task 4: TerminalCursor Component

**Files:**
- Create: `components/TerminalCursor.tsx`

- [ ] **Step 1: Create `components/TerminalCursor.tsx`**

```tsx
export default function TerminalCursor() {
  return <span className="cursor-blink" aria-hidden="true">_</span>
}
```

- [ ] **Step 2: Verify**

Update `app/(site)/page.tsx` temporarily:

```tsx
import TerminalCursor from '@/components/TerminalCursor'
export default function AboutPage() {
  return <h1 className="font-serif text-4xl">Inseon Hwang<TerminalCursor /></h1>
}
```

Open `http://localhost:3000`. Expected: Blue `_` blinks at 1.2s interval.

- [ ] **Step 3: Commit**

```bash
git add components/TerminalCursor.tsx
git commit -m "feat: terminal cursor blink component"
```

---

## Task 5: Sanity Project Setup + All Schemas

**Files:**
- Create: `sanity.config.ts`, `sanity/schemas/siteSettings.ts`, `sanity/schemas/post.ts`, `sanity/schemas/project.ts`, `sanity/schemas/researchEntry.ts`, `sanity/schemas/newsItem.ts`, `sanity/schemas/index.ts`, `sanity/lib/client.ts`, `sanity/lib/image.ts`, `app/studio/[[...tool]]/page.tsx`, `.env.local.example`

### Before starting: create Sanity project

```bash
npm create sanity@latest -- --env=.env.local
```

Prompts:
- Project name: `inseon-personal-website`
- Default dataset (`production`): Yes
- Output path: accept default

After completion, `.env.local` will have `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.

---

- [ ] **Step 1: Create `sanity/schemas/siteSettings.ts`**

Singleton document — the entire About page content.

```ts
import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'About / Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'Shown below name on About page. e.g. "CS Researcher · Fullstack Engineer"',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'profileImage',
      title: 'Profile Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      description: 'Rich text bio shown in the Background section.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'links',
      title: 'Links',
      description: 'Buttons shown in the "Find Me" section.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required() }),
            defineField({ name: 'href',  type: 'url',    title: 'URL',
              validation: (Rule) => Rule.required().uri({ allowRelative: true }) }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'tagline' },
  },
})
```

- [ ] **Step 2: Create `sanity/schemas/post.ts`**

Blog post with Portable Text body.

```ts
import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Publication Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
        },
        { type: 'code' },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', date: 'date' },
    prepare({ title, date }) {
      return { title, subtitle: date ? new Date(date).toLocaleDateString() : 'No date' }
    },
  },
})
```

- [ ] **Step 3: Create `sanity/schemas/project.ts`**

Portfolio project entry.

```ts
import { defineField, defineType } from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'url',
      title: 'Demo URL',
      type: 'url',
    }),
    defineField({
      name: 'repo',
      title: 'GitHub URL',
      type: 'url',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      description: 'Project completion or launch date.',
      type: 'date',
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight',
      description: 'Show with orange accent border.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      description: 'Lower number appears first.',
      type: 'number',
      initialValue: 99,
    }),
  ],
  orderings: [
    { title: 'Display Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Date (newest first)', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'date' },
    prepare({ title, date }) {
      return { title, subtitle: date ?? 'No date' }
    },
  },
})
```

- [ ] **Step 4: Create `sanity/schemas/researchEntry.ts`**

Paper, poster, or preprint.

```ts
import { defineField, defineType } from 'sanity'

export const researchEntryType = defineType({
  name: 'researchEntry',
  title: 'Research Entry',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authors',
      type: 'string',
      description: 'e.g. "Hwang I., Smith J., Advisor B."',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'venue',
      type: 'string',
      description: 'e.g. "ACL 2025", "NeurIPS Workshop 2024"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'venueType',
      title: 'Venue Type',
      type: 'string',
      options: {
        list: [
          { title: 'Conference', value: 'conference' },
          { title: 'Workshop',   value: 'workshop'   },
          { title: 'Preprint',   value: 'preprint'   },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Publication Date',
      description: 'Exact date of publication or submission. Year is derived from this for grouping.',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'url',    title: 'Paper URL', type: 'url' }),
    defineField({ name: 'pdf',    title: 'PDF URL',   type: 'url' }),
    defineField({ name: 'poster', title: 'Poster URL',type: 'url' }),
  ],
  orderings: [
    { title: 'Date (newest first)', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', venue: 'venue', date: 'date' },
    prepare({ title, venue, date }) {
      const year = date ? new Date(date).getFullYear() : ''
      return { title, subtitle: `${venue} · ${year}` }
    },
  },
})
```

- [ ] **Step 5: Create `sanity/schemas/newsItem.ts`**

Short timeline event.

```ts
import { defineField, defineType } from 'sanity'

export const newsItemType = defineType({
  name: 'newsItem',
  title: 'News Item',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      type: 'string',
      description: 'Short description of the event.',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'url',
      title: 'Link (optional)',
      type: 'url',
    }),
  ],
  orderings: [
    { title: 'Date (newest first)', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'text', subtitle: 'date' },
  },
})
```

- [ ] **Step 6: Create `sanity/schemas/index.ts`**

```ts
import { siteSettingsType  } from './siteSettings'
import { postType          } from './post'
import { projectType       } from './project'
import { researchEntryType } from './researchEntry'
import { newsItemType      } from './newsItem'

export const schemaTypes = [
  siteSettingsType,
  postType,
  projectType,
  researchEntryType,
  newsItemType,
]
```

- [ ] **Step 7: Create `sanity/lib/client.ts`**

```ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn:     true,
})
```

- [ ] **Step 8: Create `sanity/lib/image.ts`**

```ts
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
```

- [ ] **Step 9: Create `sanity.config.ts`**

Configures Studio with a custom structure that pins `siteSettings` as a singleton at the top.

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { codeInput } from '@sanity/code-input'
import { schemaTypes } from './sanity/schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

export default defineConfig({
  name:    'inseon-personal-website',
  title:   'Inseon · Personal Website',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('About / Site Settings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),
            S.documentTypeListItem('post').title('Blog Posts'),
            S.documentTypeListItem('project').title('Projects'),
            S.documentTypeListItem('researchEntry').title('Research'),
            S.documentTypeListItem('newsItem').title('News'),
          ]),
    }),
    codeInput(),
  ],
  schema: { types: schemaTypes },
})
```

- [ ] **Step 10: Create `app/studio/[[...tool]]/page.tsx`**

```tsx
'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

- [ ] **Step 11: Create `.env.local.example`**

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

- [ ] **Step 12: Verify Studio loads and seed initial content**

```bash
npm run dev
```

Open `http://localhost:3000/studio`. Expected: Studio loads with sidebar showing "About / Site Settings", "Blog Posts", "Projects", "Research", "News".

Seed the following content:

**About / Site Settings:**
- Name: `Inseon Hwang`
- Tagline: `CS Researcher · Fullstack Engineer`
- Bio: write 2–3 sentences in the rich text editor
- Links: add GitHub, LinkedIn, Email, CV entries
- Publish

**One Blog Post, one Project, one Research entry, one News item** — publish each so data is available for verifying page renders in subsequent tasks.

- [ ] **Step 13: Commit**

```bash
git add sanity/ sanity.config.ts app/studio/ .env.local.example package.json package-lock.json
git commit -m "feat: Sanity CMS — all schemas (siteSettings, post, project, researchEntry, newsItem)"
```

---

## Task 6: GROQ Queries for All Content

**Files:**
- Create: `sanity/lib/queries.ts`

- [ ] **Step 1: Create `sanity/lib/queries.ts`**

```ts
import { client } from './client'
import type { SiteSettings, Post, Project, ResearchEntry, NewsItem } from '@/lib/types'
import type { PortableTextBlock } from '@portabletext/types'

// ─── Site Settings ───────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(
    `*[_type == "siteSettings" && _id == "siteSettings"][0] {
      name,
      tagline,
      bio,
      links,
      profileImage
    }`
  )
}

// ─── Blog Posts ──────────────────────────────────────────────────────────────

const postFields = `
  _id,
  title,
  "slug": slug.current,
  date,
  summary,
  tags
`

export async function getAllPosts(): Promise<Post[]> {
  return client.fetch(
    `*[_type == "post"] | order(date desc) { ${postFields} }`
  )
}

export async function getPostSlugs(): Promise<string[]> {
  const results = await client.fetch<{ slug: string }[]>(
    `*[_type == "post"] { "slug": slug.current }`
  )
  return results.map((r) => r.slug)
}

export async function getPostBySlug(
  slug: string
): Promise<(Post & { body: PortableTextBlock[] }) | null> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      ${postFields},
      body
    }`,
    { slug }
  )
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  return client.fetch(
    `*[_type == "project"] | order(order asc, date desc) {
      _id,
      title,
      summary,
      tags,
      date,
      url,
      repo,
      highlight,
      order
    }`
  )
}

// ─── Research ────────────────────────────────────────────────────────────────

export async function getAllResearch(): Promise<ResearchEntry[]> {
  return client.fetch(
    `*[_type == "researchEntry"] | order(date desc) {
      _id,
      title,
      authors,
      venue,
      venueType,
      date,
      url,
      pdf,
      poster
    }`
  )
}

// ─── News ────────────────────────────────────────────────────────────────────

export async function getAllNews(): Promise<NewsItem[]> {
  return client.fetch(
    `*[_type == "newsItem"] | order(date desc) {
      _id,
      date,
      text,
      url
    }`
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add sanity/lib/queries.ts sanity/lib/image.ts
git commit -m "feat: GROQ queries for all five content types"
```

---

## Task 7: About Page (Sanity-Powered)

**Files:**
- Modify: `app/(site)/page.tsx`

- [ ] **Step 1: Write `app/(site)/page.tsx`**

```tsx
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import TerminalCursor from '@/components/TerminalCursor'
import { getSiteSettings } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

export const revalidate = 3600

export default async function AboutPage() {
  const s = await getSiteSettings()

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
```

- [ ] **Step 2: Verify About page**

Open `http://localhost:3000`. Expected: Name from Sanity with blinking cursor, tagline, status list, bio, link buttons. If you uploaded a profile image, it appears as a circle top-right.

- [ ] **Step 3: Commit**

```bash
git add "app/(site)/page.tsx"
git commit -m "feat: about page — all content from Sanity siteSettings"
```

---

## Task 8: Blog List Page

**Files:**
- Create: `app/(site)/blog/page.tsx`

- [ ] **Step 1: Create `app/(site)/blog/page.tsx`**

```tsx
import Link from 'next/link'
import { getAllPosts } from '@/sanity/lib/queries'

export const revalidate = 3600

export default async function BlogPage() {
  const posts = await getAllPosts()

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
                <article className="border border-border rounded-lg p-5 bg-surface hover:border-accent transition-colors">
                  <time className="font-mono text-xs text-text-muted">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </time>
                  <h2 className="font-serif text-xl text-text-primary mt-1 group-hover:text-accent transition-colors">
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
```

- [ ] **Step 2: Verify**

Open `http://localhost:3000/blog`. Expected: The test blog post seeded in Task 5 appears.

- [ ] **Step 3: Commit**

```bash
git add "app/(site)/blog/page.tsx"
git commit -m "feat: blog list page"
```

---

## Task 9: Blog Post Page

**Files:**
- Create: `app/(site)/blog/[slug]/page.tsx`

- [ ] **Step 1: Create `app/(site)/blog/[slug]/page.tsx`**

```tsx
import { PortableText } from '@portabletext/react'
import { getPostBySlug, getPostSlugs } from '@/sanity/lib/queries'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props { params: { slug: string } }

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}
  return { title: post.title, description: post.summary }
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)
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

      <div className="prose prose-invert prose-sm max-w-none
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
```

- [ ] **Step 2: Verify**

Open `http://localhost:3000/blog/<slug>`. Expected: Full post renders with prose styles.

- [ ] **Step 3: Commit**

```bash
git add "app/(site)/blog/[slug]/page.tsx"
git commit -m "feat: blog post page with Portable Text rendering"
```

---

## Task 10: Projects Page

**Files:**
- Create: `components/ProjectCard.tsx`, `components/TagFilter.tsx`, `components/ProjectsClient.tsx`, `app/(site)/projects/page.tsx`

The page is a server component (fetches from Sanity), passes data to `ProjectsClient` (client component that handles tag filter state).

- [ ] **Step 1: Create `components/ProjectCard.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `components/TagFilter.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `components/ProjectsClient.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `app/(site)/projects/page.tsx`**

```tsx
import { getAllProjects } from '@/sanity/lib/queries'
import ProjectsClient from '@/components/ProjectsClient'

export const revalidate = 3600

export default async function ProjectsPage() {
  const projects = await getAllProjects()

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
```

- [ ] **Step 5: Verify**

Open `http://localhost:3000/projects`. Expected: Project card from Sanity, tag filter pill, highlighted project has orange border.

- [ ] **Step 6: Commit**

```bash
git add components/ProjectCard.tsx components/TagFilter.tsx components/ProjectsClient.tsx "app/(site)/projects/page.tsx"
git commit -m "feat: projects page — fetches from Sanity, client-side tag filter"
```

---

## Task 11: Research Page

**Files:**
- Create: `components/ResearchEntry.tsx`, `app/(site)/research/page.tsx`

- [ ] **Step 1: Create `components/ResearchEntry.tsx`**

```tsx
import type { ResearchEntry } from '@/lib/types'

const VENUE_COLORS: Record<ResearchEntry['venueType'], string> = {
  conference: 'text-accent',
  workshop:   'text-accent-warm',
  preprint:   'text-text-muted',
}

export default function ResearchEntryRow({ entry }: { entry: ResearchEntry }) {
  return (
    <li className="border-b border-border pb-5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {entry.url ? (
            <a href={entry.url} target="_blank" rel="noopener noreferrer"
              className="font-serif text-lg text-text-primary hover:text-accent transition-colors">
              {entry.title}
            </a>
          ) : (
            <span className="font-serif text-lg text-text-primary">{entry.title}</span>
          )}
          <p className="font-mono text-xs text-text-muted mt-1">{entry.authors}</p>
        </div>
        <span className={['font-mono text-xs shrink-0 mt-1', VENUE_COLORS[entry.venueType]].join(' ')}>
          {entry.venue}
        </span>
      </div>
      {(entry.pdf || entry.poster) && (
        <div className="flex gap-4 mt-2">
          {entry.pdf && (
            <a href={entry.pdf} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-text-muted hover:text-accent">[PDF]</a>
          )}
          {entry.poster && (
            <a href={entry.poster} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-text-muted hover:text-accent">[Poster]</a>
          )}
        </div>
      )}
    </li>
  )
}
```

- [ ] **Step 2: Create `app/(site)/research/page.tsx`**

```tsx
import { getAllResearch } from '@/sanity/lib/queries'
import ResearchEntryRow from '@/components/ResearchEntry'

export const revalidate = 3600

export default async function ResearchPage() {
  const entries = await getAllResearch()
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
```

- [ ] **Step 3: Verify**

Open `http://localhost:3000/research`. Expected: Year section header, paper entry from Sanity with venue colored by type.

- [ ] **Step 4: Commit**

```bash
git add components/ResearchEntry.tsx "app/(site)/research/page.tsx"
git commit -m "feat: research page — fetches from Sanity"
```

---

## Task 12: News Page

**Files:**
- Create: `components/NewsItem.tsx`, `app/(site)/news/page.tsx`

- [ ] **Step 1: Create `components/NewsItem.tsx`**

```tsx
import type { NewsItem } from '@/lib/types'

export default function NewsItemRow({ item }: { item: NewsItem }) {
  return (
    <li className="flex gap-4 items-start">
      <time className="font-mono text-xs text-text-muted w-24 shrink-0 pt-0.5">
        {item.date}
      </time>
      <div className="flex items-start gap-3 flex-1">
        <span className="w-2 h-2 rounded-full bg-accent inline-block mt-1.5 shrink-0" />
        {item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="text-text-primary text-sm hover:text-accent transition-colors">
            {item.text}
          </a>
        ) : (
          <span className="text-text-primary text-sm">{item.text}</span>
        )}
      </div>
    </li>
  )
}
```

- [ ] **Step 2: Create `app/(site)/news/page.tsx`**

```tsx
import { getAllNews } from '@/sanity/lib/queries'
import NewsItemRow from '@/components/NewsItem'

export const revalidate = 3600

export default async function NewsPage() {
  const items = await getAllNews()

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
```

- [ ] **Step 3: Verify**

Open `http://localhost:3000/news`. Expected: News item from Sanity, date in mono left column, blue dot + text.

- [ ] **Step 4: Commit**

```bash
git add components/NewsItem.tsx "app/(site)/news/page.tsx"
git commit -m "feat: news page — fetches from Sanity"
```

---

## Task 13: Production Build Check

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. Routes:
```
Route (app)
┌ ○ /
├ ○ /blog
├ ● /blog/[slug]
├ ○ /projects
├ ○ /research
├ ○ /news
└ ○ /studio/[[...tool]]
```

- [ ] **Step 2: Test locally**

```bash
npm run start
```

Check all pages in browser. Verify no console errors.

- [ ] **Step 3: Mobile check**

DevTools → 375px. Hamburger appears, dropdown works.

- [ ] **Step 4: Commit any fixes**

```bash
git add . && git commit -m "fix: production build issues"
```

---

## Task 14: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/inseon-hwang/personal-website.git
git push -u origin main
```

- [ ] **Step 2: Link and preview deploy**

```bash
npx vercel --yes
```

- [ ] **Step 3: Add env vars**

```bash
npx vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID
npx vercel env add NEXT_PUBLIC_SANITY_DATASET
```

- [ ] **Step 4: Production deploy**

```bash
npx vercel --prod
```

Expected: Production URL. Verify all 5 pages and `/studio` load.

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|---|---|
| CSS design tokens | Task 1 |
| Fonts (DM Serif Display, Inter, JetBrains Mono) | Task 3 |
| Terminal cursor blink | Tasks 4 + 7 |
| Sticky nav, max-width 768px, route group | Task 3 |
| About — all content from Sanity `siteSettings` | Tasks 5 + 7 |
| Blog — Sanity posts, list + post pages | Tasks 5 + 8 + 9 |
| Projects — Sanity, tag filter | Tasks 5 + 10 |
| Research — Sanity, venue colors, year groups | Tasks 5 + 11 |
| News — Sanity, reverse-chronological | Tasks 5 + 12 |
| Mobile nav | Task 3 |
| Production build check | Task 13 |
| Vercel deploy | Task 14 |

**All content updatable from Sanity Studio — zero code edits needed for content changes.** ✓

### Type Consistency

- All types in `lib/types.ts` (Task 2) use `_id: string` as primary key, matching Sanity document shape. ✓
- `SiteSettings` has no `currentStatus` field — removed from schema, GROQ projection, and About page render. ✓
- `SiteSettings.links` is `Array<{ label: string; href: string }>` — matches schema object array and rendered in Task 7. ✓
- `Project.date?: string` (optional ISO date) — added to schema, GROQ projection, and shown in `ProjectCard` as "Mar 2024". ✓
- `ResearchEntry.date: string` replaces `year: number` — year derived via `new Date(e.date).getFullYear()` in the research page grouping. ✓
- `ResearchEntry.venueType` union `'conference' | 'workshop' | 'preprint'` matches schema radio list values exactly. ✓
- `getPostBySlug` returns `Post & { body: PortableTextBlock[] }` (Task 6); `post.body` passed to `<PortableText>` in Task 9. ✓
