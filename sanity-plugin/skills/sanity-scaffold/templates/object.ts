import { defineType, defineField } from 'sanity'
import { LinkIcon } from '@sanity/icons'

export const {{name}} = defineType({
  name: '{{name}}',
  title: '{{title}}',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'url',
      type: 'url',
    }),
  ],
})

