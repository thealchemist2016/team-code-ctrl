import React, { Component } from 'react';
import { Row, Col, Table, Button, Form, FormGroup, Input, Alert, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { AuthContext } from '../context/AuthContext';
import { Redirect } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'users',
      users: [],
      albums: [],
      tickets: [],
      stats: {
        totalUsers: 0,
        totalAlbums: 0,
        totalSingles: 0,
        openTickets: 0,
        notifications: 0
      },
      loading: true,
      replyTicketId: null,
      replyText: '',
      replyMessage: ''
    };
  }

  componentDidMount() {
    const { user } = this.context;
    if (!user || user.role !== 'admin') return;

    Promise.all([
      fetch('/admin/users').then(r => r.json()).catch(() => []),
      fetch('/admin/albums').then(r => r.json()).catch(() => []),
      fetch('/admin/tickets').then(r => r.json()).catch(() => []),
      fetch('/admin/stats').then(r => r.json()).catch(() => ({}))
    ]).then(([users, albums, tickets, stats]) => {
      this.setState({
        users: Array.isArray(users) ? users : [],
        albums: Array.isArray(albums) ? albums : [],
        tickets: Array.isArray(tickets) ? tickets : [],
        stats: {
          totalUsers: (stats && stats.totalUsers) || (Array.isArray(users) ? users.length : 0),
          totalAlbums: (stats && stats.totalAlbums) || (Array.isArray(albums) ? albums.filter(a => a.type !== 'Single').length : 0),
          totalSingles: (stats && stats.totalSingles) || (Array.isArray(albums) ? albums.filter(a => a.type === 'Single').length : 0),
          openTickets: (stats && stats.openTickets) || (Array.isArray(tickets) ? tickets.filter(t => !t.reply).length : 0),
          notifications: (stats && stats.notifications) || 0
        },
        loading: false
      });
    }).catch(() => {
      this.setState({ loading: false });
    });
  }

  toggleTab = (tab) => {
    this.setState({ activeTab: tab });
  }

  handleExportCSV = (type) => {
    const data = type === 'users' ? this.state.users : this.state.albums;
    if (data.length === 0) return;

    let csv = '';
    const keys = Object.keys(data[0]).filter(k => k !== '__v' && k !== 'password');
    csv += keys.join(',') + '\n';
    data.forEach(item => {
      csv += keys.map(k => {
        const val = item[k];
        if (typeof val === 'object') return JSON.stringify(val).replace(/,/g, ';');
        return String(val || '').replace(/,/g, ';');
      }).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type + '_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  handleReply = (ticketId) => {
    if (!this.state.replyText.trim()) return;

    fetch('/admin/tickets/' + ticketId + '/reply', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reply: this.state.replyText })
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ replyMessage: 'Reply sent!', replyTicketId: null, replyText: '' });
        // Refresh tickets
        fetch('/admin/tickets').then(r => r.json()).then(tickets => {
          this.setState({ tickets: Array.isArray(tickets) ? tickets : [] });
        }).catch(() => {});
      })
      .catch(err => {
        console.error(err);
        this.setState({ replyMessage: 'Failed to send reply.' });
      });
  }

  render() {
    const { user } = this.context;
    if (!user || user.role !== 'admin') {
      return <Redirect to="/dashboard" />;
    }

    const { activeTab, users, albums, tickets, stats, loading, replyTicketId, replyText, replyMessage } = this.state;

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
          <h2>Admin Panel</h2>
          <p>Manage users, releases, and support tickets</p>
        </div>

        {/* Stats */}
        <Row className="mb-4">
          <Col md={4} lg className="mb-3">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </Col>
          <Col md={4} lg className="mb-3">
            <div className="stat-card">
              <div className="stat-icon">💿</div>
              <div className="stat-number">{stats.totalAlbums}</div>
              <div className="stat-label">Total Albums</div>
            </div>
          </Col>
          <Col md={4} lg className="mb-3">
            <div className="stat-card teal">
              <div className="stat-icon">🎵</div>
              <div className="stat-number">{stats.totalSingles}</div>
              <div className="stat-label">Total Singles</div>
            </div>
          </Col>
          <Col md={4} lg className="mb-3">
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-number">{stats.openTickets}</div>
              <div className="stat-label">Open Tickets</div>
            </div>
          </Col>
          <Col md={4} lg className="mb-3">
            <div className="stat-card">
              <div className="stat-icon">🔔</div>
              <div className="stat-number">{stats.notifications}</div>
              <div className="stat-label">Notifications</div>
            </div>
          </Col>
        </Row>

        {/* Tabs */}
        <Nav tabs className="mb-0">
          <NavItem>
            <NavLink className={activeTab === 'users' ? 'active' : ''} onClick={() => this.toggleTab('users')} style={{ cursor: 'pointer' }}>
              Users
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={activeTab === 'albums' ? 'active' : ''} onClick={() => this.toggleTab('albums')} style={{ cursor: 'pointer' }}>
              Albums
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={activeTab === 'tickets' ? 'active' : ''} onClick={() => this.toggleTab('tickets')} style={{ cursor: 'pointer' }}>
              Tickets
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          {/* Users Tab */}
          <TabPane tabId="users">
            <div className="admin-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="admin-section-title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>Users ({users.length})</div>
                <Button className="btn-secondary btn-sm" onClick={() => this.handleExportCSV('users')}>Export CSV</Button>
              </div>
              <Table responsive className="table mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id || i}>
                      <td>{u.fname || ''} {u.lname || ''}</td>
                      <td style={{ color: '#94a3b8' }}>{u.email}</td>
                      <td>{u.username}</td>
                      <td>
                        <span style={{
                          background: u.role === 'admin' ? 'rgba(124,58,237,0.15)' : 'rgba(6,182,212,0.15)',
                          color: u.role === 'admin' ? '#a855f7' : '#06b6d4',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </TabPane>

          {/* Albums Tab */}
          <TabPane tabId="albums">
            <div className="admin-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="admin-section-title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>Albums ({albums.length})</div>
                <Button className="btn-secondary btn-sm" onClick={() => this.handleExportCSV('albums')}>Export CSV</Button>
              </div>
              <Table responsive className="table mb-0">
                <thead>
                  <tr>
                    <th>Album Name</th>
                    <th>Artist</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {albums.map((a, i) => (
                    <tr key={a._id || i}>
                      <td style={{ fontWeight: 500 }}>{a.albumName}</td>
                      <td style={{ color: '#94a3b8' }}>{a.artist}</td>
                      <td style={{ color: '#94a3b8' }}>{a.type || 'Album'}</td>
                      <td>
                        <span className={'badge-status badge-' + (a.status ? a.status.toLowerCase() : 'incomplete')}>
                          {a.status || 'incomplete'}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8' }}>{(a.user && a.user.username) || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </TabPane>

          {/* Tickets Tab */}
          <TabPane tabId="tickets">
            <div className="admin-section">
              <div className="admin-section-title">Support Tickets ({tickets.length})</div>
              {replyMessage && <Alert color="info" className="mb-3">{replyMessage}</Alert>}
              {tickets.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>No tickets found.</p>
              ) : (
                tickets.map((ticket, i) => (
                  <div className="ticket-card" key={ticket._id || i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="ticket-subject">{ticket.subject}</span>
                      <span className="ticket-date">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>
                      From: {(ticket.user && ticket.user.username) || 'Unknown'}
                    </div>
                    <div className="ticket-message">{ticket.message}</div>
                    {ticket.reply && (
                      <div className="ticket-reply">
                        <div className="reply-label">Your Reply</div>
                        <div className="reply-text">{ticket.reply}</div>
                      </div>
                    )}
                    {!ticket.reply && (
                      <div style={{ marginTop: '12px' }}>
                        {replyTicketId === (ticket._id || i) ? (
                          <Form onSubmit={(e) => { e.preventDefault(); this.handleReply(ticket._id); }}>
                            <FormGroup>
                              <Input type="textarea" value={replyText}
                                onChange={(e) => this.setState({ replyText: e.target.value })}
                                placeholder="Type your reply..." rows={3} />
                            </FormGroup>
                            <Button className="btn-gradient btn-sm" type="submit" style={{ marginRight: '8px' }}>Send Reply</Button>
                            <Button className="btn-secondary btn-sm" onClick={() => this.setState({ replyTicketId: null, replyText: '' })}>Cancel</Button>
                          </Form>
                        ) : (
                          <Button className="btn-secondary btn-sm" onClick={() => this.setState({ replyTicketId: ticket._id || i })}>Reply</Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabPane>
        </TabContent>
      </DashboardLayout>
    );
  }
}

AdminDashboard.contextType = AuthContext;

export default AdminDashboard;
