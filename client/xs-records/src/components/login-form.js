import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

class LoginForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      message: '',
      redirect: false,
      loggedIn: false
    };

  }

  onChange = (event) => {
    const state = this.state;
    state[event.target.name] = event.target.value;
    this.setState(state);
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { username, password } = this.state;
    this.context.login(username, password)
      .then((res) => {
        if (res.success) {
          this.setState({ redirect: true, loggedIn: true });
        } else {
          this.setState({ message: res.error || 'Login failed' });
        }
      })
      .catch((err) => {
        console.error(err);
        this.setState({ message: 'An error occurred during login.' });
      });
  }

  renderRedirect = () => {
    if (this.state.redirect || this.state.loggedIn) {
      return <Redirect to="/dashboard" />
    }
  }

  render() {
    return (
      <Container>
        {this.renderRedirect()}
        <h2 className="text-center">login</h2>
        {this.state.message && (
          <Row>
            <Col md={{size: 6, offset: 3}} className="text-danger text-center mb-3">
              {this.state.message}
            </Col>
          </Row>
        )}
        <Row>
          <Col md={{size: 6, offset: 3}}>
            <Form onSubmit={this.handleSubmit}>
              <FormGroup>
                <Label for="username">Username</Label>
                <Input onChange={this.onChange} type="text" name="username" id="username" placeholder="Username" />
              </FormGroup>
              <FormGroup>
                <Label for="password">Password</Label>
                <Input onChange={this.onChange} type="password" name="password" id="password" placeholder="Password" />
              </FormGroup>
              <Button type="submit" value="submit">Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    )
  }
}

LoginForm.contextType = AuthContext;

export default LoginForm;
