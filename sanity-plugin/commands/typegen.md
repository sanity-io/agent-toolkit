---
description: Run Sanity TypeGen and troubleshoot type generation issues.
---

# Sanity TypeGen Workflow

I'll help you generate TypeScript types from your Sanity schema.

## Quick Start

```bash
npm run typegen
# or
npx sanity schema extract && npx sanity typegen generate
```

## What I'll Do

1. **Check Configuration**
   - Verify `sanity-typegen.json` exists and has correct paths
   - Ensure `typegen` script is in `package.json`

2. **Run TypeGen**
   - Execute the typegen command
   - Report any errors

3. **Troubleshoot Issues**
   - Fix incorrect path globs
   - Resolve schema syntax errors
   - Update query imports

## Common Issues I Fix

| Issue | Solution |
|-------|----------|
| "No schema found" | Fix `path` glob in `sanity-typegen.json` |
| "Query not typed" | Wrap in `defineQuery()` |
| Types outdated | Re-run after schema/query changes |
| Import errors | Check `sanity.types.ts` output path |

## Configuration Template

```json
{
  "path": "./src/**/*.{ts,tsx}",
  "schema": "./schema.json",
  "generates": "./src/sanity/sanity.types.ts"
}
```

## Usage

> "Run typegen"
> "Fix my TypeGen configuration"
> "Why are my types not updating?"

