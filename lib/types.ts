import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImageSource } from '@sanity/image-url'

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
