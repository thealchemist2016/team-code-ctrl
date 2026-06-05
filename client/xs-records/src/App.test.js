import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Router><App /></Router>, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('provides AuthContext with default values', () => {
  const TestComponent = () => {
    return (
      <AuthContext.Consumer>
        {(value) => {
          if (!value) return <div>No Value</div>;
          return (
            <div>
              <span data-testid="auth-status">{value.isAuthenticated ? 'authenticated' : 'guest'}</span>
              <span data-testid="loading-status">{value.loading ? 'loading' : 'done'}</span>
            </div>
          );
        }}
      </AuthContext.Consumer>
    );
  };

  const div = document.createElement('div');
  ReactDOM.render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
