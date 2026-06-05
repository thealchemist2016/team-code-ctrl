# Authentication & Protected Routes Analysis

## Executive Summary
This analysis outlines the strategy to satisfy **R5 (Client-Side Protected Routes)** and the backend/frontend authentication requirements defined in the `PROJECT.md` for the XS-Records application. The current application lacks client-side route protection, a global authentication state provider, and critical backend endpoints (`GET /users/verify` and `POST /users/logout`). In addition, existing backend creation endpoints are unprotected. 

Implementing a React Context (`AuthContext`), a custom `PrivateRoute` component, protecting backend endpoints using the `withAuth` middleware, and mapping creations to the authenticated user's database identifier will fully secure the system and correct an existing album ownership fallback bug.

---

## 1. Existing Setup Analysis

### 1.1 Server-Side Authentication
* **Entry Point (`server/app.js`)**: Mounts routers, initializes session state, cookie parsing, and maps route handlers:
  * `/users` maps to `server/routes/users.js`.
  * `/albums` maps to `server/routes/albums.js`.
  * `/tracks` maps to `server/routes/tracks.js`.
* **JWT Custom Middleware (`server/middleware.js`)**:
  * Extracts tokens from the request body, query parameter, `x-access-token` header, or `token` cookie.
  * Verifies it against the hardcoded secret `'gracie'`.
  * On success, appends `req.username` and executes `next()`.
  * On failure, returns a **plain-text 401 response** (e.g., `'Unauthorized: No token provided'`).
* **Users Router (`server/routes/users.js`)**:
  * `POST /users/login`: Validates the username/password using `server/db.js` helpers, issues a JWT (expires in 1 hour), and sets an `httpOnly` cookie named `token`.
  * `POST /users/register`: Hashes password using bcrypt and persists user data.
  * `GET /users/dashboard`: Uses `withAuth` but only returns a text response (`'The dashboard'`).
  * **Missing Endpoints**: Currently, `GET /users/verify` and `POST /users/logout` are not implemented.
* **Database (`server/db.js`)**:
  * Emulates a MongoDB database with a local `server/db.json` file.
  * Handles user password comparisons using `bcrypt.compareSync`.
  * `saveAlbum` adds a new album. However, `getAlbums` attempts to populate the album owner by finding the user matching `u._id === album.user`. If no `user` ID is stored on the album, it defaults the owner to `"Guest"`.
* **Album and Track Routers**:
  * `POST /albums/add` and `POST /tracks/add` do **not** use the `withAuth` middleware and allow unauthenticated creations.
  * `POST /albums/add` saves whatever is in `req.body.user` (which is currently empty from the client side, causing all created albums to resolve to owner `"Guest"`).

### 1.2 Client-Side Setup
* **Routing (`client/xs-records/src/routes.js`)**:
  * Standard React Router v5 config. `/dashboard`, `/add-album`, and `/add-track` routes are all rendered as standard `<Route />` components without authentication checks.
* **State Management**:
  * Currently, components rely on component-local class state. There is no global application state for the logged-in user.
* **Navigation (`client/xs-records/src/components/nav.js`)**:
  * Renders a static navigation bar containing links only to `Login` and `Register`. It does not react to the user being logged in, nor does it display navigation to authenticated endpoints or provide a logout mechanism.
* **Login Form (`client/xs-records/src/components/login-form.js`)**:
  * An isolated component that handles form submission, performs a `fetch` request to `/users/login`, and redirects to `/dashboard` by setting local state `redirect: true`. Since state is local, this login status is immediately lost upon a page refresh or navigating away.

---

## 2. Requirements & Specification Analysis (R5)

1. **Client-Side Protection**:
   * Access to the `/dashboard`, `/add-album`, and `/add-track` routes must be restricted to authenticated users.
   * If a non-authenticated user attempts to access these routes, they must be redirected to `/login`.
