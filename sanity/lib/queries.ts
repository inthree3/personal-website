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
