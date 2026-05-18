# Product Requirements Document

## Vision
VoteBoard ist ein eigenständiges Produkt-Feedback-Board, auf dem Nutzer Ideen einreichen, diskutieren und priorisieren können. Es schafft einen transparenten Kanal zwischen Nutzern und Produktteam und macht sichtbar, welche Features wirklich gefragt sind.

## Target Users
- **Produktnutzer / Community-Mitglieder:** Reichen Ideen ein, stimmen ab und kommentieren, um Einfluss auf die Produktentwicklung zu nehmen.
- **Produkt-Admins:** Moderieren Einreichungen, vergeben Status-Updates und priorisieren Feedback für die Roadmap.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Supabase Infrastructure Setup | Planned |
| P0 (MVP) | User Authentication | Planned |
| P0 (MVP) | Idea Feed & Browse | Roadmap |
| P0 (MVP) | Idea Submission | Roadmap |
| P0 (MVP) | Voting | Roadmap |
| P1 | Comments | Roadmap |
| P1 | Admin Panel | Roadmap |
| P2 | Admin Role Management | Roadmap |

## Success Metrics
- Anzahl eingereichter Ideen (Ziel: 20+ im ersten Monat)
- Aktive abstimmende Nutzer pro Woche
- Anteil der Ideen mit Admin-Status-Update (zeigt aktive Moderation)

## Constraints
- Solo-Entwickler, MVP-Scope
- Separate Supabase-Instanz (unabhängig von der Aktienportfolio-App)
- Design System: siehe `docs/design-system.md`

## Non-Goals
- Keine E-Mail-Benachrichtigungen (z.B. bei Status-Änderungen)
- Kein Analytics-Dashboard
- Keine Integration mit der Aktienportfolio-App
- Keine mobile App
- Kein SSO / OAuth-Login (vorerst nur E-Mail + Passwort)
