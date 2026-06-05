# Analysis & Implementation Plan: Protected Routes & Authentication

## 1. Current Authentication Setup Analysis

### Server-Side Setup
- **Express Server (`server/app.js`)**:
  - Uses `cookie-parser` middleware (`app.use(cookieParser())`) to read/write cookies.
  - Session middleware is active with a maxAge of 10 minutes (600,000ms).
- **Database (`server/db.js`)**:
  - Emulates MongoDB by loading and writing to `server/db.json` synchronously.
  - Implements password hashing with `bcryptjs` and user saving/comparison helper functions: `saveUser`, `findUserByUsername`, and `comparePassword`.
  - Associative links: Album data has a `user` field representing the creator's user ID. `db.getAlbums()` populates user information by matching `album.user` to the user's `_id`.
- **JWT Middleware (`server/middleware.js`)**:
  - Defines the `withAuth` function which searches for a JWT `token` in the body, query parameters, `x-access-token` header, and cookies.
  - Uses JWT verification via secret `'gracie'`.
  - Populates `req.username` on success, or returns status `401` with text-based responses (`Unauthorized: No token provided` / `Unauthorized: Invalid token`) on failure.
- **Users Router (`server/routes/users.js`)**:
  - Has `/login` and `/register` endpoints.
  - `/login` issues a JWT with 1 hour expiration and sets it in an HTTP-only cookie named `token`.
  - Has a dummy `/dashboard` GET route protected by `withAuth` which just returns the text `'The dashboard'`.
- **Unprotected Routes**:
  - `POST /albums/add` and `POST /tracks/add` are currently **unprotected** and do not utilize `withAuth`. Additionally, `POST /albums/add` attempts to parse `req.body.user` directly from the client post body instead of resolving it from the authenticated session/cookie.

### Client-Side Setup
- **React App (`client/xs-records/src/App.js`)**:
  - Serves as the main container rendering the Navbar (`AppNav`) and routes (`Routes`).
  - Lacks global authentication state or verification logic on mount.
- **Routing (`client/xs-records/src/routes.js`)**:
  - Implements React Router v5 `<Switch>` with `<Route>` components.
  - Currently exposes all routes publicly: `/dashboard`, `/login`, `/register`, `/`, `/add-album`, and `/add-track`.
- **Forms & Components**:
  - `login-form.js` submits login requests using `fetch` to `/users/login` and handles local redirect state if successful, but doesn't share authentication status globally.
  - `nav.js` renders a static navbar that always displays "Login" and "Register", regardless of whether the user is logged in.

---

## 2. Requirements Analysis

According to the global `PROJECT.md` specification:
1. **Protected Client-Side Routes**:
   - `/dashboard`, `/add-album`, and `/add-track` must be client-side protected routes. If unauthenticated, they must redirect to `/login`.
2. **Backend Auth Verification (`GET /users/verify`)**:
   - Headers: Cookie `token=<jwt_token>`
   - Success response (`200 OK`): `{ success: true, user: { username: "..." } }`
   - Unauthorized response (`401 Unauthorized`): `{ success: false, error: "..." }`
3. **Backend Auth Logout (`POST /users/logout`)**:
   - Success response (`200 OK`): `{ success: true }` (should clear the `token` cookie).
4. **Middleware Checks**:
   - Backend APIs for album creation (`POST /albums/add`) and track creation (`POST /tracks/add`) should be protected by the `withAuth` middleware.
   - For `/albums/add`, the user's `_id` should be resolved from their authenticated `req.username` rather than a payload input from the request body.

---

## 3. Implementation Plan & Strategy

We will structure this into three parts:
- A. Backend route/middleware changes
- B. Frontend React Auth Context & Private Route component creation
- C. Frontend components modification to consume the Auth state

### Part A: Backend Modifications

#### 1. Standardize JWT Middleware (`server/middleware.js`)
We will adjust the `withAuth` middleware so that unauthorized responses return JSON objects matching the specifications in `PROJECT.md`.

```javascript
// Proposed server/middleware.js changes:
const jwt = require('jsonwebtoken');
const secret = 'gracie';

const withAuth = function(req, res, next) {
  const token = 
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.cookies.token;

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
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

#### 2. Implement Verify and Logout APIs (`server/routes/users.js`)
Add the `GET /users/verify` and `POST /users/logout` routes to the users router.

```javascript
// Proposed additions to server/routes/users.js:

// Verification Endpoint
router.get('/verify', withAuth, function(req, res) {
  res.status(200).json({ 
    success: true, 
    user: { username: req.username } 
  });
});

// Logout Endpoint
router.post('/logout', function(req, res) {
  res.clearCookie('token', { httpOnly: true });
  res.status(200).json({ success: true });
});
```

#### 3. Protect Album and Track Creation Endpoints
Add `withAuth` middleware to `/albums/add` and `/tracks/add`. In `/albums/add`, retrieve the user ID using the verified username to associate the album correctly in the database.

```javascript
// Proposed updates in server/routes/albums.js:
const withAuth = require('../middleware');

