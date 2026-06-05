## Review Summary

**Verdict**: REQUEST_CHANGES

The Database & Auth (Milestone 1) implementation successfully sets up JWT authentication, cookies, route-level protection on the client side, and dynamic database seeding. However, there are critical validation gaps in the registration flow that allow database pollution, and intermediate release forms contain broken selectors for files that prevent correct operation.

---

## Findings

### [Major] Finding 1: Lack of Registration Field Validation
- **What**: Neither the frontend register form nor the backend register route validates that required fields (`fname`, `lname`, `email`, `username`, `password`) are non-blank or properly formatted.
- **Where**: 
  - `client/xs-records/src/components/register.js`
  - `server/routes/users.js`
- **Why**: A user can submit a registration form with empty strings (as long as the Terms of Service checkbox is checked). The server will successfully create a user record with empty strings as the username and email, and a hashed empty string as the password. This pollutes the database and blocks any other user from registering or logging in cleanly (since subsequent attempts with empty fields will fail with a "Username already exists" or "Email already exists" error).
- **Suggestion**: Add the HTML5 `required` attribute to all input elements in `register.js`. In `server/routes/users.js`, add server-side validation to ensure that `username`, `email`, and `password` are present, non-empty, and meet basic formatting requirements (e.g. email regex validation) before saving the user.

### [Major] Finding 2: Broken Selectors and JSON Submission for Cover/Audio Files
- **What**: The file input elements in `AddAlbum` and `AddTrack` do not have `name` attributes, and the submission uses standard JSON stringification.
- **Where**: 
  - `client/xs-records/src/components/add-album.js` (Lines 76-79)
  - `client/xs-records/src/components/add-track.js` (Lines 66-69)
- **Why**: In `AddAlbum`, the input element is defined as `<Input onChange={this.onChange} type="file" />`. Because there is no `name="cover"` attribute, the `onChange` event sets `state[undefined] = event.target.value`, leaving `state.cover` blank. Additionally, stringifying the file input value sends `undefined` or a raw string (e.g. `"C:\\fakepath\\file.jpg"`), which does not perform actual file uploading. (Note: File upload is scheduled for Milestone 3, but the intermediate form components are currently broken and fail to pass key properties).
- **Suggestion**: Add the `name="cover"` and `name="audio"` attributes to the file input components, and update the state mapping. These forms should be updated in Milestone 3 to use multipart/form-data rather than raw JSON.

### [Minor] Finding 3: Redundant Body Parser Middleware
- **What**: The Express app initializes body parsers twice.
- **Where**: `server/app.js` (Lines 18-21)
- **Why**: 
  ```javascript
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  ```
  `express.json()` and `express.urlencoded()` are built-in Express parsers that duplicate the function of `bodyParser.json()` and `bodyParser.urlencoded()`.
- **Suggestion**: Remove the redundant `bodyParser` imports and middlewares, keeping only the native Express ones.

---

## Verified Claims

- **JWT Authentication Flow** → verified via source code analysis of `server/routes/users.js` and `server/middleware.js` → **PASS** (Token is correctly generated on login, stored in cookies, and verified by `withAuth` middleware).
- **Client Route Guarding (`ProtectedRoute`)** → verified via source code analysis of `client/xs-records/src/components/ProtectedRoute.js` and `routes.js` → **PASS** (Guests attempting to access `/dashboard`, `/add-album`, or `/add-track` are redirecting to `/login` after an async check of `/users/verify`).
- **Terms of Service (ToS) Checkbox Enforced** → verified via source code analysis of `client/xs-records/src/components/register.js` and `server/routes/users.js` → **PASS** (Checked on client before post request, and validated on the server).
- **Dynamic Database Seeding** → verified via source code analysis of `server/db.js` (`readData` method) → **PASS** (If missing, default user `michaelbyrd7741@gmail.com` and admin `admin@xsrecords.com` are created and hashed).

---

## Coverage Gaps

- **E2E Tests Implementation** — risk level: **Medium** — recommendation: **Investigate** (The current E2E test files in `e2e/tests/*.spec.js` are only skeleton placeholders with empty test bodies. The implementation of E2E tests is assigned to `worker_write_tests` which is currently in-progress).
- **Unit Tests Coverage** — risk level: **Low** — recommendation: **Accept Risk** (Only `App.test.js` exists, checking rendering and context provision. For Milestone 1, this is acceptable, but coverage should be expanded in later milestones).

---

## Unverified Items

- **Actual compilation and execution of unit/E2E tests** — reason not verified: Terminal execution command timed out waiting for user approval. However, static analysis of JS files confirms the logic structure.
