# Handoff Report — Explorer 3 (Milestone 1)

## 1. Observation
I directly observed the following configuration details in the codebase:

* **Frontend Routing (`client/xs-records/src/routes.js` lines 12-20)**:
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
  The routes `/dashboard`, `/add-album`, and `/add-track` are unprotected.

* **Server Routing (`server/routes/users.js`)**:
  There are no endpoint definitions for `GET /users/verify` or `POST /users/logout`. Only `POST /login`, `POST /register`, and `GET /dashboard` (which currently returns a plain-text message `'The dashboard'`) are defined.

* **Authorization Middleware (`server/middleware.js` lines 11-21)**:
  ```javascript
  if(!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if(err) {
        res.status(401).send('Unauthorized: Invalid token');
  ```
  The failure logic sends plain text instead of structured JSON objects.

* **Album Creation Handler (`server/routes/albums.js` lines 5-20)**:
  ```javascript
  router.post('/add', function(req, res, next) {
    try {
      const album = db.saveAlbum({
        albumName: req.body.albumName,
        numberOfTracks: parseInt(req.body.numberOfTracks),
        artist: req.body.artist,
        cover: req.body.cover,
        user: req.body.user
      });
  ```
  This endpoint does not use the `withAuth` middleware. It relies on the client sending `req.body.user` to associate the album with a user, but the client does not send this parameter.

* **Track Creation Handler (`server/routes/tracks.js` lines 5-24)**:
  This endpoint does not use the `withAuth` middleware.

---

## 2. Logic Chain
1. **Unprotected Front-end Routes**: Since `/dashboard`, `/add-album`, and `/add-track` are implemented using standard `Route` components rather than a protected wrapper component, any unauthenticated client can navigate directly to these routes (Observation 1).
2. **Missing Frontend State and Context**: In order to make routing conditional, a global React Context (`AuthContext`) must be available to distribute the current user's session state.
3. **Missing Auth Verification/Logout APIs**: To populate the `AuthContext` on mount and clear it on exit, the backend must supply `GET /users/verify` and `POST /users/logout` APIs (Observation 2).
4. **Incorrect JSON Format**: The current verification middleware `withAuth` responds with text on failure (Observation 3). This violates the JSON-only contract specified in `PROJECT.md` for interface interactions (such as verify returning `{ success: false, error: "..." }`).
5. **Vulnerable and Buggy Creations**: Because the `/albums/add` and `/tracks/add` routes lack `withAuth`, any client can POST new data without a token (Observations 4 and 5). Furthermore, since `req.body.user` is undefined, new albums get assigned to "Guest" (Observation 4). To solve this, the backend must apply `withAuth` to extract `req.username`, retrieve the corresponding user object's `_id` from the database, and link it during creation.

---

## 3. Caveats
* **Google OAuth / JWT Strategy**: There are boilerplate files referencing passport and passport-jwt in `server/config/passport.js` and `server/package.json` but they are not functional. Custom JWT token issuance and cookie parsing are already handling user auth. We assume the custom token mechanism is the standard path to follow, which aligns with `PROJECT.md` specifications.
* **OpenSSL Legacy Mode**: The frontend environment depends on the `--openssl-legacy-provider` flag to start. Testing environment must match this runtime condition.

---

## 4. Conclusion
To complete Milestone 1, the implementer needs to:
1. **Update Middleware**: Change `server/middleware.js` to respond with JSON instead of text.
2. **Create New API Endpoints**: Add `GET /users/verify` and `POST /users/logout` to `server/routes/users.js`.
3. **Secure Creation APIs**: Add `withAuth` middleware to `/albums/add` and `/tracks/add`. In `/albums/add`, query the database for the user ID matching `req.username` and assign it as the owner of the album.
4. **Implement Global State**: Create `client/xs-records/src/context/AuthContext.js` and wrap the app in `index.js`.
5. **Create Guarded Component**: Implement `client/xs-records/src/components/PrivateRoute.js`.
6. **Protect Client Routes**: Modify `client/xs-records/src/routes.js` to use `PrivateRoute` for `/dashboard`, `/add-album`, and `/add-track`.
7. **Refactor Navbar and Login Form**: Convert `login-form.js` and `nav.js` to functional components that consume `AuthContext`.

---

## 5. Verification Method
After implementation, verification should be performed using the following steps:
1. Run the application:
   * Execute `npm install` in both the server and client subfolders.
   * Run `npm run dev` in the project root folder.
2. Verify frontend redirect routing:
   * Open a browser and try accessing `http://localhost:3002/dashboard`. It should redirect to `http://localhost:3002/login`.
3. Verify registration & login:
   * Navigate to `http://localhost:3002/register`, fill out the registration form, and submit.
   * Navigate to `http://localhost:3002/login`, enter credentials, and log in. You should be redirected to the dashboard.
   * Verify that the navbar options change to show "Dashboard", "Add Album", "Add Track", and "Logout".
4. Verify backend protected APIs:
   * Execute a POST to `http://localhost:3001/albums/add` using curl or Postman without the cookie. The response should be a `401 Unauthorized` status and JSON format:
     ```json
     { "success": false, "error": "Unauthorized: No token provided" }
     ```
5. Verify album creation ownership:
   * While logged in, add an album and tracks.
   * Verify that the database `db.json` populates the `user` field of the created album with your account's `_id` (e.g. `u-xxxxxxxxxxxxx`) instead of `null` or `undefined`.
6. Verify logout:
   * Click the "Logout" link. Accessing `/dashboard` should immediately fail and redirect back to `/login`.
