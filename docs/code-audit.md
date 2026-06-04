# Code audit — nextjs-image-studio-app

**Date:** 2026-06-04 · **Scope:** whole repo · **Status:** findings only (no fixes applied here, per request).

Severity legend: 🔴 critical · 🟠 high · 🟡 medium · 🔵 low/nit.
Items marked **(already addressed)** were fixed incidentally while building the new features.

---

## Security

### 🔴 1. Password check is bypassed — any password logs in an existing user
[src/auth.ts:36](../src/auth.ts#L36)
```ts
const passwordIsValid = bcrypt.compare(password, user.passwordHash); // returns a Promise
if (!passwordIsValid) return null; // a Promise is always truthy → never null
```
`bcrypt.compare` (async form) returns a `Promise`, which is always truthy, so the guard never triggers. **Effect: authentication accepts any password for any known email.** This is the most important issue in the codebase.
**Fix:** `const passwordIsValid = await bcrypt.compare(password, user.passwordHash);`

### 🔴 2. Every new signup is created as `admin`
[src/lib/actions.ts:78](../src/lib/actions.ts#L78) — `registerAction` hard-codes `role: "admin"`. Any visitor who registers gets admin. **Fix:** default to `"user"` (the schema already defaults to `"user"`; just drop the override).

### 🟡 3. Upload endpoint hardening
[src/app/api/photos/upload/route.ts](../src/app/api/photos/upload/route.ts)
- No **file-size limit** → a large upload can exhaust memory/disk (`Buffer.from(await file.arrayBuffer())` buffers the whole file). Add a max-bytes check.
- **MIME type is taken from the client** (`file.type`) and trusted. Consider sniffing magic bytes, and derive the saved extension from the validated type rather than the user-supplied filename.

### 🔵 4. Stray import
[src/app/api/photos/upload/route.ts:7](../src/app/api/photos/upload/route.ts#L7) — `import { success } from "zod"` is unused/incorrect; remove it.

### (already addressed) Ownership + avatar
- All new mutation routes (`DELETE /api/photos/[id]`, every `/api/albums*` route) call `await auth()` and scope every query to `session.user.id`, returning 404 for non-owned ids.
- The avatar `src` previously hard-coded to `https://github.com` ([AppTopbar.tsx]) now uses `session.user.avatarUrl`.

---

## Correctness / clean code

### 🟠 5. `npm run dev` / `npm run start` wipe the database on every run
[package.json:6-9](../package.json#L6) — `dev` and `start` run `db:seed`, and [scripts/seed.ts](../scripts/seed.ts) **clears all tables** before seeding. So every server start deletes all uploaded photos and albums (the files in `public/uploads` are orphaned). Recommend: make the seed idempotent (upsert), gate it behind a flag, or remove it from `dev`/`start` and run it manually.

### 🟡 6. Invalid Tailwind classes in the gallery layout (silent no-ops)
[src/app/(gallery)/layout.tsx:12-15](../src/app/(gallery)/layout.tsx#L12) uses `md-col-end-3`, `md-row-start-2`, `md-row-end-3` — these aren't valid Tailwind (should be `md:col-end-3`, etc.), so they do nothing. The layout happens to work via the base classes; the `md-*` ones are dead.

### 🔵 7. User-facing typos
- "Logou error occured" [actions.ts:38](../src/lib/actions.ts#L38)
- "minimun 4 characters" [actions.ts:46](../src/lib/actions.ts#L46)
- "Loggin out" [AppTopbar.tsx](../src/components/AppTopbar.tsx) logout label
- "Password is requered" [login/page.tsx:18](../src/app/(auth)/login/page.tsx#L18)

### 🔵 8. Dead file
[src/store/useGalleryStore.ts](../src/store/useGalleryStore.ts) is empty and unused. Either delete it or use it (the new lightbox keeps its open/index state locally in the gallery components, which is fine).

### (already addressed)
- `usePhotos` GET query now checks `res.ok` and no longer double-wraps the error.
- `getUserInitials` now handles single-word and 3+-word names.

---

## Performance / architecture

### 🔵 9. `unoptimized` on all images
Every `next/image` uses `unoptimized`. Correct for the local `public/uploads` setup, but if storage ever moves to a remote/CDN, drop `unoptimized` and configure `images.remotePatterns` to regain optimization.

### 🔵 10. Mixed mutation styles
Auth/profile use **server actions**; photos/albums use **route handlers + TanStack**. Both are fine, but standardizing (e.g. route handlers for all resource CRUD, actions only for auth) would make the data layer more predictable.

### 🔵 11. Album cover/count query
The albums list derives covers/counts with one extra grouped query in JS (not N+1) — see [src/app/api/albums/route.ts](../src/app/api/albums/route.ts). If album counts grow large, push the aggregation into SQL (`GROUP BY` + window function for the cover).

---

## Tooling / environment

### 🟠 12. `npm run lint` is broken
ESLint 9 fails to start with `ERR_PACKAGE_PATH_NOT_EXPORTED` from `tinyglobby`/`picomatch` — a dependency-resolution problem, not a lint violation. Linting is effectively disabled. Recommend reinstalling/aligning deps (or pinning a compatible `tinyglobby`). `npx tsc --noEmit` works and is clean.

### 🔵 13. Duplicate lockfiles → wrong workspace root
Next warns it inferred the workspace root as `/Users/leonyalin/code` because of `/Users/leonyalin/code/package-lock.json` in addition to the project's own. Remove the stray parent lockfile or set `turbopack.root` in `next.config.ts`.
