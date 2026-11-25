---
title: Sanity Dashboard Apps
description: Rules for Studios and App SDK apps that run in the Sanity Dashboard, including defineApplication config (beta), app visibility, local Dashboard development, first deploys and deployment.appId, getting classic Studios into the Dashboard (sanity deploy, deploy --external, bridge script, Hide in Dashboard), and Dashboard hooks from @sanity/sdk-react/dashboard.
---

# Sanity Dashboard Apps

The Sanity Dashboard is where an organization's Studios and App SDK apps run. A Studio or app opts into the Dashboard beta by declaring itself with `defineApplication` in `sanity.cli.ts`. That changes how it is created, developed, and deployed. For SDK data hooks (`useDocuments`, `useDocument`, and so on), see the `app-sdk` rule.

For what the Dashboard is and how an organization uses it, read https://www.sanity.io/docs/dashboard/dashboard-introduction.md.

## Detect the Setup

Read `sanity.cli.ts` before running `dev` or `deploy`:

- `app: defineApplication({...})` → a **Dashboard app** (beta). Follow this rule.
- `app: {organizationId, entry}` with no `defineApplication` → a classic App SDK app. Only the Visibility and Dashboard Hooks sections apply.
- No `app` key → a classic Studio. Only the Classic Studios section applies.

## Boundaries

- **Always:** Save `application.id` from the first deploy as `deployment.appId` in `sanity.cli.ts`
- **Always:** Import Dashboard hooks from `@sanity/sdk-react/dashboard`, not `@sanity/sdk-react`
- **Always:** Change `slug`, `title`, and `visibility` in `sanity.cli.ts` and redeploy; config is the source of truth
- **Always:** Register a self-hosted or embedded classic Studio with `sanity deploy --external --url <full-url>` on every deploy
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

For a classic app's `app.visibility`, `app.title`, and `app.icon`, read https://www.sanity.io/docs/app-sdk/sdk-configuration.md.

## Develop

`npm run dev` (`sanity dev`) starts a local Dashboard on the configured port (3333 by default) and serves the Studio or app on the next port (3334), loaded into that Dashboard. Open the Dashboard URL the CLI prints, not the app port.

The Dashboard needs a signed-in Sanity account, so a human must complete sign-in in the browser. `--load-in-dashboard` is ignored; a Dashboard app already runs in the local Dashboard. Flags: https://www.sanity.io/docs/cli-reference/dev.md

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

For every `sanity deploy` flag, read https://www.sanity.io/docs/cli-reference/deploy.md. For classic App SDK deploys and the organization token CI needs, read https://www.sanity.io/docs/app-sdk/sdk-deployment.md.

Deployed apps are served at `https://<organizationId>.sanity.run/applications/<appId>` and Studios at `https://<organizationId>.sanity.run/studios/<appId>`.

## Classic Studios

A Studio without `defineApplication` shows up in the Dashboard once it is deployed or registered with the CLI. Use the latest `sanity` release; schema deployment needs v3.88.0+. Before registering a self-hosted or embedded Studio, read https://www.sanity.io/docs/dashboard/dashboard-configure.md. For hosting options and CI flags, read https://www.sanity.io/docs/studio/deployment.md.

```bash
# Develop: open the local Studio inside the Dashboard
npm run dev -- --load-in-dashboard

# Sanity-hosted: builds, deploys, and registers the Studio and its schema
npx sanity@latest deploy

# Self-hosted or embedded: build and upload to your host, then register (uploads nothing)
npx sanity@latest build
npx sanity@latest deploy --external --url https://example.com/studio
```

- Studios deployed before Dashboard existed need one more `sanity deploy`, even with auto-updates on.
- `--url` is the full public URL, including any `basePath`. Run `deploy --external` on every deploy: each run refreshes the schema and manifest. In CI, pass `--url` every time and set `SANITY_AUTH_TOKEN` to a project deploy token.
- Adding the Studio URL in Manage, serving manifest files from your own host, or running `sanity schemas deploy` does not register the Studio. Without registration, Dashboard and Media Library cannot open it.
- An embedded Studio (for example `next-sanity`), or any Studio not built with `sanity build` or `sanity deploy`, also needs the bridge script on its route: `<script src="https://core.sanity-cdn.com/bridge.js" async type="module"></script>`.
- The Studio must load without authentication and allow framing by the Dashboard: `Content-Security-Policy: frame-ancestors https://*.sanity.io`. `X-Frame-Options: DENY` or `SAMEORIGIN`, or `frame-ancestors 'self'` alone, block it (watch for Vercel deployment protection and Cloudflare).

Visibility, name, and icon are not set in `sanity.cli.ts` for a classic Studio:

- **Visibility:** the project's **Studios** page in Manage → context menu → **Hide in Dashboard**. The Studio stays registered.
- **Name:** the Studio **Title** set in Manage, else the project name (Sanity-hosted Studio with several workspaces), else the first workspace's `title`.
- **Icon:** the workspace `icon` in `sanity.config.ts`, as a static, self-contained SVG component (no hooks, context, or external values). Studios with several workspaces show an initials avatar instead.

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
