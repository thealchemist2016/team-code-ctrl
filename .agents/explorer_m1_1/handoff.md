# Handoff Report: Protected Routes & Auth

## 1. Observation

Direct observations made on files inside the `team-code-ctrl` repository:

- **Missing Backend Routes**: In `server/routes/users.js`, there are no routes matching `/verify` or `/logout`. The file contains only `router.post('/login')` (lines 8-27), `router.post('/register')` (lines 29-37), and a dummy `router.get('/dashboard')` (lines 39-41).
- **Unprotected Backend APIs**:
  - In `server/routes/albums.js` (lines 5-20), the `POST /add` route uses:
    ```javascript
    router.post('/add', function(req, res, next) {
      try {
        const album = db.saveAlbum({ ... user: req.body.user });
    ```
    This lacks standard `withAuth` middleware and reads the `user` field from request body parameters directly instead of resolving it from cookie session state.
  - In `server/routes/tracks.js` (lines 5-24), `POST /add` is also unprotected.
- **Client-side Routes**: In `client/xs-records/src/routes.js` (lines 12-20), all routing components are loaded without protection:
  ```javascript
  export default () => 
    <Switch>
      <Route path="/dashboard" exact component={Dashboard} />
      <Route path="/login" exact component={Login} />
      <Route path="/register" exact component={Register} />
      <Route path="/" exact component={Home} />
      <Route path="/add-album" exact component={AddAlbum} />
      <Route path="/add-track" exact component={AddTrack} />
    </Switch>;
  ```
- **Lack of Auth Context**: `find_by_name` search of `client/xs-records/src` lists no context provider or folder directory named `context` for managing authentication state globally.
- **Client App Root**: `client/xs-records/src/App.js` does not contain any provider wrappers or global authentication state on render (lines 15-22).
- **Login Component Layout**: `client/xs-records/src/components/login-form.js` performs `fetch('/users/login')` internally on submission and sets a local redirect state flag (lines 30-40) rather than calling a centralized authentication service.
- **Navbar Layout**: `client/xs-records/src/components/nav.js` has static navigation links showing only "Login" and "Register" unconditionally (lines 30-39).

---

## 2. Logic Chain

1. **Backend Auth Verification**:
   - Because `PROJECT.md` specifies a required verification endpoint `GET /users/verify` (accepting a JWT token cookie and returning user information in JSON format), the backend routes must be extended.
   - We can implement this in `server/routes/users.js` using the existing `withAuth` middleware, which parses the token cookie and extracts `req.username`.

2. **Backend Logout**:
   - Because `PROJECT.md` specifies a logout endpoint `POST /users/logout` that clears the cookie `token`, we must add this endpoint in `server/routes/users.js` using `res.clearCookie('token')`.

3. **Backend Middleware Checks**:
   - Because the database schema links albums to users via `user` ID references (observed in `server/db.js` where `db.saveAlbum` is defined) and the current code uses unauthenticated request parameters, adding the `withAuth` middleware is necessary to securely resolve `req.username` to `userObj._id`.
   - Applying `withAuth` to both `POST /albums/add` and `POST /tracks/add` aligns with the mandate to enforce authenticated backend access.

4. **Client-side Protected Routes**:
   - In order to prevent unauthenticated users from visiting `/dashboard`, `/add-album`, and `/add-track`, we must introduce a custom React component `<PrivateRoute>` that reads authentication state and redirects to `/login` if not logged in.
   - To avoid flashing the login screen or premature redirects when the app first loads, this component should respect a `loading` state from the context provider while it validates the session with `GET /users/verify`.

5. **Auth Context**:
   - Because authentication status must trigger dynamic state updates (such as hiding/showing navigation links in `<AppNav>` and handling page access in `<PrivateRoute>`), implementing a React Context provider (`AuthContext`) is required to distribute authentication status, user information, login handlers, and logout callbacks across the app.

---

## 3. Caveats

- **Network Requests Proxied**: The client-side is configured with `"proxy": "http://localhost:3001"` in `client/xs-records/package.json`. In production build scenarios, static serving by Express (`app.use(express.static(...))`) is standard. Both setups treat requests as same-origin, enabling automatic cookie transfer.
- **Third-Party State / Cookies**: The backend sets `httpOnly` cookies. Secure/SameSite parameters have not been set, which is appropriate for localhost environment testing.
- **No Class to Functional Refactor**: We keep client components as React Class Components as originally written, integrating the context via `static contextType = AuthContext` or wrapping components where necessary to limit the refactoring scope and avoid layout issues.

---

## 4. Conclusion

Implementing client-side route protection and backend auth APIs requires:
1. Standardizing `withAuth` middleware to output JSON errors.
2. Adding `/verify` and `/logout` routes inside `server/routes/users.js`.
3. Protecting `/albums/add` and `/tracks/add` routes with `withAuth` middleware and correcting user mapping in the database.
4. Implementing `AuthContext.js` and `PrivateRoute.js` in the React frontend.
5. Connecting `App.js`, `routes.js`, `nav.js`, and `login-form.js` to the global auth state.

The proposed code changes in `analysis.md` provide a complete and direct path to achieve these objectives safely.

---

## 5. Verification Method

To independently verify the implementation, follow these steps:

### Manual Verification
1. Run backend server:
   ```powershell
   cd server
   npm install
   npm start
   ```
2. Run frontend client:
   ```powershell
   cd client/xs-records
   npm install
   npm start
   ```
3. Open a browser and visit `http://localhost:3002/dashboard`.
   - **Expectation**: Redirects to `http://localhost:3002/login` because you are unauthenticated.
4. Try to navigate to `/add-album` and `/add-track` directly in address bar.
   - **Expectation**: Both must redirect to `/login`.
5. Register a new user (`/register`) and log in (`/login`).
   - **Expectation**: Redirects to `/dashboard`. The navbar shows "Hello, <username>" along with "Dashboard", "Add Album", and "Logout" links. "Login" and "Register" links are hidden.
6. Click "Logout" on the Navbar.
   - **Expectation**: Clears session, hides protected navbar links, and redirects back to `/login` or `/`. Direct navigation back to `/dashboard` must now fail and redirect again.

### API Contract Testing
Verify backend endpoints using curl:
- **Verify Unauthenticated**:
  ```bash
  curl -i http://localhost:3001/users/verify
  ```
  Expected status: `401 Unauthorized` with body `{ "success": false, "error": "..." }`.
- **Logout**:
  ```bash
  curl -i -X POST http://localhost:3001/users/logout
  ```
  Expected status: `200 OK` and a cookie header resetting `token`.
