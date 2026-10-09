---
title: Sanity Dashboard Apps
description: Rules for Studios and App SDK apps that run in the Sanity Dashboard, including defineApplication config (beta), app visibility, local Dashboard development, first deploys and deployment.appId, and Dashboard hooks from @sanity/sdk-react/dashboard.
---

# Sanity Dashboard Apps

The Sanity Dashboard is where an organization's Studios and App SDK apps run. A Studio or app opts into the Dashboard beta by declaring itself with `defineApplication` in `sanity.cli.ts`. That changes how it is created, developed, and deployed. For SDK data hooks (`useDocuments`, `useDocument`, and so on), see the `app-sdk` rule.

## Detect the Setup

Read `sanity.cli.ts` before running `dev` or `deploy`:

- `app: defineApplication({...})` → a **Dashboard app** (beta). Follow this rule.
- `app: {organizationId, entry}` with no `defineApplication` → a classic App SDK app. Only the Visibility and Dashboard Hooks sections apply.
- No `app` key → a classic Studio. This rule does not apply.

## Boundaries

- **Always:** Save `application.id` from the first deploy as `deployment.appId` in `sanity.cli.ts`
- **Always:** Import Dashboard hooks from `@sanity/sdk-react/dashboard`, not `@sanity/sdk-react`
- **Always:** Change `slug`, `title`, and `visibility` in `sanity.cli.ts` and redeploy; config is the source of truth
- **Ask first:** Before converting an existing classic Studio or app to `defineApplication`; it opts the project into the Dashboard beta
- **Never:** Pass `--create` or `--external` to `sanity deploy` for a Dashboard app (both rejected)
- **Never:** Call the applications API directly to create or patch an app; use the CLI
- **Never:** Set `visibility: 'disabled'` on an SDK app; it makes the app unreachable (hidden from the sidebar *and* 404 on the direct link). Use `'unlisted'`.
- **Never:** Wrap Studio components in `SanityApp`; Studio already provides the SDK

---

## Create

`sanity init --dashboard` scaffolds a Studio or app with `defineApplication`. The flag is beta; if `npx sanity@latest init --help` does not list it, the installed CLI predates it.

```bash
# App SDK app
npx sanity@latest init --dashboard --template app-quickstart --organization <org-id> --output-path . --typescript

# Studio
npx sanity@latest init --dashboard --project <project-id> --dataset production --template clean --typescript --output-path studio
```

`--dashboard` is ignored for remote templates and Next.js projects.

## Config (`sanity.cli.ts`)

App SDK app:

```typescript
import { defineApplication, defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  app: defineApplication({
    title: 'Content Reviews',
    slug: 'content-reviews',
    organizationId: 'your-org-id',
    entry: './src/App.tsx',
  }),
  deployment: {
    appId: 'abc123', // added after the first deploy
  },
})
```

Studio:

```typescript
import { defineApplication, defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: { projectId: 'your-project-id', dataset: 'production' },
  app: defineApplication({
    title: 'Marketing Studio',
    slug: 'marketing-studio',
    organizationId: 'your-org-id',
  }),
  deployment: {
    autoUpdates: true,
    appId: 'abc123', // added after the first deploy
  },
})
```

| Field | Notes |
|-------|-------|
| `title` | Required. The name shown in the Dashboard. |
| `slug` | Required. The app's address in the organization: lowercase letters, numbers, and hyphens, starting with a letter and ending with a letter or number. Must be free in the organization on first deploy. Changing it and redeploying renames the address. |
| `organizationId` | Required. The organization whose Dashboard runs the app. |
| `entry` | SDK apps only; defaults to `./src/App.tsx`. Rejected on a Studio. |
| `visibility` | See below. |

## Visibility

`visibility` controls whether the app appears in the Dashboard sidebar. Set it inside `defineApplication`, or as `app.visibility` in a classic app config (requires `sanity` v6.6.0+). It is applied on deploy.

- `default` — listed in the sidebar (the default when omitted).
- `unlisted` — hidden from the sidebar but still opens via a direct link. **Not private:** anyone with the link can open it.

## Develop

`npm run dev` (`sanity dev`) starts a local Dashboard on the configured port (3333 by default) and serves the Studio or app on the next port (3334), loaded into that Dashboard. Open the Dashboard URL the CLI prints, not the app port.

The Dashboard needs a signed-in Sanity account, so a human must complete sign-in in the browser. `--load-in-dashboard` is ignored; a Dashboard app already runs in the local Dashboard.

## Deploy

The first deploy creates the application from `slug` and `title`, then deploys to it. It works the same for Studios and apps:

```bash
npm run deploy -- --yes --json
```

1. Save `application.id` from the JSON response as `deployment.appId` in `sanity.cli.ts`.
2. Later deploys use the same command and update that application. Without `deployment.appId`, a later deploy fails because the slug is taken; the error includes the app ID to save.

- `--dry-run` previews without creating or uploading anything.
- `--title` overrides `title` for this deploy.
- A first deploy cannot use `--no-build`, because the new app ID is built into the bundle.
- A Studio also needs `api.projectId`. `studioHost` and `--url` do not apply; the address comes from `slug`.
- Agent terminals may disable prompts (`TERM=dumb`). Use these flags rather than changing terminal settings.

Deployed apps are served at `https://<organizationId>.sanity.run/applications/<appId>` and Studios at `https://<organizationId>.sanity.run/studios/<appId>`.

## Dashboard Hooks

Hooks that talk to the Dashboard are exported from `@sanity/sdk-react/dashboard` (App SDK v3+). They are not in the root `@sanity/sdk-react` export.

| Hook | Use |
|------|-----|
| `useNavigate` | Keep the app's router in sync with the Dashboard URL |
| `useNavigateToStudioDocument` | Open a document in its Studio |
| `useOrganizationId` | The organization selected in the Dashboard |
| `useApplications` / `useApplication` | Apps installed in the Dashboard |
| `useWindowTitle` | Set the browser tab title |

```typescript
import { useNavigateToStudioDocument } from '@sanity/sdk-react/dashboard'
```

**In an SDK app**, call them inside `SanityApp`, like any SDK hook.

**In a Studio** (`sanity` v6.10.0+), Studio mounts an SDK instance for the workspace, so SDK hooks work in tools, panes, and inputs without a provider. Add `@sanity/sdk-react` to the Studio's dependencies to import them. Do not add `SanityApp`: its auth boundary would take over the Studio UI.
