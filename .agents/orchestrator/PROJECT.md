# Project: XS-Records Music Distribution Platform

## Architecture
The application is a MERN stack application, but with a local JSON database emulating MongoDB.
- **Server**: Express-based REST API.
  - Data Access: `server/db.js` interacts directly with `server/db.json` using synchronous file read/write operations.
  - Auth: JWT-based auth via cookies (token named `token` signed with secret `gracie`). Route protection middleware is `withAuth` in `server/middleware.js`.
  - File Uploads: Multer middleware storing files under `server/public/uploads/` (divided into `covers`, `audio`, and `documents`).
- **Client**: React SPA (v16.8) built using `reactstrap` and styled with Bootstrap 4.
  - Routing: React Router v5 in `client/xs-records/src/routes.js` and `App.js`.
  - State: Component-level state and React Context API for global authentication (`AuthContext`) and page transitions.

## Milestones

### Implementation Track
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|--------------|--------|-----------------|
| M1 | Database & Auth (R2) | JWT Auth, Sign-Up with TOS, Log-In, access control, admin vs user roles in DB | None | PLANNED | |
| M2 | Profile & Tickets (R3) | Profile page (tax doc upload, address, bank info), support tickets, About & Blogs | M1 | PLANNED | |
| M3 | Release Submission (R3, R5) | Release submission with cover/audio uploads, release tracking counts, balance & withdrawal | M2 | PLANNED | |
| M4 | Admin Dashboard (R4, R5) | Admin views (search, edit users/albums/singles/tickets), downloads (CSV, XML, audio, images) | M3 | PLANNED | |
| M5 | Global Layout & Styling (R1) | Premium Aesthetics, Outfit font, glassmorphism, Home Page, header/menu/footer on all pages | M4 | PLANNED | |
| M6 | Final Verification | Pass 100% of E2E tests & Adversarial coverage hardening | M5, E2E Test Suite | PLANNED | |

### E2E Testing Track
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|--------------|--------|-----------------|
| T1 | E2E Test Suite | Design test infra, Tiers 1-4 tests, publish TEST_READY.md | None | PLANNED | |

## Interface Contracts

### Auth Verification API
- **Endpoint**: `GET /users/verify`
- **Headers**: Cookie `token=<jwt_token>`
- **Response**:
  - `200 OK`: `{ success: true, user: { username: "...", role: "admin|user", balance: 197 } }`
  - `401 Unauthorized`: `{ success: false, error: "..." }`

### Profile Update API
- **Endpoint**: `PUT /users/profile`
- **Body**: `{ address: "...", paypalOrBank: "..." }`
- **Response**:
  - `200 OK`: `{ success: true, user: { ... } }`

### Submit Release API (Multipart Form Data)
- **Endpoint**: `POST /releases/add`
- **Body**: `FormData` containing:
  - `title` (string)
  - `artist` (string)
  - `type` ("album" | "single")
  - `genre` (string)
  - `releaseDate` (string)
  - `cover` (file)
  - `audio` (file or array of files)
- **Response**:
  - `200 OK`: `{ success: true, release: { ... } }`

### Admin Management API
- **Endpoint**: `GET /admin/users`, `GET /admin/releases`, `GET /admin/tickets`
- **Response**:
  - `200 OK`: `{ success: true, data: [ ... ] }`

### Admin Export API
- **Endpoint**: `GET /admin/export/:entity` (e.g. users, albums, singles)
- **Query Params**: `format=csv|xml`
- **Response**: File download (CSV or XML string)

## Code Layout
- **Server**:
  - `server/app.js` - Server entry point
  - `server/db.js` - Local database utilities
  - `server/db.json` - Simulated database
  - `server/middleware.js` - JWT authentication middleware
  - `server/routes/` - Express routers
  - `server/public/uploads/` - Uploaded files folders (covers, audio, documents)
- **Client**:
  - `client/xs-records/src/App.js` - React root component
  - `client/xs-records/src/routes.js` - Route definitions
  - `client/xs-records/src/components/` - React components (Home, Dashboard, Admin, Profile, Release)
  - `client/xs-records/src/context/` - React contexts (AuthContext)
  - `client/xs-records/src/index.css` - Global styling rules
