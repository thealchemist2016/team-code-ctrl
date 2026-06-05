# Analysis: Milestone 1 Database & Auth

## 1. Executive Summary
This report provides a read-only investigation of the existing database and authentication mechanisms in the XS-Records Music Distribution Platform. It identifies key architectural gaps between the current codebase and the requirements specified in `PROJECT.md` and `ORIGINAL_REQUEST.md` (referred to as the scope document), and presents a step-by-step implementation plan. 

Currently, the server uses a synchronous JSON file database (`server/db.json` and `server/db.js`) instead of MongoDB. There are remnants of Mongoose schema definitions in `server/models/`, but Mongoose is not a dependency in `server/package.json` and is completely unused. The authentication uses JWT stored in cookies, but lacks route verification endpoints, user role separation, secure association of user data, and frontend route protection.

---

## 2. Detailed Code Review

### 2.1 Database Model (`server/db.json`, `server/db.js`, `server/models/`)
- **Simulation Layer (`server/db.json` & `server/db.js`):**
  - Data is stored in a plain JSON file (`server/db.json`).
  - Read/write operations are performed synchronously via `fs.readFileSync` and `fs.writeFileSync` inside `server/db.js` (lines 7–22).
  - High-level queries (`getUsers`, `saveUser`, `findUserByUsername`, `comparePassword`, `getAlbums`, `saveAlbum`, `saveTrack`) are emulated in Javascript in `server/db.js`.
  - Password hashing is performed using `bcryptjs` synchronously during `saveUser` (lines 28–31).
- **Mongoose Models (Unused, `server/models/`):**
  - Files `userModel.js`, `albumModel.js`, and `trackModel.js` define mongoose schemas.
  - However, **Mongoose is not imported or used** in `app.js` or `db.js`. Furthermore, `mongoose` is not in the `package.json` dependencies.
  - **Verdict:** The `server/models/` directory is dead code. All DB modifications must be performed by expanding the helper functions in `server/db.js` and updating `server/db.json` structure.

### 2.2 Authentication Setup (`server/middleware.js`, `server/config/passport.js`, `server/routes/users.js`)
- **Token Middleware (`server/middleware.js`):**
  - `withAuth` parses JWT tokens from the body, query, headers, or cookies (under the name `token`).
  - It uses secret `gracie` to verify the token.
  - If valid, it assigns the username to `req.username` and calls `next()`.
  - If invalid or missing, it sends a plain text response: `res.status(401).send('Unauthorized: ...')`.
- **Passport Setup (`server/config/passport.js`):**
  - Only requires passport: `const passport = require('passport');`. It does not define any strategies (JWT, Local, Google, etc.).
- **User Routes (`server/routes/users.js`):**
  - `POST /users/login`: Performs password verification via `db.comparePassword`. On success, it signs a JWT token `{ username }` with a 1-hour expiration, sets a cookie `token` (httpOnly), and returns a redirect response.
  - `POST /users/register`: Gathers `fname`, `lname`, `email`, `username`, and `password`, then calls `db.saveUser`.

---

## 3. Identified Gaps & Vulnerabilities

| # | Gap / Vulnerability | Location | Description / Impact |
|---|---|---|---|
| **1** | Missing Verify Endpoint | `server/routes/users.js` | There is no `GET /users/verify` endpoint to allow the frontend to confirm JWT cookie validity and fetch logged-in user info (role, balance) as required by `PROJECT.md` Interface Contracts. |
| **2** | No Terms of Service (TOS) Check | `client/.../register.js` & `server/.../users.js` | The registration form lacks a Terms of Service checkbox, and the backend registers users without checking if they accepted the terms. |
| **3** | Unprotected Creation Routes | `server/routes/albums.js` & `server/routes/tracks.js` | `POST /albums/add` and `POST /tracks/add` are completely unprotected. Anyone can create albums or tracks without passing auth middleware. |
| **4** | User Impersonation | `server/routes/albums.js` | The route reads `req.body.user` to associate the user to the album. A malicious client could pass any user ID to associate albums to other accounts. |
| **5** | Missing Role-Based Access Control | `server/middleware.js` & Database | Users do not have roles (`admin` vs `user`) defined in the database, and there is no middleware to enforce admin-only views. |
| **6** | No Logout Endpoint | `server/routes/users.js` | There is no route to clear the `token` cookie, making session termination difficult for the frontend. |
| **7** | No Frontend Route Protection | `client/.../routes.js` | The client routes `/dashboard`, `/add-album`, and `/add-track` can be visited by unauthenticated users. The navbar is static and does not change when logged in. |

---

## 4. Implementation Plan