router.post('/add', withAuth, function(req, res, next) {
  try {
    const userObj = db.findUserByUsername(req.username);
    const userId = userObj ? userObj._id : null;
    const album = db.saveAlbum({
      albumName: req.body.albumName,
      numberOfTracks: parseInt(req.body.numberOfTracks),
      artist: req.body.artist,
      cover: req.body.cover,
      user: userId
    });
    req.session.lastAlbumId = album._id;
    res.status(200).json({ message: 'Album created successfully', id: album._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving album' });
  }
});
```

```javascript
// Proposed updates in server/routes/tracks.js:
const withAuth = require('../middleware');

router.post('/add', withAuth, function(req, res, next) {
  // Existing logic remains intact ...
```

---

### Part B: Frontend Core Components

#### 1. React Auth Context (`client/xs-records/src/context/AuthContext.js`)
Create the authentication context and provider to manage global auth state. On initialization, it calls the `GET /users/verify` API to check for an active JWT cookie session.

```javascript
// Create file: client/xs-records/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check verification on page reload
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/users/verify');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Initial verification failed:', err);
      } finally {
        setLoading(false);
      }
    };
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
        setUser({ username });
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
      const res = await fetch('/users/logout', {
        method: 'POST'
      });
      if (res.ok) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 2. PrivateRoute Component (`client/xs-records/src/components/PrivateRoute.js`)
Create a custom routing wrapper using React Router v5. It reads the context authentication status and redirects non-authenticated requests to `/login`.

```javascript
// Create file: client/xs-records/src/components/PrivateRoute.js
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
          // Render loading indicator while verify API is in progress
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

---

### Part C: Update Frontend Layout & Routers

#### 1. Integrate `AuthProvider` (`client/xs-records/src/App.js`)
Wrap the main React layout inside the global `AuthProvider`.

```javascript
// Proposed changes in client/xs-records/src/App.js:
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

#### 2. Protect Routes (`client/xs-records/src/routes.js`)
Update the routes table to map `/dashboard`, `/add-album`, and `/add-track` routes using `<PrivateRoute>` instead of `<Route>`.

```javascript
// Proposed changes in client/xs-records/src/routes.js:
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

#### 3. Update Nav Bar to show Dynamic Controls (`client/xs-records/src/components/nav.js`)
Change the static Login/Register navigation list to show Dashboard, Add Album, Add Track, and a Logout action dynamically.

```javascript
// Proposed changes in client/xs-records/src/components/nav.js:
import React, { Component, Fragment } from 'react';
import { Collapse, NavbarToggler, Nav, Navbar, NavItem, NavLink, NavbarBrand } from 'reactstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { AuthContext } from '../context/AuthContext';

class AppNav extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true
    };
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  handleLogout = (e) => {
    e.preventDefault();
    this.context.logout();
  }

  render() {
    const { isAuthenticated, user } = this.context;

    return (
      <Fragment>
        <Navbar color="faded" light expand="md">
          <NavbarBrand href="/" className="navBrand">XS-Records</NavbarBrand>
          <NavbarToggler onClick={ this.toggleNavbar } className="mr-2" style={ { backgroundColor: '#d5e6f7'}} />
          <Collapse isOpen={ !this.state.collapsed } navbar>
            <Nav className="ml-auto" navbar>
              {isAuthenticated ? (
                <Fragment>
                  <NavItem className="d-flex align-items-center mr-3">
                    <span className="text-muted font-weight-bold">
                      Hello, {user ? user.username : ''}
                    </span>
                  </NavItem>
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
                    <NavLink className="font-weight-bold" onClick={this.handleLogout}>Logout</NavLink>
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
    )
  }
}

export default AppNav;
```

#### 4. Connect Login Form to AuthContext (`client/xs-records/src/components/login-form.js`)
Refactor the Login Form to call `context.login` instead of direct fetch, ensuring the global auth state is populated, and showing error messages locally if authentication fails.

```javascript
// Proposed changes in client/xs-records/src/components/login-form.js:
import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

class LoginForm extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      message: '',
      redirect: false,
      loggedIn: false
    };
  }

  onChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.context.login(this.state.username, this.state.password)
      .then((res) => {
        if (res.success) {
          this.setState({ redirect: true, loggedIn: true });
        } else {
          this.setState({ message: res.error });
        }
      });
  }

  renderRedirect = () => {
    if (this.state.redirect || this.state.loggedIn || this.context.isAuthenticated) {
      return <Redirect to="/dashboard" />
    }
  }

  render() {
    return (
      <Container>
        {this.renderRedirect()}
        <h2 className="text-center">login</h2>
        <Row>
          <Col md={{size: 6, offset: 3}}>
            {this.state.message && (
              <div className="alert alert-danger text-center" role="alert">
                {this.state.message}
              </div>
            )}
            <Form onSubmit={this.handleSubmit}>
              <FormGroup>
                <Label for="username">Username</Label>
                <Input onChange={this.onChange} type="text" name="username" id="username" placeholder="Username" />
              </FormGroup>
              <FormGroup>
                <Label for="password">Password</Label>
                <Input onChange={this.onChange} type="password" name="password" id="password" placeholder="Password" />
              </FormGroup>
              <Button type="submit" value="submit">Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default LoginForm;
```
