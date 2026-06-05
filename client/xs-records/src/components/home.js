import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import Footer from './Footer';

class Home extends Component {
  render() {
    return (
      <div>
        {/* Hero Section */}
        <section className="hero-section">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 className="hero-title">XS Records</h1>
            <p className="hero-tagline">
              The easiest way for musicians to get music into Spotify, iTunes, Amazon,
              Google Play, Tidal, and more. Upload as much as you want, keep 100% of your royalties.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register">
                <Button className="btn-gradient btn-lg">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button className="btn-secondary btn-lg">Login</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <Container>
            <Row className="justify-content-center mb-5">
              <Col lg={8} className="text-center">
                <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '12px' }}>
                  Everything You Need to <span className="text-gradient">Distribute</span>
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                  Professional tools for independent artists, all in one platform.
                </p>
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-4">
                <div className="feature-card">
                  <span className="feature-icon">🌍</span>
                  <h5 className="feature-title">Global Distribution</h5>
                  <p className="feature-desc">
                    Get your music on 150+ streaming platforms and stores worldwide.
                    Spotify, Apple Music, Amazon Music, Tidal, YouTube Music, and more.
                  </p>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="feature-card">
                  <span className="feature-icon">💰</span>
                  <h5 className="feature-title">100% Royalties</h5>
                  <p className="feature-desc">
                    Keep every cent you earn. We never take a cut of your royalties.
                    Real-time earnings tracking and fast payouts to your account.
                  </p>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="feature-card">
                  <span className="feature-icon">📊</span>
                  <h5 className="feature-title">Analytics Dashboard</h5>
                  <p className="feature-desc">
                    Track your streams, downloads, and revenue across all platforms.
                    Detailed analytics to help you understand your audience.
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Blog Preview Section */}
        <section style={{ padding: '60px 0' }}>
          <Container>
            <Row className="justify-content-center mb-4">
              <Col lg={8} className="text-center">
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>
                  From the <span className="text-gradient">Blog</span>
                </h2>
                <p style={{ color: '#94a3b8' }}>Latest insights for independent artists</p>
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-4">
                <div className="blog-card">
                  <img src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=600&q=80" alt="Spotify" className="blog-card-img" />
                  <div className="blog-card-body">
                    <span className="blog-card-date">November 15, 2025</span>
                    <h5 className="blog-card-title">How to Get Your First 1,000 Streams</h5>
                    <p className="blog-card-excerpt">
                      Breaking into Spotify can feel daunting, but with the right strategy you can build a dedicated listener base.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="blog-card">
                  <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80" alt="Royalties" className="blog-card-img" />
                  <div className="blog-card-body">
                    <span className="blog-card-date">October 28, 2025</span>
                    <h5 className="blog-card-title">Understanding Music Royalties</h5>
                    <p className="blog-card-excerpt">
                      The world of music royalties can be confusing. This guide breaks down everything you need to know.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="blog-card">
                  <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80" alt="Cover Art" className="blog-card-img" />
                  <div className="blog-card-body">
                    <span className="blog-card-date">October 10, 2025</span>
                    <h5 className="blog-card-title">Creating Professional Cover Art</h5>
                    <p className="blog-card-excerpt">
                      Your cover art is the first thing listeners see. Learn how to create eye-catching artwork.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
            <Row className="justify-content-center mt-3">
              <Link to="/blogs">
                <Button className="btn-secondary">View All Posts →</Button>
              </Link>
            </Row>
          </Container>
        </section>

        <Footer />
      </div>
    );
  }
}

export default Home;
