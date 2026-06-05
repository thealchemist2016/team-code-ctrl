import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: [],
      stats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        incomplete: 0
      },
      loading: true
    };
  }

  componentDidMount() {
    Promise.all([
      fetch('/albums/user').then(r => r.json()).catch(() => []),
      fetch('/albums/stats').then(r => r.json()).catch(() => ({}))
    ]).then(([albums, stats]) => {
      const albumList = Array.isArray(albums) ? albums : [];
      this.setState({
        albums: albumList,
        stats: {
          total: (stats && stats.total) || albumList.length || 0,
          pending: (stats && stats.pending) || 0,
          approved: (stats && stats.approved) || 0,
          rejected: (stats && stats.rejected) || 0,
          incomplete: (stats && stats.incomplete) || 0
        },
        loading: false
      });
    }).catch(() => {
      this.setState({ loading: false });
    });
  }

  getStatusBadge(status) {
    if (!status) return <span className="badge-status badge-incomplete">incomplete</span>;
    const s = status.toLowerCase();
    return <span className={'badge-status badge-' + s}>{s}</span>;
  }

  render() {
    const { stats, albums, loading } = this.state;

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
          <h2>Dashboard</h2>
          <p>Welcome back! Here's an overview of your releases.</p>
        </div>

        {/* Stat Cards */}
        <Row className="mb-4">
          <Col md={4} lg className="mb-3">
            <div className="stat-card">
              <div className="stat-icon">📀</div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Releases</div>
            </div>
          </Col>
          <Col md={4} lg className="mb-3">
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </Col>
          <Col md={4} lg className="mb-3">
            <div className="stat-card teal">
              <div className="stat-icon">✅</div>
              <div className="stat-number">{stats.approved}</div>
              <div className="stat-label">Approved</div>
            </div>
          </Col>
          <Col md={4} lg className="mb-3">
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-number">{stats.rejected}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </Col>
          <Col md={4} lg className="mb-3">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-number">{stats.incomplete}</div>
              <div className="stat-label">Incomplete</div>
            </div>
          </Col>
        </Row>

        {/* Recent Releases */}
        <div className="page-header" style={{ marginTop: '16px' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Recent Releases</h2>
        </div>

        {albums.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>No releases yet. Start distributing your music!</p>
            <a href="/add-album" className="btn btn-gradient">Submit Your First Release</a>
          </div>
        ) : (
          <Row>
            {albums.map((album, index) => (
              <Col md={6} lg={4} key={album._id || index} className="mb-4">
                <div className="card" style={{ height: '100%' }}>
                  <img
                    src={album.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80'}
                    alt={album.albumName}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                      <h5 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{album.albumName}</h5>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '12px' }}>{album.artist || 'Unknown Artist'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        {this.getStatusBadge(album.status)}
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {album.numberOfTracks || (album.tracks && album.tracks.length) || 0} tracks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </DashboardLayout>
    );
  }
}

Dashboard.contextType = AuthContext;

export default Dashboard;
