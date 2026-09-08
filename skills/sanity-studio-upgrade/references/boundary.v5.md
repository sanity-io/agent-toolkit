# Boundary: into Studio v5

Covers the v4 to v5 crossing and everything inside the v5 line. Read this file only if the span crosses or lands in v5.

Within-line coverage for this file: **5.0.0 through 5.31.2**, verified 2026-09-04.

---

## 1. v4 to v5

Published 2025-12-15. Three declared breaking changes plus one default flip.

### Requirements

| Change | Applicability condition |
| --- | --- |
| **React 19.2.2 or newer required**, for both `react` and `react-dom`. | Read resolved React version from the lockfile. If already 19.2.2+, this is satisfied and should be stated as satisfied rather than listed as work. |

If the project is on React 18, recommend running `sanity dev` on React 18.3 first to clear deprecation warnings, and enabling `reactStrictMode: true` in `sanity.cli.ts` to surface effect-cleanup and concurrent-rendering issues before the React bump rather than after.

### Declared breaking changes

| Change | Applicability condition |
| --- | --- |
| **TypeGen re-cases `snake_case` query names.** `PAGE_QUERY` now yields `PAGE_QUERY_RESULT` rather than `PAGE_QUERYResult`; `page_query` yields `page_query_result`. camelCase and PascalCase are unaffected. | Only if TypeGen is in use. Check for `sanity.types.ts`, a `typegen` block, or `sanity typegen` in scripts. Then grep for `snake_case` query variable names. Note that consumers are often in a different repository. |
| **TypeGen hoists shared types.** Repeated object shapes and document references become standalone named types instead of being inlined at each use site. This changes the shape of `schema.json`, not only the generated TypeScript. | Applies to anything consuming `schema.json` programmatically, including homegrown generators that emit types for other languages. Those will not appear in any dependency list, so ask rather than only grepping. |
| **`TypeGenerator.generateTypes()` in `@sanity/codegen` simplified.** Returns generated code directly; progress via an optional `reporter` callback. | Only if the project has tooling that wraps `@sanity/codegen` programmatically. |

### Default flip

| Change | Applicability condition |
| --- | --- |
| **Smart typography in the Portable Text editor is on by default.** Straight quotes become curly quotes, double hyphens become dashes, three periods become an ellipsis, and these characters are written into stored content. **This reverses the 4.16.0 default**, where the same plugin shipped disabled, so a project coming from anywhere in the v4 line is getting a behavior change rather than a new feature. | Applies to any project with Portable Text fields, which is most. Raise it whenever content is consumed by something that cannot be patched quickly, matches strings exactly, or renders with a font that may lack those glyphs. Disable globally or per field in the Portable Text editor configuration. |

---

## 2. Within the v5 line

Shipped in minor and patch releases. Most are not labelled breaking.

### Requires a code or script change

| Version | Change | Applicability condition |
| --- | --- | --- |
| 5.3.0 | `unstable_use*` hooks deprecated in favour of `useUnstable*`. | `grep -rn "unstable_use" src/` |
| 5.12.0 | **`beta.form.enhancedObjectDialog` config option removed.** The dialog is now unconditional. | Grep the config for `enhancedObjectDialog`. |
| 5.14.0 | `SANITY_STUDIO_AGENT_API_HOST` environment override removed. | Grep for the variable name across source and CI. |
| 5.15.0 | **CLI errors on unknown flags** instead of ignoring them. A typo such as `--datset` now fails the command. | Audit every `sanity` invocation in `package.json` scripts and CI config. |
| 5.18.0 | **`sanity start` deprecated in favour of `sanity preview`.** `start` was an alias of `preview`, so `preview` is the one-to-one replacement. **`sanity dev` is not equivalent**: `dev` runs a development server, `preview` serves an already-built production bundle. Recommending `dev` silently changes what the script does. Several commands also gained plural forms, with the singular kept as aliases. | Grep scripts and CI for `sanity start`. If a `start` script exists alongside a `dev` script, the likely intent was `preview`; confirm rather than assume. |
| 5.18.0 | **`sanity schema extract` always appends `schema.json`** to the path argument. | Applies if any invocation passes a full filename rather than a directory. |
| 5.18.0 | **Structure `sheetList` removed.** The bundled Sanity Create plugin was also removed from core. | `grep -rn "sheetList" src/` |
| 5.18.0 | `useTimeLineStore` deprecated; use the events store to retrieve deleted documents. | Grep for the hook name. |
| 5.19.0 | `menuButton`'s `placement` prop deprecated in favour of `popover.placement`. | Grep for `menuButton`. |
| 5.21.0 | `extractSchema` in `@sanity/schema` returns a proper object type for fieldless object types instead of `unknown`. | Only if the project consumes the extract API. |
| 5.2.0 | The `ServerStyleSheet` re-export from `styled-components` was removed from `sanity`. | Grep for `ServerStyleSheet` imported from `sanity`. |
| 5.8.1 | **`auth.loginMethod` strictly enforced.** `'token'` no longer falls back to cookie auth when another Studio on the same domain left session cookies; `'cookie'` now ignores localStorage tokens. | Applies if `auth.loginMethod` is set, if several Studios share a domain, or if a Studio is embedded in a Dashboard. |

### Behavior changes editors will notice

No code change required, but they belong in the plan so whoever supports editors is not surprised.

| Version | Change |
| --- | --- |
| 5.8.0 | Pasting a URL into a Portable Text field now automatically creates a link annotation. Raise this wherever the rendering surface may not handle the `link` mark. |
| 5.14.0 | A preview's `media` falls back to the schema type icon when `media` is omitted from `prepare()`. Return `media: null` or `media: false` to suppress. |
| 5.14.0 | Duplicating an array item regenerates `_key` for all nested items, not only the top level. Relevant to anything caching or diffing on `_key`. |
| 5.26.0 | `options.disableNew` is now actually enforced on fields where uploads were meant to be disabled. |
| 5.26.0 | The Studio routes to the first workspace a user can see, rather than the configured default when that default is hidden from them. |
| 5.29.0 | Array `initialValue` precedence changed: a parent field's `initialValue` now takes precedence over a child's inside `defineArrayMember`, with the child still filling omitted keys. |
| 5.31.1 | Documented caveat that becomes live once v6 flips the search default: under `groq2024`, preview fields resolved through a reference do not contribute to search matching or ranking. See section 1 of `boundary.v6.md`. |

### Notes

**5.31.2 is the final v5 release**, published under the `maintenance-v5` dist-tag. It is the right intermediate stop before v6. Note that it is a patch above the last minor, so a sequence that stops at 5.31.1 or at "the last 5.31 minor" is stopping one release early. Confirm the terminal release of a line from the registry rather than assuming the highest minor is it.

TypeGen reached general availability in 5.10.0, and automatic generation plus `--watch` arrived in 5.8.0. If a project is not yet using TypeGen, crossing v5 means it lands on the GA version with nothing to migrate, which is worth mentioning as an opportunity rather than a task.
