import { useMemo, useState } from 'react';
import {
  MUSICAL_KEYS,
  getProgressionsForKey,
} from '../utils/progressionDatabase';
import './ChordProgressions.css';

const ChordProgressions = () => {
  const [selectedKeyId, setSelectedKeyId] = useState('C_major');

  const selectedKey = useMemo(
    () => MUSICAL_KEYS.find((key) => key.id === selectedKeyId) || MUSICAL_KEYS[0],
    [selectedKeyId]
  );

  const progressions = useMemo(
    () => getProgressionsForKey(selectedKey),
    [selectedKey]
  );

  return (
    <section className="progressions">
      <div className="progressions-header">
        <h2>Nice-Sounding Chord Progressions</h2>
        <p>
          Choose a key and explore chord progressions that naturally work together
          in that key.
        </p>
      </div>

      <div className="progression-controls">
        <label htmlFor="key-select">Select Key</label>
        <select
          id="key-select"
          value={selectedKeyId}
          onChange={(e) => setSelectedKeyId(e.target.value)}
        >
          {MUSICAL_KEYS.map((key) => (
            <option key={key.id} value={key.id}>
              {key.label}
            </option>
          ))}
        </select>
      </div>

      <div className="key-scale">
        <h3>{selectedKey.label} Scale Tones</h3>
        <div className="scale-notes">
          {selectedKey.scale.map((note) => (
            <span key={note} className="scale-note-chip">
              {note}
            </span>
          ))}
        </div>
      </div>

      <div className="progression-grid">
        {progressions.map((progression) => (
          <article key={progression.name} className="progression-card">
            <h4>{progression.name}</h4>
            <p className="progression-description">{progression.description}</p>
            <p className="progression-degrees">{progression.degrees.join(' - ')}</p>
            <p className="progression-chords">{progression.chords.join(' - ')}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ChordProgressions;
