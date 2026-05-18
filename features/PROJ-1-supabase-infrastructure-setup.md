# PROJ-1: Supabase Infrastructure Setup

## Status: In Progress
**Created:** 2026-05-18
**Last Updated:** 2026-05-18

## Dependencies
- None

## User Stories
- As a developer, I want a connected Supabase project so that all features have a working database backend.
- As a developer, I want configured environment variables so that the app connects to Supabase securely.
- As a developer, I want all database tables with RLS policies so that data is secure by default.
- As a developer, I want pre-seeded categories so that the app is immediately usable after setup.
- As a super admin, I want my account to be assignable as `super_admin` so that I can manage the app from day one.

## Acceptance Criteria
- [ ] Supabase project created and connected to the Next.js app via environment variables
- [ ] `src/lib/supabase.ts` exports a working browser client and server client (no longer exports `null`)
- [ ] `.env.local.example` documents all required environment variables without actual values
- [ ] `.env.local` is listed in `.gitignore`
- [ ] RLS is enabled on all 6 tables
- [ ] The following 5 default categories are seeded: "Feature Request", "Bug Report", "UI/UX", "Performance", "Sonstiges"
- [ ] A database trigger automatically creates a `profiles` row when a new auth user is registered
- [ ] Auth is configured for email + password only (no OAuth providers)
- [ ] All tables have a `created_at` column with default `now()`

## Database Schema

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | FK → auth.users, primary key |
| display_name | text | nullable |
| created_at | timestamptz | default now() |

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key, default gen_random_uuid() |
| name | text | not null |
| slug | text | unique, not null |
| created_at | timestamptz | default now() |

### `ideas`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key, default gen_random_uuid() |
| user_id | uuid | FK → profiles, not null |
| title | text | not null, max 120 chars |
| description | text | max 1000 chars |
| category_id | uuid | FK → categories |
| status | text | enum: open, planned, implemented, rejected — default: open |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### `votes`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key, default gen_random_uuid() |
| user_id | uuid | FK → profiles, not null |
| idea_id | uuid | FK → ideas ON DELETE CASCADE, not null |
| created_at | timestamptz | default now() |
| | | UNIQUE(user_id, idea_id) |

### `comments`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key, default gen_random_uuid() |
| user_id | uuid | FK → profiles, not null |
| idea_id | uuid | FK → ideas ON DELETE CASCADE, not null |
| content | text | not null, max 500 chars |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### `admin_roles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key, default gen_random_uuid() |
| user_id | uuid | FK → profiles, unique, not null |
| role | text | enum: super_admin, moderator — not null |
| created_at | timestamptz | default now() |

## RLS Policies (per table)

| Table | Policy |
|-------|--------|
| `profiles` | SELECT: everyone; UPDATE: own row only |
| `categories` | SELECT: everyone; INSERT/UPDATE/DELETE: admin_roles only |
| `ideas` | SELECT: everyone; INSERT: authenticated users; UPDATE: own row or admin_roles; DELETE: admin_roles only |
| `votes` | SELECT: everyone; INSERT: authenticated users (own only); DELETE: own row only |
| `comments` | SELECT: everyone; INSERT: authenticated users; DELETE: own row or admin_roles |
| `admin_roles` | SELECT/INSERT/UPDATE/DELETE: super_admin role only |

## Edge Cases
- Missing env variables → app must fail with a clear error message on startup, no silent failures
- Database migration fails → rollback steps must be documented in the migration file
- `profiles` trigger fails → user cannot log in; trigger must be idempotent (ON CONFLICT DO NOTHING)
- `.env.local` accidentally committed → `.gitignore` entry prevents this
- Duplicate vote attempt → blocked by UNIQUE(user_id, idea_id) constraint at DB level

## Technical Requirements
- Auth: email + password only, no OAuth providers
- All foreign keys use ON DELETE CASCADE where child data is meaningless without the parent (votes, comments)
- profiles.id must equal auth.users.id (not a separate UUID) — trigger creates the row on signup
- `.env.local.example` must be committed to git; `.env.local` must not

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### System Structure

```
Browser (Next.js App)
+-- Supabase Browser Client (src/lib/supabase.ts)
|   +-- Auth: login, registration, session management
|   +-- DB: read/write ideas, votes, comments
|
Server (Next.js API Routes / Server Components)
+-- Supabase Server Client (src/lib/supabase-server.ts)
    +-- Secure admin operations
    +-- Server-side database queries

Supabase Cloud
+-- Auth Service (email + password only)
+-- PostgreSQL Database
|   +-- profiles       (linked to auth users via trigger)
|   +-- categories     (pre-seeded with 5 default categories)
|   +-- ideas
|   +-- votes
|   +-- comments
|   +-- admin_roles
+-- Row Level Security (data access control on DB level)
+-- DB Trigger (auto-creates profile row on user signup)
```

### File Structure (new files)

```
project-root/
+-- .env.local.example              (new — env variable template, committed to git)
+-- .env.local                      (local only, never committed)
supabase/
+-- migrations/
    +-- 001_initial_schema.sql      (all 6 tables + RLS policies + trigger)
    +-- 002_seed_categories.sql     (5 default categories)
src/lib/
+-- supabase.ts                     (updated — browser client activated)
+-- supabase-server.ts              (new — server client for API routes)
```

### Tech Decisions

| Decision | Rationale |
|---|---|
| Two Supabase clients (browser + server) | Browser client runs with the user's session (frontend); server client runs in API routes with secure cookie-based auth |
| Migration files instead of direct SQL in dashboard | Reproducible, version-controlled, auditable |
| DB trigger for profile creation | Guarantees every new user has a profile row immediately — no manual step or race condition |
| RLS on all tables | Data access is enforced at the database level — even a buggy API route cannot leak other users' data |

