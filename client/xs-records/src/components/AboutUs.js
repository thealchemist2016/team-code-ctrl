import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Footer from './Footer';

class AboutUs extends Component {
  render() {
    return (
      <div>
        <Container style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '16px' }}>About XS Records</h1>
              <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: '1.8' }}>
                Empowering independent artists to share their music with the world.
              </p>
            </Col>
          </Row>

          <Row className="justify-content-center mb-5">
            <Col lg={8}>
              <div className="glass-panel" style={{ padding: '40px' }}>
                <h3 style={{ marginBottom: '16px' }}>Our Mission</h3>
                <p style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                  At XS Records, we believe every artist deserves the opportunity to be heard.
                  Our platform provides independent musicians with the tools they need to distribute
                  their music to every major streaming platform worldwide — Spotify, Apple Music,
                  Amazon Music, Tidal, YouTube Music, and over 150 more stores.
                </p>
                <p style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                  We're committed to transparency, fairness, and artist empowerment. Unlike traditional
                  labels, we let you keep 100% of your royalties. No hidden fees, no long-term contracts,
                  just pure music distribution done right.
                </p>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center mb-5">
            <Col lg={8}>
              <Row>
                <Col md={4} className="mb-4">
                  <div className="feature-card">
                    <span className="feature-icon">🌍</span>
                    <h5 className="feature-title">Global Reach</h5>
                    <p className="feature-desc">
                      Distribute to 150+ streaming platforms and stores worldwide.
                    </p>
                  </div>
                </Col>
                <Col md={4} className="mb-4">
                  <div className="feature-card">
                    <span className="feature-icon">💯</span>
                    <h5 className="feature-title">100% Royalties</h5>
                    <p className="feature-desc">
                      Keep every cent you earn. We never take a cut of your royalties.
                    </p>
                  </div>
                </Col>
                <Col md={4} className="mb-4">
                  <div className="feature-card">
                    <span className="feature-icon">⚡</span>
                    <h5 className="feature-title">Fast Delivery</h5>
                    <p className="feature-desc">
                      Your music goes live on stores within 24-48 hours of approval.
                    </p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="glass-panel" style={{ padding: '40px' }}>
                <h3 style={{ marginBottom: '16px' }}>Our Story</h3>
                <p style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                  Founded by musicians, for musicians. XS Records started in a small studio with a big
                  dream — to democratize music distribution. We saw independent artists struggling with
                  complicated and expensive distribution services, and we knew there had to be a better way.
                </p>
                <p style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                  Today, we serve thousands of artists across the globe, helping them get their music heard
                  by millions of listeners. From bedroom producers to touring bands, XS Records is the
                  trusted partner that helps turn musical dreams into reality.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    );
  }
}

export default AboutUs;
