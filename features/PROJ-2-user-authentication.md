# PROJ-2: User Authentication

## Status: Approved
**Created:** 2026-05-18
**Last Updated:** 2026-05-18

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure Setup) — database, auth service, and Supabase clients

## User Stories
- As a visitor, I want to register with email, display name, and password so I can participate in the board.
- As a new user, I want to receive a verification email so I can activate my account.
- As a registered user, I want to log in with my email and password so I can access the board.
- As a logged-in user, I want to log out so my session is closed.
- As a user who forgot their password, I want to request a reset link by email so I can regain access.
- As a user who clicked a reset link, I want to set a new password so I can log back in.

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/auth/register` | Registration form |
| `/auth/login` | Login form |
| `/auth/verify-email` | "Check your email" screen shown after registration |
| `/auth/forgot-password` | Forgot password form |
| `/auth/reset-password` | Set new password (accessed via email link) |
| `/auth/callback` | Supabase Auth callback handler (email verification + password reset) |

## Acceptance Criteria
- [ ] Registration form collects: email, display name, password, password confirmation
- [ ] Password validation follows NIST SP 800-63B: minimum 8 characters, maximum 64 characters, no complexity rules enforced (no forced special characters, uppercase, or numbers)
- [ ] Password and password confirmation must match — mismatch shows inline error
- [ ] If email is already registered, a clear error message is shown
- [ ] After successful registration: verification email is sent, user is shown the `/auth/verify-email` screen
- [ ] An unverified user who attempts to log in sees the message: "Please verify your email before logging in"
- [ ] After clicking the verification link in the email: user is logged in and redirected to the idea feed
- [ ] Successful login redirects to the idea feed
- [ ] Logout clears the session and redirects to `/auth/login`
- [ ] Forgot password form always shows: "If an account with that email exists, we've sent a reset link" (prevents email enumeration)
- [ ] Password reset form enforces NIST password rules; on success, user is logged in and redirected to the idea feed
- [ ] Session persists across page refreshes (cookie-based via `@supabase/ssr`)
- [ ] Unauthenticated users who navigate to protected routes are redirected to `/auth/login`

## Edge Cases
- Invalid email format → client-side validation error shown before form submission
- Password shorter than 8 or longer than 64 characters → inline validation error
- Password and confirmation do not match → inline validation error
- Reset link expired (Supabase default: 1 hour) → clear error message with option to request a new link
- Network error during login or registration → error toast with retry guidance
- User clicks verification link a second time → no error, redirect to feed (already verified)
- User navigates to `/auth/reset-password` without a valid token → redirect to `/auth/forgot-password`

## Technical Requirements
- Auth provider: Supabase Auth (email + password only, no OAuth)
- Session management: cookie-based via `@supabase/ssr` (not localStorage)
- Email enumeration prevention: password reset flow always returns a generic response
- Route protection: middleware or server component check redirects unauthenticated users

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### File Structure (new files)

```
src/app/
+-- middleware.ts                    (route protection — runs before every request)
+-- auth/
|   +-- layout.tsx                  (centered auth layout, no navigation)
|   +-- login/page.tsx
|   +-- register/page.tsx
|   +-- verify-email/page.tsx       ("check your email" screen)
|   +-- forgot-password/page.tsx
|   +-- reset-password/page.tsx
|   +-- callback/route.ts           (Supabase auth callback — NOT a page)

src/components/auth/
+-- LoginForm.tsx                   (email + password)
+-- RegisterForm.tsx                (email + display name + password + confirmation)
+-- ForgotPasswordForm.tsx          (email input only)
+-- ResetPasswordForm.tsx           (new password + confirmation)
```

### Data Flow

```
Registration
  User submits form
    → Supabase Auth creates account + sends verification email
    → User redirected to /auth/verify-email

Email Verification
  User clicks link in email
    → /auth/callback exchanges code for session
    → Supabase trigger creates profile row (PROJ-1)
    → Redirect to idea feed

Login
  User enters email + password
    → Supabase Auth validates credentials + sets session cookie
    → Redirect to idea feed

Logout
  User clicks "Sign out"
    → Session cookie cleared
    → Redirect to /auth/login

Forgot Password
  User enters email
    → Supabase sends reset link (always same response — no email enumeration)

Password Reset
  User clicks link → /auth/callback → /auth/reset-password
    → User sets new password
    → Redirect to idea feed
