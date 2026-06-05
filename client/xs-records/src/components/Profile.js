import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      email: '',
      username: '',
      address: '',
      bankInfo: '',
      taxDoc: null,
      loading: true,
      message: '',
      messageType: '',
      taxMessage: ''
    };
  }

  componentDidMount() {
    fetch('/users/profile')
      .then(res => res.json())
      .then(data => {
        if (data) {
          this.setState({
            fullName: data.fullName || ((data.fname || '') + ' ' + (data.lname || '')).trim(),
            email: data.email || '',
            username: data.username || '',
            address: data.address || '',
            bankInfo: data.bankInfo || '',
            loading: false
          });
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        this.setState({ loading: false });
      });
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  onFileChange = (event) => {
    this.setState({ taxDoc: event.target.files[0] });
  }

  handleSave = (event) => {
    event.preventDefault();
    const { address, bankInfo } = this.state;
    fetch('/users/profile', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address, bankInfo })
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          message: data.message || 'Profile updated successfully!',
          messageType: 'success'
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          message: 'Failed to update profile.',
          messageType: 'danger'
        });
      });
  }

  handleTaxUpload = (event) => {
    event.preventDefault();
    if (!this.state.taxDoc) {
      this.setState({ taxMessage: 'Please select a file.' });
      return;
    }
    const formData = new FormData();
    formData.append('taxDoc', this.state.taxDoc);

    fetch('/users/profile/tax-doc', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ taxMessage: data.message || 'Tax document uploaded successfully!' });
      })
      .catch(err => {
        console.error(err);
        this.setState({ taxMessage: 'Failed to upload tax document.' });
      });
  }

  render() {
    const { fullName, email, username, address, bankInfo, loading, message, messageType, taxMessage } = this.state;

    if (loading) {
      return (
        <DashboardLayout>
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </DashboardLayout>
      );
    }

    const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

    return (
      <DashboardLayout>
        <div className="page-header">
          <h2>Profile</h2>
          <p>Manage your account information</p>
        </div>

        <Row>
          <Col lg={8}>
            <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
              <div className="profile-header">
                <div className="profile-avatar">{initials}</div>
                <h4>{fullName || 'User'}</h4>
                <p style={{ color: '#94a3b8' }}>@{username}</p>
              </div>

              {message && <Alert color={messageType}>{message}</Alert>}

              <Form onSubmit={this.handleSave}>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Full Name</Label>
                      <Input type="text" value={fullName} disabled style={{ opacity: 0.6 }} />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Email</Label>
                      <Input type="email" value={email} disabled style={{ opacity: 0.6 }} />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <Label>Username</Label>
                  <Input type="text" value={username} disabled style={{ opacity: 0.6 }} />
                </FormGroup>
                <FormGroup>
                  <Label>Address</Label>
                  <Input type="textarea" name="address" value={address} onChange={this.onChange}
                    placeholder="Enter your mailing address" rows={3} />
                </FormGroup>
                <FormGroup>
                  <Label>Bank / PayPal Information</Label>
                  <Input type="textarea" name="bankInfo" value={bankInfo} onChange={this.onChange}
                    placeholder="Enter your bank account or PayPal details for royalty payments" rows={3} />
                </FormGroup>
                <Button className="btn-gradient" type="submit">Save Changes</Button>
              </Form>
            </div>

            {/* Tax Document Upload */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h5 style={{ marginBottom: '16px' }}>Tax Document</h5>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Upload your W-9 or relevant tax document for royalty payment compliance.
              </p>
              {taxMessage && <Alert color="info">{taxMessage}</Alert>}
              <Form onSubmit={this.handleTaxUpload}>
                <FormGroup>
                  <Input type="file" name="taxDoc" onChange={this.onFileChange} accept=".pdf,.jpg,.png,.doc,.docx" />
                </FormGroup>
                <Button className="btn-gradient" type="submit">Upload Document</Button>
              </Form>
            </div>
          </Col>
        </Row>
      </DashboardLayout>
    );
  }
}

Profile.contextType = AuthContext;

export default Profile;
