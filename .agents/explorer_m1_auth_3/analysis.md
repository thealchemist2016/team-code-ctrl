# Database & Authentication Analysis and Implementation Plan (Milestone 1)

This analysis outlines the detailed implementation plan for **Milestone 1: Database & Auth (R2)** of the XS-Records Music Distribution Platform. It details the existing architecture, assesses gaps relative to requirements in `PROJECT.md` and `SCOPE.md`, and provides an actionable implementation plan for JWT-based auth via cookies, user Sign-Up with Terms of Service acceptance, Log-In, role-based access control, and schema expansions.

---

## 1. Executive Summary
* **Current State Assessment**:
  * **Database**: The app uses a file-based JSON DB (`server/db.json`) managed by `server/db.js`. Mongoose models exist in `server/models/` but are unused. Users lack attributes for roles (`admin` vs `user`), balance, profile information, and Terms of Service (ToS) acceptance.
  * **Authentication**: A custom `withAuth` middleware in `server/middleware.js` verifies tokens from cookies, but routes `/albums/add` and `/tracks/add` are entirely unprotected.
  * **Frontend**: Routing is static. There is no global authentication state provider (`AuthContext`), no route guards (`<PrivateRoute>` or `<AdminRoute>`), and the registration component does not contain a ToS checkbox.
* **Proposed Solution**: 
  1. Expand the local JSON database schema to support `role`, `balance`, `termsAccepted`, `termsAcceptedAt`, and other profile fields.
  2. Implement a unified `UserController` to consolidate registration, login, logout, and token verification.
  3. Update `withAuth` to respond with JSON. Protect all resource modification routes.
  4. Create `AuthContext`, `PrivateRoute`, and `AdminRoute` on the frontend, wrap `App.js` with the context provider, and adapt the navbar dynamically.
  5. Add a ToS agreement checkbox and validation to the Sign-Up component (`register.js`).

---

## 2. Codebase Review & Authentication Analysis

### 2.1 Database Layer (`server/db.json` / `server/db.js` / `server/models`)
* **Observations**:
  * The DB helper functions in `server/db.js` read and write synchronously to `server/db.json`.
  * `saveUser` (lines 26-36) does not initialize role, balance, or ToS fields.
  * Mongoose models (`userModel.js`, `albumModel.js`, `trackModel.js`) are defined in `server/models/` but are not imported or used anywhere.
  * **Conclusion**: We will not use the Mongoose models. All database-level enhancements must be implemented in `server/db.js` and structure updates saved to `server/db.json`.

### 2.2 Server-Side Auth Setup (`server/middleware.js` / `server/config/passport.js`)
* **Observations**:
  * `withAuth` middleware checks `req.cookies.token` or other token locations and assigns `req.username = decoded.username` (lines 4-23).
  * If a token is missing or invalid, `withAuth` responds with a plain-text error: `res.status(401).send(...)` (lines 12, 16).
  * `server/config/passport.js` contains only `const passport = require('passport');` and is never configured, despite being initialized in `server/app.js`.
  * Routes for `/albums/add` and `/tracks/add` do not apply `withAuth` and let anyone submit data.
  * **Conclusion**: Update `withAuth` to output JSON errors. Secure the creation endpoints. Configure Passport as an alternative JWT strategy option for standards compliance.

### 2.3 User Controllers (`server/controllers/user.js`)
* **Observations**:
  * `server/controllers/user.js` contains a single dummy placeholder function: `exports.register = function(req, res) { res.send(...) }`.
  * The login and registration routes are written directly inside `server/routes/users.js`.
  * **Conclusion**: We should refactor all user authentication handlers (register, login, logout, verify) into the controller `server/controllers/user.js` to separate routing concerns.

---

## 3. Scope & Requirement Mapping

