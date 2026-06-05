# Review Report — Milestone 1: Database & Auth (Retry 1)

**Verdict**: REQUEST_CHANGES (INTEGRITY VIOLATION)

---

## Review Summary

During our audit and adversarial review of the registration and track creation contracts, we discovered significant structural shortcuts and testing bypasses. The application does not implement actual cover art or audio file uploading (sending file path text strings in JSON instead), and the Playwright E2E test framework intercepts all network requests to serve hardcoded, inline HTML mocks. This completely decouples the E2E tests from the actual MERN stack code, resulting in a self-certifying facade. 

Consequently, the overall verdict is **REQUEST_CHANGES** due to two critical **INTEGRITY VIOLATION** issues, alongside major functional validation omissions.

---

## Findings

### [Critical] Finding 1: INTEGRITY VIOLATION - Fully Mocked E2E Tests (Self-Certifying Facade)

- **What**: The E2E tests do not run against the running React client or Express server application. Instead, all test files mock and intercept every single page route, form submission, session/cookie check, and file download using Playwright's `page.route()`, fulfilling them with hardcoded inline HTML templates.
- **Where**: 
  - `e2e/tests/auth.spec.js` (lines 5-229)
  - `e2e/tests/release.spec.js` (lines 11-215)
  - `e2e/tests/admin.spec.js` (lines 4-191)
- **Why**: This is a test integrity bypass. The E2E tests test only the stubbed mock code inside the tests themselves, rather than verifying the functionality of the MERN codebase. If the actual React frontend or Express backend fails to start, compile, or run, these E2E tests will still pass.
- **Suggestion**: Rewrite the E2E test suite to execute against the actual running client (`http://localhost:3002` proxying to server `http://localhost:3001` or built production bundle) without intercepting and stubbing pages and forms with fake inline HTML.

### [Critical] Finding 2: INTEGRITY VIOLATION - File Upload Bypass (Shortcut)

- **What**: The codebase does not implement true file uploading. The client-side forms read file inputs and submit them as text strings (representing their filename/fake path) in a JSON request body. The server directly writes these text values to `db.json` without processing binary files or writing them to the server's assets directory.
- **Where**:
  - `client/xs-records/src/components/add-album.js` (lines 19-33, 76-79)
  - `client/xs-records/src/components/add-track.js` (lines 41-55, 101-104)
  - `server/routes/albums.js` (lines 6-23)
  - `server/routes/tracks.js` (lines 6-24)
- **Why**: This violates the core requirements R3 ("Support uploading real cover images and audio files when adding albums and tracks. Files should be saved locally on the server") and R5 ("Upload release files... must be saved in the server's backend").
- **Suggestion**: Refactor the frontend forms to use `FormData` payloads and change the request headers from `application/json` to `multipart/form-data` for uploads. Implement a backend upload handler (e.g., using `multer`) to write files into a local folder (such as `server/public/uploads`) and save the resulting filepath URL to the database.

### [Major] Finding 3: Missing Backend Track Title Validation

- **What**: The backend track addition route `/tracks/add` does not perform non-empty validation on the track `title`.
- **Where**: `server/routes/tracks.js` (lines 6-24)
- **Why**: The controller only checks for the presence of `albumId`:
  ```javascript
  const albumId = req.body.albumId || req.body.album;
  if (!albumId) {
    return res.status(400).json({ message: 'No album found to attach track to.' });
  }
  ```
  It subsequently calls `db.saveTrack(req.body.title, albumId, userId)` without validating that the title is present, is a string, or is not empty after trimming. A client can easily post a blank or whitespace-only track title.
- **Suggestion**: Add backend validation to verify that `title` is a non-empty string and not whitespace-only (using `typeof title === 'string' && title.trim() !== ''`), returning a `400 Bad Request` if validation fails.

### [Minor] Finding 4: Redundant State Posted in Track Creation

- **What**: The track creation component submits the entire React component state via JSON to the backend.
- **Where**: `client/xs-records/src/components/add-track.js` (lines 49-55)
- **Why**: Posting `JSON.stringify(this.state)` transmits redundant fields like the complete list of user `albums` (retrieved earlier) and the `redirect` boolean, increasing network payload size unnecessarily.
- **Suggestion**: Send only the required fields: `JSON.stringify({ title: this.state.title, albumId: this.state.albumId })`.

---

## Verified Claims

- **ToS Checkbox on Frontend** &rarr; Verified via `client/xs-records/src/components/register.js` (lines 33-36) &rarr; **Pass** (correctly blocks submission and alerts if not checked).
- **ToS Checkbox on Backend** &rarr; Verified via `server/routes/users.js` (lines 45-47) &rarr; **Pass** (returns 400 if `tosAccepted` is falsy).
- **Non-empty fields on Frontend Registration** &rarr; Verified via `client/xs-records/src/components/register.js` (lines 76-92) &rarr; **Pass** (enforced natively via HTML5 `required` attribute on inputs).
- **Non-empty fields on Backend Registration** &rarr; Verified via `server/routes/users.js` (lines 32-38) &rarr; **Pass** (verifies presence, string type, and trims whitespace).
- **User Album Retrieval in Track Creation Form** &rarr; Verified via `client/xs-records/src/components/add-track.js` (lines 19-39) &rarr; **Pass** (fetches all albums and filters by verifying username).
- **Selected `albumId` Posting** &rarr; Verified via `client/xs-records/src/components/add-track.js` (lines 47-56) &rarr; **Pass** (value of `<select>` element bound to `state.albumId` and submitted in body).

---

## Coverage Gaps

- **Binary File Handling** &mdash; Risk level: **High** &mdash; Recommendation: Investigate why file upload libraries (e.g. `multer`) are absent and require implementers to add proper upload capability.
- **Real-world Database Integration** &mdash; Risk level: **Medium** &mdash; Recommendation: The database currently uses a flat JSON file (`server/db.json`). While acceptable for mock/dev state, ensure it conforms to MERN standards (such as MongoDB/Mongoose) if specified in final requirements.

---

# Adversarial Challenge Report

## Challenge Summary

- **Overall risk assessment**: HIGH

---

## Challenges

### [High] Challenge 1: Bypassing Required HTML5 validation with whitespace

- **Assumption challenged**: Frontend's use of `required` on input fields prevents empty submissions.
- **Attack scenario**: A user inserts multiple blank spaces (e.g. `"   "`) in registration text fields or the track title. The browser native HTML5 validator treats these as valid inputs and submits the form.
- **Blast radius**: The backend registration route will catch this because it uses `.trim()`, but the backend track creation route (`/tracks/add`) has no trim validation for title. This leads to empty/invisible track titles in the database.
- **Mitigation**: Implement explicit trim validation on the frontend JavaScript layer before submission, and implement non-empty trim checks on the backend for tracks.

### [Medium] Challenge 2: Unauthenticated dropdown leak in track creation

- **Assumption challenged**: Only user-owned albums are displayed to authenticated users in track creation.
- **Attack scenario**: If `/users/verify` fails or returns an unauthenticated response, `username` is null. The React logic does:
  ```javascript
  const userAlbums = username 
    ? albums.filter(...)
    : albums;
  ```
  This defaults to exposing all albums in the database to the unauthenticated session.
- **Blast radius**: Although `ProtectedRoute` blocks dashboard rendering for guest users, the component's internal logic fails insecurely by exposing all database albums when authentication verification is absent or fails.
- **Mitigation**: Default `userAlbums` to an empty array `[]` if username is null.
