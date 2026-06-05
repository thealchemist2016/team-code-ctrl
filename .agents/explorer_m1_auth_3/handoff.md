# Handoff Report: Database & Auth Investigation (Milestone 1)

This handoff report summarizes the read-only investigation and implementation plan for database extensions and JWT-based cookie authentication.

---

## 1. Observation

Exact observations made within the project workspace (`C:\Users\admin\.gemini\antigravity\scratch\team-code-ctrl`):

* **Database schema**: 
  In `server/db.json` (lines 1-11), users do not have fields representing role, balance, or Terms of Service (ToS) agreement:
  ```json
  "users": [
    {
      "fname": "Michael",
      "lname": "Byrd",
      "email": "michaelbyrd7741@gmail.com",
      "username": "michaelbyrd7741@gmail.com",
      "password": "$2a$10$sbaZciiv/QfxzdluqKVf6uJozLNT66AUzeSRorruB9GoNHrjKnS12",
      "_id": "u-1780631162676"
    }
  ]
  ```
  In `server/db.js` (lines 26-36), `saveUser` does not initialize default roles, balance, or agreement metadata:
  ```javascript
  saveUser: (user) => {
    const data = readData();
    // hash password
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    user.password = bcrypt.hashSync(user.password, salt);
    user._id = 'u-' + Date.now();
    data.users.push(user);
    writeData(data);
    return user;
  }
  ```
* **Unused models**: Mongoose files exist in `server/models/userModel.js`, `albumModel.js`, and `trackModel.js` but are not imported or used by the Express app.
* **Server-side auth routing**:
  * In `server/routes/users.js` (lines 29-37), the `POST /register` route contains no check verifying ToS agreement:
    ```javascript
    router.post('/register', function(req, res, next){
      const { fname, lname, email, username, password } = req.body;
      try {
        db.saveUser({ fname, lname, email, username, password });
        res.status(200).json({ message: "New user registered", success: true });
    ```
  * In `server/middleware.js` (lines 11-17), authentication failures output plain-text responses rather than standardized JSON matching standard REST APIs:
    ```javascript
    if(!token) {
      res.status(401).send('Unauthorized: No token provided');
    } else {
      jwt.verify(token, secret, function(err, decoded) {
        if(err) {
          res.status(401).send('Unauthorized: Invalid token');
    ```
  * In `server/config/passport.js` (lines 1-2), passport is required but lacks strategy configurations.
* **Client-side auth representation**:
  * In `client/xs-records/src/components/register.js` (lines 56-91), the register form gathers names, email, username, and password but has no checkbox for Terms of Service (ToS) agreement.
  * In `client/xs-records/src/routes.js` (lines 12-20), routes are loaded as standard public components without any route guards.
  * In `client/xs-records/src/components/nav.js` (lines 29-41), the navigation bar renders static login and register links regardless of authentication status.

---

## 2. Logic Chain

1. **Sign-up ToS Check**: To comply with **R2: Sign-Up Form** (requiring a checkbox to agree to ToS), the client-side signup form must render a checkbox and block submission if unchecked. For API integrity, the backend `/users/register` handler must verify this flag and return a 400 Bad Request if false.
2. **Access Control & Roles**: To support role-based access control (admin vs user) and retrieve balance values specified in the `PROJECT.md` verify contract:
   - The user record in `db.json` must store a `role` ("user" | "admin") and a `balance` (number).
   - In `db.js`, `saveUser` must default new signups to role `"user"` and balance `0`.
   - The verify route `GET /users/verify` must fetch the user from the database via their username to return their real role and balance.
3. **Route Protection**: Unauthenticated users must be barred from accessing protected views (dashboard, add album, add track). Therefore:
   - Server-side routes `POST /albums/add` and `POST /tracks/add` must apply `withAuth` middleware.
   - Client-side routes in `routes.js` must be wrapped in a React Context-based `<PrivateRoute>` check.
   - Admin-only routes must be protected using a server-side role check (`requireRole('admin')`) and a client-side `<AdminRoute>` guard.

---

## 3. Caveats

* **Mongoose Models**: Mongoose models in `server/models` are obsolete and left unmodified. All user profile storage and lookups are performed directly against `db.json` using the utilities in `server/db.js`.
* **Hardcoded Secret**: The JWT secret is hardcoded as `'gracie'` for compatibility with the existing codebase setup. In a production scenario, it should be loaded from environment variables.

---

## 4. Conclusion

Achieving complete database and authentication security (Milestone 1) requires extending the local database schema (`db.json` / `db.js`), refactoring backend auth logic into controllers (`server/controllers/user.js`), securing Express routers, and implementing a global auth provider (`AuthContext`) and private route guards (`PrivateRoute`, `AdminRoute`) on the client.

A complete implementation plan is written to `analysis.md`.

---

## 5. Verification Method

### Automated Tests
Run client-side mount test:
```powershell
cd client/xs-records
npm test
```

### Manual Verification Path
1. **ToS Registration Enforce**: Attempt to sign up at `/register` with ToS checkbox unchecked. Ensure an error is shown and submission is blocked. Check the box and submit to verify success.
2. **Unauthorized Block**: Visit `/dashboard` directly without logging in. Ensure the app redirects to `/login`.
3. **Authorization & Navigation**: Log in. Ensure you redirect to `/dashboard`, the navbar updates dynamically to show "Hello, <username>", "Logout", "Add Album", and "Add Track".
4. **Endpoint Protection**: Use curl to request creation endpoints without cookies:
   ```bash
   curl -i -X POST http://localhost:3001/albums/add
   ```
   Ensure it fails with status `401` and returns JSON `{ "success": false, "error": "..." }`.
