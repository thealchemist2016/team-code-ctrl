# Analysis and Implementation Plan: Database Model & Authentication Setup

## 1. Executive Summary
This document analyzes the current database model and authentication setup for the XS-Records platform (Milestone 1) and presents a comprehensive, step-by-step implementation plan. 

The application is structured around a local JSON database emulating MongoDB. We identify missing fields in the database schema (such as user roles, balance, address, payment info, and Terms of Service acceptance status) and identify gaps in authentication (specifically, lack of signup-time validation, missing token verification, and lack of role-based route access controls).

Our implementation plan defines the exact database schema changes, backend route additions/modifications, and frontend integrations required to implement JWT cookie authentication, Sign-Up validation (with Terms of Service checks), Log-In, access controls, and admin/user role segregation.

---

## 2. Current State Analysis

### 2.1 Database Model (`server/db.json`, `server/db.js`, `server/models/*`)
- **Storage Layer (`server/db.json`)**:
  - Emulates MongoDB records using standard JSON lists.
  - The schema structure for a user is currently minimal:
    ```json
    {
      "fname": "Michael",
      "lname": "Byrd",
      "email": "michaelbyrd7741@gmail.com",
      "username": "michaelbyrd7741@gmail.com",
      "password": "$2a$10$sbaZciiv/QfxzdluqKVf6uJozLNT66AUzeSRorruB9GoNHrjKnS12",
      "_id": "u-1780631162676"
    }
    ```
  - **Gaps**: It lacks crucial user fields for roles (`role`), financial balance (`balance`), terms of service compliance (`tosAccepted`), and user profile parameters (`address`, `paypalOrBank`, `taxDoc`) required by subsequent milestones.
- **Data Access Utilities (`server/db.js`)**:
  - Implements basic operations like `getUsers()`, `saveUser()`, `findUserByUsername()`, `comparePassword()`, `getAlbums()`, `saveAlbum()`, `getLatestAlbum()`, and `saveTrack()`.
  - Password hashing is performed using `bcryptjs` synchronously during `saveUser`.
  - **Gaps**: It lacks lookups by email (`findUserByEmail`), lookups by user ID (`findUserById`), and update helpers (`updateUser`) to modify profile details.
- **Mongoose Models (`server/models/`)**:
  - `userModel.js`, `albumModel.js`, and `trackModel.js` define standard Mongoose schemas.
  - **Gaps**: These models are **not** currently integrated into the app. The server relies entirely on the custom `db.js` file-based JSON database engine. The plan details how we should structure the JSON schema to mirror Mongoose structures where relevant.

### 2.2 Authentication Setup (`server/middleware.js`, `config/passport.js`, `server/routes/users.js`)
- **JWT Verification Middleware (`server/middleware.js`)**:
  - Contains `withAuth` which reads JWT tokens from request bodies, query strings, headers (`x-access-token`), or cookies (`req.cookies.token`).
  - Decodes and verifies using the secret `'gracie'` and sets `req.username = decoded.username`.
  - **Gaps**:
    - Returns plain-text responses on failure (`Unauthorized: No token provided` / `Unauthorized: Invalid token`) instead of the structured JSON contract `{ success: false, error: "..." }` specified in `PROJECT.md`.
    - Does not resolve user roles or ID from the token payload.
- **Passport Config (`server/config/passport.js`)**:
  - Contains only `const passport = require('passport');`. It is completely unconfigured.
  - Express app (`app.js`) initializes and loads passport, but the application routes utilize the custom `withAuth` middleware instead.
- **Users Router (`server/routes/users.js`)**:
  - `/login`: Verifies password and username, signs a JWT token expiring in 1 hour, sets it as an HTTP-only cookie, and returns `{ redirect: true, message: 'Logged in successfully' }`.
  - `/register`: Unconditionally registers the user payload (`fname`, `lname`, `email`, `username`, `password`) into the DB.
  - **Gaps**:
    - **No validation**: There is no check to see if a username or email is already registered, leading to duplicate database records.
    - **No TOS check**: There is no check to verify if the client has accepted the Terms of Service.
    - **Missing endpoints**: Lacks `GET /users/verify` and `POST /users/logout` APIs required by `PROJECT.md`.

---

## 3. Detailed Implementation Plan

We propose a two-phase implementation approach: **Backend Core Services** and **Frontend Interface Integrations**.

### Phase A: Backend Database & Route Enhancements

