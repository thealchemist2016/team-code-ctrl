import React, { Component } from 'react';
import AppNav from './components/nav';
import Routes from './routes';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';

class App extends Component {
  render() {
    return (
      <AuthProvider>
        <PlayerProvider>
          <main role="main" className="App" style={{ paddingBottom: '80px' }}>
            <AppNav />
            <Routes />
          </main>
          <MusicPlayer />
        </PlayerProvider>
      </AuthProvider>
    );
  }
}

export default App;
