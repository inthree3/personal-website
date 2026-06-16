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
            defineField({ name: 'href', type: 'url', title: 'URL',
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
