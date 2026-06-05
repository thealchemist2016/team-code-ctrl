# Scope: E2E Test Suite for Music Distribution Platform

## Architecture
- The E2E test suite is opaque-box, requirement-driven, and exercises the built application from an end-user perspective.
- Tests will run against the active application:
  - Backend API on `http://localhost:3001`
  - Frontend SPA on `http://localhost:3002`
- The test suite will be located in the `e2e-tests` directory under the project root.
- A test runner script will launch/manage the server and client, run tests, and report results.
- Tests will utilize a headless browser framework (e.g. Puppeteer/Playwright) to perform true user-level UI flow verification, and optionally axios for API-level contract verification.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|--------------|--------|-----------------|
| T1 | Test Infrastructure Design | Create `TEST_INFRA.md`, determine framework, lay out directory structure | None | PLANNED | |
| T2 | E2E Runner & Helpers | Implement test runner, launch/teardown code, and authentication/upload utilities | T1 | PLANNED | |
| T3 | Tier 1 Feature Coverage | Implement Tier 1 tests (happy-path, >= 5 cases per feature) | T2 | PLANNED | |
| T4 | Tier 2 Boundary & Corner Cases | Implement Tier 2 tests (boundaries, errors, invalid files, >= 5 cases per feature) | T3 | PLANNED | |
| T5 | Tier 3 Cross-Feature Combinations | Implement Tier 3 tests (pairwise interactions between auth, profile, release, admin, etc.) | T4 | PLANNED | |
| T6 | Tier 4 Real-World Scenarios | Implement Tier 4 tests (complex multi-step user workflows and application scenarios) | T5 | PLANNED | |
| T7 | Final Validation & Publication | Run all tests, ensure 100% pass, generate report, and publish `TEST_READY.md` | T6 | PLANNED | |

## Interface Contracts
- Frontend Base URL: `http://localhost:3002`
- Backend API Base URL: `http://localhost:3001`
- Local storage directories: `server/public/uploads/` (divided into `covers`, `audio`, and `documents`)
- Auth Verification API: `GET /users/verify` (JWT token cookie)
- Profile Update API: `PUT /users/profile` (update address/payment details)
- Submit Release API: `POST /releases/add` (add release metadata with cover and audio files)
- Admin Management API: `GET /admin/users`, `GET /admin/releases`, `GET /admin/tickets` (retrieve admin data)
- Admin Export API: `GET /admin/export/:entity` (CSV/XML export downloads)
