# PROJ-4: Idea Submission

## Status: Planned
**Created:** 2026-05-18
**Last Updated:** 2026-05-18

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure Setup) — ideas and categories tables
- Requires: PROJ-2 (User Authentication) — only authenticated users can submit

## User Stories
- As a logged-in community member, I want to submit a new idea via a modal dialog so that I can share feedback without leaving the feed.
- As a logged-in community member, I want live character counters on title and description so that I know when I'm approaching the character limits.
- As a logged-in community member, I want to see my newly submitted idea at the top of the feed immediately after submitting so that I get confirmation it was received.
- As a visitor (not logged in), I want the "Idee einreichen" button to always be visible so that I know the feature exists and am prompted to register.
- As a logged-in community member, I want a clear error message inside the modal if my submission fails so that I can fix the problem without losing my input.

## Pages & Routes

| Element | Description |
|---------|-------------|
| Header button | "Idee einreichen" — visible on `/` for all users |
| Modal | Opens over the feed; no page navigation |

## Acceptance Criteria
- [ ] An "Idee einreichen" button is always visible in the feed header, for both logged-in and logged-out users
- [ ] Clicking the button when not logged in redirects to `/auth/login`
- [ ] Clicking the button when logged in opens a modal dialog with a submission form
- [ ] The form contains three fields: Title (text input), Description (textarea), Category (select)
- [ ] All three fields are required; attempting to submit with any field empty shows a validation error on that field
- [ ] Title field has a maximum of 120 characters; a live counter displays "X / 120" below the field
- [ ] Description field has a maximum of 1000 characters; a live counter displays "X / 1000" below the field
- [ ] The Category select is pre-populated with all existing categories from the database
- [ ] On successful submission: the modal closes, a toast "Idee erfolgreich eingereicht!" appears, and the feed switches to "Neu" sort so the new idea appears at the top
- [ ] If the API call fails, an inline error message is shown inside the modal; the user's input is preserved so they can retry
- [ ] The submit button shows a loading state while the request is in flight and cannot be double-clicked
- [ ] Closing the modal (Escape key or clicking outside) discards the draft with no confirmation prompt

## Edge Cases
- User submits with only whitespace in title or description → treated as empty, validation error shown
- User types exactly 120 characters in the title → allowed and submittable; 121st character is blocked by the input
- User types exactly 1000 characters in description → allowed; 1001st character is blocked
- User closes and reopens the modal → form resets to blank (no stale draft retained)
- User not logged in clicks "Idee einreichen" → redirected to `/auth/login`; after login they return to `/` and can open the modal again
- Network timeout or 500 error during submission → inline error shown, form data preserved, user can retry
- Category list fails to load (Supabase error) → submit button disabled, error message shown in modal
- Very long unbroken word in title (no spaces) → title truncates with `overflow-hidden` / `break-words` styling, does not break layout
- Two tabs submit the same idea simultaneously → second submission creates a separate idea (no deduplication for MVP)

## Technical Requirements
- Authentication required to submit (server-side check, not just client-side)
- Title and description validated both client-side (instant feedback) and server-side (security)
- Category ID validated server-side to ensure it exists in the categories table
- Input sanitization: title and description stored as plain text; no HTML rendering

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
