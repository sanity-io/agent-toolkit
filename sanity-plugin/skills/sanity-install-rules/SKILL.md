---
name: sanity-install-rules
description: Installs Sanity agent rules directly into the local project. Use when setting up a new editor environment.
---

# Install Agent Rules

This skill downloads the official Sanity agent rules and saves them to the user's local `.cursor/rules` directory.

## Procedure

1.  **Check Environment**
    * Check if `.cursor/rules/` exists. If not, create it.

2.  **Fetch & Write Rules**
    * Load `sanity://rules/sanity-schema.mdc` -> Write to `.cursor/rules/sanity-schema.mdc`
    * Load `sanity://rules/sanity-groq.mdc` -> Write to `.cursor/rules/sanity-groq.mdc`
    * Load `sanity://rules/sanity-typegen.mdc` -> Write to `.cursor/rules/sanity-typegen.mdc`
    * Load `sanity://rules/sanity-visual-editing.mdc` -> Write to `.cursor/rules/sanity-visual-editing.mdc`
    * Load `sanity://rules/sanity-migration.mdc` -> Write to `.cursor/rules/sanity-migration.mdc`
    * Load `sanity://rules/sanity-page-builder.mdc` -> Write to `.cursor/rules/sanity-page-builder.mdc`
    * Load `sanity://rules/sanity-image.mdc` -> Write to `.cursor/rules/sanity-image.mdc`
    * Load `sanity://rules/sanity-portable-text.mdc` -> Write to `.cursor/rules/sanity-portable-text.mdc`
    * Load `sanity://rules/sanity-studio-structure.mdc` -> Write to `.cursor/rules/sanity-studio-structure.mdc`
    * Load `sanity://rules/sanity-get-started.mdc` -> Write to `.cursor/rules/sanity-get-started.mdc`
    * Load `sanity://rules/sanity-project-structure.mdc` -> Write to `.cursor/rules/sanity-project-structure.mdc`
    * Load `sanity://rules/sanity-localization.mdc` -> Write to `.cursor/rules/sanity-localization.mdc`
    * Load `sanity://rules/sanity-seo.mdc` -> Write to `.cursor/rules/sanity-seo.mdc`
    * Load `sanity://rules/sanity-hydrogen.mdc` -> Write to `.cursor/rules/sanity-hydrogen.mdc`

    **Framework Specifics (Conditional):**
    * Ask user or detect framework.
    * If Next.js: Load `sanity://rules/sanity-nextjs.mdc`
    * If Remix: Load `sanity://rules/sanity-remix.mdc`
    * If Svelte: Load `sanity://rules/sanity-svelte.mdc`
    * If Nuxt: Load `sanity://rules/sanity-nuxt.mdc`
    * If Astro: Load `sanity://rules/sanity-astro.mdc`

3.  **Update Configuration**
    * Check for `.cursorrules` or `agents.md`.
    * Append a reference to the new rules if needed.

4.  **Confirmation**
    * Tell the user: "Agent rules have been installed locally. Your AI editor now knows Sanity best practices."
