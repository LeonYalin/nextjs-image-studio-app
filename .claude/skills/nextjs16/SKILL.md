---
name: nextjs16
description: Read this BEFORE writing or modifying Next.js 16 code in this repo — routing, route handlers, server actions/mutations, next/image, caching/data fetching, params, or metadata. This Next.js has breaking changes vs older versions; the table maps each task to the exact bundled doc to read first so you don't code from stale memory.
---

# Next.js 16 — read the doc first

This repo runs **Next.js 16** (App Router). APIs differ from older versions. Before writing code for a task below, **Read the listed file** under `node_modules/next/dist/docs/01-app/` and follow it. Heed deprecation notices. When in doubt, also skim the matching `getting-started` page.

| Task | Read (relative to `node_modules/next/dist/docs/01-app/`) |
| --- | --- |
| New page / nested route / layout | `01-getting-started/03-layouts-and-pages.md`, `03-api-reference/03-file-conventions/page.md`, `.../layout.md` |
| Route groups `(auth)` / `(gallery)` | `03-api-reference/03-file-conventions/route-groups.md` |
| Dynamic route `[id]` + reading params | `03-api-reference/03-file-conventions/dynamic-routes.md`, `03-api-reference/04-functions/use-params.md` (params are async in 16 — check the page doc) |
| API route handler (GET/POST/DELETE…) | `01-getting-started/15-route-handlers.md`, `03-api-reference/03-file-conventions/route.md`, `03-api-reference/04-functions/next-request.md` / `next-response.md` |
| Server action / mutating data | `01-getting-started/07-mutating-data.md`, `03-api-reference/01-directives/use-server.md` |
| Client vs server component split | `01-getting-started/05-server-and-client-components.md`, `03-api-reference/01-directives/use-client.md` |
| Fetching data / caching / revalidating | `01-getting-started/06-fetching-data.md`, `08-caching.md`, `09-revalidating.md`, `03-api-reference/04-functions/fetch.md` |
| `next/image` (sizing, remotePatterns, unoptimized) | `01-getting-started/12-images.md`, `03-api-reference/02-components/image.md` |
| `next.config.ts` (images.remotePatterns etc.) | `03-api-reference/05-config/01-next-config-js/` |
| Navigation (router, pathname, Link) | `03-api-reference/04-functions/use-router.md`, `use-pathname.md`, `03-api-reference/02-components/link.md` |
| error.tsx / loading.tsx / not-found | `03-api-reference/03-file-conventions/error.md`, `loading.md`, `not-found.md` |
| Metadata / OG images | `01-getting-started/14-metadata-and-og-images.md`, `03-api-reference/03-file-conventions/01-metadata/` |

If a task isn't listed, browse `node_modules/next/dist/docs/01-app/01-getting-started/index.md` for the right page before coding.
