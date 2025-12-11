---
name: sanity-typegen
description: Troubleshoot and setup Sanity TypeGen configuration. Use when types are missing or incorrect.
---

# TypeGen Setup & Fixer

This skill ensures TypeScript types are generating correctly for the Content Lake.

## Procedure

1.  **Check Configuration**
    * Check if `sanity-typegen.json` exists.
    * If missing, ask: "Do you want me to set up Sanity TypeGen?"
    * If yes, create the file based on `sanity://rules/sanity-typegen.mdc`.

2.  **Check Scripts**
    * Read `package.json`.
    * Ensure a `typegen` script exists: `"sanity schema extract && sanity typegen generate"`.
    * If missing, add it.

3.  **Run & Verify**
    * Run `npm run typegen`.
    * If it fails, read the error log and fix the `sanity-typegen.json` paths (often the `path` glob is incorrect for the project structure).
    * If successful, confirm that `sanity.types.ts` (or configured output) was updated.