| Requirement | Description | Files Affected | Details |
|---|---|---|---|
| **R2: Sign-Up** | Gathering name, email, username, password + ToS acceptance checkbox. | `client/register.js`, `server/controllers/user.js`, `server/routes/users.js` | Introduce ToS checkbox on the client. Enforce `termsAccepted` check in backend API. Save `termsAccepted` & `termsAcceptedAt` in database. |
| **R2: Log-In** | JWT-based auth via cookies + session validation endpoint. | `server/controllers/user.js`, `server/middleware.js`, `client/context/AuthContext.js` | Maintain HTTP-only `token` cookie. Expose `GET /users/verify` and `POST /users/logout` APIs. |
| **R2: Access Control** | Protect dashboard views, album/track additions. | `client/routes.js`, `client/components/PrivateRoute.js`, `server/routes/albums.js`, `server/routes/tracks.js` | Block unauthorized views on the client. Guard creation routes on the server using `withAuth` middleware. |
| **R2: User Roles** | Differentiate admin vs user in database and client dashboards. | `server/db.json`, `server/db.js`, `client/components/AdminRoute.js` | Persist `"role": "admin" \| "user"` in user data. Build role-based access restrictions. |

---

## 4. Proposed Implementation Plan

### 4.1 Database Schema Extensions (`server/db.json` & `server/db.js`)
We will expand the schemas inside `server/db.json` to handle all user parameters. Additionally, to support subsequent milestones (Tickets, Withdrawals, Notifications), we will define their schemas here:

#### `server/db.json` Structure
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
      "role": "admin",
      "balance": 197,
      "termsAccepted": true,
      "termsAcceptedAt": "2026-06-05T05:23:09Z",
      "address": "123 Main St, Austin, TX",
      "paypalOrBank": "paypal:michaelbyrd7741@gmail.com",
      "taxDocument": ""
    }
  ],
  "albums": [],
  "tracks": [],
  "tickets": [],
  "notifications": [],
  "withdrawals": []
}
```

#### `server/db.js` Updates
Add updates and default fields initialization in `saveUser` and write an `updateUser` helper:
```javascript
// Add updates inside server/db.js:

saveUser: (user) => {
  const data = readData();
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  
  user.password = bcrypt.hashSync(user.password, salt);
  user._id = 'u-' + Date.now();
  user.role = user.role || 'user'; // Default role is user
  user.balance = user.balance !== undefined ? user.balance : 0; // Default balance is 0
  user.termsAccepted = user.termsAccepted || false;
  user.termsAcceptedAt = user.termsAcceptedAt || null;
  user.address = user.address || "";
  user.paypalOrBank = user.paypalOrBank || "";
  user.taxDocument = user.taxDocument || "";
  
  data.users.push(user);
  writeData(data);
  return user;
},

updateUser: (username, updates) => {
  const data = readData();
  const index = data.users.findIndex(u => u.username === username);
  if (index !== -1) {
    data.users[index] = { ...data.users[index], ...updates };
    writeData(data);
    return data.users[index];
  }
  return null;
}
```

---

### 4.2 Backend Authentication Controller & Routing

#### Create `server/controllers/user.js`
This file implements user sign-up with ToS validation, login, cookie logout, and verification:
```javascript
const db = require('../db');
const jwt = require('jsonwebtoken');
const secret = 'gracie';

exports.register = function(req, res) {
  const { fname, lname, email, username, password, termsAccepted } = req.body;
  
  if (!termsAccepted) {
    return res.status(400).json({ success: false, error: 'You must accept the Terms of Service to register.' });
  }
  
  if (!fname || !lname || !email || !username || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const existingUser = db.findUserByUsername(username);
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'Username is already taken.' });
  }

  try {
    db.saveUser({
      fname,
      lname,
      email,
      username,
      password,
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
      role: 'user',
      balance: 0
    });
    res.status(200).json({ success: true, message: 'New user registered successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error registering new user. Please try again.' });
  }
};

exports.login = function(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Incorrect username or password' });
  }

  const same = db.comparePassword(password, user.password);
  if (!same) {
    return res.status(401).json({ success: false, error: 'Incorrect username or password' });
  }

  const payload = { username };
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  
  res.cookie('token', token, { httpOnly: true })
    .status(200)
    .json({ redirect: true, success: true, message: 'Logged in successfully' });
};

