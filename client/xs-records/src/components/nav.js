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
        <Navbar color="faded" light expand="md">
          <NavbarBrand href="/" className="navBrand">XS-Records</NavbarBrand>
          <NavbarToggler onClick={ this.toggleNavbar } className="mr-2" style={ { backgroundColor: '#d5e6f7'}} />
          <Collapse isOpen={ !this.state.collapsed } navbar>
            <Nav className="ml-auto align-items-center" navbar>
              {isAuthenticated ? (
                <Fragment>
                  <span className="navbar-text mr-3 font-italic text-muted">
                    Hello, {user && user.username} (Balance: ${user && user.balance})
                  </span>
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
                  <NavItem>
                    <NavLink href="#" onClick={this.handleLogout} className="font-weight-bold">Logout</NavLink>
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

AppNav.contextType = AuthContext;

export default AppNav;