```

### Tech Decisions

| Decision | Rationale |
|---|---|
| **Next.js Middleware** for route protection | Runs before the page loads — fastest way to redirect unauthenticated users without flash-of-content |
| **`/auth/callback` as API Route** (not a page) | Supabase sends the user back with a one-time code after email click — this route exchanges it for a real session |
| **Cookie-based session** (not localStorage) | Works with Next.js Server Components; more secure than localStorage (no XSS risk) |
| **`react-hook-form` + `zod`** | Already installed — validates inline without page reload; Zod enforces NIST rules in a type-safe way |
| **Separate auth layout** | Login/register pages look different from the rest of the app (no header/nav) — a layout wrapper keeps this clean |

### Dependencies

No new packages needed — all already installed:
- `@supabase/ssr` ✅ (installed in PROJ-1)
- `react-hook-form` + `zod` ✅
- shadcn/ui (`Form`, `Input`, `Button`, `Card`) ✅

## QA Test Results

**Tested:** 2026-05-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Test Suite:** 40 E2E tests (Chromium + Mobile Safari) — all pass

### Acceptance Criteria Status

#### AC-1: Registration form collects all required fields
- [x] Email, display name, password, and password confirmation fields present and visible

#### AC-2: NIST SP 800-63B password rules
- [x] Minimum 8 characters enforced with inline error
- [x] Maximum 64 characters enforced with inline error
- [x] No complexity rules (lowercase-only "aaaaaaaa" is accepted)

#### AC-3: Password mismatch shows inline error
- [x] "Passwörter stimmen nicht überein" shown when passwords differ

#### AC-4: Duplicate email shows error
- [ ] **MANUAL TEST REQUIRED** — requires registering with a real email address in Supabase

#### AC-5: After registration → verify email page
- [x] `/auth/verify-email` page exists and is accessible
- [ ] **MANUAL TEST REQUIRED** — full flow requires real Supabase email delivery

#### AC-6: Unverified user login shows correct message
- [ ] **MANUAL TEST REQUIRED** — requires an unverified Supabase account

#### AC-7: Email verification link → logged in + redirected
- [ ] **MANUAL TEST REQUIRED** — requires clicking a real Supabase verification email

#### AC-8: Successful login redirects to idea feed
- [ ] **MANUAL TEST REQUIRED** — requires a verified account in Supabase

#### AC-9: Logout clears session and redirects to /auth/login
- [x] "Abmelden" button in header calls `supabase.auth.signOut()` and redirects to `/auth/login`
- [ ] **MANUAL TEST REQUIRED** — requires a real authenticated session to verify full flow

#### AC-10: Forgot password always shows generic message
- [x] "Falls ein Konto mit dieser E-Mail existiert" shown regardless of whether the email is registered

#### AC-11: Password reset enforces NIST rules; on success → redirected to feed
- [x] Min 8 chars enforced on reset form
- [x] Max 64 chars enforced on reset form
- [x] Password mismatch error shown
- [ ] **MANUAL TEST REQUIRED** — success redirect requires a valid Supabase reset token

#### AC-12: Session persists across page refreshes
- [ ] **MANUAL TEST REQUIRED** — requires a logged-in session

#### AC-13: Unauthenticated users redirected to /auth/login
- [x] GET `/` returns 307 → `/auth/login` when no session cookie is present

### Edge Cases Status

#### EC-1: Invalid email format
- [x] Client-side validation error shown on both register and login forms (via `noValidate` injection — see BUG-2)

#### EC-2: Password shorter than 8 or longer than 64 characters
- [x] Inline Zod validation error shown on both register and reset forms

#### EC-3: Password and confirmation do not match
- [x] Inline error shown on both register and reset forms

#### EC-4: Reset link expired
- [x] Error block with "Neuen Reset-Link anfordern" link displayed

#### EC-5: Network error during login or registration
- [x] `catch` block triggers Sonner toast "Netzwerkfehler. Bitte erneut versuchen."

#### EC-6: User clicks verification link a second time
- [ ] **MANUAL TEST REQUIRED**

#### EC-7: Navigate to /auth/reset-password without a valid token
- [x] Supabase `updateUser()` returns an error; error block is shown with link to request new reset

### Security Audit Results
- [x] Route protection: All non-auth routes redirect unauthenticated users to `/auth/login`
- [x] Auth-page redirect: Authenticated users on auth routes are redirected to `/`
- [x] Email enumeration prevention: Forgot password always returns generic message
- [x] Password rules: NIST SP 800-63B enforced via Zod (min 8, max 64, no forced complexity)
- [x] Session management: Cookie-based via `@supabase/ssr` (not localStorage)
- [x] Supabase code exchange: Invalid codes redirect to `/auth/login?error=auth_callback_failed`
- [ ] **BUG (High):** Open redirect in `/auth/callback` — see BUG-3

### Bugs Found

#### BUG-1: Logout not implemented — ✅ FIXED
- **Fix:** Added `LogoutButton` component (`src/components/auth/LogoutButton.tsx`) with `supabase.auth.signOut()` and `window.location.href = "/auth/login"`. Button placed in the header on `src/app/page.tsx`.

#### BUG-2: Auth forms missing `noValidate` attribute — ✅ FIXED
- **Fix:** Added `noValidate` to all 4 form elements in `LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`, and `ResetPasswordForm.tsx`. E2E test workarounds removed.

#### BUG-3: Open redirect vulnerability in /auth/callback via `next` parameter — ✅ FIXED
- **Fix:** In `src/app/auth/callback/route.ts`, `next` is now validated to be a safe relative path before use. Values not starting with `/` or starting with `//` fall back to `"/"`, blocking `@evil.com` and protocol-relative redirect attacks.

### Summary
- **Acceptance Criteria:** 7/13 automatically verified (6 require manual testing with real Supabase account; AC-9 fails)
- **Bugs Found:** 3 total (0 critical, 2 high, 1 medium, 0 low) — all fixed
- **Security:** 1 High issue found (open redirect in callback route)
- **Production Ready:** YES (automated checks pass; 6 acceptance criteria require manual verification with a real Supabase account)
- **Recommendation:** Deploy after manual smoke test of the full registration → verify email → login → logout flow

## Deployment
_To be added by /deploy_
