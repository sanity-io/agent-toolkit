---
name: sanity-studio-listeners
description: Keep Sanity Studio customizations (custom tools, inputs, document views, structure and plugins) from opening a real-time listener per document, which fills the browser's shared connection to the Sanity API and makes Studio hang when editors have several tabs open. Use when writing or reviewing Studio code that shows live data, validation or permissions for many documents (lists, boards, tables, review queues, dashboards); when code calls useValidationStatus, useDocumentPairPermissions, documentStore.listenQuery, listenQuery, client.listen or useListeningQuery from sanity-plugin-utils; or when editors report Studio stuck on its loading spinner or "Trying to connect…", "Could not establish EventSource connection", or that closing other Studio tabs fixes it.
---

# Studio listeners

Studio keeps data live with listeners: long-lived requests that stream changes from the Sanity
API. A browser runs at most 100 requests at a time on its connection to the API, and every Studio
tab shares that connection (on HTTP/1.1, browsers open only 6 connections per host). A listener
holds its slot for as long as it is open, and a Studio tab normally has 6 to 12 open.

Code that opens a listener for every item it renders multiplies by items, then by tabs. Once the
slots run out, every request in every tab waits: the newest tab hangs on its spinner, documents and
previews stop loading, and a tab that does load can show missing validation errors. The goal is
that your code adds a constant number of listeners, never one per item.

Studio already keeps one listener open that follows every document in the dataset. Read documents,
validation and permissions through it, and open a listener of your own only when it can't serve
the query.

## Workflow

1. **Find listeners opened per item.** Look in components rendered once per card, row, list item,
   search result or preview for:
   - `useValidationStatus(` or `useDocumentPairPermissions(` without `listener: 'global'`. By
     default they load the document the way the editor does, which opens a listener for it.
   - `documentStore.listenQuery(`, `listenQuery(`, `client.listen(`, `client.observable.listen(`.
     Every call opens its own listener, even for a query another component already runs.
   - `useListeningQuery(` from `sanity-plugin-utils`, and plugins built on it. Each call opens a
     listener. As of 2.0.23, when the listener fails, its error handler throws "You provided an
     invalid object where a stream was expected" and the hook stops updating.

   Also look for the same query run by several components (a settings document read by the
   structure, a tool and a badge).
2. **Check the Studio version.** `{listener: 'global'}` needs `sanity` 6.24.0 or later. On an
   older version, propose the upgrade first (see the `sanity-studio-upgrade` skill).
3. **Replace each one by what the item needs:**

   | Per item you need                                     | Use                                                                  | Listeners added |
   | ----------------------------------------------------- | -------------------------------------------------------------------- | --------------- |
   | Validation status                                     | `useValidationStatus(id, type, {listener: 'global'})`                | 0               |
   | A permission check                                    | `useDocumentPairPermissions({id, type, permission, listener: 'global'})` | 0           |
   | Live values of a document                             | `useDocumentPreviewStore().unstable_observeDocument(id)` (or `unstable_observeDocuments([...ids])`) | 0 |
   | Which documents match a filter you can't know by id   | One `documentStore.listenQuery` for the whole screen, results passed down | 1          |

   Full code for each: [references/patterns.md](references/patterns.md).
4. **Render less.** Every per-item cost is paid for every rendered item, on screen or not.
   Paginate long lists and virtualize long boards.
5. **Handle errors.** See the error rules below.
6. **Verify.** Count the tab's listeners with the screen open (below). Up to about 12 is fine, and
   the count must not grow when the list gets longer. For screens that matter, add the listener
   budget test from [references/patterns.md](references/patterns.md).

## Rules for `'global'` mode

- **It reflects saved changes.** A change is seen once it has been saved and is visible to
  queries, a moment after the keystroke. That is right for lists, boards and dashboards. Keep the
  default (`'document'`) only in components rendered inside the document form, next to the editor.
- **The id picks the version.** A published id validates the published document. If editors work
  in drafts, pass `drafts.<id>` when a draft exists, or errors in unpublished changes won't show
  ("Validating what editors see" in the patterns).
- **Wrap lists in an error boundary.** The hooks retry a failed load a few times, then throw while
  rendering. One failure should show a message, not crash the tool.
- `unstable_observeDocument` follows one exact id and emits `undefined` when the document doesn't
  exist, so start `useObservable` from `null` to tell loading from missing. To show the draft when
  there is one, observe `[getDraftId(id), getPublishedId(id)]` together and use
  `draft ?? published`.

## Rules for a listener of your own

Some queries can't be followed by id: a board of every document in a status, a filtered list,
search results. Only a listener with the query's filter knows when to fetch again. Use
`documentStore.listenQuery`, and treat every call as spending one of the browser's 100 slots in
every tab where the screen is open:

- Only when the table above has nothing that fits.
- Once per screen, never per item. Open it in the component that owns the list, pass each item its
  data, and render extra per-item details with `'global'` validation or `unstable_observeDocument`
  rather than another query.
- Once per query. Two components that call it with the same query open two listeners. Read it
  once, high enough in the tree.
- Use the `{fetch, listen}` form. The listener only needs the filter. Ordering, slicing and
  projections belong in `fetch`. Pass values as parameters (`$status`), not string interpolation.
- Build the observable with `useMemo` on stable inputs. A new observable on every render opens a
  new listener on every render.
- Count it. A screen with three of these, open in five tabs, uses 15 of the 100.

## Error rules

A listener fails when the network drops, the API restarts, or the browser's connection is full and
it times out waiting to connect. An uncaught error can crash the tool, the Structure tool or the
whole Studio.

- Give every observable you subscribe to an error path (`catchError` before `useObservable`, or
  the `error` callback of `subscribe`) and render a fallback.
- Don't retry in a tight loop: Studio's listeners reconnect on their own. Retry your own fetches a
  few times with a growing delay, then show the error.
- A structure resolver that depends on a document (navigation settings, for example) falls back to
  a default structure when it fails to load, instead of letting the error escape.
- To test it, block the request in DevTools (Network panel, right-click a `listen` request, **Block
  request URL**, reload). The screen should show its fallback.

## Counting listeners

In Chrome or Edge DevTools, open **Network**, reload, and filter by `listen`. Every request whose
**Time** still says **Pending** is an open listener. The `tag` query parameter names its source:

- `sanity.studio.preview.global` is the shared listener every `'global'` read and
  `unstable_observeDocument` goes through. One per tab is expected.
- Many `sanity.studio.document.pair.listen` that don't match documents open in the editor mean
  validation or permission hooks per item without `{listener: 'global'}`.
- Many requests for the same or similar query mean a query per item or per component.

The count covers one tab. Multiply by the tabs editors keep open: 20 per tab is fine alone and
fills the browser's budget at five tabs. To reproduce the problem, open the screen in four or five
tabs of the same browser and watch the newest one load.

Until a fix ships, editors can close unused Studio tabs, use split panes in one tab, or use a second
browser profile, which has a connection of its own.

## API stability

`useValidationStatus` and `useDocumentPairPermissions` are exported from `sanity` but marked
internal; the document preview store and the document store are beta, and `unstable_` methods can
change. Code that depends on them should pin `sanity` and check the release notes on upgrade.
