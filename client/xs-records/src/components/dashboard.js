import React, { Component } from 'react';
import { Container, Row, Card, CardBody, CardTitle, CardText, CardImg, CardSubtitle, Jumbotron, Col, Button } from 'reactstrap';

class Dashboard extends Component {

  constructor(props) {
    super(props);

    // Default albums in case none exist in database
    const defaultAlbums = [
      {
        _id: 'mock-1',
        albumName: "Drop It Like It's Hot",
        artist: "Snoop Dogg",
        numberOfTracks: 2,
        cover: "https://upload.wikimedia.org/wikipedia/en/8/83/SnoopDoggDILIH.jpg",
        tracks: [
          { _id: 't-1', title: "Drop It Like It's Hot (featuring Pharrell)" },
          { _id: 't-2', title: "Get 2 Know U (featuring Jelly Roll)" }
        ]
      },
      {
        _id: 'mock-2',
        albumName: "Coolaid",
        artist: "Snoop Dogg",
        numberOfTracks: 3,
        cover: "http://epmgaa.media.clients.ellingtoncms.com/img/photos/2016/06/13/1465825178_6e473d50ca73a0ac5058fbd2edce81f4-2_t580.jpg?8f1b5874916776826eb17d7e67de7278c987ca33",
        tracks: [
          { _id: 't-3', title: "Legend" },
          { _id: 't-4', title: "Ten Toes Down" },
          { _id: 't-5', title: "Don't Stop" }
        ]
      },
      {
        _id: 'mock-3',
        albumName: "R&G (Rhythm and Gangsta)",
        artist: "Snoop Dogg",
        numberOfTracks: 3,
        cover: "https://upload.wikimedia.org/wikipedia/en/1/10/R_and_G_%28Rhythm_and_Gangsta%29_The_Masterpiece_%28Snoop_Dog_album%29_coverart.jpg",
        tracks: [
          { _id: 't-6', title: "(Intro) I Love to Give You Light" },
          { _id: 't-7', title: "Bang Out" },
          { _id: 't-8', title: "Drop It Like It's Hot (featuring Pharrell)" }
        ]
      }
    ];

    this.state = {
      albums: defaultAlbums
    };
  }

  componentDidMount() {
    fetch('/albums')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          this.setState({ albums: data });
        }
      })
      .catch((err) => {
        console.warn("Backend API not reachable or failed. Using fallback catalog.", err);
      });
  }

  render() {
    return (
      <Container>
        <Row className="row justify-content-md-center">
          <Jumbotron className='jumbotron' style={{ width: '100%', textAlign: 'center' }}>
            <h1 className="display-4 font-weight-bold jumbotronH1">My Discography</h1>
          </Jumbotron>
        </Row>
        <Row className="row justify-content-md-center mb-4">
          <p><a className="btn btn-dark btn-lg " href="/add-album" role="button">Add A New Release &raquo;</a></p>
        </Row>
        <Row>
          {this.state.albums.map((album, index) => (
            <Col md={ 4 } key={album._id || index} className="mb-4">
              <Card color="default" className='card' style={{ height: '100%', minHeight: '400px' }}>
                <CardImg 
                  src={album.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80"} 
                  alt={`${album.albumName} Cover`}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <CardBody style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <CardTitle className="h3 mb-2 pt-2 font-weight-bold">{album.albumName}</CardTitle>
                    <CardSubtitle className="h4 mb-2 pt-1 text-muted font-weight-bold">{album.artist || "Independent Artist"}</CardSubtitle>
                    <CardText className="mb-4 cardTextDash">
                      <p>Number of Tracks: {album.numberOfTracks}</p>
                      {album.tracks && album.tracks.length > 0 ? (
                        <ol>
                          {album.tracks.map((track, idx) => (
                            <li key={track._id || idx}> {track.title || track} </li>
                          ))}
                        </ol>
                      ) : (
                        <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>No tracks added yet.</p>
                      )}
                    </CardText>
                  </div>
                  <Row className="mx-0 mt-auto pt-3">
                    <Button color="dark" style={{ width: '100%' }}>More Details</Button>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }
}

export default Dashboard;
