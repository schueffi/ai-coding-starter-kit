# PROJ-3: Idea Feed & Browse

## Status: Planned
**Created:** 2026-05-18
**Last Updated:** 2026-05-18

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure Setup) — ideas, categories, votes, comments tables

## User Stories
- As a visitor (not logged in), I want to browse all submitted ideas so I can explore the board without registering.
- As a visitor, I want to search for ideas by keyword so I can quickly find relevant submissions.
- As a visitor, I want to filter ideas by category so I can focus on topics I care about.
- As a visitor, I want to sort ideas by vote count or submission date so I can see what's popular or what's new.
- As a visitor, I want to click on an idea to see its full details in an overlay without leaving the feed.
- As a visitor, I want to see how many votes and comments each idea has so I can gauge community interest at a glance.

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Main idea feed (replaces current placeholder) |

## Acceptance Criteria
- [ ] The feed is publicly accessible — no login required to view ideas
- [ ] Each idea card displays: title, truncated description (max ~150 chars), category badge, vote count, comment count, author display name, and creation date
- [ ] Ideas are sorted by vote count (descending) by default ("Top"); user can switch to "Neu" (sorted by creation date descending)
- [ ] A category filter bar shows all available categories plus an "Alle" option; selecting a category filters the feed to that category only
- [ ] A search bar performs server-side full-text search across idea titles and descriptions; results update on submit
- [ ] The feed is paginated: 20 ideas per page with Previous / Next controls
- [ ] Clicking an idea card opens a detail overlay showing: full title, full description, category, author display name, creation date, vote count, and comment count
- [ ] The detail overlay can be closed by clicking outside it or pressing Escape
- [ ] When no ideas exist yet, the feed shows: "Noch keine Ideen. Sei der Erste!" with a link to `/auth/register`
- [ ] When a search or filter yields no results, the feed shows: "Keine Ideen gefunden. Passe deine Suche an."
- [ ] Sort, category filter, search query, and current page are reflected in the URL (shareable / deep-linkable)

## Edge Cases
- Feed loads with search + category filter + sort all active simultaneously — results respect all three constraints at once
- User navigates directly to a URL with query params (e.g. `/?q=dark+mode&category=UI%2FUX&sort=new&page=2`) — the feed initialises with those values pre-applied
- Search query contains special characters (e.g. `<script>`, `%`, `'`) — safely handled server-side, no injection risk
- Page number in URL exceeds total pages (e.g. `?page=999`) — last available page is shown, no error
- Idea has 0 votes and 0 comments — counts display as "0", not blank
- Very long idea title or description — title truncated with ellipsis on card; full content shown in overlay without overflow
- Network error while loading feed — error message shown with a retry option
- Idea is deleted by admin while overlay is open — overlay shows a "Diese Idee wurde entfernt" message on next interaction

## Technical Requirements
- Full-text search must run server-side (not client-side filtering)
- Feed must support simultaneous filtering by search + category + sort
- URL state must be maintained for all filter/sort/page/search combinations
- No authentication required for any read operation in this feature

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
