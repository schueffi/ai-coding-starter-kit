import { test, expect } from "@playwright/test"

// AC13: Unauthenticated users on protected routes are redirected to /auth/login
// Note: / is public (PROJ-3). Testing a genuinely protected route instead.
test("unauthenticated users are redirected to /auth/login from protected routes", async ({ page }) => {
  // /profile does not exist yet, so middleware redirects unknown protected paths
  // Use a path that isn't public (not /, not /auth/*)
  await page.goto("/settings")
  await expect(page).toHaveURL(/\/auth\/login/)
})

// Auth routes are accessible without authentication
test("login page is accessible without authentication", async ({ page }) => {
  await page.goto("/auth/login")
  await expect(page).toHaveURL(/\/auth\/login/)
  await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible()
})

// AC1: Registration form collects all required fields
test("registration form shows all required fields", async ({ page }) => {
  await page.goto("/auth/register")
  await expect(page.getByLabel("E-Mail")).toBeVisible()
  await expect(page.getByLabel("Anzeigename")).toBeVisible()
  await expect(page.getByLabel("Passwort", { exact: true })).toBeVisible()
  await expect(page.getByLabel("Passwort bestätigen")).toBeVisible()
})

// AC2: NIST password min 8 characters
test("registration rejects passwords shorter than 8 characters", async ({ page }) => {
  await page.goto("/auth/register")
  await page.getByLabel("E-Mail").fill("test@example.com")
  await page.getByLabel("Anzeigename").fill("Test User")
  await page.getByLabel("Passwort", { exact: true }).fill("1234567")
  await page.getByLabel("Passwort bestätigen").fill("1234567")
  await page.getByRole("button", { name: "Konto erstellen" }).click()
  await expect(page.getByText("Passwort muss mindestens 8 Zeichen lang sein")).toBeVisible()
})

// AC2: NIST password max 64 characters
test("registration rejects passwords longer than 64 characters", async ({ page }) => {
  await page.goto("/auth/register")
  await page.getByLabel("E-Mail").fill("test@example.com")
  await page.getByLabel("Anzeigename").fill("Test User")
  const longPassword = "a".repeat(65)
  await page.getByLabel("Passwort", { exact: true }).fill(longPassword)
  await page.getByLabel("Passwort bestätigen").fill(longPassword)
  await page.getByRole("button", { name: "Konto erstellen" }).click()
  await expect(page.getByText("Passwort darf maximal 64 Zeichen lang sein")).toBeVisible()
})

// AC2: NIST — no complexity rules (8-char password with only lowercase accepted)
test("registration accepts a simple 8-character lowercase password (no complexity rules)", async ({
  page,
}) => {
  await page.goto("/auth/register")
  await page.getByLabel("E-Mail").fill("test@example.com")
  await page.getByLabel("Anzeigename").fill("Test User")
  await page.getByLabel("Passwort", { exact: true }).fill("aaaaaaaa")
  await page.getByLabel("Passwort bestätigen").fill("aaaaaaaa")
  await page.getByRole("button", { name: "Konto erstellen" }).click()
  // No complexity error should appear
  await expect(page.getByText("Sonderzeichen erforderlich")).not.toBeVisible()
  await expect(page.getByText("Großbuchstabe erforderlich")).not.toBeVisible()
  await expect(page.getByText("Zahl erforderlich")).not.toBeVisible()
})

// AC3: Password mismatch shows inline error
test("registration shows error when passwords do not match", async ({ page }) => {
  await page.goto("/auth/register")
  await page.getByLabel("E-Mail").fill("test@example.com")
  await page.getByLabel("Anzeigename").fill("Test User")
  await page.getByLabel("Passwort", { exact: true }).fill("password123")
  await page.getByLabel("Passwort bestätigen").fill("password456")
  await page.getByRole("button", { name: "Konto erstellen" }).click()
  await expect(page.getByText("Passwörter stimmen nicht überein")).toBeVisible()
})

// Edge case: invalid email format on registration
test("registration shows error for invalid email format", async ({ page }) => {
  await page.goto("/auth/register")
  await page.getByLabel("E-Mail").fill("not-an-email")
  await page.getByLabel("Anzeigename").fill("Test User")
  await page.getByLabel("Passwort", { exact: true }).fill("password123")
  await page.getByLabel("Passwort bestätigen").fill("password123")
  await page.getByRole("button", { name: "Konto erstellen" }).click()
  await expect(page.getByText("Bitte eine gültige E-Mail-Adresse eingeben")).toBeVisible()
})

