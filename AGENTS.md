<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project map

Google-Photos-style gallery. Stack: Next.js 16 App Router + React 19, NextAuth v5 (JWT, credentials), Drizzle + libSQL (SQLite), TanStack Query, Zustand, React Hook Form + Zod, shadcn/ui (radix-nova), Tailwind 4.

Layout:
- `src/app` — routes. Groups: `(auth)` (login/register), `(gallery)` (photos/albums, shares `layout.tsx` with sidebar+topbar). API route handlers under `src/app/api`.
- `src/components` — UI; `ui/` is shadcn (don't hand-edit, regenerate via CLI).
- `src/hooks` — TanStack Query hooks (one file per resource, e.g. `use-photos.ts`).
- `src/lib/actions.ts` — server actions (`"use server"`).
- `src/db` — Drizzle (`schema.ts`, `index.ts`); `src/auth*.ts` — NextAuth; `src/store` — Zustand.

Client/server boundary:
- `"use client"` ONLY for interactivity (forms, dialogs, hooks). Keep pages/layouts as server components where possible.
- **Reads**: client → route handler (`GET /api/...`) → TanStack hook. **Mutations**: server action OR route handler.
- EVERY route handler / action that touches data MUST `await auth()` and enforce `userId` ownership before reading/writing. Never trust an id from the client without scoping it to the session user.

Commands: `npm run dev` · `npm run lint` · `npx tsc --noEmit` · `npm run db:seed` (drizzle push + seed).