exports.logout = function(req, res) {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.verify = function(req, res) {
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
};
```

#### Update `server/routes/users.js`
Replace route handlers to route directly to the user controller:
```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const withAuth = require('../middleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/verify', withAuth, userController.verify);

module.exports = router;
```

---

### 4.3 Backend Access Control Middleware

#### Update `server/middleware.js`
Modify this file to return standardized JSON error messages instead of plain text:
```javascript
const jwt = require('jsonwebtoken');
const secret = 'gracie';

const withAuth = function(req, res, next) {
  const token = 
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.cookies.token;

  if(!token) {
    res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if(err) {
        res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
      } else {
        req.username = decoded.username;
        next();
      }
    });
  }
}

module.exports = withAuth;
```

#### Create Role Protection Middleware (`server/middleware/roleAuth.js` or helper functions)
Provide an access control check for admin-only routes:
```javascript
const db = require('../db');

exports.requireRole = function(role) {
  return function(req, res, next) {
    const user = db.findUserByUsername(req.username);
    if (!user || user.role !== role) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
```

#### Protect Release Creation routes
Update `server/routes/albums.js` and `server/routes/tracks.js` to utilize `withAuth`.

In `server/routes/albums.js`:
```javascript
const withAuth = require('../middleware');

router.post('/add', withAuth, function(req, res, next) {
  try {
    const user = db.findUserByUsername(req.username);
    const userId = user ? user._id : null;
    
    const album = db.saveAlbum({
      albumName: req.body.albumName,
      numberOfTracks: parseInt(req.body.numberOfTracks),
      artist: req.body.artist,
      cover: req.body.cover,
      user: userId // Map creation to database user object ID
    });
    req.session.lastAlbumId = album._id;
    res.status(200).json({ message: 'Album created successfully', id: album._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving album' });
  }
});
```

In `server/routes/tracks.js`:
```javascript
const withAuth = require('../middleware');

router.post('/add', withAuth, function(req, res, next) {
  try {
    const albumId = req.session.lastAlbumId;
    if (!albumId) {
      const latestAlbum = db.getLatestAlbum();
      if (!latestAlbum) {
        return res.status(400).json({ message: 'No album found to attach track to.' });
      }
      db.saveTrack(req.body.title, latestAlbum._id);
    } else {
      db.saveTrack(req.body.title, albumId);
    }
    res.status(200).json({ message: 'Track added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving track' });
  }
});
```

#### Configure optional Passport strategy (`server/config/passport.js`)
Ensure passport can also parse standard token extraction:
```javascript
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const db = require('../db');

const cookieExtractor = function(req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['token'];
  }
  return token;
};

const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: 'gracie'
};

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  const user = db.findUserByUsername(jwt_payload.username);
  if (user) {
    return done(null, user);
  } else {
    return done(null, false);
  }
}));
```

---

### 4.4 Frontend Authentication Context & Route Guards

#### Create `client/xs-records/src/context/AuthContext.js`
Manage session persistence and verification state across all components:
```javascript
import React, { createContext, Component } from 'react';

export const AuthContext = createContext();

export class AuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isAuthenticated: false,
      loading: true
    };
  }

  componentDidMount() {
    this.verifySession();
  }

  verifySession = () => {
    return fetch('/users/verify')
      .then((res) => {
        if (res.status === 200) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => {
        if (data.success) {
          this.setState({ user: data.user, isAuthenticated: true, loading: false });
        } else {
          this.setState({ user: null, isAuthenticated: false, loading: false });
        }
      })
      .catch(() => {
        this.setState({ user: null, isAuthenticated: false, loading: false });
      });
  };

  login = (username, password) => {
    return fetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (res.status === 200) return res.json();
        throw new Error('Login credentials invalid');
      })
      .then((data) => {
        if (data.redirect) {
          return this.verifySession().then(() => true);
        }
        return false;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  };

  logout = () => {
    return fetch('/users/logout', { method: 'POST' })
      .then((res) => {
        if (res.status === 200) return res.json();
        throw new Error('Logout API request failed');
      })
      .then((data) => {
        if (data.success) {
          this.setState({ user: null, isAuthenticated: false, loading: false });
          return true;
        }
        return false;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  };

  render() {
    return (
      <AuthContext.Provider
        value={{
          ...this.state,
          login: this.login,
          logout: this.logout,
          verifySession: this.verifySession
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}
```

#### Wrap app root in `client/xs-records/src/App.js`
```javascript
import React, { Component } from 'react';
import AppNav from './components/nav';
import Routes from './routes';
import { AuthProvider } from './context/AuthContext';

class App extends Component {
  render() {
    return (
      <AuthProvider>
        <main role="main" className="App">
          <AppNav />
          <Routes />
        </main>
      </AuthProvider>
    );
  }
}

export default App;
```

#### Create `client/xs-records/src/components/PrivateRoute.js`
Route guard for authenticated user sections:
```javascript
import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) {
          return <div className="text-center mt-5"><h4>Verifying session...</h4></div>;
        }
        return isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />;
      }}
    />
  );
};

export default PrivateRoute;
```

#### Create `client/xs-records/src/components/AdminRoute.js`
Route guard for administrator sections:
```javascript
import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) {
          return <div className="text-center mt-5"><h4>Verifying session...</h4></div>;
        }
        return isAuthenticated && user && user.role === 'admin' ? (
          <Component {...props} />
        ) : (
          <Redirect to="/dashboard" />
        );
      }}
    />
  );
};

