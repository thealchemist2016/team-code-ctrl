# Analysis Report: Protected Routes & Auth (Milestone 1)

This report details the implementation plan for Milestone 1 (Protected Routes & Auth) of the XS-Records Discography application. The goal is to implement client-side route protection, backend authentication verification and logout APIs, and apply route protection middleware checks.

---

## 1. Executive Summary
- **Current State**: Client-side routing lacks guards, allowing anyone to access `/dashboard`, `/add-album`, or `/add-track`. The server implements JWT-based login using cookies but does not expose verify/logout endpoints or enforce authentication on the album/track creation APIs.
- **Proposed Solution**: Introduce `AuthContext` to manage global auth state on the client, implement a `<PrivateRoute>` guard for protected routes, write `/users/verify` and `/users/logout` endpoints on the server, configure the `withAuth` middleware to return JSON errors, and secure album/track creation APIs.

---

## 2. Codebase Review & Current Authentication Setup

### Server-Side Inspection
- **Authentication Mechanism**: Implemented in `server/routes/users.js` (`/login` on lines 8-27) using JSON Web Tokens (JWT) signed with the secret `'gracie'`.
- **JWT Storage**: Tokens are signed with a 1-hour expiration and stored in an HTTP-only cookie named `token`:
  ```javascript
  res.cookie('token', token, { httpOnly: true })
  ```
- **JWT Verification**: Handled by the `withAuth` middleware in `server/middleware.js` (lines 4-23). It extracts the token from the request body, query params, headers (`x-access-token`), or cookie (`req.cookies.token`). If verified, it sets `req.username` and calls `next()`.
- **API Security**: The routes `POST /albums/add` (in `server/routes/albums.js`) and `POST /tracks/add` (in `server/routes/tracks.js`) are currently **public** and do not utilize `withAuth`.

### Client-Side Inspection
- **Router Configuration**: Located in `client/xs-records/src/routes.js`. It defines standard `<Route>` components for `/dashboard`, `/add-album`, and `/add-track`. No route guards are present.
- **State Management**: Authentication state is entirely component-local. For example, `LoginForm` (in `client/xs-records/src/components/login-form.js`) performs a fetch to `/users/login` and updates local component state to handle local redirection. No global session is shared.

---

## 3. Client-Side Implementation Strategy (R5)

### A. React Context: `AuthContext`
We will introduce `AuthContext` in `client/xs-records/src/context/AuthContext.js` to manage the global authentication state.

#### State Structure
```javascript
state = {
  user: null,          // { username: "..." } or null
  isAuthenticated: false,
  loading: true        // True while checking initial session, prevents route flashing
}
```

#### Context Methods
- `verifySession()`: Initiates a fetch to `/users/verify`.
- `login(username, password)`: Sends credentials to `/users/login`.
- `logout()`: Clears the session via `/users/logout`.