#### Step 1: Database Migration & Schema Expansion (`server/db.js`)
Introduce default fallbacks for missing properties inside the data retrieval layer, and expand the user object saved during registration.

1. **Add Unique Field Checking & Database Lookup Helpers**:
   Add functions to search by email, search by user ID, and dynamically update user attributes.
   
2. **Standardize User Object Initialization**:
   During `saveUser`, enforce safe defaults for all fields:
   - `role`: `'user'` (default role, or `'admin'` if pre-seeded).
   - `balance`: `0`
   - `address`: `""`
   - `paypalOrBank`: `""`
   - `taxDoc`: `""`
   - `tosAccepted`: `true`

##### Proposed changes in `server/db.js`:
```javascript
// Target Content (starting around line 24):
module.exports = {
  getUsers: () => readData().users,
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
  },
  findUserByUsername: (username) => {
    return readData().users.find(u => u.username === username);
  },
  comparePassword: (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  },
  
// Replacement Content:
module.exports = {
  getUsers: () => readData().users,
  saveUser: (user) => {
    const data = readData();
    
    // Hash password
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(user.password, salt);
    
    const newUser = {
      _id: 'u-' + Date.now(),
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      username: user.username,
      password: hashedPassword,
      role: user.role || 'user',
      balance: user.balance || 0,
      address: user.address || '',
      paypalOrBank: user.paypalOrBank || '',
      taxDoc: user.taxDoc || '',
      tosAccepted: user.tosAccepted === true
    };
    
    data.users.push(newUser);
    writeData(data);
    return newUser;
  },
  findUserByUsername: (username) => {
    const user = readData().users.find(u => u.username === username);
    if (!user) return null;
    return {
      role: 'user',
      balance: 0,
      address: '',
      paypalOrBank: '',
      taxDoc: '',
      tosAccepted: false,
      ...user
    };
  },
  findUserByEmail: (email) => {
    const user = readData().users.find(u => u.email === email);
    if (!user) return null;
    return {
      role: 'user',
      balance: 0,
      address: '',
      paypalOrBank: '',
      taxDoc: '',
      tosAccepted: false,
      ...user
    };
  },
  findUserById: (id) => {
    const user = readData().users.find(u => u._id === id);
    if (!user) return null;
    return {
      role: 'user',
      balance: 0,
      address: '',
      paypalOrBank: '',
      taxDoc: '',
      tosAccepted: false,
      ...user
    };
  },
  updateUser: (id, updatedFields) => {
    const data = readData();
    const index = data.users.findIndex(u => u._id === id);
    if (index !== -1) {
      data.users[index] = {
        ...data.users[index],
        ...updatedFields
      };
      writeData(data);
      return data.users[index];
    }
    return null;
  },
  comparePassword: (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  },
```

#### Step 2: Implement Pre-Seeded Admin User (`server/db.json`)
To allow local testing of admin roles without complex user management interfaces, seed an admin account into `server/db.json`:
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
      "balance": 0,
      "address": "",
      "paypalOrBank": "",
      "taxDoc": "",
      "tosAccepted": true
    },
    {
      "fname": "Platform",
      "lname": "Administrator",
      "email": "admin@xsrecords.com",
      "username": "admin",
      "password": "$2a$10$vWd4P8r08c8KqH8b/44kOuxuO1pE2FmX5Y3/b3GzQO1aC2b2n2c2c", // Hashes to 'adminPassword'
      "_id": "u-admin-seeded",
      "role": "admin",
      "balance": 0,
      "address": "Platform Office",
      "paypalOrBank": "N/A",
      "taxDoc": "",
      "tosAccepted": true
    }
  ],
  ...
}
```

#### Step 3: Upgrade Access Control Middlewares (`server/middleware.js`)
Revise standard JWT validation logic in `withAuth` to return standard-compliant JSON payloads, and define an admin-only authorization gate.

1. **Verify Token Payload & Inject Context**:
   Parse user properties directly from database entries dynamically, providing resilient access controls even if user states change.
2. **Provide Admin Route Guard (`adminOnly`)**:
   Verify user roles before matching router endpoints.

##### Proposed implementation for `server/middleware.js`:
```javascript
const jwt = require('jsonwebtoken');
const db = require('./db');
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
    
    // Resolve user details dynamically
    const user = db.findUserByUsername(decoded.username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found' });
    }

    req.username = user.username;
    req.userId = user._id;
    req.role = user.role || 'user';
    next();
  });
};

