import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: {
        total: 0,
        incomplete: 0,
        pending: 0,
        rejected: 0,
        approved: 0
      }
    };
  }

  componentDidMount() {
    fetch('/albums/stats')
      .then(res => res.json())
      .then(data => {
        if (data) {
          this.setState({
            stats: {
              total: data.total || 0,
              incomplete: data.incomplete || 0,
              pending: data.pending || 0,
              rejected: data.rejected || 0,
              approved: data.approved || 0
            }
          });
        }
      })
      .catch(err => {
        console.warn('Could not fetch album stats:', err);
      });
  }

  isActive(path) {
    if (typeof window !== 'undefined') {
      return window.location.pathname === path;
    }
    return false;
  }

  render() {
    const { user } = this.context;
    const { stats } = this.state;
    const balance = user ? (user.balance || 0) : 0;

    return (
      <aside className="dashboard-sidebar">
        <div className="sidebar-balance">
          <div className="balance-label">Your Balance</div>
          <div className="balance-amount">${parseFloat(balance).toFixed(2)}</div>
        </div>

        <div className="sidebar-section-title">Navigation</div>
        <Link to="/profile" className={'sidebar-nav-link' + (this.isActive('/profile') ? ' active' : '')}>
          <span>👤 Profile</span>
        </Link>
        <Link to="/add-album" className={'sidebar-nav-link' + (this.isActive('/add-album') ? ' active' : '')}>
          <span>➕ Submit a New Release</span>
        </Link>

        <div className="sidebar-section-title">Releases</div>
        <Link to="/releases" className={'sidebar-nav-link' + (this.isActive('/releases') ? ' active' : '')}>
          <span>📀 All Your Releases</span>
          <span className="badge">{stats.total}</span>
        </Link>
        <Link to="/releases/incomplete" className={'sidebar-nav-link' + (this.isActive('/releases/incomplete') ? ' active' : '')}>
          <span>📝 Incomplete</span>
          <span className="badge">{stats.incomplete}</span>
        </Link>
        <Link to="/releases/pending" className={'sidebar-nav-link' + (this.isActive('/releases/pending') ? ' active' : '')}>
          <span>⏳ Pending</span>
          <span className="badge">{stats.pending}</span>
        </Link>
        <Link to="/releases/rejected" className={'sidebar-nav-link' + (this.isActive('/releases/rejected') ? ' active' : '')}>
          <span>❌ Rejected</span>
          <span className="badge">{stats.rejected}</span>
        </Link>
        <Link to="/releases/approved" className={'sidebar-nav-link' + (this.isActive('/releases/approved') ? ' active' : '')}>
          <span>✅ Approved</span>
          <span className="badge">{stats.approved}</span>
        </Link>

        <div className="sidebar-section-title">Account</div>
        <Link to="/balance" className={'sidebar-nav-link' + (this.isActive('/balance') ? ' active' : '')}>
          <span>💰 Balance</span>
        </Link>
        <Link to="/notifications" className={'sidebar-nav-link' + (this.isActive('/notifications') ? ' active' : '')}>
          <span>🔔 Notifications</span>
        </Link>
        <Link to="/contact" className={'sidebar-nav-link' + (this.isActive('/contact') ? ' active' : '')}>
          <span>✉️ Contact Us</span>
        </Link>

        <div className="sidebar-section-title">More</div>
        <Link to="/about" className={'sidebar-nav-link' + (this.isActive('/about') ? ' active' : '')}>
          <span>ℹ️ About Us</span>
        </Link>
        <Link to="/blogs" className={'sidebar-nav-link' + (this.isActive('/blogs') ? ' active' : '')}>
          <span>📰 Blogs</span>
        </Link>

        {user && user.role === 'admin' && (
          <React.Fragment>
            <div className="sidebar-section-title">Admin</div>
            <Link to="/admin" className={'sidebar-nav-link' + (this.isActive('/admin') ? ' active' : '')} style={{ color: '#a855f7' }}>
              <span>⚙️ Admin Panel</span>
            </Link>
          </React.Fragment>
        )}
      </aside>
    );
  }
}

Sidebar.contextType = AuthContext;

export default Sidebar;
