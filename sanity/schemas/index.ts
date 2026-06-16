import type { SchemaTypeDefinition } from 'sanity'
import { siteSettingsType  } from './siteSettings'
import { postType          } from './post'
import { projectType       } from './project'
import { researchEntryType } from './researchEntry'
import { newsItemType      } from './newsItem'

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettingsType,
  postType,
  projectType,
  researchEntryType,
  newsItemType,
]