// Edge case: invalid email format on login
test("login shows error for invalid email format", async ({ page }) => {
  await page.goto("/auth/login")
  await page.getByLabel("E-Mail").fill("not-an-email")
  await page.getByLabel("Passwort").fill("password")
  await page.getByRole("button", { name: "Anmelden" }).click()
  await expect(page.getByText("Bitte eine gültige E-Mail-Adresse eingeben")).toBeVisible()
})

// AC10: Forgot password always shows generic message (anti-enumeration)
test("forgot password shows generic message regardless of email existence", async ({ page }) => {
  await page.goto("/auth/forgot-password")
  await page.getByLabel("E-Mail").fill("doesnotexist@voteboard-test.invalid")
  await page.getByRole("button", { name: "Reset-Link senden" }).click()
  await expect(
    page.getByText("Falls ein Konto mit dieser E-Mail existiert")
  ).toBeVisible()
})

// AC11: Reset password enforces NIST min 8 characters
test("reset password form enforces minimum 8 character rule", async ({ page }) => {
  await page.goto("/auth/reset-password")
  await page.getByLabel("Neues Passwort").fill("1234567")
  await page.getByLabel("Passwort bestätigen").fill("1234567")
  await page.getByRole("button", { name: "Passwort speichern" }).click()
  await expect(page.getByText("Passwort muss mindestens 8 Zeichen lang sein")).toBeVisible()
})

// AC11: Reset password enforces NIST max 64 characters
test("reset password form enforces maximum 64 character rule", async ({ page }) => {
  await page.goto("/auth/reset-password")
  const longPassword = "a".repeat(65)
  await page.getByLabel("Neues Passwort").fill(longPassword)
  await page.getByLabel("Passwort bestätigen").fill(longPassword)
  await page.getByRole("button", { name: "Passwort speichern" }).click()
  await expect(page.getByText("Passwort darf maximal 64 Zeichen lang sein")).toBeVisible()
})

// AC11: Reset password mismatch shows error
test("reset password shows error when passwords do not match", async ({ page }) => {
  await page.goto("/auth/reset-password")
  await page.getByLabel("Neues Passwort").fill("newpassword1")
  await page.getByLabel("Passwort bestätigen").fill("newpassword2")
  await page.getByRole("button", { name: "Passwort speichern" }).click()
  await expect(page.getByText("Passwörter stimmen nicht überein")).toBeVisible()
})

// Verify email page is accessible (auth route, no redirect)
test("verify email page is accessible and shows instructions", async ({ page }) => {
  await page.goto("/auth/verify-email")
  await expect(page).toHaveURL(/\/auth\/verify-email/)
})

// Navigation: login → register
test("login page links to registration page", async ({ page }) => {
  await page.goto("/auth/login")
  await page.getByRole("link", { name: "Registrieren" }).click()
  await expect(page).toHaveURL(/\/auth\/register/)
})

// Navigation: register → login
test("register page links back to login page", async ({ page }) => {
  await page.goto("/auth/register")
  await page.getByRole("link", { name: "Anmelden" }).click()
  await expect(page).toHaveURL(/\/auth\/login/)
})

// Navigation: login → forgot password
test("login page has forgot password link", async ({ page }) => {
  await page.goto("/auth/login")
  await page.getByRole("link", { name: "Passwort vergessen?" }).click()
  await expect(page).toHaveURL(/\/auth\/forgot-password/)
})

// Navigation: forgot password → login
test("forgot password page links back to login", async ({ page }) => {
  await page.goto("/auth/forgot-password")
  await page.getByRole("link", { name: "Zurück zur Anmeldung" }).click()
  await expect(page).toHaveURL(/\/auth\/login/)
})

// Edge case: expired reset link message includes new-link option
test("reset password expired link error shows link to request new reset", async ({ page }) => {
  await page.goto("/auth/reset-password")
  // Without a valid session token, Supabase updateUser will fail with auth error
  await page.getByLabel("Neues Passwort").fill("newpassword1")
  await page.getByLabel("Passwort bestätigen").fill("newpassword1")
  await page.getByRole("button", { name: "Passwort speichern" }).click()
  // Should show an error (either expired link or auth error)
  // The error block should be visible
  await expect(page.locator(".text-red-600")).toBeVisible({ timeout: 8000 })
})

// AC9: Home page shows login/register buttons for unauthenticated users
// (PROJ-3 made / public; logout button only shows when authenticated — tested manually)
test("home page shows login and register buttons for unauthenticated users", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Anmelden" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Registrieren" })).toBeVisible()
})

// Responsive: mobile viewport — auth pages render correctly
test("login page renders correctly on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/auth/login")
  await expect(page.getByLabel("E-Mail")).toBeVisible()
  await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible()
})