export default AdminRoute;
```

#### Update Routes wiring in `client/xs-records/src/routes.js`
Apply private route protection:
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

---

### 4.5 Component-Level Refactoring

#### Update Navigation (`client/xs-records/src/components/nav.js`)
Use `AuthContext` to dynamically render navigation items and handle logout:
```javascript
import React, { Component } from 'react';
import { Fragment } from 'react';
import { Collapse, NavbarToggler, Nav, Navbar, NavItem, NavLink, NavbarBrand } from 'reactstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { withRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

class AppNav extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = { collapsed: true };
  }

  toggleNavbar = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };

  handleLogout = (e) => {
    e.preventDefault();
    this.context.logout().then((success) => {
      if (success) {
        this.props.history.push('/login');
      }
    });
  };

  render() {
    const { isAuthenticated, user } = this.context;
    return (
      <Fragment>
        <Navbar color="faded" light expand="md">
          <NavbarBrand href="/" className="navBrand">XS-Records</NavbarBrand>
          <NavbarToggler onClick={this.toggleNavbar} className="mr-2" style={{ backgroundColor: '#d5e6f7' }} />
          <Collapse isOpen={!this.state.collapsed} navbar>
            <Nav className="ml-auto" navbar>
              {isAuthenticated ? (
                <Fragment>
                  <NavItem><span className="navbar-text mr-3 font-weight-bold">Hello, {user ? user.username : ''}</span></NavItem>
                  <LinkContainer to="/dashboard">
                    <NavItem><NavLink className="font-weight-bold">Dashboard</NavLink></NavItem>
                  </LinkContainer>
                  <LinkContainer to="/add-album">
                    <NavItem><NavLink className="font-weight-bold">Add Album</NavLink></NavItem>
                  </LinkContainer>
                  <LinkContainer to="/add-track">
                    <NavItem><NavLink className="font-weight-bold">Add Track</NavLink></NavItem>
                  </LinkContainer>
                  {user && user.role === 'admin' && (
                    <LinkContainer to="/admin">
                      <NavItem><NavLink className="font-weight-bold text-danger">Admin</NavLink></NavItem>
                    </LinkContainer>
                  )}
                  <NavItem>
                    <NavLink onClick={this.handleLogout} className="font-weight-bold" style={{ cursor: 'pointer' }}>Logout</NavLink>
                  </NavItem>
                </Fragment>
              ) : (
                <Fragment>
                  <LinkContainer to="/login">
                    <NavItem><NavLink className="font-weight-bold">Login</NavLink></NavItem>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <NavItem><NavLink className="font-weight-bold">Register</NavLink></NavItem>
                  </LinkContainer>
                </Fragment>
              )}
            </Nav>
          </Collapse>
        </Navbar>
      </Fragment>
    );
  }
}

export default withRouter(AppNav);
```

#### Update Sign-Up component (`client/xs-records/src/components/register.js`)
Include a mandatory checkbox to agree to the Terms of Service:
```javascript
// Modify constructor state:
this.state = {
  fname: '',
  lname: '',
  email: '',
  username: '',
  password: '',
  termsAccepted: false,
  redirect: false
};

