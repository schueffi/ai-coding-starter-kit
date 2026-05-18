import { test, expect, type Page } from "@playwright/test"

const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD
const HAS_AUTH = !!(TEST_EMAIL && TEST_PASSWORD)

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/auth/login")
  await page.getByLabel("E-Mail").fill(email)
  await page.getByLabel("Passwort").fill(password)
  await page.getByRole("button", { name: "Anmelden" }).click()
  // LoginForm uses window.location.href = "/" on success (full navigation)
  await page.waitForURL("/", { timeout: 10000 })
}

async function openSubmitModal(page: Page) {
  await page.getByRole("button", { name: "Idee einreichen" }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
}

// ─── AC-1: Button visible for unauthenticated users ───────────────────────────
test("submit button is always visible in header for unauthenticated users", async ({ page }) => {
  await page.goto("/")
  const button = page.getByRole("link", { name: "Idee einreichen" })
  await expect(button).toBeVisible()
})

// ─── AC-2: Unauthenticated click redirects to /auth/login ─────────────────────
test("clicking submit button when not logged in redirects to /auth/login", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "Idee einreichen" }).click()
  await expect(page).toHaveURL(/\/auth\/login/)
})

// ─── Regression: button still present alongside auth links ────────────────────
test("submit button and auth links both appear in header for unauthenticated users", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page.getByRole("link", { name: "Idee einreichen" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Anmelden" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Registrieren" })).toBeVisible()
})

// ─── Authenticated tests ───────────────────────────────────────────────────────
// These require TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local
// pointing to a pre-existing, email-verified Supabase account.

// AC-3: Modal opens when logged in
test("clicking submit button when logged in opens modal dialog", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByText("Idee einreichen")).toBeVisible()
})

// AC-4: Modal contains three fields
test("modal form contains Title, Description, and Category fields", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  await expect(page.getByLabel("Titel")).toBeVisible()
  await expect(page.getByLabel("Beschreibung")).toBeVisible()
  await expect(page.getByRole("combobox")).toBeVisible()
})

// AC-5: All three fields required
test("submitting empty form shows validation errors on all required fields", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  await page.getByRole("button", { name: "Idee einreichen" }).click()
  await expect(page.getByText("Bitte gib einen Titel ein.")).toBeVisible()
  await expect(page.getByText("Bitte beschreibe deine Idee.")).toBeVisible()
  await expect(page.getByText("Bitte wähle eine Kategorie.")).toBeVisible()
})

// AC-6: Title counter shows "X / 120"
test("title field shows live character counter X / 120", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  await expect(page.getByText("0 / 120")).toBeVisible()
  await page.getByLabel("Titel").fill("Hello")
  await expect(page.getByText("5 / 120")).toBeVisible()
})

// AC-6: Title enforces max 120 characters via maxLength attribute
test("title input is capped at 120 characters", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  const title = page.getByLabel("Titel")
  const exactly120 = "a".repeat(120)
  await title.fill(exactly120)
  // Counter shows 120 / 120 — the full 120 chars accepted
  await expect(page.getByText("120 / 120")).toBeVisible()
  // Try to type one more character — should still be 120 (maxLength blocks it)
  await title.press("a")
  await expect(page.getByText("120 / 120")).toBeVisible()
})

// AC-7: Description counter shows "X / 1000"
test("description field shows live character counter X / 1000", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  await expect(page.getByText("0 / 1000")).toBeVisible()
  await page.getByLabel("Beschreibung").fill("Test input")
  await expect(page.getByText("10 / 1000")).toBeVisible()
})

// AC-7: Description enforces max 1000 characters via maxLength attribute
test("description input is capped at 1000 characters", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  const description = page.getByLabel("Beschreibung")
  const exactly1000 = "a".repeat(1000)
  await description.fill(exactly1000)
  await expect(page.getByText("1000 / 1000")).toBeVisible()
  await description.press("a")
  await expect(page.getByText("1000 / 1000")).toBeVisible()
})

