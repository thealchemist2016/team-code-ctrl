# Handoff Report: Milestone 1 Database & Auth

## 1. Observation

Direct observations made on the codebase:

1. **JSON DB Operations**: In `server/db.js` lines 7–22, operations read/write directly to `server/db.json` using synchronous file APIs:
   ```javascript
   7: const readData = () => {
   ...
   14:     return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
   ...
   20: const writeData = (data) => {
   21:   fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
   22: };
   ```
2. **Missing Mongoose Dependency**: In `server/package.json`, there is no `mongoose` listed in the dependencies.
3. **Missing User Fields**: In `server/db.json` lines 2–11, the user database format lacks fields for `role`, `balance`, and `tosAccepted`:
   ```json
   2:   "users": [
   3:     {
   4:       "fname": "Michael",
   5:       "lname": "Byrd",
   6:       "email": "michaelbyrd7741@gmail.com",
   7:       "username": "michaelbyrd7741@gmail.com",
   8:       "password": "$2a$10$sbaZciiv/QfxzdluqKVf6uJozLNT66AUzeSRorruB9GoNHrjKnS12",
   9:       "_id": "u-1780631162676"
   10:     }
   11:   ]
   ```
4. **Middleware Content Type**: In `server/middleware.js` lines 12 and 16, token errors are sent as plain text:
   ```javascript
   12:     res.status(401).send('Unauthorized: No token provided');
   ...
   16:         res.status(401).send('Unauthorized: Invalid token');
   ```
5. **No Verification, Logout or TOS Validation Route**:
   - `server/routes/users.js` lacks `GET /users/verify` and `POST /users/logout` routes.
   - `server/routes/users.js` register endpoint (lines 29–37) does not query or validate Terms of Service:
     ```javascript
     29: router.post('/register', function(req, res, next){
     30:   const { fname, lname, email, username, password } = req.body;
     31:   try {
     32:     db.saveUser({ fname, lname, email, username, password });
     ```
6. **Unsecured Creation Routes**:
   - `server/routes/albums.js` lines 5–6 lacks authentication checks, and associates the album via `req.body.user`:
     ```javascript
     5: router.post('/add', function(req, res, next) {
     ...
     12:       user: req.body.user
     ```
   - `server/routes/tracks.js` line 5 lacks authentication checks:
     ```javascript
     5: router.post('/add', function(req, res, next) {
     ```
7. **Frontend Forms & Route Guard Absence**:
   - `client/xs-records/src/components/register.js` lines 64–86 lacks any input checkbox for agreeing to the Terms of Service.
   - `client/xs-records/src/routes.js` lines 12–20 imports and uses standard React Router `<Route>` tags without checking user auth state:
     ```javascript
     13:   <Switch>
     14:     <Route path="/dashboard" exact component={Dashboard} />
     ```
   - `client/xs-records/src/components/nav.js` lines 29–41 displays hardcoded "Login" and "Register" routes irrespective of login state.

---

## 2. Logic Chain

1. **Mongoose Is Unused**: Because `server/package.json` does not include `mongoose` and all core controllers interact via `server/db.js` to modify `server/db.json` synchronously (Observation 1, 2), the files under `server/models/` are dead code. Any updates to user roles, balances, or other schemas must be executed by altering the helper functions in `server/db.js` and updating `server/db.json` directly.
2. **Access Control Needs Verify Endpoint**: Because there is no token verification endpoint on the server (Observation 5) and the client routes are unguarded (Observation 7), we must implement a `GET /users/verify` endpoint returning a JSON payload of the logged-in user profile, and create a custom React `<ProtectedRoute>` component utilizing React Context to guard client routes.
3. **Register Requires TOS Check**: Because the React register form does not include a Terms of Service checkbox (Observation 7) and the backend register endpoint does not check for agreement (Observation 5), we must add an `agreeToTOS` checkbox to the form state/render, update the server side `/users/register` handler to reject the request if the checkbox is unchecked, and record `tosAccepted: true` in `db.json`.
4. **Vulnerability in Release Routes**: Because `POST /albums/add` and `POST /tracks/add` are unguarded (Observation 6) and map user ownership via `req.body.user` instead of `req.username` (Observation 6), any user or unauthenticated visitor can create albums or tracks and assign them to any other user. Thus, we must apply `withAuth` to both endpoints, and resolve the owner user ID on the server side using the decoded token username.
5. **Admin Access Needs Separation**: Because the database does not distinguish roles (Observation 3) and there is no admin middleware, we must introduce a `role` attribute (`admin` vs `user`), seed a default admin account in `db.json`, and implement an `isAdmin` middleware in `server/middleware.js` to restrict admin dashboard routes.

---

## 3. Caveats

- **Mock Session Management**: The server uses Express Session (`app.use(session({secret: 'gracie', ...}))`) and passport initialization, but passport setup is completely empty and session is only used to store `lastAlbumId` for track creation. Our design leverages stateless JWT cookies for auth, which is the most robust and secure approach.
- **Admin Dashboard Integration**: The design of the Admin Dashboard itself is scoped under Milestone 4, but our implementation plan ensures the structural foundation (the `isAdmin` middleware, database roles, and React `AdminRoute` layout) is ready in this milestone.

---

## 4. Conclusion

The implementation plan is scoped, actionable, and addresses every requirement of Milestone 1. It establishes:
1. **User Schema Evolution**: Add `role`, `balance`, and `tosAccepted` properties. Seed a default Admin user.
2. **Secure JWT Cookie Authentication**: Return JSON error responses from authentication middleware, build `GET /users/verify` and `POST /users/logout` endpoints.
3. **Strict Route Protection**: Apply token verification to `/albums/add` and `/tracks/add`. Map release ownership using the token username rather than client-supplied request bodies.
4. **React Client Guards**: Construct a global `AuthContext` to fetch/store authentication status. Apply `ProtectedRoute` to `/dashboard`, `/add-album`, and `/add-track`. Incorporate a Terms of Service checkbox in the register page and dynamic links in the navbar.

---

## 5. Verification Method

Once the implementation is complete, it can be verified via the following steps:

1. **Database Schema Verification**:
   Inspect `server/db.json`. Ensure the seeded users match the updated layout (containing `role: "admin"` or `"user"`, `balance: 197` or `0`, and `tosAccepted: true`).
2. **Server API Verification**:
   Submit login request (`POST /users/login`) with valid credentials. Verify response returns `200 OK`, response body is JSON, and a `token` cookie is set.
   Call `GET /users/verify`. Confirm that with a valid cookie, it returns:
   `200 OK` and `{ success: true, user: { username: "...", role: "admin|user", balance: 197 } }`.
   Call `GET /users/verify` without a token. Confirm it returns `401 Unauthorized` and `{ success: false, error: "..." }`.
3. **TOS Verification**:
   Submit register request (`POST /users/register`) with `agreeToTOS` set to `false`. Ensure it fails with `400 Bad Request`.
4. **Client-side Guards**:
   Attempt to navigate to `/dashboard` while unauthenticated. Confirm the user is automatically redirected to `/login`.
