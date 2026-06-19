import React, { Component } from 'react';
import { PlayerContext } from '../context/PlayerContext';

class MusicPlayer extends Component {
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  handleProgressClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const { duration, seek } = this.context;
    if (duration) {
      seek(percent * duration);
    }
  }

  handleVolumeChange = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    this.context.setVolume(percent);
  }

  render() {
    const {
      currentTrack, isPlaying, currentTime, duration,
      volume, isMuted, shuffle, repeat,
      togglePlay, toggleMute, toggleShuffle, toggleRepeat
    } = this.context;

    const progress = duration ? (currentTime / duration) * 100 : 0;
    const volumeLevel = isMuted ? 0 : volume * 100;

    return (
      <div className="music-player-container">
        {/* Track Info */}
        <div className="music-player-track-info">
          {currentTrack ? (
            <React.Fragment>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginRight: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0
              }}>
                <img
                  src={currentTrack.coverArt || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&q=60'}
                  alt="Cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  color: '#e2e8f0',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentTrack.title}
                </div>
                <div style={{
                  color: '#64748b',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentTrack.artist || 'Unknown Artist'}
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
              No track selected
            </div>
          )}
        </div>

        {/* Player Controls */}
        <div className="music-player-controls-container">
          {/* Buttons */}
          <div className="music-player-buttons-wrapper">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              style={{
                background: 'none',
                border: 'none',
                color: shuffle ? '#a855f7' : '#64748b',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '4px',
                transition: 'all 0.3s ease'
              }}
              title="Shuffle"
            >
              🔀
            </button>

            {/* Skip Back */}
            <button
              onClick={() => this.context.seek(Math.max(0, currentTime - 10))}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '4px',
                transition: 'all 0.3s ease'
              }}
              title="Skip Back"
            >
              ⏮
            </button>

            <button
              onClick={togglePlay}
              className="music-player-play-btn"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                transition: 'all 0.3s ease',
                boxShadow: isPlaying ? '0 0 20px rgba(124, 58, 237, 0.4)' : '0 0 10px rgba(124, 58, 237, 0.2)',
                transform: isPlaying ? 'scale(1.05)' : 'scale(1)'
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => this.context.seek(Math.min(duration || 0, currentTime + 10))}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '4px',
                transition: 'all 0.3s ease'
              }}
              title="Skip Forward"
            >
              ⏭
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              style={{
                background: 'none',
                border: 'none',
                color: repeat ? '#a855f7' : '#64748b',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '4px',
                transition: 'all 0.3s ease'
              }}
              title="Repeat"
            >
              🔁
            </button>
          </div>

          {/* Progress Bar */}
          <div className="music-player-progress-wrapper">
            <span className="music-player-time" style={{ color: '#64748b', fontSize: '0.75rem', minWidth: '35px', textAlign: 'right' }}>
              {this.formatTime(currentTime)}
            </span>
            <div
              onClick={this.handleProgressClick}
              className="music-player-bar-container progress-bar-interactive"
              style={{
                flex: 1,
                height: '4px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'height 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.height = '6px'; }}
              onMouseLeave={(e) => { e.currentTarget.style.height = '4px'; }}
            >
              <div style={{
                width: progress + '%',
                height: '100%',
                background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                borderRadius: '2px',
                transition: 'width 0.1s linear',
                boxShadow: '0 0 8px rgba(124, 58, 237, 0.3)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  right: '-5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#a855f7',
                  boxShadow: '0 0 6px rgba(168, 85, 247, 0.5)'
                }} />
              </div>
            </div>
            <span className="music-player-time" style={{ color: '#64748b', fontSize: '0.75rem', minWidth: '35px' }}>
              {this.formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="music-player-volume-container">
          <button
            onClick={toggleMute}
            style={{
              background: 'none',
              border: 'none',
              color: isMuted ? '#ef4444' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '4px',
              transition: 'all 0.3s ease'
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : volumeLevel > 50 ? '🔊' : volumeLevel > 0 ? '🔉' : '🔈'}
          </button>
          <div
            onClick={this.handleVolumeChange}
            style={{
              width: '80px',
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{
              width: volumeLevel + '%',
              height: '100%',
              background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
              borderRadius: '2px'
            }} />
          </div>
        </div>
      </div>
    );
  }
}

MusicPlayer.contextType = PlayerContext;

export default MusicPlayer;