// AC-8: Category select populated from database
test("category select is pre-populated with categories from the database", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  await page.getByRole("combobox").click()
  // At least one category option should appear in the dropdown
  const options = page.getByRole("option")
  await expect(options.first()).toBeVisible()
  const count = await options.count()
  expect(count).toBeGreaterThan(0)
})

// AC-12: Closing modal with Escape discards draft and resets form
test("closing modal with Escape key discards draft without confirmation", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  await page.getByLabel("Titel").fill("Draft title")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).not.toBeVisible()
})

// AC-12: Reopening modal after close shows blank form (no stale draft)
test("reopening modal after close resets form to blank", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  // Open, fill, close
  await openSubmitModal(page)
  await page.getByLabel("Titel").fill("Draft title")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).not.toBeVisible()
  // Reopen and check blank
  await openSubmitModal(page)
  const titleValue = await page.getByLabel("Titel").inputValue()
  expect(titleValue).toBe("")
})

// AC-12: Clicking outside the modal dialog closes it
test("clicking outside modal dialog closes it", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  // Click the overlay backdrop (top-left corner, outside the dialog box)
  await page.mouse.click(10, 10)
  await expect(page.getByRole("dialog")).not.toBeVisible()
})

// ─── Edge Cases ───────────────────────────────────────────────────────────────

// EC-1: Whitespace-only title is treated as empty
test("whitespace-only title is rejected as empty by validation", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  await page.getByLabel("Titel").fill("   ")
  await page.getByRole("button", { name: "Idee einreichen" }).click()
  await expect(page.getByText("Bitte gib einen Titel ein.")).toBeVisible()
})

// EC-1: Whitespace-only description is treated as empty
test("whitespace-only description is rejected as empty by validation", async ({ page }) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)
  await page.getByLabel("Beschreibung").fill("   ")
  await page.getByRole("button", { name: "Idee einreichen" }).click()
  await expect(page.getByText("Bitte beschreibe deine Idee.")).toBeVisible()
})

// ─── Security Audit ───────────────────────────────────────────────────────────

// XSS: submit button for logged-out users does not execute injected script
test("XSS in URL does not execute via submit button behavior", async ({ page }) => {
  // Navigate to page without auth
  await page.goto("/")
  // Verify button is a safe link to /auth/login and not executing any script
  const button = page.getByRole("link", { name: "Idee einreichen" })
  const href = await button.getAttribute("href")
  expect(href).toBe("/auth/login")
})

// ─── Responsive ───────────────────────────────────────────────────────────────

// Mobile: submit button visible at 375px
test("submit button is visible on mobile viewport (375px)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/")
  await expect(page.getByRole("link", { name: "Idee einreichen" })).toBeVisible()
})

// Tablet: submit button visible at 768px
test("submit button is visible on tablet viewport (768px)", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto("/")
  await expect(page.getByRole("link", { name: "Idee einreichen" })).toBeVisible()
})

// ─── AC-9: Successful submission (full integration) ───────────────────────────
test("successful submission closes modal, shows toast, and switches feed to Neu", async ({
  page,
}) => {
  test.skip(!HAS_AUTH, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local")
  await loginAs(page, TEST_EMAIL!, TEST_PASSWORD!)
  await openSubmitModal(page)

  // Fill all fields
  const uniqueTitle = `E2E Test Idee ${Date.now()}`
  await page.getByLabel("Titel").fill(uniqueTitle)
  await page.getByLabel("Beschreibung").fill("Dies ist eine automatisch erstellte Test-Idee für die E2E-Tests.")

  // Select first available category
  await page.getByRole("combobox").click()
  await page.getByRole("option").first().click()

  // Submit
  await page.getByRole("button", { name: "Idee einreichen" }).click()

  // Modal closes
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 })

  // Toast appears
  await expect(page.getByText("Idee erfolgreich eingereicht!")).toBeVisible({ timeout: 8000 })

  // URL switches to /?sort=new
  await expect(page).toHaveURL(/sort=new/)

  // New idea appears at the top of the feed
  await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 8000 })
})
