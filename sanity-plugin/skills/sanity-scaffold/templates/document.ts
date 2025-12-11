import { defineType, defineField } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const {{name}} = defineType({
  name: '{{name}}',
  title: '{{title}}',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