const adminOnly = function(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin authorization required' });
  }
  next();
};

module.exports = {
  withAuth,
  adminOnly
};
```

#### Step 4: Revise User Account Endpoint Routers (`server/routes/users.js`)
Update `/register` and `/login` handlers, and append implementation details for `/verify` and `/logout`.

1. **TOS Verification and Profile Property Validation**:
   Check if the checkbox value (`tosAccepted`) is falsy or missing during sign-up requests. Ensure username and email collisions are caught early.
2. **Cookie Auth on Login**:
   Issue JWT token cookies containing user context.
3. **Verify Handler (`GET /users/verify`)**:
   Resolve the logged-in context back to the frontend.
4. **Logout Route (`POST /users/logout`)**:
   Clear the HTTP-only cookie safely.

##### Proposed changes in `server/routes/users.js`:
```javascript
// Target Content (all file contents starting at imports and going to bottom):
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const withAuth = require('../middleware');
const db = require('../db');
const secret = 'gracie';

router.post('/login', function(req, res, next) { ... });
router.post('/register', function(req, res, next) { ... });
router.get('/dashboard', withAuth, function(req, res, next) { ... });
module.exports = router;

// Replacement Content:
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { withAuth } = require('../middleware');
const db = require('../db');
const secret = 'gracie';

// Login Endpoint
router.post('/login', function(req, res, next) {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Incorrect username or password' });
  }

  const same = db.comparePassword(password, user.password);
  if (!same) {
    return res.status(401).json({ error: 'Incorrect username or password' });
  }

  // Issue token containing username
  const payload = { username: user.username };
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  
  res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'strict' })
    .status(200)
    .json({ redirect: true, message: 'Logged in successfully' });
});

// Register Endpoint with TOS validation & Uniqueness checks
router.post('/register', function(req, res, next) {
  const { fname, lname, email, username, password, tosAccepted } = req.body;
  
  // 1. Mandatory Fields Validation
  if (!fname || !lname || !email || !username || !password) {
    return res.status(400).json({ success: false, message: "All registration fields are required." });
  }

  // 2. Terms of Service Validation
  if (tosAccepted !== true) {
    return res.status(400).json({ success: false, message: "You must accept the Terms of Service to register." });
  }

  try {
    // 3. Check for Duplicate Username
    if (db.findUserByUsername(username)) {
      return res.status(400).json({ success: false, message: "Username is already registered." });
    }

    // 4. Check for Duplicate Email
    if (db.findUserByEmail(email)) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    // 5. Persist User with default settings
    db.saveUser({
      fname,
      lname,
      email,
      username,
      password,
      role: 'user',
      balance: 0,
      address: '',
      paypalOrBank: '',
      taxDoc: '',
      tosAccepted: true
    });

    res.status(200).json({ success: true, message: "New user registered successfully." });
  } catch (err) {
    console.error("Registration failed:", err);
    res.status(500).json({ success: false, message: "Error registering new user. Please try again." });
  }
});

