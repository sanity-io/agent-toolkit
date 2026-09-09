# Boundary: into Studio v6

Covers the v5 to v6 crossing and everything inside the v6 line. Read this file only if the span crosses or lands in v6.

Within-line coverage for this file: **6.0.0 through 6.12.0**, verified 2026-09-04. Anything released after 6.12.0 must be fetched; `boundaries.md` has the rule.

---

## 1. v5 to v6

Published 2026-06-11. A focused release: schemas, plugin APIs, configuration shape, and content APIs are unchanged.

### Requirements

| Change | Applicability condition |
| --- | --- |
| **Node.js 22.12 or newer required.** `engines.node` narrows from the v4 and v5 range of `>=20.19 <22 \|\| >=22.12` to a flat `>=22.12`. Node 20 reached end of life in April 2026. | Check `engines.node`, `.nvmrc`, CI images, and the build host. Affects build and development environments only, not the Content Lake or the browser bundle. |

Note for anyone arriving from the v4 or v5 line: **this is a genuine new requirement for Node 20.19 through 21.x**, which the whole v4 and v5 span accepted. The one band that was already rejected before v6 is Node 22.0 through 22.11, per section 3. A team sitting there has been out of range since 4.5.0 without necessarily knowing it, and the fix is the same move to 22.12.

### The change most likely to break a configuration

**`auth.providers` now replaces the built-in providers rather than appending to them, and `mode: 'append'` is no longer supported.**

Applicability: does `sanity.config.*` contain an `auth` block with `providers`?

This is the highest-severity item in the boundary because it affects login, and custom providers usually mean SSO or SAML. If the project has no `auth` block, it is unaffected, and saying so explicitly is valuable: it removes the scariest item from the plan.

Migration is to the callback form:

```ts
// before
auth: {providers: [{name: 'saml', title: 'SSO', url: '...'}], mode: 'append'}

// after
auth: {providers: (prev) => [...prev, {name: 'saml', title: 'SSO', url: '...'}]}
```

If the intent is to offer only the custom provider, the new default is already correct and the array form needs no change. Either way, recommend verifying the login screen with a real non-administrator account before production.

### Other declared changes

| Change | Applicability condition |
| --- | --- |
| **`enableLegacySearch` config option removed.** Use `search: {strategy: 'groqLegacy'}` instead. | Grep the config for `enableLegacySearch`. |
| **React strict mode on by default in development.** Opt out with `reactStrictMode: false` in `sanity.cli.ts`. | Applies to every project. It surfaces existing effect-cleanup and concurrent-rendering issues rather than creating new ones, so recommend leaving it on and fixing what it reports. |
| **Default search strategy changed from `groqLegacy` to `groq2024`.** Better performance on large datasets, deeper nested-content and Portable Text coverage, and wildcard, phrase, and negation syntax. Results, ordering, and counts shift because the query logic differs. | Applies unless `search.strategy` is already set. See below. |

**The specific search regression to test for:** under `groq2024`, preview fields resolved through a reference, such as `subtitle: 'author.name'`, no longer contribute to search matching or ranking. They did under `groqLegacy`.

Detect candidates with:

```sh
grep -rEn "(title|subtitle|description):\s*'[A-Za-z0-9_]+\.[A-Za-z0-9_.]+'" src/
```

Matches are candidates, not confirmations. Whether it matters depends on how editors search, which is a human question. `search: {strategy: 'groqLegacy'}` restores the old behavior as a temporary measure.

### Under the hood

**Vite 8.** Build times improved substantially in Sanity's internal testing, with smaller bundles from better tree shaking. The React plugin updates automatically.

Applicability: does `sanity.cli.ts` customize `vite`? If yes, this is the most likely source of a build failure on this boundary, and testing against the pre-release before committing is worth recommending. If no, this boundary loses its main build risk, and the plan should say so.

---

## 2. Within the v6 line

| Version | Change | Applicability condition |
| --- | --- | --- |
| **6.3.0** | **The Portable Text input dropped all legacy `data-slate-*` attributes, CSS classes, and non-`pt` data attributes from its editing DOM.** Migrate to the `data-pt-*` equivalents. | `grep -rn "data-slate"` across source, stylesheets, and test suites. **This is the highest-impact undeclared change in the v6 line and it fails silently.** Custom CSS stops applying and end-to-end selectors stop matching, with no error. |
| 6.2.0 | The markdown plugin's `config` prop deprecated in favour of `enabled`. | Only if `sanity-plugin-markdown` is configured with `config`. |
| 6.2.0 | Native browser autocomplete and autofill disabled on Studio form fields. | Informational. |
| 6.4.0 | `useDocumentVersionInfo` deprecated. | Grep for the hook. |
| 6.6.0 | **Invisible stega metadata stripped from text pasted into plain-text fields.** | Going forward, no action. Documents already containing stega characters need a one-time content migration using `stegaClean` from `@sanity/client/stega`. Only relevant if visual editing with stega is or was in use. |
| 6.6.0 | **`menuItems([])` in structure configuration is now honored**, so no default menu items are injected. | Applies if structure config uses `menuItems([])` and relied on the injected items appearing. |
| 6.6.0 | "Default sort" and "Default view" scoped to the individual document list rather than overriding every list of the same type. | Applies to structure customization that relied on the old spillover. |
| 6.6.0 | Opt-in table editing added to the Portable Text input, enabled with `plugins: {table: {enabled: true}}` on `components.portableText` plus a declared table schema. | Off by default, so no risk. Worth a note: do not enable it until every rendering surface can handle table blocks. |
| 6.7.0 | `Rule.uri({scheme})` respects a custom scheme when combined with other rules, so `mailto:` and `tel:` values are no longer wrongly rejected. | No action. Content that previously failed validation may now pass. |
| **6.9.0** | **`sanity build` and `sanity deploy` now honor `deployment.autoUpdates`**, which was previously ignored in some code paths. | Applies to every project with `autoUpdates` set. If a project set `false` but was receiving updates anyway, that stops. Verify which behavior the team expects. |
| 6.9.0 | `defineType`, `defineField`, and `defineArrayMember` preserve explicitly supplied optional properties on their return types. | Applies to any TypeScript project. Inferred types shift, so expect new type errors or newly redundant non-null assertions in schema-adjacent code. Usually quick to resolve. |
| **6.11.0** | **`useClient` deprecation narrowed to the no-argument call.** Calling `useClient()` without options warns; calling it with options, such as `useClient({apiVersion: '2024-01-01'})`, does not. | `grep -rEn "useClient\(\s*\)" src/`. The fix is to pass an explicit `apiVersion` rather than to stop using the hook. Worth doing regardless of the warning, because an implicit API version is its own latent problem. |
| 6.10.0 | The request-access screen was replaced with the shared `access-ui` package, which adds a `renderAction` slot. | Informational for most projects. Applies only if the access-request screen was customized or its markup was targeted by tests or CSS. |
| 6.12.0 | `displayName` assignments removed from `sanity` exports to unblock tree shaking. | Applies only to code or tests that identify components by `displayName`, including some snapshot and component-lookup patterns. Grep test suites, not just `src/`. |
| 6.12.0 | The mutator drops patch paths that cannot apply to the local document instead of throwing. | Informational. Relevant if custom code relied on the throw to detect a stale path. |
