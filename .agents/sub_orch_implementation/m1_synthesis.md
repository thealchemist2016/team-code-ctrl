# Milestone 1 Synthesis: Database & Auth

## 1. Summary of Consensus
Both Explorer 1 and 2 agreed on the following points:
- **No Mongoose**: The application uses a mock DB `server/db.json` managed synchronously by `server/db.js`. Any database enhancements must be made in `server/db.js` and `server/db.json`.
- **Database Fields**: Add `role` ("admin" or "user"), `balance` (number), and `tosAccepted` (boolean) to the user schema. Seed a default admin user and default regular user.
- **Backend Routes**:
  - Enforce `tosAccepted === true` and validate username/email uniqueness in `POST /users/register`.
  - Add `GET /users/verify` returning `{ success: true, user: { username, role, balance } }`.
  - Add `POST /users/logout` clearing the cookie `token`.
- **Route Security**: Secure `POST /albums/add` and `POST /tracks/add` using the `withAuth` middleware. Resolve the album/track owner from the token's username (`req.username`) instead of client-supplied `req.body.user`.
- **React Frontend**:
  - Implement `AuthContext` to track authenticated state.
  - Implement `ProtectedRoute` to restrict access to `/dashboard`, `/add-album`, and `/add-track`.
  - Update Register form with a Terms of Service checkbox.
  - Dynamically update Navbar links based on login status and role.

## 2. Implementation Instructions

### Step 1: Database Setup (`server/db.js` and `server/db.json`)
- In `server/db.json`, modify the existing users or add:
  - Seed an admin account: username `admin@xsrecords.com`, password hashed, role `admin`.
  - Seed a standard user account: username `michaelbyrd7741@gmail.com`, password hashed, role `user`, balance `197` (or similar).
- In `server/db.js`, add helper methods if needed (e.g. `findUserByUsername`, `findUserByEmail`, `findUserById`, `updateUser`).

### Step 2: Backend Authentication API (`server/routes/users.js` and `server/middleware.js`)
- Update `server/middleware.js` to return JSON on auth failure:
  - Return `res.status(401).json({ success: false, error: 'No token provided' })` instead of text.
  - Add `adminOnly` middleware checking if user role in `db.json` is `admin`.
- In `server/routes/users.js`:
  - Enforce validation for `tosAccepted === true` and uniqueness of username and email.
  - Implement `GET /users/verify` utilizing `withAuth`.
  - Implement `POST /users/logout` to clear cookie `token`.

### Step 3: Secure Release Creation (`server/routes/albums.js` and `server/routes/tracks.js`)
- Import `withAuth` middleware.
- Apply `withAuth` to `POST /albums/add` and `POST /tracks/add`.
- Identify the owner using `req.username` instead of `req.body.user`.

### Step 4: React Global State & Routing Guards (`client/xs-records/src/context/AuthContext.js` and `routes.js`)
- Create `AuthContext.js` providing: `isAuthenticated`, `user`, `login`, `logout`, `loading`.
- Fetch `GET /users/verify` on load to restore session.
- Create `<ProtectedRoute>` wrapping components that require authentication.
- Guard `/dashboard`, `/add-album`, `/add-track`.

### Step 5: Forms & UI Updates (`register.js`, `nav.js`)
- Add a Terms of Service checkbox in `register.js` that must be checked to register.
- Update `nav.js` to check `AuthContext` and show:
  - For logged-in users: Dashboard, Add Album, Logout, and a label: `Hello, <username> (Balance: $<balance>)`.
  - For logged-in admin users: Include a link to the Admin Panel.
  - For guests: Login, Register links.
