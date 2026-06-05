import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';

class Footer extends Component {
  render() {
    return (
      <footer className="site-footer">
        <Container>
          <Row className="align-items-start">
            <Col md={4} className="mb-4 mb-md-0">
              <div className="footer-brand mb-3">XS Records</div>
              <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>
                The easiest way for musicians to distribute music worldwide.
                Upload as much as you want, keep 100% of your royalties.
              </p>
            </Col>
            <Col md={4} className="mb-4 mb-md-0">
              <h6 style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '16px' }}>Quick Links</h6>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/about">About Us</Link>
                <Link to="/blogs">Blogs</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/register">Get Started</Link>
              </div>
            </Col>
            <Col md={4}>
              <h6 style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '16px' }}>Legal</h6>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/about">Terms of Service</Link>
                <Link to="/about">Privacy Policy</Link>
                <Link to="/about">Cookie Policy</Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="footer-copy text-center">
                &copy; {new Date().getFullYear()} XS Records. All rights reserved.
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }
}

export default Footer;
