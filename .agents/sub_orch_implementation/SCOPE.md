# Scope: Implementation Track - Music Distribution Platform

## Architecture & Code Layout
- Link to Global Project Document: [PROJECT.md](../orchestrator/PROJECT.md)
- Client-side: React SPA at `client/xs-records`
- Server-side: Express API at `server`
- Database: Local JSON database at `server/db.json` managed via `server/db.js`.
- File Uploads: Multer storing files locally in `server/public/uploads/` split into `covers/`, `audio/`, and `documents/`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Database & Auth | JWT auth via cookies, user Sign-Up with TOS acceptance, Log-In, access controls, support for admin vs user roles in `db.json`. | None | PLANNED |
| M2 | Profile & Tickets | Profile page (tax doc upload, address details, PayPal/Bank info), Support Tickets system (create, reply, track), and About/Blogs pages. | M1 | PLANNED |
| M3 | Release Submission | Release submission with cover/audio uploads (album/single types, genre, release date), release tracking counts, user balance and withdrawal requests. | M2 | PLANNED |
| M4 | Admin Dashboard | Admin view to search, edit users/albums/singles/tickets, and download CSV, XML, audio files, and images exports. | M3 | PLANNED |
| M5 | Global Layout & Styling | Premium Aesthetics: Outfit font, dark mode, glassmorphism, responsive sidebar layout, Home Page, header/menu/footer on all pages. | M4 | PLANNED |
| M6 | E2E Integration | Final integration and verification: pass 100% of E2E tests and perform adversarial coverage hardening (Phase 2). | M5 | PLANNED |

## Interface Contracts
- Detailed in [PROJECT.md](../orchestrator/PROJECT.md)
