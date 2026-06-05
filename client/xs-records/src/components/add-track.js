import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { Redirect } from 'react-router-dom';

class AddTrack extends Component {

  constructor(props) {
    super(props);

    this.state = {
      title: '',
      audio:'',
      albumId: '',
      albums: [],
      redirect: false
    }
  }

  componentDidMount() {
    fetch('/users/verify')
      .then(res => res.json())
      .then(authData => {
        const username = authData.success && authData.user ? authData.user.username : null;
        fetch('/albums')
          .then(res => res.json())
          .then(albums => {
            const userAlbums = username 
              ? albums.filter(album => album.user && album.user.username === username)
              : albums;
            
            this.setState({
              albums: userAlbums,
              albumId: userAlbums.length > 0 ? userAlbums[userAlbums.length - 1]._id : ''
            });
          })
          .catch(err => console.error('Error fetching albums:', err));
      })
      .catch(err => console.error('Error verifying user:', err));
  }

  onChange = (event) => {
    const state = this.state;
    state[event.target.name] = event.target.value;
    this.setState(state);
  }

  handleSubmit = (event) => {
    event.preventDefault();
    fetch('/tracks/add', {
      method: 'post',
      body: JSON.stringify(this.state),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === 'Track added successfully') {
          this.setState({ redirect: true });
        } else {
          alert(data.message || 'Failed to add track');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('An error occurred while adding the track.');
      });
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to="/dashboard" />
    }
  }

  render() {
    return (
      <Container fluid>
        {this.renderRedirect()}
        <h2 className="text-center"> Add tracks </h2>
        <hr />
        <Row>
          <Col md={{size: 6, offset: 3}}>
            <Form onSubmit={this.handleSubmit}>
              <FormGroup>
                <Label for="albumId">Select Album</Label>
                <Input onChange={this.onChange} type="select" name="albumId" id="albumId" value={this.state.albumId}>
                  <option value="">-- Select Album --</option>
                  {this.state.albums.map(album => (
                    <option key={album._id} value={album._id}>
                      {album.albumName} (by {album.artist})
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="title">Song Title</Label>
                <Input onChange={this.onChange} type="text" name="title" id="title" placeholder="Song Title" required />
              </FormGroup>
              <FormGroup>
                <Label for="audio">Upload Audio </Label>
                <Input onChange={this.onChange} type="file" name="audio" id="audio" required />
              </FormGroup>
              <Button type="submit">Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>
      )
}
}

export default AddTrack;
