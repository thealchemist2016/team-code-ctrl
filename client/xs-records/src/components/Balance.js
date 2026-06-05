import React, { Component } from 'react';
import { Row, Col, Form, FormGroup, Label, Input, Button, Alert, Table } from 'reactstrap';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';

class Balance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: '',
      method: 'Bank Transfer',
      accountDetails: '',
      withdrawals: [],
      loading: true,
      message: '',
      messageType: ''
    };
  }

  componentDidMount() {
    fetch('/withdrawals')
      .then(res => res.json())
      .then(data => {
        this.setState({
          withdrawals: Array.isArray(data) ? data : [],
          loading: false
        });
      })
      .catch(err => {
        console.warn('Error fetching withdrawals:', err);
        this.setState({ loading: false });
      });
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { amount, method, accountDetails } = this.state;

    if (!amount || parseFloat(amount) <= 0) {
      this.setState({ message: 'Please enter a valid amount.', messageType: 'danger' });
      return;
    }

    fetch('/withdrawals', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: parseFloat(amount), method, accountDetails })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success || data.message) {
          this.setState({
            message: data.message || 'Withdrawal request submitted!',
            messageType: 'success',
            amount: '',
            accountDetails: ''
          });
          // Refresh withdrawals
          fetch('/withdrawals')
            .then(res => res.json())
            .then(wdata => {
              this.setState({ withdrawals: Array.isArray(wdata) ? wdata : [] });
            })
            .catch(() => {});
        } else {
          this.setState({ message: data.error || 'Failed to submit withdrawal.', messageType: 'danger' });
        }
      })
      .catch(err => {
        console.error(err);
        this.setState({ message: 'An error occurred.', messageType: 'danger' });
      });
  }

  render() {
    const { user } = this.context;
    const balance = user ? (user.balance || 0) : 0;
    const { amount, method, accountDetails, withdrawals, loading, message, messageType } = this.state;

    return (
      <DashboardLayout>
        <div className="page-header">
          <h2>Balance & Withdrawals</h2>
          <p>Manage your earnings and request withdrawals</p>
        </div>

        <Row>
          <Col lg={8}>
            {/* Current Balance */}
            <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Current Balance
              </p>
              <div style={{
                fontSize: '3rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ${parseFloat(balance).toFixed(2)}
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
              <h5 style={{ marginBottom: '20px' }}>Request Withdrawal</h5>
              {message && <Alert color={messageType}>{message}</Alert>}
              <Form onSubmit={this.handleSubmit}>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Amount ($)</Label>
                      <Input type="number" name="amount" value={amount} onChange={this.onChange}
                        placeholder="0.00" min="1" step="0.01" required />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Payment Method</Label>
                      <Input type="select" name="method" value={method} onChange={this.onChange}>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="PayPal">PayPal</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <Label>Account Details</Label>
                  <Input type="textarea" name="accountDetails" value={accountDetails} onChange={this.onChange}
                    placeholder="Enter your bank account number or PayPal email" rows={3} required />
                </FormGroup>
                <Button className="btn-gradient" type="submit">Submit Withdrawal Request</Button>
              </Form>
            </div>

            {/* Withdrawal History */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ margin: 0 }}>Withdrawal History</h5>
              </div>
              {loading ? (
                <div className="loading-container" style={{ minHeight: '100px' }}>
                  <div className="loading-spinner"></div>
                </div>
              ) : withdrawals.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  No withdrawal history yet.
                </div>
              ) : (
                <Table responsive className="table mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w, i) => (
                      <tr key={w._id || i}>
                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="withdrawal-amount">${parseFloat(w.amount || 0).toFixed(2)}</td>
                        <td style={{ color: '#94a3b8' }}>{w.method || 'N/A'}</td>
                        <td>
                          <span className={'badge-status badge-' + (w.status ? w.status.toLowerCase() : 'pending')}>
                            {w.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Col>
        </Row>
      </DashboardLayout>
    );
  }
}

Balance.contextType = AuthContext;

export default Balance;
