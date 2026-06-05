import React, { Component } from 'react';
import DashboardLayout from './DashboardLayout';

class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      loading: true
    };
  }

  componentDidMount() {
    fetch('/notifications')
      .then(res => res.json())
      .then(data => {
        this.setState({
          notifications: Array.isArray(data) ? data : [],
          loading: false
        });
      })
      .catch(err => {
        console.warn('Error fetching notifications:', err);
        this.setState({ loading: false });
      });
  }

  render() {
    const { notifications, loading } = this.state;

    if (loading) {
      return (
        <DashboardLayout>
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        <div className="page-header">
          <h2>Notifications</h2>
          <p>Stay updated with your account activity</p>
        </div>

        {notifications.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</p>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notif, index) => (
            <div className="notification-card" key={notif._id || index}>
              <div className="notif-date">
                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Recently'}
              </div>
              <div className="notif-subject">{notif.subject || 'Notification'}</div>
              <div className="notif-message">{notif.message || notif.text || ''}</div>
            </div>
          ))
        )}
      </DashboardLayout>
    );
  }
}

export default Notifications;
