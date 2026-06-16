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
