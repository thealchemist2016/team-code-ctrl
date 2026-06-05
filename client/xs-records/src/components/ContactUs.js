import React, { Component } from 'react';
import { Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import DashboardLayout from './DashboardLayout';

class ContactUs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subject: '',
      message: '',
      tickets: [],
      loading: true,
      submitMessage: '',
      submitType: ''
    };
  }

  componentDidMount() {
    fetch('/tickets')
      .then(res => res.json())
      .then(data => {
        this.setState({
          tickets: Array.isArray(data) ? data : [],
          loading: false
        });
      })
      .catch(err => {
        console.warn('Error fetching tickets:', err);
        this.setState({ loading: false });
      });
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { subject, message } = this.state;

    fetch('/tickets', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subject, message })
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          submitMessage: data.message || 'Ticket submitted successfully!',
          submitType: 'success',
          subject: '',
          message: ''
        });
        // Refresh tickets
        fetch('/tickets')
          .then(res => res.json())
          .then(tdata => {
            this.setState({ tickets: Array.isArray(tdata) ? tdata : [] });
          })
          .catch(() => {});
      })
      .catch(err => {
        console.error(err);
        this.setState({
          submitMessage: 'Failed to submit ticket.',
          submitType: 'danger'
        });
      });
  }

  render() {
    const { subject, message, tickets, loading, submitMessage, submitType } = this.state;

    return (
      <DashboardLayout>
        <div className="page-header">
          <h2>Contact Us</h2>
          <p>Submit a support ticket or view your previous conversations</p>
        </div>

        <Row>
          <Col lg={8}>
            {/* New Ticket Form */}
            <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
              <h5 style={{ marginBottom: '20px' }}>Submit a New Ticket</h5>
              {submitMessage && <Alert color={submitType}>{submitMessage}</Alert>}
              <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                  <Label>Subject</Label>
                  <Input type="text" name="subject" value={subject} onChange={this.onChange}
                    placeholder="Brief description of your issue" required />
                </FormGroup>
                <FormGroup>
                  <Label>Message</Label>
                  <Input type="textarea" name="message" value={message} onChange={this.onChange}
                    placeholder="Describe your issue in detail..." rows={5} required />
                </FormGroup>
                <Button className="btn-gradient" type="submit">Submit Ticket</Button>
              </Form>
            </div>

            {/* Existing Tickets */}
            <h5 style={{ marginBottom: '16px' }}>Your Tickets</h5>
            {loading ? (
              <div className="loading-container" style={{ minHeight: '100px' }}>
                <div className="loading-spinner"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                No tickets submitted yet.
              </div>
            ) : (
              tickets.map((ticket, index) => (
                <div className="ticket-card" key={ticket._id || index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="ticket-subject">{ticket.subject}</span>
                    <span className="ticket-date">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div className="ticket-message">{ticket.message}</div>
                  {ticket.reply && (
                    <div className="ticket-reply">
                      <div className="reply-label">Admin Reply</div>
                      <div className="reply-text">{ticket.reply}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </Col>
        </Row>
      </DashboardLayout>
    );
  }
}

export default ContactUs;