#### File Template: `client/xs-records/src/context/AuthContext.js`
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
    return fetch('/users/verify', { credentials: 'same-origin' })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
        throw new Error('Not authenticated');
      })
      .then((data) => {
        if (data.success) {
          this.setState({
            user: data.user,
            isAuthenticated: true,
            loading: false
          });
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
      },
      credentials: 'same-origin'
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
        throw new Error('Login failed');
      })
      .then((data) => {
        if (data.redirect) {
          this.setState({
            user: { username },
            isAuthenticated: true,
            loading: false
          });
          return true;
        }
        return false;
      })
      .catch((err) => {
        console.error(err);
        this.setState({ user: null, isAuthenticated: false, loading: false });
        return false;
      });
  };

  logout = () => {
    return fetch('/users/logout', {
      method: 'POST',
      credentials: 'same-origin'
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
        throw new Error('Logout failed');
      })
      .then((data) => {
        if (data.success) {
          this.setState({
            user: null,
            isAuthenticated: false,
            loading: false
          });
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

### B. Route Guard: `PrivateRoute`
We will create `client/xs-records/src/components/PrivateRoute.js` to serve as our client-side route guard.

#### File Template: `client/xs-records/src/components/PrivateRoute.js`
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
          // Render loading screen/spinner to prevent layout flashing
          return (
            <div style={{ textAlign: 'center', marginTop: '10%' }}>
              <h3>Checking session...</h3>
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

### C. Integrating Router and Context
1. **App-level wrapping (`App.js`)**: Wrap layout inside `AuthProvider`.
   ```javascript
   import { AuthProvider } from './context/AuthContext';
   // In render():
   return (
     <AuthProvider>
       <main role="main" className="App">
         <AppNav />
         <Routes />
       </main>
     </AuthProvider>
   );
   ```
2. **Switching to Private Route guards (`routes.js`)**:
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
     </Switch>;
   ```

### D. Upgrading UI Navigation (`nav.js`)
We will enable dynamic navigation links and logout triggers.

#### Class Component Integration
```javascript
import { AuthContext } from '../context/AuthContext';
import { withRouter } from 'react-router-dom';

class AppNav extends Component {
  static contextType = AuthContext;

  handleLogout = (e) => {
    e.preventDefault();
    this.context.logout().then((success) => {
      if (success) {
        this.props.history.push('/login');
      }
    });
  };

  render() {
    const { isAuthenticated } = this.context;
    return (
      <Navbar color="faded" light expand="md">
        <NavbarBrand href="/" className="navBrand">XS-Records</NavbarBrand>
        <NavbarToggler onClick={this.toggleNavbar} />
        <Collapse isOpen={!this.state.collapsed} navbar>
          <Nav className="ml-auto" navbar>
            {isAuthenticated ? (
              <React.Fragment>
                <LinkContainer to="/dashboard">
                  <NavItem><NavLink className="font-weight-bold">Dashboard</NavLink></NavItem>
                </LinkContainer>
                <LinkContainer to="/add-album">
                  <NavItem><NavLink className="font-weight-bold">Add Album</NavLink></NavItem>
                </LinkContainer>
                <LinkContainer to="/add-track">
                  <NavItem><NavLink className="font-weight-bold">Add Track</NavLink></NavItem>
                </LinkContainer>
                <NavItem>
                  <NavLink onClick={this.handleLogout} className="font-weight-bold" style={{ cursor: 'pointer' }}>
                    Logout
                  </NavLink>
                </NavItem>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <LinkContainer to="/login">
                  <NavItem><NavLink className="font-weight-bold">Login</NavLink></NavItem>
                </LinkContainer>
                <LinkContainer to="/register">
                  <NavItem><NavLink className="font-weight-bold">Register</NavLink></NavItem>
                </LinkContainer>
              </React.Fragment>
            )}
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default withRouter(AppNav);
```

### E. Upgrading Login Form (`login-form.js`)
`LoginForm` should delegate logic to `AuthContext.login`.
```javascript
import { AuthContext } from '../context/AuthContext';

class LoginForm extends Component {
  static contextType = AuthContext;

  handleSubmit = (event) => {
    event.preventDefault();
    const { username, password } = this.state;
    this.context.login(username, password).then((success) => {
      if (success) {
        this.setState({ redirect: true, loggedIn: true });
      } else {
        this.setState({ message: 'Incorrect username or password' });
      }
    });
  };
  // Render can check state.message and display error alerts if present
}
```

---

## 4. Server-Side Integration Plan

### A. Updating `withAuth` Middleware (`server/middleware.js`)
Currently, `withAuth` sends a plain text response on failure. To match the expected JSON structure specified in the global project file, it must be rewritten:
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

### B. Adding Verification & Logout API endpoints (`server/routes/users.js`)
Add the following endpoint declarations to `server/routes/users.js`:

```javascript
// GET /users/verify
router.get('/verify', withAuth, function(req, res) {
  res.status(200).json({ success: true, user: { username: req.username } });
});

// POST /users/logout
router.post('/logout', function(req, res) {
  res.clearCookie('token');
  res.status(200).json({ success: true });
});
```

### C. Protecting Album and Track Creation routes
Modify `server/routes/albums.js` and `server/routes/tracks.js` to apply the `withAuth` middleware and automatically associate creations with the authenticated user.

#### In `server/routes/albums.js`:
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
      user: userId // Associate with the authenticated user ID
    });
    req.session.lastAlbumId = album._id;
    res.status(200).json({ message: 'Album created successfully', id: album._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving album' });
  }
});
```

#### In `server/routes/tracks.js`:
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

---

## 5. Testing & Verification

### Verification Checklist
1. **Initial Mount**: Check that accessing `/dashboard` triggers a background `GET /users/verify` request, which returns 401 (if no token) and redirects the client to `/login`.
2. **Access Control**: Check that entering direct routes `/dashboard`, `/add-album`, and `/add-track` redirects back to `/login` when unauthenticated.
3. **Login Integration**: Verify that filling in username/password details on `/login` sets an HTTP-only cookie named `token`, changes the context state `isAuthenticated` to true, and navigates the client to `/dashboard`.
4. **Dynamic Navigation**: Verify that the header menu updates to show "Dashboard", "Add Album", "Add Track", and "Logout" buttons upon successful authentication.
5. **Logout**: Verify that clicking "Logout" hits `/users/logout`, which clears the `token` cookie and redirects the client back to `/login`.
6. **API Security**: Perform requests to `POST /albums/add` and `POST /tracks/add` without a cookie to confirm they return status `401` and JSON `{ success: false, error: "..." }`. Verify that with a valid JWT cookie, they execute successfully and populate the database with correct creator user references.
