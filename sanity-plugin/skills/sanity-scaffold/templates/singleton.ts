import { defineType, defineField } from 'sanity'
import { CogIcon } from '@sanity/icons'

/**
 * Singleton Document Type
 * 
 * This document type is intended to have only ONE instance in the dataset.
 * Singletons are enforced via Desk Structure, not schema options.
 * 
 * Add to your structure (src/structure/index.ts):
 * 
 * ```ts
 * S.listItem()
 *   .title('{{title}}')
 *   .icon(CogIcon)
 *   .child(
 *     S.document()
 *       .schemaType('{{name}}')
 *       .documentId('{{name}}') // Fixed ID ensures only one instance
 *   )
 * ```
 * 
 * Then filter it from generic lists:
 * ```ts
 * ...S.documentTypeListItems().filter(
 *   (item) => !['{{name}}'].includes(item.getId() as string)
 * )
 * ```
 */
export const {{name}} = defineType({
  name: '{{name}}',
  title: '{{title}}',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Internal Title',
      description: 'For internal reference only',
      initialValue: '{{title}}',
      hidden: true, // Hide since it's auto-set
    }),
    // Add your singleton fields below
    // Example:
    // defineField({
    //   name: 'siteTitle',
    //   type: 'string',
    //   title: 'Site Title',
    //   validation: (rule) => rule.required(),
    // }),
  ],
  preview: {
    prepare() {
      return { title: '{{title}}' }
    },
  },
})

