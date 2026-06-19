import React, { Component } from 'react';
import { Fragment } from 'react';
import { Collapse, NavbarToggler, Nav, Navbar, NavItem, NavLink, NavbarBrand } from 'reactstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { AuthContext } from '../context/AuthContext';

class AppNav extends Component {
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

  handleLogout = (event) => {
    event.preventDefault();
    this.context.logout();
  }

  render() {
    const { isAuthenticated, user } = this.context;

    return (
      <Fragment>
        <Navbar dark expand="md" style={{
          background: 'rgba(10, 10, 15, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 24px'
        }}>
          <NavbarBrand href="#/" style={{
            fontWeight: 700,
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px'
          }}>
            XS Records
          </NavbarBrand>
          <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
          <Collapse isOpen={!this.state.collapsed} navbar>
            <Nav className="ml-auto align-items-center" navbar>
              {isAuthenticated ? (
                <Fragment>
                  <NavItem className="mr-3">
                    <span className="nav-balance-badge">
                      ${user && user.balance != null ? parseFloat(user.balance).toFixed(2) : '0.00'}
                    </span>
                  </NavItem>
                  <span className="navbar-text mr-3" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Hello, {user && user.username}
                  </span>
                  {user && user.role === 'admin' && (
                    <LinkContainer to="/admin">
                      <NavItem className="nav-admin-link">
                        <NavLink style={{ color: '#a855f7', fontWeight: 600 }}>Admin</NavLink>
                      </NavItem>
                    </LinkContainer>
                  )}
                  <LinkContainer to="/dashboard">
                    <NavItem>
                      <NavLink style={{ color: '#94a3b8', fontWeight: 500 }}>Dashboard</NavLink>
                    </NavItem>
                  </LinkContainer>
                  <LinkContainer to="/add-album">
                    <NavItem>
                      <NavLink style={{ color: '#94a3b8', fontWeight: 500 }}>New Release</NavLink>
                    </NavItem>
                  </LinkContainer>
                  <NavItem>
                    <NavLink href="#" onClick={this.handleLogout} style={{ color: '#94a3b8', fontWeight: 500 }}>Logout</NavLink>
                  </NavItem>
                </Fragment>
              ) : (
                <Fragment>
                  <LinkContainer to="/about">
                    <NavItem>
                      <NavLink style={{ color: '#94a3b8', fontWeight: 500 }}>About</NavLink>
                    </NavItem>
                  </LinkContainer>
                  <LinkContainer to="/blogs">
                    <NavItem>
                      <NavLink style={{ color: '#94a3b8', fontWeight: 500 }}>Blog</NavLink>
                    </NavItem>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <NavItem>
                      <NavLink style={{ color: '#94a3b8', fontWeight: 500 }}>Login</NavLink>
                    </NavItem>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <NavItem>
                      <NavLink style={{
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        color: '#fff',
                        borderRadius: '8px',
                        fontWeight: 600,
                        padding: '8px 20px'
                      }}>
                        Get Started
                      </NavLink>
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

AppNav.contextType = AuthContext;

export default AppNav;
