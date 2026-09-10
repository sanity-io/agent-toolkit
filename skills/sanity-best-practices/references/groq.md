---
title: GROQ Query Maintenance & Best Practices
description: Guidelines for GROQ queries, type safety, performance optimization, and syntax highlighting.
---

# GROQ Query Maintenance & Best Practices

## Constructing queries before execution

Start with the smallest query that returns the requested result. Use known document IDs, types, and fields, and use query parameters for filter values:

```groq
*[_id == $id][0]{_id, title, "launchCode": metadata.launchCode}
```

Before executing queries with reference lookups in filters, mixed `OR` conditions, computed sorts, or deep pagination, review [Performance Rules](#6-performance-rules). A small returned result does not establish that the query is cheap to execute.

### Projection keys and attribute traversal

Plain fields can use `{_id, title}`. Give nested fields and computed expressions an explicit **quoted** output key:

```groq
*[_type == "article"][0...10]{
  _id,
  "displayName": title,
  "slug": slug.current,
  "launchCode": metadata["launchCode"]
}
```

`{displayName: title}` is invalid: quote the alias. `{slug.current}` and `{metadata["launchCode"]}` also need explicit keys. After a dot, use an attribute name, such as `.title`; do not write `.(title)`.

### Use functions that GROQ actually provides

Do not assume JavaScript or SQL functions exist in GROQ. Check the [GROQ functions reference](https://www.sanity.io/docs/specifications/groq-functions) for unfamiliar operations.

- To join an array into a string, use `array::join(tags, ", ")`. There is no built-in `string::join()`.
- There is no built-in `keys()`, `object::keys()`, or `array::keys()`. To report the properties present in an object, retrieve that object and inspect the returned JSON outside GROQ. Do not retry by guessing another namespace. To learn declared fields instead, read the schema.
- For a conditional value, use `select(featured => title, "Other")`. A standalone `featured => title` is not a value expression. Conditional projection branches use objects, such as `featured => {title}`.
- To count matching documents, use `count(*[_type == "article"])`.

To inspect the fields present on a document, fetch it by ID:

```groq
*[_id == $id][0]
```

Read the property names from the returned object outside GROQ. This does not require a key-enumeration function in the query.

### Check the complete expression

Before submission, check that filters and slices close with `]`, projections with `}`, and function calls with `)`. For example:

```groq
*[_type == "article" && featured == true][0...10]{title}
```

```groq
count(*[_type == "article" && featured == true])
```

After a syntax rejection, use the reported position and error to inspect the relevant expression, correct it, and retry. Do not resend the unchanged query or change a function namespace without checking that the replacement exists.

Use this contents list to jump to the query concern you need to solve.

## Table of Contents

- Constructing queries before execution
- Query definition and imports
- Query fragments
- Expansion patterns
- Maintenance workflow
- Common patterns
- Performance rules
- API version best practices

## 1. Query Definition & Imports

### The `defineQuery` Function
**In application code**, wrap GROQ queries in `defineQuery` for TypeGen support. The import location depends on your framework:

```typescript
// Framework-agnostic (Angular, Remix, SvelteKit, Astro, vanilla)
import { defineQuery } from "groq";

// Next.js (re-exported for convenience)
import { defineQuery } from "next-sanity";
```

### Syntax Highlighting
For VS Code syntax highlighting, either:
1. Use the `groq` tagged template (recommended): `groq\`...\``
2. Or prefix with `/* groq */` comment when using `defineQuery`

```typescript
import { defineQuery } from "groq";

// ✅ Option A: groq tag (provides highlighting automatically)
import groq from "groq";
const QUERY = defineQuery(groq`*[_type == "post"]`);

// ✅ Option B: Comment prefix (for plain template literals)
const QUERY = defineQuery(/* groq */ `*[_type == "post"]`);

// ✅ Also valid: Just defineQuery (TypeGen works, but no editor highlighting)
const QUERY = defineQuery(`*[_type == "post"]`);
```

## 2. Query Fragments
Use string interpolation to reuse query logic and keep queries maintainable.

```typescript
// src/sanity/fragments/image.ts
export const imageFragment = /* groq */ `
  asset->{
    _id,
    url,
    metadata { lqip, dimensions }
  },
  alt
`;

// src/sanity/queries/post.ts
import { defineQuery } from "groq";
import { imageFragment } from "../fragments/image";

export const POST_QUERY = defineQuery(/* groq */ `
  *[_type == "post"][0] {
    title,
    mainImage {
      ${imageFragment}
    }
  }
`);
```

## 3. Expansion Patterns (Page Builder)
When building a Page Builder query, expand all potential component types.

**Best Practice:** Use a `pageFields` fragment or similar strategy to keep the main query clean.

```typescript
const pageBuilderExpansion = /* groq */ `
  pageBuilder[] {
    ...,
    _type == "hero" => {
      ...,
      cta[] { link, label }
    },
    _type == "gallery" => {
      images[] { ${imageFragment} }
    }
  }
`;
```

## 4. Maintenance Workflow
When you add a new field or component to the Schema:
1.  **Update the Query:** Add the new field/expansion to the relevant GROQ query immediately.
2.  **Run TypeGen:** If you have `typegen.enabled: true` in `sanity.cli.ts`, types regenerate automatically during `sanity dev`/`sanity build`. Otherwise, run `npm run typegen` manually.
3.  **Verify:** Ensure the new field is available in the generated types.

## 5. Common Patterns

### Ordering
```groq
// Single field
*[_type == "post"] | order(publishedAt desc)

// Multiple fields (tiebreaker)
*[_type == "post"] | order(featured desc, publishedAt desc)

// ⚠️ Order BEFORE slice, not after!
*[_type == "post"] | order(publishedAt desc)[0...10]  // ✅ Correct
*[_type == "post"][0...10] | order(publishedAt desc)  // ❌ Wrong order
```

### Slice Notation
```groq
*[_type == "post"][0]       // Single document (object, not array)
*[_type == "post"][0...5]   // First 5 (exclusive) ← Most common
```

Slice bounds must be constant numbers — `$params` aren't allowed. For dynamic pagination, validate the numbers in application code and interpolate them directly into the query string:

```typescript
const start = Number.isInteger(page) && page >= 0 ? page * pageSize : 0
const end = start + pageSize

const query = `*[_type == "post"] | order(publishedAt desc)[${start}...${end}]`
```

### Default Values with `coalesce()`
```groq
*[_type == "page"]{
  "title": coalesce(seoTitle, title, "Untitled"),
  "image": coalesce(ogImage, mainImage, defaultImage)
}
```

### Conditionals with `select()`
```groq
*[_type == "product"]{
  title,
  "badge": select(
    stock == 0 => "Out of Stock",
    stock < 5 => "Low Stock",
    "In Stock"
  )
}
```

### Aggregation with `count()`
```groq
// Total count
count(*[_type == "post" && defined(slug.current)])

// Count per document
*[_type == "category"]{
  title,
  "postCount": count(*[_type == "post" && references(^._id)])
}
```

### Reverse References
```groq
*[_type == "author"]{
  name,
  "posts": *[_type == "post" && references(^._id)]{ title, slug }
}
```

### Array Filtering
```groq
*[_type == "movie"]{
  title,
  "mainCast": castMembers[role == "lead"]->{name}
}

// Match a known category ID (see Avoid Joins in Filters for dynamic lookups)
*[_type == "post" && $categoryId in categories[]._ref]
```

### Special Variables
```groq
// ^ = parent document (in nested queries)
*[_type == "author"]{
  name,
  "posts": *[_type == "post" && author._ref == ^._id]
}

// @ = current item (in array operations)
*[_type == "post"]{
  "tagCount": count(tags[@ != null])
}
```

## 6. Performance Rules

### Optimizable vs Non-Optimizable Filters
GROQ uses indexes for **optimizable** filters. Other expressions require evaluating candidate documents. An indexed `_type` constraint can narrow those candidates; without an indexed restriction, the query may scan the dataset.

| Pattern | Optimizable | Example |
|---------|-------------|---------|
| `_type == "x"` | ✅ Yes | `*[_type == "post"]` |
| `_id == "x"` | ✅ Yes | `*[_id == "abc123"]` |
| `slug.current == $slug` | ✅ Yes | `*[slug.current == "hello"]` |
| `defined(field)` | ✅ Yes | `*[defined(publishedAt)]` |
| `references($id)` | ✅ Yes | `*[references("author-123")]` |
| `field->attr == x` | ❌ No | Resolves references while evaluating candidates |
| `fieldA < fieldB` | ❌ No | Compares two attributes |

**Reduce the candidates for non-optimizable filters:**
```groq
// Add selective indexed constraints; textual order does not force execution order
*[_type == "product" && defined(salePrice) && salePrice < displayPrice]
```

### Avoid Joins in Filters
Reference resolution (`->`) in filters is expensive. Use `_ref` instead:

```groq
// ❌ Slow: Resolves reference for every document
*[_type == "post" && author->name == "Bob Woodward"]

// ✅ Fast: Direct _ref comparison
*[_type == "post" && author._ref == "author-bob-woodward-id"]
```

**When you need dynamic lookups** (don't know the IDs upfront), fetch all matching IDs and pass them as a parameter:

```groq
// Two-step approach:
// 1. Get every matching author ID
*[_type == "author" && name == $name]._id

// 2. Pass every returned ID as $authorIds in the main query
*[_type == "post" && author._ref in $authorIds]
```

Using `[0]` in the lookup would silently drop other authors with the same name. Discover the actual reference target types from the schema. Keep the same dataset, API version, and perspective in both requests. If the ID set needs pagination, collect all pages rather than silently truncating it; two requests can observe intervening content changes. A nested lookup is another option, but verify its timings rather than assuming it is faster.

### Mixed OR Filters Can Still Require Joins

```groq
// Resolves brands while testing product candidates
*[_type == "product" && (
  name match $search || brand->name match $search
)]{_id, name, "brand": brand->name} | order(name asc)
```

The indexed `name match` branch does not make the whole `OR` optimizable: a product can qualify solely through its brand. Resolve matching brand IDs first, using the schema's target type (here `brand`):

```groq
*[_type == "brand" && name match $search]._id
```

Pass that complete result as `$brandIds`, keeping `$search` unchanged (for example, `"Acme*"`):

```groq
*[_type == "product" && (
  name match $search || brand._ref in $brandIds
)] | order(name asc) {
  _id,
  name,
  "brand": brand->name
}
```

An empty `$brandIds` array still permits direct product-name matches. Keep `match` semantics, both `OR` branches, ordering, and returned fields intact. Dereferencing in the projection is appropriate when the caller needs the related value; the expensive pattern here is dereferencing to decide which documents qualify.

### Small Results Do Not Prove Cheap Execution

A final slice limits returned results, but may still leave substantial filtering or sorting work. `count()` can also be expensive when its filter requires joins or other per-document evaluation. Add pagination when the task permits it; do not add a limit that changes a request for all results.

Before claiming an improvement, compare results and timings on representative data with the same parameters, API version, and perspective. For a two-step rewrite, include both requests in the timing. Check multiple matching reference targets, no matching targets, and missing references. Local GROQ evaluation can check semantics, but cannot establish Content Lake performance.

### Merge Repeated Reference Resolutions
Each `->` is a subquery. Don't repeat it:

```groq
// ❌ Slow: Two separate subqueries
*[_type == "category"]{
  "parentTitle": parent->title,
  "parentSlug": parent->slug.current
}

// ✅ Fast: Single subquery, merged
*[_type == "category"]{
  ...(parent->{ "parentTitle": title, "parentSlug": slug.current })
}
```

### Cursor-Based Pagination (Not Deep Slicing)
Deep slices are slow because all skipped docs must be sorted first.

```groq
// ❌ Slow: Must sort and skip 10,000 docs
*[_type == "article"] | order(_id)[10000...10020]

// ✅ Fast: Cursor-based, only fetches 20
*[_type == "article" && _id > $lastId] | order(_id)[0...20]
```

**For custom sort orders**, include the sort field in the cursor:

```groq
// Compound cursor: publishedAt + _id for deterministic pagination
*[_type == "article" && (
  publishedAt < $lastDate || 
  (publishedAt == $lastDate && _id > $lastId)
)] | order(publishedAt desc, _id)[0...20]
```

### Always Project Fields
Always use projections to return only the fields your application needs. Fetching entire documents wastes bandwidth and processing time.

```groq
// ❌ Returns ALL fields including unused ones, metadata, revisions
*[_type == "post"]

// ✅ Only fetch what the component needs
*[_type == "post"]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt
}
```

Apply projections at every level, including nested references:

```groq
*[_type == "post"]{
  title,
  author->{ name, "avatar": image.asset->url },
  categories[]->{ title, "slug": slug.current }
}
```

Use conditional projections for different contexts:

```groq
*[_type == "post"]{
  title,
  slug,
  // Only include body for single post view
  $includeBody == true => { body }
}
```

### Don't Filter/Sort on Projected Values
Computed attributes can't use indexes:

```groq
// ❌ Not optimizable (computed attribute)
*[_type == "person"]{
  "fullName": firstName + " " + lastName
} | order(fullName)

// ✅ Optimizable (original attribute)
*[_type == "person"] | order(firstName, lastName)
```

### Quick Checklist
| Rule | Why |
|------|-----|
| Always project `{ fields }` | Reduces data returned |
| Use `defined()` checks | Filters use indexes |
| Use `$params` not interpolation | Prevents query manipulation + enables caching (exception: slice bounds — see Slice Notation) |
| Order BEFORE slice | `order()[0...N]` not `[0...N] order()` |
| Use `_ref` not `->field` in filters | Avoids expensive joins |
| Merge repeated `->` calls | Single subquery vs many |
| Cursor pagination for deep pages | Avoids sorting entire dataset |

## 7. API Version Best Practices

Always use dated versions (`YYYY-MM-DD`) for consistent behavior:

```typescript
const client = createClient({
  apiVersion: '2026-02-01', // Use current date for new projects
})
```

- **New projects:** Use current date (e.g., `2026-02-01`)
- **Existing projects:** Keep current version unless you need new features
- Dated versions lock behavior; `v1` or `vX` may change unexpectedly
