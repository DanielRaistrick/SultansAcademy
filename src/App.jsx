import { useState } from 'react';
import Fretboard from './components/Fretboard';
import ChordHelper from './components/ChordHelper';
import { detectChord, NOTE_COLORS, getNoteAtPosition } from './utils/chordDetection';
import './App.css';

function App() {
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [detectedChord, setDetectedChord] = useState(null);

  const handleNoteSelect = (noteData) => {
    setSelectedNotes(prevNotes => {
      // Check if this note is already selected
      const existingIndex = prevNotes.findIndex(
        n => n.string === noteData.string && n.fret === noteData.fret
      );

      let newNotes;
      if (existingIndex >= 0) {
        // Deselect the note
        newNotes = prevNotes.filter((_, index) => index !== existingIndex);
      } else {
        // Check if another fret on the same string is selected
        const sameStringIndex = prevNotes.findIndex(n => n.string === noteData.string);
        
        if (sameStringIndex >= 0) {
          // Replace the existing note on this string
          newNotes = [...prevNotes];
          newNotes[sameStringIndex] = noteData;
        } else {
          // Add new note
          newNotes = [...prevNotes, noteData];
        }
      }

      // Detect chord with new selection
      const chordResult = detectChord(newNotes);
      setDetectedChord(chordResult);

      return newNotes;
    });
  };

  const clearSelection = () => {
    setSelectedNotes([]);
    setDetectedChord(null);
  };

  const handleChordSelect = (chord) => {
    // Convert chord frets to selected notes
    const notes = [];
    const stringNames = ['E', 'A', 'D', 'G', 'B', 'E']; // Low to high
    
    chord.frets.forEach((fret, stringIndex) => {
      if (fret !== -1) {
        const note = getNoteAtPosition(stringIndex, fret);
        notes.push({ string: stringIndex, fret, note });
      }
    });
    
    setSelectedNotes(notes);
    const chordResult = detectChord(notes);
    setDetectedChord(chordResult);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎸 Guitar Learning Studio</h1>
        <p className="subtitle">Interactive Fretboard Explorer</p>
      </header>

      <main className="app-main">
        <ChordHelper onChordSelect={handleChordSelect} />
        
        <div className="fretboard-container">
          <Fretboard 
            selectedNotes={selectedNotes} 
            onNoteSelect={handleNoteSelect}
          />
        </div>

        <div className="control-panel">
          <div className="chord-display">
            <h2>Detected Chord</h2>
            <div className="chord-name">
              {detectedChord ? (
                <>
                  <span className="chord-result">{detectedChord.name}</span>
                  {detectedChord.confidence === 'partial' && (
                    <span className="chord-hint">Partial match - add more notes for complete chord</span>
                  )}
                  {detectedChord.confidence === 'exact' && (
                    <span className="chord-confidence">✓ Perfect match!</span>
                  )}
                </>
              ) : (
                <span className="chord-empty">Select notes on the fretboard...</span>
              )}
            </div>
          </div>

          <div className="selected-notes">
            <h3>Selected Notes ({selectedNotes.length})</h3>
            <div className="notes-list">
              {selectedNotes.length > 0 ? (
                <>
                  {selectedNotes
                    .sort((a, b) => b.string - a.string) // Sort by string (high to low for display)
                    .map((note, index) => {
                      // Convert string index to name (0=low E, 5=high E)
                      const stringNames = ['low E', 'A', 'D', 'G', 'B', 'high E'];
                      return (
                        <div key={index} className="note-item">
                          <span className="note-string">{stringNames[note.string]}</span>
                          <span className="note-fret">Fret {note.fret}</span>
                          <span className="note-name" style={{ 
                            backgroundColor: NOTE_COLORS[note.note],
                            color: '#000',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            {note.note}
                          </span>
                        </div>
                      );
                    })
                  }
                  <div className="fret-pattern">
                    Pattern: {Array(6).fill(0).map((_, i) => {
                      const note = selectedNotes.find(n => n.string === i);
                      return note ? note.fret : 'X';
                    }).join('')}
                  </div>
                </>
              ) : (
                <p className="empty-state">No notes selected</p>
              )}
            </div>
          </div>

          <button 
            className="clear-button" 
            onClick={clearSelection}
            disabled={selectedNotes.length === 0}
          >
            Clear Selection
          </button>
        </div>

        <div className="instructions">
          <h3>How to use:</h3>
          <ul>
            <li><strong>Quick start:</strong> Click a chord in "Common Chords to Try" above to auto-select it</li>
            <li>Or manually click notes on the fretboard to build your own chords</li>
            <li>Click a selected note again to deselect it</li>
            <li>The chord name appears automatically as you select notes</li>
            <li>Try open chords like C, G, D, E, A for best results</li>
          </ul>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built for personal guitar learning • Standard tuning (E A D G B E)</p>
      </footer>
    </div>
  );
}

export default App;
