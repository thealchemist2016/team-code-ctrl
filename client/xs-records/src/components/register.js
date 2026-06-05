import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { Redirect } from 'react-router-dom';

class Register extends Component {

  constructor(props) {
    super(props);

    this.state = {
      fname: '',
      lname: '',
      email: '',
      username: '',
      password: '',
      tosAccepted: false,
      redirect: false
    }
  }

  onChange = (event) => {
    const state = this.state;
    if (event.target.type === 'checkbox') {
      state[event.target.name] = event.target.checked;
    } else {
      state[event.target.name] = event.target.value;
    }
    this.setState(state);
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (!this.state.tosAccepted) {
      alert("Terms of Service must be accepted.");
      return;
    }
    fetch('/users/register', {
      method: 'post',
      body: JSON.stringify(this.state),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          this.setState({ redirect: true });
        } else {
          alert(data.message || 'Registration failed');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('An error occurred during registration.');
      });
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to="/login" />
    }
  }

  render() {
    return (
      <Container fluid>
        {this.renderRedirect()}
        <h2 className="text-center"> Register </h2>
        <hr />
        <Row>
          <Col md={{size: 6, offset: 3}}>
            <Form onSubmit={this.handleSubmit}>
              <FormGroup>
                <Label for="fname">First Name</Label>
                <Input onChange={this.onChange} type="text" name="fname" id="fname" placeholder="First Name" required />
              </FormGroup>
              <FormGroup>
                <Label for="lname">Last Name</Label>
                <Input onChange={this.onChange} type="text" name="lname" id="lname" placeholder="Last Name" required />
              </FormGroup>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input onChange={this.onChange} type="email" name="email" id="email" placeholder="Email" required />
              </FormGroup>
              <FormGroup>
                <Label for="username">Username</Label>
                <Input onChange={this.onChange} type="text" name="username" id="usename" placeholder="User Name" required />
              </FormGroup>
              <FormGroup>
                <Label for="password">Password</Label>
                <Input onChange={this.onChange} type="password" name="password" id="password" placeholder="Password" required />
              </FormGroup>
              <FormGroup check className="mb-3 ml-1">
                <Label check>
                  <Input onChange={this.onChange} type="checkbox" name="tosAccepted" id="tosAccepted" />{' '}
                  I agree to the Terms of Service
                </Label>
              </FormGroup>
              <Button>Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>
      )
}
}

export default Register;
