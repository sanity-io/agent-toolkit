---
name: sanity-visual-editing-setup
description: Configures Sanity Visual Editing for your front-end framework. Use when setting up live preview or click-to-edit overlays.
---

# Visual Editing Setup

This skill inspects the project and installs/configures the necessary packages for Sanity Visual Editing.

## Procedure

1.  **Detect Framework**
    *   Check `package.json` dependencies.
    *   Identify: `next`, `react-router`, `@remix-run/react`, `svelte`, `nuxt`, `astro`.

2.  **Install Dependencies**
    *   **Next.js:** `npm install next-sanity @sanity/client` (Ensure v11+ for `next-sanity`)
    *   **Remix:** `npm install @sanity/react-loader @sanity/client @sanity/visual-editing`
    *   **Svelte:** `npm install @sanity/svelte-loader @sanity/client @sanity/visual-editing`
    *   **Nuxt:** `npm install @nuxtjs/sanity`
    *   **Astro:** `npm install @sanity/astro`

3.  **Configure Client (Stega)**
    *   Locate the Sanity Client config (e.g., `sanity/client.ts`, `lib/sanity.ts`).
    *   Update the configuration to include `stega: { enabled: true, studioUrl: '...' }`.
    *   **Crucial:** Ensure `useCdn` logic is correct (usually `false` for live preview).

4.  **Configure Loaders (Framework Specific)**
    *   **Next.js:** Setup `defineLive` in `sanity/lib/live.ts`. Add `<SanityLive />` to layout.
    *   **Remix:** Setup `loader.server.ts` (server-only) and `loader.ts` (shared). Implement `useQuery`.
    *   **Svelte:** Setup `hooks.server.ts` (`createRequestHandler`) and `+layout.svelte` (`useLiveMode`).

5.  **Verification**
    *   Ask user to run the dev server.
    *   Check if overlays appear in the Presentation Tool (iframe).
