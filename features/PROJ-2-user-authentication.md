# PROJ-2: User Authentication

## Status: Architected
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
_To be added by /qa_

## Deployment
_To be added by /deploy_