2. **Backend Verify API (`GET /users/verify`)**:
   * Must check the `token` cookie.
   * If verified, respond with status `200 OK` and JSON:
     ```json
     { "success": true, "user": { "username": "..." } }
     ```
   * If invalid/missing, respond with status `401 Unauthorized` and JSON:
     ```json
     { "success": false, "error": "..." }
     ```
3. **Backend Logout API (`POST /users/logout`)**:
   * Must clear the `token` cookie and return a `200 OK` status with JSON:
     ```json
     { "success": true }
     ```
4. **Endpoint Integrity (Middleware Checks)**:
   * Backend APIs for album creation (`POST /albums/add`) and track creation (`POST /tracks/add`) must verify authentication via the `withAuth` middleware.
   * On authorization failure, they must return standard 401 JSON responses.

---

## 3. Implementation Strategy

### 3.1 Backend Enhancements

#### A. Adjusting verification middleware (`server/middleware.js`)
Currently, `withAuth` sends a plain text response. To conform to the JSON payload interface contracts, it should be updated to respond with JSON:
```javascript
// Before (Lines 11-17):
// if(!token) {
//   res.status(401).send('Unauthorized: No token provided');
// } else {
//   jwt.verify(token, secret, function(err, decoded) {
//     if(err) {
//       res.status(401).send('Unauthorized: Invalid token');
// ...

// Proposed:
if (!token) {
  return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
} else {
  jwt.verify(token, secret, function(err, decoded) {
    if (err) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
    req.username = decoded.username;
    next();
  });
}
```

#### B. Adding authentication endpoints in `server/routes/users.js`
1. **Verify Endpoint**: Mounts `withAuth` and returns the authenticated user data.
   ```javascript
   router.get('/verify', withAuth, function(req, res) {
     res.status(200).json({ success: true, user: { username: req.username } });
   });
   ```
2. **Logout Endpoint**: Clears the `token` cookie.
   ```javascript
   router.post('/logout', function(req, res) {
     res.clearCookie('token');
     res.status(200).json({ success: true });
   });
   ```

#### C. Protecting Album and Track Creation APIs
Import `withAuth` in `server/routes/albums.js` and `server/routes/tracks.js`.
1. **In `server/routes/albums.js`**:
   Protect `POST /add` and fix the album-user ownership assignment:
   ```javascript
   const withAuth = require('../middleware');

   router.post('/add', withAuth, function(req, res, next) {
     try {
       // Look up the user database object to get their _id
       const user = db.findUserByUsername(req.username);
       const album = db.saveAlbum({
         albumName: req.body.albumName,
         numberOfTracks: parseInt(req.body.numberOfTracks),
         artist: req.body.artist,
         cover: req.body.cover,
         user: user ? user._id : null  // Sets the actual user ID instead of undefined
       });
       req.session.lastAlbumId = album._id;
       res.status(200).json({ message: 'Album created successfully', id: album._id });
     } catch (err) {
       console.error(err);
       res.status(500).json({ message: 'Error saving album' });
     }
   });
   ```
2. **In `server/routes/tracks.js`**:
   Protect `POST /add`:
   ```javascript
   const withAuth = require('../middleware');

   router.post('/add', withAuth, function(req, res, next) {
     // implementation continues with authentication middleware check...
   });
   ```

---

### 3.2 Frontend Enhancements

#### A. Global state setup via Context API (`AuthContext`)
Create `client/xs-records/src/context/AuthContext.js` with state managing the authenticated `user` (or `null`) and a `loading` indicator (essential to prevent page flicker or incorrect redirection while checking authentication status on mount).

**Proposed `AuthContext.js` Sketch**:
```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyUser = async () => {
    try {
      const res = await fetch('/users/verify');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error verifying session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyUser();
  }, []);

  const login = async (username, password) => {
    const res = await fetch('/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.redirect) {
      setUser({ username });
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/users/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### B. Implementing `PrivateRoute` Component
Create `client/xs-records/src/components/PrivateRoute.js` to guard client-side routes:
```javascript
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-5">Loading user session...</div>;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
};

