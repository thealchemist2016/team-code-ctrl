# Handoff Report — Explorer 2 (Milestone 1: Database & Auth)

## 1. Observation
We have inspected the database model and authentication setup files. Verbatim quotes and details from files:

1. **Local Database Schema (`server/db.json`)**:
   ```json
   {
     "users": [
       {
         "fname": "Michael",
         "lname": "Byrd",
         "email": "michaelbyrd7741@gmail.com",
         "username": "michaelbyrd7741@gmail.com",
         "password": "$2a$10$sbaZciiv/QfxzdluqKVf6uJozLNT66AUzeSRorruB9GoNHrjKnS12",
         "_id": "u-1780631162676"
       }
     ],
     ...
   }
   ```
   *Observations*: Users in the database do not contain fields for `role`, `balance`, `address`, `paypalOrBank`, `taxDoc`, or `tosAccepted`.

2. **Data Layers (`server/db.js`)**:
   The function `saveUser` does not check field validation:
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
   *Observations*: There are no lookup functions for email (`findUserByEmail`), user ID (`findUserById`), or updating a user's record (`updateUser`).

3. **Users Route (`server/routes/users.js`)**:
   Under registration:
   ```javascript
   router.post('/register', function(req, res, next){
     const { fname, lname, email, username, password } = req.body;
     try {
       db.saveUser({ fname, lname, email, username, password });
       res.status(200).json({ message: "New user registered", success: true });
     } catch (err) {
       res.status(500).json({ message: "Error registering new user. Please try again.", success: false });
     }
   });
   ```
   *Observations*: The registration endpoint lacks validation for username/email uniqueness, fails to check if all mandatory fields are present, and does not check for Terms of Service acceptance.

4. **Register Component Form (`client/xs-records/src/components/register.js`)**:
   ```javascript
   this.state = {
     fname: '',
     lname: '',
     email: '',
     username: '',
     password: '',
     redirect: false
   }
   ```
   *Observations*: The React sign-up form does not present a Terms of Service checkbox component, and the state object does not initialize or record checkbox interactions.

---

## 2. Logic Chain
1. *From Obs 1 & 2*: Since `server/db.json` and `server/db.js` lack core fields (role, balance, address, payment, and TOS acceptance) and lookup functions (by email, ID), these must be explicitly defined and default-initialized to support secure access controls (Milestone 1) and profiles (Milestone 2).
2. *From Obs 3 & 4*: Since the sign-up handler does not check Terms of Service acceptance and the register page form lacks a TOS checkbox, the frontend must add a TOS check box in `register.js` and submit a `tosAccepted: true` field. The backend must enforce that `tosAccepted === true` is passed and reject registration if it is missing or falsy.
3. *From Obs 3*: Since there are no uniqueness constraints validated in `/register`, we must verify that the requested username and email are not already in `db.json` before saving a user record, preventing account collisions.
4. *From Obs 1 & PROJECT.md*: Since we need a way to distinguish administrators from normal users for the upcoming admin dashboard (Milestone 4), we should define user roles (`admin` and `user`) in the user schema. The backend should check roles dynamically in `server/middleware.js` via a custom `adminOnly` route guard.

---

## 3. Caveats
- We assume that the JWT secret is to be stored hardcoded as `'gracie'` matching the current signature logic. In production environments, this must be kept in configuration variables (`process.env.JWT_SECRET`).
- The application relies on `fs.writeFileSync` in `server/db.js` to persist changes. Under high traffic concurrency, this may lead to write blocking or race conditions. A transition to an asynchronous database engine is recommended for production.

---

## 4. Conclusion
We have formulated a detailed implementation plan mapping database modifications, endpoint updates (`GET /users/verify`, `POST /users/logout`), access control middlewares (`withAuth`, `adminOnly`), frontend state management via `AuthContext.js`, form validations, routing guards, and dynamic navbar controls. The analysis and implementation roadmap has been written to:
`C:\Users\admin\.gemini\antigravity\scratch\team-code-ctrl\.agents\explorer_m1_auth_2\analysis.md`

---

## 5. Verification Method
To verify the proposed design implementation in the subsequent steps:
1. **Pre-requisite check**: Ensure the development servers build and run:
   ```powershell
   npm run dev
   ```
   Check that backend starts on `http://localhost:3001` and React on `http://localhost:3002`.
2. **Endpoint check**:
   - Verify `POST /users/register` returns `400 Bad Request` if `tosAccepted` is missing or false.
   - Verify `POST /users/register` returns `400 Bad Request` if the username or email is already registered.
   - Verify `GET /users/verify` returns user object with `role` and `balance` fields when token cookie is set.
   - Verify `POST /users/logout` clears the `token` cookie.
3. **Frontend flow checks**:
   - Navigate to `/dashboard` without being logged in. It should redirect to `/login`.
   - Register a new account with the Terms of Service checkbox unchecked. It should fail and raise an alert message.
   - Log in using a regular user account. Check that the navbar displays `Hello, <username> (Balance: $0)` and links to Dashboard, Add Album, and Logout.
   - Log in using an admin account. Verify that the "Admin Panel" link is visible in the navigation bar.