### Step 1: Database updates (Schema & Seeding)
1. **Extend `db.json` structure:**
   Add `role`, `balance`, and `tosAccepted` properties to the user schema.
   ```json
   {
     "users": [
       {
         "fname": "Michael",
         "lname": "Byrd",
         "email": "michaelbyrd7741@gmail.com",
         "username": "michaelbyrd7741@gmail.com",
         "password": "$2a$10$sbaZciiv/QfxzdluqKVf6uJozLNT66AUzeSRorruB9GoNHrjKnS12",
         "_id": "u-1780631162676",
         "role": "user",
         "balance": 197,
         "tosAccepted": true
       },
       {
         "fname": "Admin",
         "lname": "System",
         "email": "admin@xsrecords.com",
         "username": "admin",
         "password": "$2a$10$sbaZciiv/QfxzdluqKVf6uJozLNT66AUzeSRorruB9GoNHrjKnS12", // password: "admin" or same as Michael's
         "_id": "u-admin",
         "role": "admin",
         "balance": 0,
         "tosAccepted": true
       }
     ]
   }
   ```
2. **Update `server/db.js`:**
   Modify `saveUser` to ensure roles, balance, and TOS acceptance are initialized:
   ```javascript
   saveUser: (user) => {
     const data = readData();
     const existing = data.users.find(u => u.username === user.username);
     if (existing) {
       throw new Error('User already exists');
     }
     const saltRounds = 10;
     const salt = bcrypt.genSaltSync(saltRounds);
     user.password = bcrypt.hashSync(user.password, salt);
     user._id = 'u-' + Date.now();
     user.role = user.role || 'user';
     user.balance = user.balance !== undefined ? user.balance : 0;
     user.tosAccepted = user.tosAccepted !== undefined ? user.tosAccepted : true;
     data.users.push(user);
     writeData(data);
     return user;
   }
   ```

### Step 2: Authentication Middleware Enhancement
1. **Update `server/middleware.js` to output JSON:**
   Replace the plain text sends with JSON payloads:
   ```javascript
   const jwt = require('jsonwebtoken');
   const secret = 'gracie';

   const withAuth = function(req, res, next) {
     const token = 
       req.body.token ||
       req.query.token ||
       req.headers['x-access-token'] ||
       req.cookies.token;

     if (!token) {
       return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
     }
     jwt.verify(token, secret, function(err, decoded) {
       if (err) {
         return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
       }
       req.username = decoded.username;
       next();
     });
   };

   const isAdmin = function(req, res, next) {
     const db = require('./db');
     const user = db.findUserByUsername(req.username);
     if (!user || user.role !== 'admin') {
       return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
     }
     next();
   };

   module.exports = { withAuth, isAdmin };
   ```
2. **Adjust imports in `server/routes/users.js`:**
   ```javascript
   const { withAuth } = require('../middleware');
   ```

### Step 3: Implement Core Server Routes
1. **Add `GET /users/verify` to `server/routes/users.js`:**
   ```javascript
   router.get('/verify', withAuth, function(req, res) {
     const user = db.findUserByUsername(req.username);
     if (!user) {
       return res.status(401).json({ success: false, error: 'User not found' });
     }
     res.status(200).json({
       success: true,
       user: {
         username: user.username,
         role: user.role || 'user',
         balance: user.balance || 0
       }
     });
   });
   ```
2. **Add `POST /users/logout` to `server/routes/users.js`:**
   ```javascript
   router.post('/logout', function(req, res) {
     res.clearCookie('token');
     res.status(200).json({ success: true, message: 'Logged out successfully' });
   });
   ```
3. **Verify Terms of Service on registration `POST /users/register`:**
   ```javascript
   router.post('/register', function(req, res) {
     const { fname, lname, email, username, password, agreeToTOS } = req.body;
     if (!agreeToTOS) {
       return res.status(400).json({ success: false, message: 'You must accept the Terms of Service to sign up.' });
     }
     try {
       db.saveUser({ fname, lname, email, username, password, role: 'user', balance: 0, tosAccepted: true });
       res.status(200).json({ message: "New user registered", success: true });
     } catch (err) {
       res.status(500).json({ message: err.message || "Error registering new user. Please try again.", success: false });
     }
   });
   ```

### Step 4: Protect Album and Track Creation
1. **Secure `POST /albums/add` in `server/routes/albums.js`:**
   Import `{ withAuth } = require('../middleware')`.
   Update the route definition to protect it and securely resolve the user identity:
   ```javascript
   router.post('/add', withAuth, function(req, res, next) {
     try {
       const user = db.findUserByUsername(req.username);
       const album = db.saveAlbum({
         albumName: req.body.albumName,
         numberOfTracks: parseInt(req.body.numberOfTracks),
         artist: req.body.artist,
         cover: req.body.cover,
         user: user._id
       });
       req.session.lastAlbumId = album._id;
       res.status(200).json({ message: 'Album created successfully', id: album._id });
     } catch (err) {
       console.error(err);
       res.status(500).json({ message: 'Error saving album' });
     }
   });
   ```