export default PrivateRoute;
```

#### C. Integrating the Provider and Routes
1. **In `client/xs-records/src/index.js`**:
   Import `AuthProvider` and wrap `<App />`:
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
2. **In `client/xs-records/src/routes.js`**:
   Use the `PrivateRoute` component to restrict dashboard, album adding, and track adding:
   ```javascript
   import React from 'react';
   import { Route, Switch } from 'react-router-dom';
   import Dashboard from './components/dashboard';
   import Register from './components/register';
   import Login from './components/login-form';
   import Home from './components/home';
   import AddAlbum from './components/add-album';
   import AddTrack from './components/add-track';
   import PrivateRoute from './components/PrivateRoute';

   export default () => 
     <Switch>
       <PrivateRoute path="/dashboard" exact component={Dashboard} />
       <Route path="/login" exact component={Login} />
       <Route path="/register" exact component={Register} />
       <Route path="/" exact component={Home} />
       <PrivateRoute path="/add-album" exact component={AddAlbum} />
       <PrivateRoute path="/add-track" exact component={AddTrack} />
     </Switch>;
   ```

#### D. Component Adaptations
1. **`LoginForm` (`login-form.js`)**:
   Refactor `LoginForm` to a functional component utilizing the `useAuth()` hook.
   * Invoke `login(username, password)` inside `handleSubmit`.
   * On success, standard React Router redirect triggers or simple state redirection.
2. **Navigation Bar (`nav.js`)**:
   Refactor `AppNav` to a functional component utilizing `useAuth()`.
   * If `user` is present, display Links: `Dashboard`, `Add Album`, `Add Track`, and a clickable `Logout` item.
   * If `user` is null, display Links: `Login` and `Register`.
   * `Logout` triggers the `logout()` API request and redirects the user to `/login`.

---

## 4. Risks & Mitigations

* **OpenSSL Legacy Provider**: The React start/build commands use `NODE_OPTIONS=--openssl-legacy-provider`. This is critical for compatibility with Node v17+ when using older react-scripts. Ensure this env variable remains in the startup scripts.
* **JWT Expiration**: The session could expire during an active client session. The `verifyUser` method checks status on reload. The frontend should gracefully handle 401 responses from other fetch calls (like `/albums/add`) by logging the user out in the client context if a 401 is returned.
* **Hardcoded Secret**: The JWT secret is hardcoded in multiple server files (`middleware.js`, `routes/users.js`, `bin/www`). While not in scope for immediate rewrite, it is highly recommended to refactor this to read from `process.env.JWT_SECRET` in a production scenario.

---

## 5. Verification Plan

### 5.1 Verification Scenarios
1. **Unauthenticated Redirects**:
   * Direct browser navigation to `http://localhost:3002/dashboard` when not logged in must immediately redirect to `http://localhost:3002/login`.
   * Direct navigation to `/add-album` and `/add-track` must similarly redirect to `/login`.
2. **Successful Login flow**:
   * Complete register at `/register` -> Navigate to `/login` -> Enter credentials -> Success redirects to `/dashboard`.
   * The navbar should now update, hiding "Login" and "Register" and showing "Dashboard", "Add Album", "Add Track", and "Logout".
3. **Session Persistence**:
   * Reloading `/dashboard` after a successful login should keep the user logged in (supported by the `useEffect` call in `AuthProvider` querying `/users/verify` and reading the HTTP-only cookie).
4. **Backend Security Checks**:
   * Submit a POST request to `/albums/add` or `/tracks/add` without a valid cookie using curl or Postman. The request should fail with a `401 Unauthorized` status and JSON payload.
5. **Logout Action**:
   * Clicking "Logout" in the navbar should send a POST request to `/users/logout`, clear the client auth state, wipe the `token` cookie, and redirect to `/login`. Direct navigation to `/dashboard` immediately after should fail and redirect.
