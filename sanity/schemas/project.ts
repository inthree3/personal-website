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
      name: 'date',
      title: 'Date',
      description: 'Project completion or launch date.',
      type: 'date',
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
      return { title, subtitle: (date as string | undefined) ?? 'No date' }
    },
  },
})
