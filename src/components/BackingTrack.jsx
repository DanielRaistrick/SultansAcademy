import { useEffect, useMemo, useRef, useState } from 'react';
import { MUSICAL_KEYS, getProgressionsForKey } from '../utils/progressionDatabase';
import {
  STYLES,
  startBackingTrack,
  stopBackingTrack,
  setTrackVolume,
  setLiveBpm,
} from '../utils/backingTrackEngine';
import './BackingTrack.css';

const TRACKS = ['drums', 'bass', 'pad'];

const TrackControl = ({ label, icon, pct, muted, onVolume, onMute }) => (
  <div className={`bt-track ${muted ? 'muted' : ''}`}>
    <button
      className={`bt-mute-btn ${muted ? 'active' : ''}`}
      onClick={onMute}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
    <span className="bt-track-label">{icon} {label}</span>
    <input
      type="range"
      className="bt-slider"
      min="0"
      max="100"
      value={pct}
      onChange={(e) => onVolume(Number(e.target.value))}
    />
    <span className="bt-vol-num">{pct}</span>
  </div>
);

const BackingTrack = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState('C_major');
  const [selectedProgIdx, setSelectedProgIdx] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState('rock');
  const [bpm, setBpm] = useState(STYLES.rock.defaultBpm);
  const [currentChordIdx, setCurrentChordIdx] = useState(-1);
  const [volumes, setVolumes] = useState({ drums: 80, bass: 75, pad: 55 });
  const [muted, setMuted]     = useState({ drums: false, bass: false, pad: false });

  // When style changes during idle, update default BPM
  const prevStyle = useRef(selectedStyle);
  useEffect(() => {
    if (!isPlaying && prevStyle.current !== selectedStyle) {
      setBpm(STYLES[selectedStyle].defaultBpm);
    }
    prevStyle.current = selectedStyle;
  }, [selectedStyle, isPlaying]);

  const selectedKey = useMemo(
    () => MUSICAL_KEYS.find((k) => k.id === selectedKeyId) ?? MUSICAL_KEYS[0],
    [selectedKeyId],
  );

  const progressions = useMemo(
    () => getProgressionsForKey(selectedKey),
    [selectedKey],
  );

  // Clamp progression index when key changes
  const safeProg = Math.min(selectedProgIdx, progressions.length - 1);
  const progression = progressions[safeProg] ?? progressions[0];
  const chords = progression?.chords ?? [];

  // Stop on unmount
  useEffect(() => () => stopBackingTrack(), []);

  // Live volume/mute updates while playing
  useEffect(() => {
    if (!isPlaying) return;
    TRACKS.forEach((t) => setTrackVolume(t, volumes[t], muted[t]));
  }, [volumes, muted, isPlaying]);

  // Live BPM updates while playing
  useEffect(() => {
    if (isPlaying) setLiveBpm(bpm);
  }, [bpm, isPlaying]);

  const handlePlayStop = async () => {
    if (isPlaying) {
      stopBackingTrack();
      setIsPlaying(false);
      setCurrentChordIdx(-1);
    } else {
      await startBackingTrack({
        chords,
        style: selectedStyle,
        bpm,
        volumes,
        muted,
        onChordChange: setCurrentChordIdx,
      });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (track, val) =>
    setVolumes((prev) => ({ ...prev, [track]: val }));

  const handleMuteToggle = (track) =>
    setMuted((prev) => ({ ...prev, [track]: !prev[track] }));

  // When key/progression changes while playing, restart
  const handleKeyChange = (id) => {
    if (isPlaying) { stopBackingTrack(); setIsPlaying(false); setCurrentChordIdx(-1); }
    setSelectedKeyId(id);
    setSelectedProgIdx(0);
  };

  const handleProgChange = (idx) => {
    if (isPlaying) { stopBackingTrack(); setIsPlaying(false); setCurrentChordIdx(-1); }
    setSelectedProgIdx(idx);
  };

  const handleStyleChange = (style) => {
    if (isPlaying) { stopBackingTrack(); setIsPlaying(false); setCurrentChordIdx(-1); }
    setSelectedStyle(style);
  };

  return (
    <div className="backing-track">
      {/* Header */}
      <div className="bt-header">
        <h2>Backing Track</h2>
        <p>Pick a key, style and progression — then jam over it.</p>
      </div>

      {/* Settings row */}
      <div className="bt-settings">
        <div className="bt-field">
          <label>Key</label>
          <select value={selectedKeyId} onChange={(e) => handleKeyChange(e.target.value)}>
            {MUSICAL_KEYS.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </div>

        <div className="bt-field">
          <label>Style</label>
          <select value={selectedStyle} onChange={(e) => handleStyleChange(e.target.value)}>
            {Object.entries(STYLES).map(([key, def]) => (
              <option key={key} value={key}>{def.label}</option>
            ))}
          </select>
        </div>

        <div className="bt-field bt-field--bpm">
          <label>BPM — {bpm}</label>
          <input
            type="range"
            min="50"
            max="220"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="bt-bpm-slider"
          />
        </div>
      </div>

      {/* Progression selector */}
      <div className="bt-prog-section">
        <label className="bt-prog-label">Progression</label>
        <div className="bt-prog-grid">
          {progressions.map((prog, i) => (
            <button
              key={i}
              className={`bt-prog-card ${safeProg === i ? 'active' : ''}`}
              onClick={() => handleProgChange(i)}
            >
              <span className="bt-prog-name">{prog.name}</span>
              <span className="bt-prog-chords">{prog.chords.join(' – ')}</span>
              <span className="bt-prog-desc">{prog.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chord display */}
      <div className="bt-chord-row">
        {chords.map((chord, i) => (
          <div
            key={i}
            className={`bt-chord-box ${isPlaying && i === currentChordIdx ? 'active' : ''}`}
          >
            <span className="bt-chord-name">{chord}</span>
            <span className="bt-chord-degree">{progression?.degrees?.[i]}</span>
          </div>
        ))}
      </div>

      {/* Mixer */}
      <div className="bt-mixer">
        <TrackControl
          label="Drums"   icon="🥁"
          pct={volumes.drums} muted={muted.drums}
          onVolume={(v) => handleVolumeChange('drums', v)}
          onMute={() => handleMuteToggle('drums')}
        />
        <TrackControl
          label="Bass"    icon="🎸"
          pct={volumes.bass}  muted={muted.bass}
          onVolume={(v) => handleVolumeChange('bass', v)}
          onMute={() => handleMuteToggle('bass')}
        />
        <TrackControl
          label="Pads"    icon="🎹"
          pct={volumes.pad}   muted={muted.pad}
          onVolume={(v) => handleVolumeChange('pad', v)}
          onMute={() => handleMuteToggle('pad')}
        />
      </div>

      {/* Play / Stop */}
      <button
        className={`bt-play-btn ${isPlaying ? 'playing' : ''}`}
        onClick={handlePlayStop}
      >
        {isPlaying ? '⏹ Stop' : '▶ Play'}
      </button>

      {isPlaying && (
        <p className="bt-playing-hint">Playing in {selectedKey.label} — pick up your guitar!</p>
      )}
    </div>
  );
};

export default BackingTrack;
