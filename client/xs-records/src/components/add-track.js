import React, { Component } from 'react';
import { Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

class AddTrack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      audio: null,
      albumId: '',
      albums: [],
      redirect: false,
      addAnother: false,
      error: '',
      successMessage: '',
      submitting: false,
      trackCount: 0
    };
  }

  componentDidMount() {
    fetch('/albums/user')
      .then(res => res.json())
      .then(albums => {
        const albumList = Array.isArray(albums) ? albums : [];
        this.setState({
          albums: albumList,
          albumId: albumList.length > 0 ? albumList[albumList.length - 1]._id : ''
        });
      })
      .catch(err => console.error('Error fetching albums:', err));
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  onFileChange = (event) => {
    this.setState({ audio: event.target.files[0] });
  }

  handleSubmit = (event, addAnother) => {
    event.preventDefault();
    this.setState({ submitting: true, error: '', successMessage: '' });

    const formData = new FormData();
    formData.append('title', this.state.title);
    formData.append('albumId', this.state.albumId);
    if (this.state.audio) {
      formData.append('audio', this.state.audio);
    }

    fetch('/tracks/add', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === 'Track added successfully' || data.success || data._id || data.id) {
          if (addAnother) {
            this.setState({
              title: '',
              audio: null,
              submitting: false,
              successMessage: 'Track added! Add another one.',
              trackCount: this.state.trackCount + 1
            });
            // Reset file input
            const fileInput = document.getElementById('audio');
            if (fileInput) fileInput.value = '';
          } else {
            this.setState({ redirect: true });
          }
        } else {
          this.setState({
            error: data.message || 'Failed to add track.',
            submitting: false
          });
        }
      })
      .catch(err => {
        console.error(err);
        this.setState({
          error: 'An error occurred while adding the track.',
          submitting: false
        });
      });
  }

  render() {
    const { title, albumId, albums, error, successMessage, submitting, trackCount } = this.state;

    if (this.state.redirect) {
      return <Redirect to="/dashboard" />;
    }

    return (
      <DashboardLayout>
        <div className="page-header">
          <h2>Add Tracks</h2>
          <p>Upload audio files for your release {trackCount > 0 && <span style={{ color: '#22c55e' }}>({trackCount} track{trackCount !== 1 ? 's' : ''} added)</span>}</p>
        </div>

        <Row>
          <Col lg={8}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              {error && <Alert color="danger">{error}</Alert>}
              {successMessage && <Alert color="success">{successMessage}</Alert>}

              <Form onSubmit={(e) => this.handleSubmit(e, false)}>
                <FormGroup>
                  <Label>Select Album</Label>
                  <Input type="select" name="albumId" value={albumId} onChange={this.onChange}>
                    <option value="">-- Select Album --</option>
                    {albums.map(album => (
                      <option key={album._id} value={album._id}>
                        {album.albumName} (by {album.artist})
                      </option>
                    ))}
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label>Track Title</Label>
                  <Input type="text" name="title" value={title} onChange={this.onChange}
                    placeholder="Enter track title" required />
                </FormGroup>

                <FormGroup>
                  <Label>Audio File</Label>
                  <Input type="file" name="audio" id="audio" onChange={this.onFileChange}
                    accept="audio/*" required />
                  <small style={{ color: '#64748b' }}>Accepted formats: MP3, WAV, FLAC, AAC</small>
                </FormGroup>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Button className="btn-gradient" type="submit" disabled={submitting}>
                    {submitting ? 'Uploading...' : 'Submit & Finish'}
                  </Button>
                  <Button className="btn-secondary" type="button" disabled={submitting}
                    onClick={(e) => this.handleSubmit(e, true)}>
                    Add Another Track
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </DashboardLayout>
    );
  }
}

export default AddTrack;
