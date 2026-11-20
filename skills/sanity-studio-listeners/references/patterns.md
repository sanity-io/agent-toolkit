# Studio listener patterns

Code for each row of the table in `SKILL.md`. The first three open no listener of their own: they
read through the listener Studio already keeps open. Imports are from `sanity` 6.24.0 or later,
`@sanity/ui`, `react-rx` and `rxjs`.

## Validation in a list

```tsx
import {Badge, ErrorBoundary, Spinner, Stack, Text} from '@sanity/ui'
import {useState} from 'react'
import {useValidationStatus} from 'sanity'

function ValidationBadge({id, type}: {id: string; type: string}) {
  const {validation, isValidating} = useValidationStatus(id, type, {listener: 'global'})

  if (isValidating) return <Spinner />
  return (
    <Badge tone={validation.length > 0 ? 'critical' : 'positive'}>
      {validation.length} {validation.length === 1 ? 'issue' : 'issues'}
    </Badge>
  )
}

export function ValidationList({documents}: {documents: {_id: string; _type: string}[]}) {
  const [error, setError] = useState<Error | null>(null)

  if (error) return <Text>Couldn't validate these documents.</Text>
  return (
    <ErrorBoundary onCatch={({error: caught}) => setError(caught)}>
      <Stack gap={2}>
        {documents.map((doc) => (
          <ValidationBadge key={doc._id} id={doc._id} type={doc._type} />
        ))}
      </Stack>
    </ErrorBoundary>
  )
}
```

A permission check per item works the same way, inside the same kind of error boundary:

```tsx
const [publishPermission, isLoading] = useDocumentPairPermissions({
  id,
  type,
  permission: 'publish',
  listener: 'global',
})
```

## Live document values per item

```tsx
import {Card, Text} from '@sanity/ui'
import {useMemo} from 'react'
import {useObservable} from 'react-rx'
import {getDraftId, getPublishedId, type SanityDocument, useDocumentPreviewStore} from 'sanity'

export function AuthorCard({id}: {id: string}) {
  const previewStore = useDocumentPreviewStore()
  const documents$ = useMemo(
    () => previewStore.unstable_observeDocuments([getDraftId(id), getPublishedId(id)]),
    [previewStore, id],
  )
  // null until the first answer; a document that doesn't exist comes back as undefined
  const documents = useObservable(documents$, null)
  if (!documents) return <Text>Loading…</Text>

  const [draft, published] = documents
  const author: SanityDocument | undefined = draft ?? published
  return (
    <Card padding={2} border>
      <Text>{author ? String(author.name ?? 'Untitled') : 'Not found'}</Text>
    </Card>
  )
}
```

Fetches for many documents are batched into one query, and every card reads through the same
shared listener.

## Validating what editors see

`'global'` validation checks exactly the id it is given. To validate the draft when there is one,
the way the document editor does, pick the id from the same shared streams:

```tsx
import {useMemo} from 'react'
import {useObservable} from 'react-rx'
import {getDraftId, getPublishedId, useDocumentPreviewStore} from 'sanity'

export function CurrentValidationBadge({id, type}: {id: string; type: string}) {
  const previewStore = useDocumentPreviewStore()
  const draft$ = useMemo(
    () => previewStore.unstable_observeDocument(getDraftId(id)),
    [previewStore, id],
  )
  const draft = useObservable(draft$, undefined)
  const targetId = draft ? getDraftId(id) : getPublishedId(id)

  return <ValidationBadge key={targetId} id={targetId} type={type} />
}
```

`ValidationBadge` is the component from the first example; render it inside the list's error
boundary. Keying it on the target id starts a fresh validation when a draft appears or is
published.

## A listener of your own, once per screen

For a list whose members you can't know by id:

```tsx
import {Card, Spinner, Stack, Text} from '@sanity/ui'
import {useMemo} from 'react'
import {useObservable} from 'react-rx'
import {catchError, map, of} from 'rxjs'
import {useDocumentStore} from 'sanity'

interface Article {
  _id: string
  title?: string
}

type BoardState = {status: 'loading'} | {status: 'ready'; articles: Article[]} | {status: 'error'}

const FILTER = `_type == "article" && status == $status`

export function ReviewBoard() {
  const documentStore = useDocumentStore()
  const board$ = useMemo(
    () =>
      documentStore
        .listenQuery(
          {
            fetch: `*[${FILTER}] | order(_updatedAt desc) {_id, title}`,
            listen: `*[${FILTER}]`,
          },
          {status: 'in-review'},
          {tag: 'review-board'},
        )
        .pipe(
          map((articles: Article[]): BoardState => ({status: 'ready', articles})),
          catchError(() => of<BoardState>({status: 'error'})),
        ),
    [documentStore],
  )
  const board = useObservable(board$, {status: 'loading'} as BoardState)

  if (board.status === 'loading') return <Spinner />
  if (board.status === 'error') return <Text>Couldn't load the board.</Text>
  return (
    <Stack gap={2}>
      {board.articles.map((article) => (
        <Card key={article._id} padding={2} border>
          <Text>{article.title ?? 'Untitled'}</Text>
        </Card>
      ))}
    </Stack>
  )
}
```

The board holds one listener however many articles it shows. To show validation on each card,
render a `ValidationBadge` inside it rather than querying per card.

## A listener budget test

With Playwright, assert the most listeners the tab held while the screen loaded:

```ts
import {expect, type Request, test} from '@playwright/test'

test('the review board stays within its listener budget', async ({page}) => {
  const open = new Set<Request>()
  let peak = 0
  page.on('request', (request) => {
    if (!request.headers().accept?.includes('text/event-stream')) return
    open.add(request)
    peak = Math.max(peak, open.size)
  })
  page.on('requestfinished', (request) => open.delete(request))
  page.on('requestfailed', (request) => open.delete(request))

  await page.goto('/production/review-board')
  await expect(page.getByTestId('review-board-ready')).toBeVisible()
  // Listeners connect after the screen renders, and nothing signals the last one
  await page.waitForTimeout(5_000)

  expect(peak).toBeLessThanOrEqual(12)
})
```

- Assert the peak, not the count at the end: per-item listeners that close again (rows scrolled
  away) still held a slot.
- Load enough items for a per-item listener to break the budget. A screen with two items hides it.
