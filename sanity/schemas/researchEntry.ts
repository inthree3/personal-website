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
      description: 'Exact date of publication or submission. Year is derived from this for page grouping.',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'url',    title: 'Paper URL', type: 'url' }),
    defineField({ name: 'pdf',    title: 'PDF URL',   type: 'url' }),
    defineField({ name: 'poster', title: 'Poster URL', type: 'url' }),
  ],
  orderings: [
    { title: 'Date (newest first)', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', venue: 'venue', date: 'date' },
    prepare({ title, venue, date }) {
      const year = date ? new Date(date as string).getFullYear() : ''
      return { title, subtitle: `${venue} · ${year}` }
    },
  },
})
