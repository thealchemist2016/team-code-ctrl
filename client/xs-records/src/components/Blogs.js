import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Footer from './Footer';

const blogPosts = [
  {
    id: 1,
    title: 'How to Get Your First 1,000 Streams on Spotify',
    excerpt: 'Breaking into Spotify can feel daunting, but with the right strategy you can build a dedicated listener base. Learn proven tactics for playlist placement, social media promotion, and release timing.',
    date: 'November 15, 2025',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=600&q=80',
    category: 'Marketing'
  },
  {
    id: 2,
    title: 'Understanding Music Royalties: A Complete Guide',
    excerpt: 'Mechanical royalties, performance royalties, sync licenses — the world of music royalties can be confusing. This guide breaks down everything you need to know about how you get paid.',
    date: 'October 28, 2025',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
    category: 'Education'
  },
  {
    id: 3,
    title: '5 Tips for Creating Professional Cover Art',
    excerpt: 'Your cover art is the first thing listeners see. Learn how to create eye-catching artwork that stands out in crowded streaming libraries and represents your music authentically.',
    date: 'October 10, 2025',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    category: 'Design'
  },
  {
    id: 4,
    title: 'The Rise of Independent Music Distribution',
    excerpt: 'Independent artists are taking control of their careers like never before. Explore how digital distribution platforms have transformed the music industry landscape.',
    date: 'September 22, 2025',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',
    category: 'Industry'
  },
  {
    id: 5,
    title: 'Mastering Your Tracks: Home Studio vs Professional',
    excerpt: 'Should you master your tracks at home or invest in professional mastering? We compare both approaches and help you decide what is right for your next release.',
    date: 'September 5, 2025',
    image: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600&q=80',
    category: 'Production'
  },
  {
    id: 6,
    title: 'Building Your Brand as an Independent Artist',
    excerpt: 'Your music is just one part of the equation. Learn how to build a compelling artist brand that resonates with fans and creates lasting connections.',
    date: 'August 18, 2025',
    image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&q=80',
    category: 'Branding'
  }
];

class Blogs extends Component {
  render() {
    return (
      <div>
        <Container style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '16px' }}>Blog</h1>
              <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                Insights, tips, and stories for independent artists.
              </p>
            </Col>
          </Row>

          <Row>
            {blogPosts.map(post => (
              <Col md={6} lg={4} key={post.id} className="mb-4">
                <div className="blog-card">
                  <img src={post.image} alt={post.title} className="blog-card-img" />
                  <div className="blog-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="blog-card-date">{post.date}</span>
                      <span style={{
                        background: 'rgba(124, 58, 237, 0.15)',
                        color: '#a855f7',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {post.category}
                      </span>
                    </div>
                    <h5 className="blog-card-title">{post.title}</h5>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
        <Footer />
      </div>
    );
  }
}

export default Blogs;
