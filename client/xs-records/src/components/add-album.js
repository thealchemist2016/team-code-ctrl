import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { Redirect } from 'react-router-dom';

class AddAlbum extends Component {

  constructor(props) {
    super(props);

    this.state = {
      albumName: '',
      artist: '',
      numberOfTracks: Number,
      cover:'',
      redirect: false
    }
  }

  onChange = (event) => {
    const state = this.state;
    state[event.target.name] = event.target.value;
    this.setState(state);
  }

  handleSubmit = (event) => {
    event.preventDefault();
    fetch('/albums/add', {
      method: 'post',
      body: JSON.stringify(this.state),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          this.setState({ redirect: true });
        } else {
          alert(data.message || 'Failed to add album');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('An error occurred while adding the album.');
      });
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to="/add-track" />
    }
  }

  render() {
    return (
      <Container fluid>
        {this.renderRedirect()}
        <h2 className="text-center"> Add a new Album </h2>
        <hr />
        <Row>
          <Col md={{size: 6, offset: 3}}>
            <Form onSubmit={this.handleSubmit}>
              <FormGroup>
                <Label for="albumName">Album Name</Label>
                <Input onChange={this.onChange} type="text" name="albumName" id="albumName" placeholder="Album Name" />
              </FormGroup>
              <FormGroup>
                <Label for="artist">Atrist</Label>
                <Input onChange={this.onChange} type="text" name="artist" id="artist" placeholder="Artist" />
              </FormGroup>
              <FormGroup>
                <Label for="numberOfTracks">Number of tracks</Label>
                <Input onChange={this.onChange} type="number" name="numberOfTracks" id="numberOfTracks" placeholder="12" />
              </FormGroup>
              <FormGroup>
                <Label for="cover">Upload Cover </Label>
                <Input onChange={this.onChange} type="file" name="cover" id="cover" required />
              </FormGroup>
              <Button type="submit">Continue to Tracks</Button>
            </Form>
          </Col>
        </Row>
      </Container>
      )
}
}

export default AddAlbum;