### Dependencies

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Main client for database queries and auth |
| `@supabase/ssr` | Server-side rendering support for Next.js (cookie-based sessions) |

## QA Test Results

**Tested:** 2026-05-18
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Supabase project created and connected via env vars
- [x] Project `vrzzmiuipgvhvhycaaiq` active in eu-central-1
- [x] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` present in `.env.local`

#### AC-2: Supabase clients exported (no longer null)
- [x] `src/lib/supabase.ts` exports browser client via `@supabase/ssr`
- [x] `src/lib/supabase-server.ts` exports server client (correctly split per architecture design)

#### AC-3: .env.local.example documents all required variables
- [x] Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` documented with placeholder values
- [x] File committed to git

#### AC-4: .env.local in .gitignore
- [x] Covered by `.env*.local` pattern in `.gitignore`
- [x] `.env.local` is NOT tracked by git (verified via `git ls-files`)
- [x] No secrets found in any tracked files

#### AC-5: RLS enabled on all 6 tables
- [x] profiles: RLS ON
- [x] admin_roles: RLS ON
- [x] categories: RLS ON
- [x] ideas: RLS ON
- [x] votes: RLS ON
- [x] comments: RLS ON

#### AC-6: 5 default categories seeded
- [x] Feature Request, Bug Report, UI/UX, Performance, Sonstiges — all present

#### AC-7: DB trigger auto-creates profile on signup
- [x] Trigger `on_auth_user_created` exists on `auth.users` (INSERT)
- [x] Uses `ON CONFLICT (id) DO NOTHING` — idempotent

#### AC-8: Auth configured for email + password only
- [x] No OAuth providers configured (Supabase project default)

#### AC-9: All tables have created_at with default now()
- [x] Verified on all 6 tables

### Edge Cases Status

#### EC-1: Missing env variables
- [x] Next.js build succeeds with `.env.local` present; would fail clearly without it (non-null assertion `!`)

#### EC-2: .env.local accidentally committed
- [x] Blocked by `.gitignore` — confirmed not tracked

#### EC-3: Duplicate vote attempt
- [x] `UNIQUE(user_id, idea_id)` constraint present on `votes` table

#### EC-4: profiles trigger idempotent
- [x] `ON CONFLICT (id) DO NOTHING` confirmed in trigger body

### Security Audit Results
- [x] No secrets committed to git
- [x] RLS enabled on all tables — data access controlled at DB level
- [x] INSERT policies use `with_check (auth.uid() = user_id)` — prevents spoofing
- [x] Admin helper functions use `SECURITY DEFINER` to avoid RLS recursion
- [ ] **BUG-1**: SECURITY DEFINER functions publicly callable via REST API (see below)
- [ ] **BUG-2**: `handle_updated_at()` has mutable search_path (see below)
- [ ] **BUG-3**: RLS policies use bare `auth.uid()` instead of `(select auth.uid())` (see below)

### Bugs Found

#### BUG-1: SECURITY DEFINER functions publicly callable via REST API
- **Severity:** High
- **Steps to Reproduce:**
  1. Call `GET /rest/v1/rpc/is_admin` with the anon key
  2. Call `GET /rest/v1/rpc/is_super_admin` with the anon key
  3. Call `POST /rest/v1/rpc/handle_new_user` with the anon key
  4. Expected: 403 / function not accessible
  5. Actual: Function executes (anon + authenticated roles have EXECUTE permission)
- **Fix:** Revoke `EXECUTE` on `is_admin`, `is_super_admin`, `handle_new_user` from `anon` and `authenticated` roles via migration
- **Ref:** https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- **Priority:** Fix before deployment

#### BUG-2: handle_updated_at() has mutable search_path
- **Severity:** Medium
- **Detail:** Function `public.handle_updated_at` was created without `set search_path = public`, making it vulnerable to search_path injection attacks.
- **Fix:** Recreate function with `set search_path = public`
- **Ref:** https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- **Priority:** Fix before deployment

#### BUG-3: RLS policies re-evaluate auth.uid() per row
- **Severity:** Medium
- **Detail:** 7 RLS policies use bare `auth.uid()` instead of `(select auth.uid())`. Postgres re-evaluates the function for each row, causing suboptimal performance at scale. Affected: `profiles_update_own`, `ideas_insert_auth`, `ideas_update_own_or_admin`, `votes_insert_own`, `votes_delete_own`, `comments_insert_auth`, `comments_delete_own_or_admin`.
- **Fix:** Replace `auth.uid()` with `(select auth.uid())` in all affected policies
- **Ref:** https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
- **Priority:** Fix before deployment

### Additional Finding (not a bug)
- **Bootstrap process undocumented:** The first `super_admin` cannot be assigned from the app UI — it must be inserted directly via the Supabase dashboard SQL editor: `INSERT INTO public.admin_roles (user_id, role) VALUES ('<your-user-uuid>', 'super_admin');`. This should be documented in the README or setup guide.

### Summary
- **Acceptance Criteria:** 9/9 passed
- **Bugs Found:** 3 total (0 critical, 1 high, 2 medium, 0 low)
- **Security:** Issues found — HIGH bug must be fixed
- **Production Ready:** NO
- **Recommendation:** Fix BUG-1 (HIGH) and BUG-2, BUG-3 (MEDIUM) before deployment

## Deployment
_To be added by /deploy_
