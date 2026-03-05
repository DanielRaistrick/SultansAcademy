import React, { useState, useMemo } from 'react';
import './ChordPicker.css';

const ChordPicker = ({ onChordSelect, chordDatabase }) => {
  const [selectedChord, setSelectedChord] = useState('');

  // Group chords by root note and type
  const groupedChords = useMemo(() => {
    const groups = {
      'Major Chords': [],
      'Minor Chords': [],
      'Dominant 7th': [],
      'Major 7th': [],
      'Minor 7th': [],
      'Suspended': [],
      '6th Chords': [],
      'Add9 Chords': [],
      '9th Chords': [],
      'Diminished': [],
      'Augmented': [],
      'Power Chords': []
    };

    chordDatabase.forEach((chord, index) => {
      const name = chord.name.toLowerCase();
      const chordOption = {
        ...chord,
        id: index,
        displayName: chord.name
      };

      if (name.includes('maj7')) {
        groups['Major 7th'].push(chordOption);
      } else if (name.includes('m7') || name.includes('min7')) {
        groups['Minor 7th'].push(chordOption);
      } else if (name.includes('7') && !name.includes('maj')) {
        groups['Dominant 7th'].push(chordOption);
      } else if (name.includes('sus')) {
        groups['Suspended'].push(chordOption);
      } else if (name.includes('add9')) {
        groups['Add9 Chords'].push(chordOption);
      } else if (name.includes('9')) {
        groups['9th Chords'].push(chordOption);
      } else if (name.includes('6')) {
        groups['6th Chords'].push(chordOption);
      } else if (name.includes('dim')) {
        groups['Diminished'].push(chordOption);
      } else if (name.includes('aug')) {
        groups['Augmented'].push(chordOption);
      } else if (name.includes('5') || name.includes('power')) {
        groups['Power Chords'].push(chordOption);
      } else if (name.includes('m') || name.includes('minor')) {
        groups['Minor Chords'].push(chordOption);
      } else {
        groups['Major Chords'].push(chordOption);
      }
    });

    // Remove empty groups
    return Object.entries(groups).filter(([_, chords]) => chords.length > 0);
  }, [chordDatabase]);

  const handleChange = (e) => {
    const chordId = e.target.value;
    setSelectedChord(chordId);
    
    if (chordId) {
      const chord = chordDatabase[parseInt(chordId)];
      if (chord && onChordSelect) {
        onChordSelect(chord);
      }
    }
  };

  const handleClear = () => {
    setSelectedChord('');
    if (onChordSelect) {
      onChordSelect(null);
    }
  };

  return (
    <div className="chord-picker">
      <div className="chord-picker-header">
        <label htmlFor="chord-select" className="chord-picker-label">
          🎵 Choose a Chord
        </label>
        {selectedChord && (
          <button className="chord-picker-clear" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
      
      <select 
        id="chord-select"
        className="chord-picker-select"
        value={selectedChord}
        onChange={handleChange}
      >
        <option value="">Select a chord...</option>
        {groupedChords.map(([groupName, chords]) => (
          <optgroup key={groupName} label={groupName}>
            {chords.map((chord) => (
              <option key={chord.id} value={chord.id}>
                {chord.displayName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {selectedChord && (
        <div className="chord-picker-info">
          <div className="chord-info-pattern">
            Pattern: {chordDatabase[parseInt(selectedChord)].frets
              .map(f => f === -1 ? 'X' : f)
              .join('')}
          </div>
          <div className="chord-info-notes">
            Notes: {chordDatabase[parseInt(selectedChord)].notes.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChordPicker;
