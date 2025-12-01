---
name: sanity-scaffold
description: Interactively scaffold a new Sanity Schema Document or Object type using best-practice templates. Use when user wants to create new content types.
---

# Schema Scaffolder

This skill guides the user to create a new Sanity document type, ensuring it follows the "Data > Presentation" philosophy and strict typing rules.

## Procedure

1.  **Discovery**
    *   Run `ls -R src/schemaTypes` (or `schemas`) to understand the project structure.
    *   Read `src/schemaTypes/index.ts` (or equivalent) to see how schemas are registered.

2.  **Input Gathering**
    *   Ask: "What is the name of the content type (e.g., 'blogPost', 'author')?"
    *   Ask: "Is this a Document (standalone) or an Object (embedded)?"
    *   Ask: "What are the key fields needed?"

3.  **Drafting (Template Based)**
    *   **Action:** Read the template file: `templates/document.ts` (or `templates/object.ts` / `templates/singleton.ts`).
    *   **Action:** Create the new file content by replacing the `{{name}}` and `{{title}}` placeholders in the template with the user's input.
    *   **Constraint:** Ensure the `icon` import is preserved or updated to a relevant icon from `@sanity/icons`.
    *   **Singleton Note:** If using `singleton.ts`, remind user that singletons require Desk Structure configuration (see template comments). Offer to help set up the structure.

4.  **Execution**
    *   Write the generated file to the correct folder (e.g., `src/schemaTypes/documents/`).
    *   Read `src/schemaTypes/index.ts`.
    *   Add the import line for the new schema.
    *   Add the new type to the export array.

5.  **Verification**
    *   Run `npm run typegen` (if available) to verify syntax.
    *   Confirm success to the user.