// Token Verification API
router.get('/verify', withAuth, function(req, res) {
  const user = db.findUserByUsername(req.username);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: User does not exist' });
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

// Logout Endpoint
router.post('/logout', function(req, res) {
  res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'strict' });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

router.get('/dashboard', withAuth, function(req, res, next) {
  res.send('The dashboard');
});

module.exports = router;
```

---

### Phase B: Frontend React Integrations

To track and enforce session states client-side, we must create a global context, guard React routes, and adapt user interactions.

#### Step 1: Create React Authentication Context (`client/xs-records/src/context/AuthContext.js`)
We will develop a standard Context provider wrapping standard lifecycle calls (`verify`, `login`, `logout`) that routes can hook into.

```javascript
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check login state on component mount / reload
  const checkAuth = async () => {
    try {
      const res = await fetch('/users/verify');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Initial token verification failed:', err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.redirect) {
        // Run verify query to get fresh details (role, balance)
        const verifyRes = await fetch('/users/verify');
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setUser(verifyData.user);
            setIsAuthenticated(true);
            return { success: true };
          }
        }
        setUser({ username, role: 'user', balance: 0 });
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred during login.' };
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/users/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Step 2: Implement Client-Side Route Guards (`client/xs-records/src/components/PrivateRoute.js`)
We will declare custom `<PrivateRoute>` and `<AdminRoute>` components to guard protected pages.

```javascript
// client/xs-records/src/components/PrivateRoute.js
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
          return (
            <div className="text-center mt-5">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          );
        }
        return isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        );
      }}
    />
  );
};

export default PrivateRoute;
```

Similarly, create an `AdminRoute`:
```javascript
// client/xs-records/src/components/AdminRoute.js
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
          return <div className="text-center mt-5">Loading...</div>;
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

#### Step 3: Connect Context to App Router (`client/xs-records/src/App.js` & `src/routes.js`)
Update root nodes to make sure AuthProvider encompasses routing elements and protect URLs.

1. **`App.js`**: Wrap content structure inside `<AuthProvider>`.
2. **`routes.js`**: Replace protected items:
   ```javascript
   import PrivateRoute from './components/PrivateRoute';
   
   export default () => 
     <Switch>
       <PrivateRoute path="/dashboard" exact component={Dashboard} />
       <Route path="/login" exact component={Login} />
       <Route path="/register" exact component={Register} />
       <Route path="/" exact component={Home} />
       <PrivateRoute path="/add-album" exact component={AddAlbum} />
       <PrivateRoute path="/add-track" exact component={AddTrack} />
       {/* Future Admin Dashboard route under Milestone 4 */}
       {/* <AdminRoute path="/admin" exact component={AdminDashboard} /> */}
     </Switch>;
   ```

#### Step 4: Revise Forms with Validations

##### Register Component (`client/xs-records/src/components/register.js`)
We will add a Terms of Service checkbox into the form fields, change state updates to process boolean states on checkboxes, and ensure form submission blocks invalid attempts.

1. **Add Form state variable**:
   ```javascript
   this.state = {
     fname: '',
     lname: '',
     email: '',
     username: '',
     password: '',
     tosAccepted: false, // Default is unaccepted
     redirect: false
   };
   ```
2. **Update input listener (`onChange`)**:
   Adjust listener values dynamically depending on input elements:
   ```javascript
   onChange = (event) => {
     const target = event.target;
     const value = target.type === 'checkbox' ? target.checked : target.value;
     this.setState({
       [target.name]: value
     });
   }
   ```
3. **Form layout**:
   Append Reactstrap FormGroup check markup before the submit button:
   ```javascript
   <FormGroup check className="mb-3">
     <Label check>
       <Input 
         type="checkbox" 
         name="tosAccepted" 
         id="tosAccepted"
         onChange={this.onChange} 
         checked={this.state.tosAccepted} 
       />{' '}
       I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
     </Label>
   </FormGroup>
   ```
4. **Validation Logic inside `handleSubmit`**:
   Check checkbox before firing off fetch calls:
   ```javascript
   handleSubmit = (event) => {
     event.preventDefault();
     const { fname, lname, email, username, password, tosAccepted } = this.state;
     
     if (!fname || !lname || !email || !username || !password) {
       alert('All fields are required.');
       return;
     }

     if (!tosAccepted) {
       alert('You must accept the Terms of Service to register.');
       return;
     }
     
     // Fetch request proceeds...
   ```

##### Login Component (`client/xs-records/src/components/login-form.js`)
We will change `LoginForm` to call the shared context controller so details persist globally.

1. **Utilize Static Context ContextType**:
   ```javascript
   class LoginForm extends Component {
     static contextType = AuthContext;
     // ...
   ```
2. **Submit via AuthContext**:
   ```javascript
   handleSubmit = (event) => {
     event.preventDefault();
     const { username, password } = this.state;

     if (!username || !password) {
       this.setState({ message: 'Username and password are required' });
       return;
     }

     this.context.login(username, password)
       .then((res) => {
         if (res.success) {
           this.setState({ redirect: true, loggedIn: true });
         } else {
           this.setState({ message: res.error });
         }
       });
   }
   ```
3. **Handle automatic redirects**:
   Inside `renderRedirect`:
   ```javascript
   renderRedirect = () => {
     if (this.state.redirect || this.state.loggedIn || this.context.isAuthenticated) {
       return <Redirect to="/dashboard" />
     }
   }
   ```

#### Step 5: Render Responsive & Role-Based Navigation Bar (`client/xs-records/src/components/nav.js`)
Update the dynamic menu to display options matching users' access clearances.

1. **Connect static context type**:
   ```javascript
   class AppNav extends Component {
     static contextType = AuthContext;
     // ...
   ```
2. **Render conditional paths based on Role**:
   - Guest Layout: Display links to `Login` and `Register`.
   - Logged-in User: Display greeting `Hello, <username> (Balance: $<balance>)`, links to `Dashboard`, `Add Album`, and `Logout`.
   - Logged-in Admin: Additionally show `Admin Dashboard` or admin features (e.g. `/admin/users` controls).

```javascript
render() {
  const { isAuthenticated, user, logout } = this.context;

  return (
    <Fragment>
      <Navbar color="faded" light expand="md">
        <NavbarBrand href="/" className="navBrand">XS-Records</NavbarBrand>
        <NavbarToggler onClick={ this.toggleNavbar } className="mr-2" style={{ backgroundColor: '#d5e6f7' }} />
        <Collapse isOpen={ !this.state.collapsed } navbar>
          <Nav className="ml-auto" navbar>
            {isAuthenticated ? (
              <Fragment>
                <NavItem className="d-flex align-items-center mr-3">
                  <span className="text-muted font-weight-bold">
                    Hello, {user ? user.username : ''} (Balance: ${user ? user.balance : 0})
                  </span>
                </NavItem>
                
                {user && user.role === 'admin' && (
                  <LinkContainer to="/admin">
                    <NavItem>
                      <NavLink className="font-weight-bold text-danger">Admin Panel</NavLink>
                    </NavItem>
                  </LinkContainer>
                )}

                <LinkContainer to="/dashboard">
                  <NavItem>
                    <NavLink className="font-weight-bold">Dashboard</NavLink>
                  </NavItem>
                </LinkContainer>
                <LinkContainer to="/add-album">
                  <NavItem>
                    <NavLink className="font-weight-bold">Add Album</NavLink>
                  </NavItem>
                </LinkContainer>
                <NavItem style={{ cursor: 'pointer' }}>
                  <NavLink className="font-weight-bold" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</NavLink>
                </NavItem>
              </Fragment>
            ) : (
              <Fragment>
                <LinkContainer to="/login">
                  <NavItem>
                    <NavLink className="font-weight-bold">Login</NavLink>
                  </NavItem>
                </LinkContainer>
                <LinkContainer to="/register">
                  <NavItem>
                    <NavLink className="font-weight-bold">Register</NavLink>
                  </NavItem>
                </LinkContainer>
              </Fragment>
            )}
          </Nav>
        </Collapse>
      </Navbar>
    </Fragment>
  );
}
```

---

## 4. Alignments to PROJECT.md and SCOPE.md

This proposal directly matches specified platform architecture requirements:

- **JWT Auth via Cookie & route protection**: Meets Milestone 1 (M1) backend specifications by maintaining cookie-based token signatures (`token`) and the route protection wrapper `withAuth`. It fulfills the endpoint expectations for user verification `GET /users/verify` and token cleanup `POST /users/logout`.
- **Sign-Up & Log-In UI features**: Fulfills registration flow standards, ensuring Terms of Service (TOS) compliance checks occur securely both on the frontend form validations and backend database persistence gates.
- **Support for user roles (`admin` vs `user`) in database**: Prepares database schemas (`db.json`) for admin views and data export features under Milestone 4 (M4) by defining structural user roles early in development.
- **Platform styling alignment**: Consistently maintains existing markup structures using `Reactstrap` wrappers (such as `Container`, `Row`, `Col`, `FormGroup`, etc.), establishing smooth transitions for styling milestones (M5).

---

## 5. Security Safeguards & Risk Assessment

- **JWT Secret Security**: Currently, the signing key `'gracie'` is hardcoded in files. In production, this must be stored in environment variables (such as `process.env.JWT_SECRET`) to prevent security leaks.
- **XSS Mitigation**: The token cookie is marked `httpOnly: true`. This prevents client-side javascript from querying raw cookie tokens, which mitigates cross-site scripting (XSS) risks.
- **CSRF Consideration**: As we are storing tokens inside client-side cookies, adding `sameSite: 'strict'` and `secure: true` (in production) to cookies prevents Cross-Site Request Forgery (CSRF) issues.
- **Race conditions in local JSON DB storage**: Since the JSON file database uses synchronous operations (`fs.writeFileSync`), server routes will block during writes. This is fine for development and testing, but for production, this should be migrated to an async MongoDB connector or SQL storage.
