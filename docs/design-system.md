# Design System — VoteBoard

> Inspired by softgarden.com — clean, professional, corporate SaaS aesthetic.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#005CA9` | Buttons, links, active states, highlights |
| Primary Dark | `#004A8A` | Hover states on primary |
| Primary Light | `#E8F0F9` | Backgrounds, chips, badges |
| Background | `#FFFFFF` | Page background |
| Surface | `#F7F8FA` | Card backgrounds, sidebars |
| Border | `#E2E6EA` | Card borders, dividers |
| Text Primary | `#1A1F2E` | Headings, body text |
| Text Secondary | `#6B7280` | Metadata, labels, placeholders |
| Success | `#16A34A` | "Umgesetzt" status |
| Warning | `#D97706` | "Geplant" status |
| Danger | `#DC2626` | "Abgelehnt" status, destructive actions |
| Neutral | `#6B7280` | "Offen" status |

## Typography

- **Font Family:** Inter (Google Fonts) — fallback: `system-ui, -apple-system, sans-serif`
- **Headings:** `font-weight: 700` (bold), `font-weight: 600` (semibold) for sub-headings
- **Body:** `font-weight: 400`, `line-height: 1.6`
- **Scale:** Use Tailwind defaults (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`)

## Spacing & Layout

- Max content width: `1200px`
- Page padding: `px-6` on mobile, `px-8` on desktop
- Card padding: `p-6`
- Section spacing: `py-12` to `py-16`
- Generous whitespace — don't crowd elements

## Component Styles

### Buttons
- Primary: `bg-[#005CA9] text-white rounded-lg px-4 py-2 font-medium hover:bg-[#004A8A]`
- Secondary: `border border-[#005CA9] text-[#005CA9] rounded-lg px-4 py-2 hover:bg-[#E8F0F9]`
- Ghost: `text-[#005CA9] hover:bg-[#E8F0F9] rounded-lg px-4 py-2`
- Border radius: `rounded-lg` (8px) — modern but not pill-shaped

### Cards
- Background: `bg-white`
- Border: `border border-[#E2E6EA]`
- Border radius: `rounded-xl` (12px)
- Shadow: `shadow-sm` — subtle, not heavy

### Status Badges
- Offen: `bg-gray-100 text-gray-600`
- Geplant: `bg-amber-50 text-amber-700`
- Umgesetzt: `bg-green-50 text-green-700`
- Abgelehnt: `bg-red-50 text-red-600`

### Inputs
- Border: `border border-[#E2E6EA] rounded-lg`
- Focus: `ring-2 ring-[#005CA9] border-transparent`
- Background: `bg-white`

## Overall Aesthetic

- **Clean and minimal** — lots of white space
- **Professional, not playful** — no heavy gradients, no decorative illustrations
- **Trust-building** — clear hierarchy, readable typography
- **Corporate SaaS** — similar to HR/B2B software tools
