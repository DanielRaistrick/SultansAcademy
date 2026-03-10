import { useEffect, useMemo, useState } from 'react';
import Fretboard from './Fretboard';
import {
  MUSICAL_KEYS,
  getProgressionsForKey,
} from '../utils/progressionDatabase';
import { CHORD_DATABASE, getNoteAtPosition } from '../utils/chordDetection';
import './ChordProgressions.css';

const normalizeNote = (note) => note.replace('♭', 'b').replace('♯', '#');

const getChordRootAndQuality = (chordName) => {
  const normalized = normalizeNote(chordName);

  if (normalized.endsWith('dim')) {
    return { root: normalized.replace('dim', ''), quality: 'dim' };
  }

  if (normalized.endsWith('m')) {
    return { root: normalized.slice(0, -1), quality: 'minor' };
  }

  return { root: normalized, quality: 'major' };
};

const findVoicingForChord = (chordName) => {
  const { root, quality } = getChordRootAndQuality(chordName);
  const escapedRoot = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const byPriority = {
    major: [
      (name) => name === `${root} Major`,
      (name) => name.startsWith(`${root} Major`),
    ],
    minor: [
      (name) => name === `${root} Minor`,
      (name) => new RegExp(`^${escapedRoot}m(\\b|\\s|\\()`).test(name),
      (name) => name.startsWith(`${root} Minor`),
    ],
    dim: [
      (name) => name === `${root}dim`,
      (name) => name.startsWith(`${root}dim`),
    ],
  };

  const tests = byPriority[quality] || [];
  for (const test of tests) {
    const match = CHORD_DATABASE.find((chord) => test(normalizeNote(chord.name)));
    if (match) return match;
  }

  return null;
};

const chordToSelectedNotes = (chord) => {
  if (!chord) return [];

  const notes = [];
  chord.frets.forEach((fret, stringIndex) => {
    if (fret > 0) {
      notes.push({
        string: stringIndex,
        fret,
        note: getNoteAtPosition(stringIndex, fret),
      });
    }
  });

  return notes;
};

const ChordProgressions = () => {
  const [selectedKeyId, setSelectedKeyId] = useState('C_major');
  const [selectedProgressionIndex, setSelectedProgressionIndex] = useState(0);
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);

  const selectedKey = useMemo(
    () => MUSICAL_KEYS.find((key) => key.id === selectedKeyId) || MUSICAL_KEYS[0],
    [selectedKeyId]
  );

  const progressions = useMemo(
    () => getProgressionsForKey(selectedKey),
    [selectedKey]
  );

  useEffect(() => {
    setSelectedProgressionIndex(0);
    setSelectedChordIndex(0);
  }, [selectedKeyId]);

  const selectedProgression = progressions[selectedProgressionIndex] || null;
  const selectedChordName = selectedProgression?.chords?.[selectedChordIndex] || null;
  const selectedVoicing = selectedChordName ? findVoicingForChord(selectedChordName) : null;
  const fretboardNotes = useMemo(
    () => chordToSelectedNotes(selectedVoicing),
    [selectedVoicing]
  );

  const handleProgressionSelect = (index) => {
    setSelectedProgressionIndex(index);
    setSelectedChordIndex(0);
  };

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
        {progressions.map((progression, index) => (
          <article
            key={progression.name}
            className={`progression-card ${selectedProgressionIndex === index ? 'active' : ''}`}
            onClick={() => handleProgressionSelect(index)}
          >
            <h4>{progression.name}</h4>
            <p className="progression-description">{progression.description}</p>
            <p className="progression-degrees">{progression.degrees.join(' - ')}</p>
            <p className="progression-chords">{progression.chords.join(' - ')}</p>
          </article>
        ))}
      </div>

      {selectedProgression && (
        <div className="progression-preview">
          <div className="progression-preview-header">
            <h3>{selectedProgression.name} - Fretboard Preview</h3>
            <p>Select a chord in the progression to view it on the fretboard.</p>
          </div>

          <div className="progression-chord-row">
            {selectedProgression.chords.map((chordName, chordIndex) => (
              <button
                key={`${selectedProgression.name}-${chordName}-${chordIndex}`}
                className={`progression-chord-pill ${selectedChordIndex === chordIndex ? 'active' : ''}`}
                onClick={() => setSelectedChordIndex(chordIndex)}
              >
                <span>{selectedProgression.degrees[chordIndex]}</span>
                <strong>{chordName}</strong>
              </button>
            ))}
          </div>

          {selectedVoicing ? (
            <>
              <p className="voicing-label">
                Showing: <strong>{selectedChordName}</strong> ({selectedVoicing.name})
              </p>
              <div className="progression-fretboard-wrap">
                <Fretboard
                  selectedNotes={fretboardNotes}
                  onNoteSelect={() => {}}
                  scaleNotes={[]}
                />
              </div>
            </>
          ) : (
            <p className="voicing-missing">
              No saved voicing found for {selectedChordName} in the current chord library yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default ChordProgressions;
