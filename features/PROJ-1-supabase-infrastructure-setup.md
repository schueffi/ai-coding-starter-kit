# PROJ-1: Supabase Infrastructure Setup

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
