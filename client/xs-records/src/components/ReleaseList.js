import React, { Component } from 'react';
import { Table, Row, Col } from 'reactstrap';
import DashboardLayout from './DashboardLayout';

class ReleaseList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: [],
      loading: true
    };
  }

  componentDidMount() {
    this.fetchAlbums();
  }

  componentDidUpdate(prevProps) {
    const prevStatus = prevProps.status || (prevProps.match && prevProps.match.params && prevProps.match.params.status);
    const currentStatus = this.props.status || (this.props.match && this.props.match.params && this.props.match.params.status);
    if (prevStatus !== currentStatus) {
      this.fetchAlbums();
    }
  }

  fetchAlbums() {
    const status = this.props.status;
    const url = status ? '/albums/user/' + status : '/albums/user';
    this.setState({ loading: true });

    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.setState({
          albums: Array.isArray(data) ? data : [],
          loading: false
        });
      })
      .catch(err => {
        console.warn('Error fetching releases:', err);
        this.setState({ albums: [], loading: false });
      });
  }

  getStatusBadge(status) {
    if (!status) return <span className="badge-status badge-incomplete">incomplete</span>;
    const s = status.toLowerCase();
    return <span className={'badge-status badge-' + s}>{s}</span>;
  }

  getTitle() {
    const status = this.props.status;
    if (!status) return 'All Releases';
    return status.charAt(0).toUpperCase() + status.slice(1) + ' Releases';
  }

  render() {
    const { albums, loading } = this.state;

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
          <h2>{this.getTitle()}</h2>
          <p>Showing {albums.length} release{albums.length !== 1 ? 's' : ''}</p>
        </div>

        {albums.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>No releases found for this filter.</p>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <Table responsive className="table mb-0">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Album Name</th>
                  <th>Artist</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Tracks</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((album, index) => (
                  <tr key={album._id || index}>
                    <td>
                      <img
                        src={album.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&q=60'}
                        alt={album.albumName}
                        className="cover-thumb"
                      />
                    </td>
                    <td style={{ fontWeight: 500 }}>{album.albumName}</td>
                    <td style={{ color: '#94a3b8' }}>{album.artist || 'Unknown'}</td>
                    <td style={{ color: '#94a3b8' }}>{album.type || 'Album'}</td>
                    <td>{this.getStatusBadge(album.status)}</td>
                    <td style={{ color: '#94a3b8' }}>
                      {album.numberOfTracks || (album.tracks && album.tracks.length) || 0}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </DashboardLayout>
    );
  }
}

export default ReleaseList;
