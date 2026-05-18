import { describe, it, expect } from "vitest"

// Extracted truncate logic from IdeaCard — test the pure function directly
function truncate(text: string, max = 150) {
  if (!text) return ""
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text
}

describe("truncate", () => {
  it("returns text unchanged when shorter than max", () => {
    expect(truncate("Short text")).toBe("Short text")
  })

  it("returns empty string for empty input", () => {
    expect(truncate("")).toBe("")
  })

  it("truncates text longer than 150 chars and appends ellipsis", () => {
    const long = "A".repeat(200)
    const result = truncate(long)
    expect(result.endsWith("…")).toBe(true)
    expect(result.length).toBeLessThanOrEqual(151) // 150 chars + "…"
  })

  it("does not truncate text exactly at max length", () => {
    const exact = "B".repeat(150)
    expect(truncate(exact)).toBe(exact)
  })

  it("trims trailing whitespace before adding ellipsis", () => {
    const withSpaces = "A".repeat(148) + "  " + "B".repeat(10)
    const result = truncate(withSpaces)
    expect(result).not.toMatch(/\s…$/)
    expect(result.endsWith("…")).toBe(true)
  })

  it("respects custom max parameter", () => {
    const result = truncate("Hello World, this is a test", 10)
    // slices to first 10 chars ("Hello Worl") then appends "…"
    expect(result).toBe("Hello Worl…")
    expect(result.endsWith("…")).toBe(true)
  })
})

// Test date formatter expectations (pure logic)
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

describe("formatDate", () => {
  it("formats ISO date string to German locale", () => {
    const result = formatDate("2026-01-15T10:00:00Z")
    expect(result).toMatch(/\d+/) // has a day number
    expect(result).toContain("2026")
  })

  it("returns a non-empty string for valid date", () => {
    const result = formatDate("2026-05-18T00:00:00Z")
    expect(result.length).toBeGreaterThan(0)
  })
})
