import React, { Component } from 'react';
import AppNav from './components/nav';
import Routes from './routes';
import { AuthProvider } from './context/AuthContext';

class App extends Component {
  render() {
    return (
      <AuthProvider>
        <main role="main" className="App">
          <AppNav />
          <Routes />
        </main>
      </AuthProvider>
    );
  }
}

export default App;

