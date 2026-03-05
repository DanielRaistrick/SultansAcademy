import React, { useState } from 'react';
import './ChordHelper.css';

const COMMON_CHORDS = [
  { name: 'C Major', frets: [-1, 3, 2, 0, 1, 0], diagram: 'X32010' },
  { name: 'D Major', frets: [-1, -1, 0, 2, 3, 2], diagram: 'XX0232' },
  { name: 'E Major', frets: [0, 2, 2, 1, 0, 0], diagram: '022100' },
  { name: 'G Major', frets: [3, 2, 0, 0, 0, 3], diagram: '320003' },
  { name: 'A Major', frets: [-1, 0, 2, 2, 2, 0], diagram: 'X02220' },
  { name: 'A Minor', frets: [-1, 0, 2, 2, 1, 0], diagram: 'X02210' },
  { name: 'E Minor', frets: [0, 2, 2, 0, 0, 0], diagram: '022000' },
  { name: 'D Minor', frets: [-1, -1, 0, 2, 3, 1], diagram: 'XX0231' },
];

const ChordHelper = ({ onChordSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChordClick = (chord) => {
    if (onChordSelect) {
      onChordSelect(chord);
    }
  };

  return (
    <div className="chord-helper">
      <button 
        className="chord-helper-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▼' : '▶'} Common Chords to Try
      </button>
      
      {isExpanded && (
        <div className="chord-helper-grid">
          {COMMON_CHORDS.map((chord, index) => (
            <div 
              key={index} 
              className="chord-card"
              onClick={() => handleChordClick(chord)}
              title="Click to auto-select this chord"
            >
              <div className="chord-card-name">{chord.name}</div>
              <div className="chord-card-diagram">{chord.diagram}</div>
              <div className="chord-card-hint">
                {chord.diagram.split('').map((fret, i) => (
                  <span key={i} className="string-label">
                    {fret === 'X' ? '×' : fret}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChordHelper;
