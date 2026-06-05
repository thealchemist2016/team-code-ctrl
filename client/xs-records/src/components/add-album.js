import React, { Component } from 'react';
import { Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

class AddAlbum extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albumName: '',
      artist: '',
      type: 'Album',
      genre: '',
      releaseDate: '',
      numberOfTracks: '',
      cover: null,
      coverPreview: null,
      redirect: false,
      error: '',
      submitting: false
    };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ cover: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setState({ coverPreview: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ submitting: true, error: '' });

    const formData = new FormData();
    formData.append('albumName', this.state.albumName);
    formData.append('artist', this.state.artist);
    formData.append('type', this.state.type);
    formData.append('genre', this.state.genre);
    formData.append('releaseDate', this.state.releaseDate);
    formData.append('numberOfTracks', this.state.numberOfTracks);
    if (this.state.cover) {
      formData.append('cover', this.state.cover);
    }

    fetch('/albums/add', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.id || data._id || data.success) {
          this.setState({ redirect: true });
        } else {
          this.setState({
            error: data.message || 'Failed to create release.',
            submitting: false
          });
        }
      })
      .catch(err => {
        console.error(err);
        this.setState({
          error: 'An error occurred while creating the release.',
          submitting: false
        });
      });
  }

  render() {
    const { albumName, artist, type, genre, releaseDate, numberOfTracks, coverPreview, error, submitting } = this.state;

    if (this.state.redirect) {
      return <Redirect to="/add-track" />;
    }

    return (
      <DashboardLayout>
        <div className="page-header">
          <h2>Submit a New Release</h2>
          <p>Fill in the details for your new album or single</p>
        </div>

        <Row>
          <Col lg={8}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              {error && <Alert color="danger">{error}</Alert>}

              <Form onSubmit={this.handleSubmit}>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Album Name</Label>
                      <Input type="text" name="albumName" value={albumName} onChange={this.onChange}
                        placeholder="Enter album name" required />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Artist Name</Label>
                      <Input type="text" name="artist" value={artist} onChange={this.onChange}
                        placeholder="Enter artist name" required />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Type</Label>
                      <Input type="select" name="type" value={type} onChange={this.onChange}>
                        <option value="Album">Album</option>
                        <option value="Single">Single</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Genre</Label>
                      <Input type="select" name="genre" value={genre} onChange={this.onChange} required>
                        <option value="">Select Genre</option>
                        <option value="Pop">Pop</option>
                        <option value="Rock">Rock</option>
                        <option value="Hip-Hop">Hip-Hop</option>
                        <option value="R&B">R&B</option>
                        <option value="Electronic">Electronic</option>
                        <option value="Country">Country</option>
                        <option value="Jazz">Jazz</option>
                        <option value="Classical">Classical</option>
                        <option value="Latin">Latin</option>
                        <option value="Reggae">Reggae</option>
                        <option value="Blues">Blues</option>
                        <option value="Folk">Folk</option>
                        <option value="Metal">Metal</option>
                        <option value="Punk">Punk</option>
                        <option value="Soul">Soul</option>
                        <option value="Gospel">Gospel</option>
                        <option value="Alternative">Alternative</option>
                        <option value="Indie">Indie</option>
                        <option value="Other">Other</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Release Date</Label>
                      <Input type="date" name="releaseDate" value={releaseDate} onChange={this.onChange} required />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label>Number of Tracks</Label>
                  <Input type="number" name="numberOfTracks" value={numberOfTracks} onChange={this.onChange}
                    placeholder="How many tracks?" min="1" required />
                </FormGroup>

                <FormGroup>
                  <Label>Cover Art</Label>
                  <Input type="file" name="cover" onChange={this.onFileChange}
                    accept="image/*" />
                  <small style={{ color: '#64748b' }}>Recommended: 3000x3000px, JPG or PNG</small>
                  {coverPreview && (
                    <div style={{ marginTop: '12px' }}>
                      <img src={coverPreview} alt="Cover Preview" className="cover-preview" />
                    </div>
                  )}
                </FormGroup>

                <Button className="btn-gradient" type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Continue to Tracks →'}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </DashboardLayout>
    );
  }
}

export default AddAlbum;
