---
name: sanity-groq
description: Expert assistance for writing, optimizing, and debugging GROQ queries. Use when writing queries or debugging performance.
---

# GROQ Query Assistant

This skill helps users write GROQ queries that are efficient, correct, and compatible with Sanity TypeGen.

## Procedure

1.  **Analyze Request**
    *   Is the user asking for a new query?
    *   Is the user debugging an existing query?
    *   Is the user asking about performance?

2.  **Drafting Queries**
    *   **Rule:** Always wrap in `defineQuery` (or `groq` tag).
    *   **Rule:** Always use the `/* groq */` comment for syntax highlighting.
    *   **Rule:** Always use Projections `{ ... }`. Never return `*` (naked projection).
    *   **Example:**
        ```typescript
        const QUERY = defineQuery(/* groq */ `*[_type == "post" && slug.current == $slug][0]{ title, body }`);
        ```

3.  **Optimization Checks**
    *   **Scan:** Look for `*[_type == "..."]` without `{}`. -> **Warn:** "Fetch only what you need."
    *   **Scan:** Look for string interpolation (`slug == "${slug}"`). -> **Warn:** "Use parameters (`$slug`)."
    *   **Scan:** Look for deep expansion (`...`). -> **Warn:** "Be explicit to reduce payload size."

4.  **TypeGen Integration**
    *   After writing the query, remind the user to run `npm run typegen` (or equivalent).
    *   Show how to import the generated type: `import { type QUERYResult } from './sanity.types'`.