// Update onChange handler to resolve type === 'checkbox':
onChange = (event) => {
  const { name, value, type, checked } = event.target;
  this.setState({
    [name]: type === 'checkbox' ? checked : value
  });
}

// Modify handleSubmit validation check:
handleSubmit = (event) => {
  event.preventDefault();
  
  if (!this.state.termsAccepted) {
    alert('You must accept the Terms of Service to register.');
    return;
  }

  fetch('/users/register', {
    method: 'post',
    body: JSON.stringify({
      fname: this.state.fname,
      lname: this.state.lname,
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
      termsAccepted: this.state.termsAccepted
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        this.setState({ redirect: true });
      } else {
        alert(data.error || 'Registration failed');
      }
    })
    .catch((err) => {
      console.error(err);
      alert('An error occurred during registration.');
    });
}

// Add the Form checkbox group to the layout (above the Submit button):
<FormGroup check className="mb-3">
  <Label check>
    <Input 
      type="checkbox" 
      name="termsAccepted" 
      id="termsAccepted" 
      onChange={this.onChange} 
      checked={this.state.termsAccepted} 
    />{' '}
    I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
  </Label>
</FormGroup>
```

#### Update Log-In component (`client/xs-records/src/components/login-form.js`)
Connect login submission to the global `AuthContext`:
```javascript
import { AuthContext } from '../context/AuthContext';

class LoginForm extends Component {
  static contextType = AuthContext;

  handleSubmit = (event) => {
    event.preventDefault();
    const { username, password } = this.state;
    
    if (!username || !password) {
      this.setState({ message: 'Username and password are required.' });
      return;
    }

    this.context.login(username, password).then((success) => {
      if (success) {
        this.setState({ redirect: true, loggedIn: true });
      } else {
        this.setState({ message: 'Incorrect username or password' });
      }
    });
  }
}
```

---

## 5. Security & Access Control Enhancements
1. **Cookie Session Integrity**: Ensure the token cookie is created with `httpOnly: true` (which is already configured) to prevent cross-site scripting (XSS) extraction.
2. **Access Control Checks on API routes**: Backend controllers for resource modification (creating albums/tracks) must use the `withAuth` middleware.
3. **Database Security Mapping**: By looking up user profiles via `req.username` in the database, the backend verifies ownership dynamically instead of relying on the client-side passing the `user` id via request parameters.
4. **Admin Route Guards**: Client-side `<AdminRoute>` guards enforce route blocking for user roles, and the server-side role-based checks (`requireRole('admin')`) protect API endpoints from unauthorized execution.

---

## 6. Verification and Testing Methodologies

### 6.1 Backend API Unit/Integration Testing
Write integration tests using a testing library (e.g. Supertest with Jest) to verify API routing behaviors:
* Verify that posting to `/users/register` fails with status `400` if `termsAccepted` is false.
* Verify that posting valid user fields and `termsAccepted: true` returns `200` and saves user credentials (with default role `"user"` and balance `0` in `db.json`).
* Verify that `POST /users/login` issues a cookie header named `token` and returns redirect directives on valid details, or returns `401` on invalid details.
* Verify that `GET /users/verify` responds with status `200` and the user profile JSON (including username, role, and balance) when called with a valid cookie, or status `401` when unauthenticated.
* Verify that `POST /albums/add` and `POST /tracks/add` reject requests without token cookies, returning `401`.

### 6.2 Frontend Interface Guard Verification
Verify component mount and route redirects:
1. Access `/dashboard` directly in the browser address bar as an anonymous user -> Expect redirection to `/login`.
2. Navigate to `/register`, enter fields, leave the ToS checkbox empty, submit -> Expect error alert "You must accept the Terms of Service to register."
3. Check the ToS checkbox and submit register -> Expect redirect to `/login`.
4. Log in with the newly created account -> Expect redirect to `/dashboard`. Verify navbar has updated to show "Hello, <username>" and protected navigation menu options.
5. Attempt to access `/admin` dashboard -> Expect redirect to `/dashboard` (since the user role defaults to `"user"`).
6. Update user role in `db.json` to `"admin"`, refresh dashboard -> Verify the "Admin" button appears in the navbar and navigating to `/admin` succeeds.
7. Click "Logout" -> Expect cookie clearance and redirect to `/login`.
