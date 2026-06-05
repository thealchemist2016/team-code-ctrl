import React, { createContext, Component } from 'react';

export const PlayerContext = createContext();

export class PlayerProvider extends Component {
  constructor(props) {
    super(props);
    this.audioRef = React.createRef();
    this.state = {
      currentTrack: null, // { title, artist, audioUrl, coverArt }
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      shuffle: false,
      repeat: false
    };
  }

  componentDidMount() {
    this.audio = new Audio();
    this.audio.volume = this.state.volume;

    this.audio.addEventListener('timeupdate', () => {
      this.setState({ currentTime: this.audio.currentTime });
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.setState({ duration: this.audio.duration });
    });

    this.audio.addEventListener('ended', () => {
      if (this.state.repeat) {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.setState({ isPlaying: false, currentTime: 0 });
      }
    });

    this.audio.addEventListener('error', () => {
      console.warn('Audio error or no source');
    });
  }

  componentWillUnmount() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
    }
  }

  playTrack = (track) => {
    if (!track || !track.audioUrl) return;

    if (this.state.currentTrack && this.state.currentTrack.audioUrl === track.audioUrl) {
      // Same track, toggle play/pause
      this.togglePlay();
      return;
    }

    this.audio.src = track.audioUrl;
    this.audio.play().then(() => {
      this.setState({
        currentTrack: track,
        isPlaying: true,
        currentTime: 0
      });
    }).catch(err => {
      console.warn('Playback failed:', err);
      this.setState({ currentTrack: track, isPlaying: false });
    });
  }

  togglePlay = () => {
    if (!this.audio.src) return;

    if (this.state.isPlaying) {
      this.audio.pause();
      this.setState({ isPlaying: false });
    } else {
      this.audio.play().then(() => {
        this.setState({ isPlaying: true });
      }).catch(err => console.warn('Play failed:', err));
    }
  }

  seek = (time) => {
    if (!this.audio.src) return;
    this.audio.currentTime = time;
    this.setState({ currentTime: time });
  }

  setVolume = (vol) => {
    const v = Math.max(0, Math.min(1, vol));
    this.audio.volume = v;
    this.setState({ volume: v, isMuted: v === 0 });
  }

  toggleMute = () => {
    if (this.state.isMuted) {
      this.audio.volume = this.state.volume || 0.8;
      this.setState({ isMuted: false });
    } else {
      this.audio.volume = 0;
      this.setState({ isMuted: true });
    }
  }

  toggleShuffle = () => {
    this.setState({ shuffle: !this.state.shuffle });
  }

  toggleRepeat = () => {
    this.setState({ repeat: !this.state.repeat });
  }

  render() {
    const value = {
      ...this.state,
      playTrack: this.playTrack,
      togglePlay: this.togglePlay,
      seek: this.seek,
      setVolume: this.setVolume,
      toggleMute: this.toggleMute,
      toggleShuffle: this.toggleShuffle,
      toggleRepeat: this.toggleRepeat
    };

    return (
      <PlayerContext.Provider value={value}>
        {this.props.children}
      </PlayerContext.Provider>
    );
  }
}
