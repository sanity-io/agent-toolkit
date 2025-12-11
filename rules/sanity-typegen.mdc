---
description: Workflow for generating TypeScript types from Sanity Schema and GROQ queries.
globs: package.json, sanity.types.ts, tsconfig.json, sanity-typegen.json
alwaysApply: false
---

# Sanity TypeGen Rules

## 1. The Workflow
Sanity TypeGen works in a strict cycle. You must run this cycle whenever Schema or Queries change.

1.  **Extract:** Converts your Schema (TS/JS) into a static JSON representation.
2.  **Generate:** Scans your codebase for `defineQuery` calls and generates TypeScript interfaces based on the Extracted Schema.

## 2. The "Update Types" Pattern
Most projects should implement a single script to handle the full update cycle.

**package.json:**
```json
"scripts": {
  "typegen": "sanity schema extract --path=./schema.json && sanity typegen generate",
  "update-types": "npm run typegen" // Alias for clarity
}
```

**Workflow:**
1.  Modify Schema (`schemaTypes/...`).
2.  Modify Queries (`queries.ts`).
3.  Run `npm run update-types`.
4.  Restart TS Server if needed.

### Git Strategy for Generated Files

**Option A: Commit generated types (Recommended for most teams)**
- ✅ Types available immediately after `git pull`
- ✅ CI/CD doesn't need to run typegen
- ❌ Can cause merge conflicts

**Option B: Generate in CI (Recommended for larger teams)**
Add to `.gitignore`:
```gitignore
# Sanity TypeGen (generated)
sanity.types.ts
schema.json
```

Then ensure CI runs `npm run typegen` before build:
```yaml
# Example GitHub Actions
- run: npm run typegen
- run: npm run build
```

## 3. Configuration (`sanity-typegen.json`)
Your configuration depends on your project structure.

### Option A: Single Repo (Recommended for Next.js)
Everything lives in the same root.
```json
{
  "path": "./src/**/*.{ts,tsx,js,jsx}",
  "schema": "./schema.json",
  "generates": "./src/sanity/types.ts"
}
````

### Option B: Monorepo
Studio is in `/studio`, Frontend is in `/app`.
**Config location:** `app/sanity-typegen.json`

```json
{
  "path": "./src/**/*.{ts,tsx,js,jsx}",
  "schema": "../studio/schema.json", 
  "generates": "./src/sanity/types.ts"
}
```

## 4. Usage in Code
**Never** manually type query results. Always infer them from the query definition.

```typescript
import { defineQuery } from "next-sanity";

// The query name determines the type name
const AUTHOR_QUERY = defineQuery(/* groq */ `*[_type == "author"]{ name, bio }`);

// In your component
import { type AUTHOR_QUERYResult } from "@/sanity/types";

export default function Author({ data }: { data: AUTHOR_QUERYResult }) {
  return <h1>{data.name}</h1>
}
```