2. **Secure `POST /tracks/add` in `server/routes/tracks.js`:**
   Import `{ withAuth } = require('../middleware')`.
   ```javascript
   router.post('/add', withAuth, function(req, res, next) {
     // ...
   ```

---

### Step 5: Client-side Global State & Protected Routes

1. **Create `client/xs-records/src/context/AuthContext.js`:**
   Establish a context provider to maintain logged-in state across the app.
   ```javascript
   import React, { createContext, useState, useEffect } from 'react';

   export const AuthContext = createContext();

   export const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);

     const verifyUser = () => {
       return fetch('/users/verify')
         .then(res => res.json())
         .then(data => {
           if (data.success) {
             setUser(data.user);
           } else {
             setUser(null);
           }
           setLoading(false);
         })
         .catch(() => {
           setUser(null);
           setLoading(false);
         });
     };

     useEffect(() => {
       verifyUser();
     }, []);

     const login = (userData) => {
       setUser(userData);
     };

     const logout = () => {
       setUser(null);
     };

     return (
       <AuthContext.Provider value={{ user, loading, login, logout, verifyUser }}>
         {children}
       </AuthContext.Provider>
     );
   };
   ```

2. **Wrap Root in `client/xs-records/src/index.js`:**
   ```javascript
   import { AuthProvider } from './context/AuthContext';
   ReactDOM.render(
     <Router>
       <AuthProvider>
         <App />
       </AuthProvider>
     </Router>,
     document.getElementById('root')
   );
   ```

3. **Create `client/xs-records/src/components/protected-route.js`:**
   ```javascript
   import React, { useContext } from 'react';
   import { Route, Redirect } from 'react-router-dom';
   import { AuthContext } from '../context/AuthContext';

   export const ProtectedRoute = ({ component: Component, ...rest }) => {
     const { user, loading } = useContext(AuthContext);

     if (loading) {
       return <div className="text-center mt-5">Loading authentication...</div>;
     }

     return (
       <Route
         {...rest}
         render={props =>
           user ? (
             <Component {...props} />
           ) : (
             <Redirect to="/login" />
           )
         }
       />
     );
   };
   ```

4. **Integrate route guards in `client/xs-records/src/routes.js`:**
   Import `ProtectedRoute` and substitute standard Routes:
   ```javascript
   import { ProtectedRoute } from './components/protected-route';

   export default () => 
     <Switch>
       <ProtectedRoute path="/dashboard" exact component={Dashboard} />
       <Route path="/login" exact component={Login} />
       <Route path="/register" exact component={Register} />
       <Route path="/" exact component={Home} />
       <ProtectedRoute path="/add-album" exact component={AddAlbum} />
       <ProtectedRoute path="/add-track" exact component={AddTrack} />
     </Switch>;
   ```

---

### Step 6: Frontend Interface Integration

1. **Add Terms of Service checkbox in `client/.../components/register.js`:**
   - In state, add `agreeToTOS: false`.
   - Update `onChange` to handle checkbox elements:
     ```javascript
     onChange = (event) => {
       const { name, value, type, checked } = event.target;
       this.setState({
         [name]: type === 'checkbox' ? checked : value
       });
     }
     ```
   - Inside `<Form>` add the TOS input:
     ```jsx
     <FormGroup check className="mb-3">
       <Label check>
         <Input 
           type="checkbox" 
           name="agreeToTOS" 
           onChange={this.onChange} 
           checked={this.state.agreeToTOS} 
           id="agreeToTOS"
         />{' '}
         I agree to the Terms of Service
       </Label>
     </FormGroup>
     ```
   - Inside `handleSubmit`, submit `this.state` containing `agreeToTOS`.

2. **Connect `LoginForm` to `AuthContext`:**
   - Define `static contextType = AuthContext` in `LoginForm`.
   - On success, call `this.context.verifyUser()` and update state.

3. **Dynamic Navbar in `client/.../components/nav.js`:**
   - Configure context consumer: `static contextType = AuthContext`.
   - In `render()`, fetch `user` and conditionally display elements.
   - Implement `handleLogout` to invoke `POST /users/logout` and call `this.context.logout()`.

---

## 5. Global Project Scope Alignment

This implementation directly addresses:
- **`PROJECT.md` Milestone 1 (Database & Auth):** JWT Auth, Sign-Up with TOS, Log-In, access control, admin vs user roles in DB.
- **`PROJECT.md` Interface Contracts:** Matches request and response formats of `GET /users/verify`.
- **`ORIGINAL_REQUEST.md` (Scope) R2 Authentication:** Ensures user registration checks Terms of Service, implements JWT authentication with session stored in cookie, and sets up dashboard protection.
