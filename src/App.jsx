import { useState, useEffect } from 'react';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import UserMenu from './components/UserMenu';
import Fretboard from './components/Fretboard';
import ChordPicker from './components/ChordPicker';
import ScalePicker from './components/ScalePicker';
import Navigation from './components/Navigation';
import Resources from './components/Resources';
import LessonNotes from './components/LessonNotes';
import ChordProgressions from './components/ChordProgressions';
import { detectChord, NOTE_COLORS, getNoteAtPosition, CHORD_DATABASE } from './utils/chordDetection';
import './App.css';

function App() {
  const user = useAuth();
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [detectedChord, setDetectedChord] = useState(null);
  const [activePage, setActivePage] = useState('fretboard');
  const [scaleNotes, setScaleNotes] = useState([]);

  // One-time migration: claim any documents that pre-date auth
  useEffect(() => {
    if (!user) return;
    const migrationKey = `sultans_migrated_${user.uid}`;
    if (localStorage.getItem(migrationKey)) return;

    const migrate = async () => {
      for (const col of ['resources', 'lessonNotes']) {
        const snapshot = await getDocs(collection(db, col));
        const orphans = snapshot.docs.filter((d) => !d.data().userId);
        if (orphans.length > 0) {
          const batch = writeBatch(db);
          orphans.forEach((d) => batch.update(d.ref, { userId: user.uid }));
          await batch.commit();
        }
      }
      localStorage.setItem(migrationKey, 'true');
    };

    migrate().catch(console.error);
  }, [user]);

  const handleScaleSelect = (notes) => {
    setScaleNotes(notes ?? []);
  };

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

  // Still resolving Firebase auth state
  if (user === undefined) {
    return (
      <div className="app">
        <div className="auth-loading">
          <div className="auth-loading-spinner" />
        </div>
      </div>
    );
  }

  // Not signed in
  if (user === null) {
    return <Login />;
  }

  const handleChordSelect = (chord) => {
    if (!chord) {
      // Clear selection
      setSelectedNotes([]);
      setDetectedChord(null);
      return;
    }
    
    // Convert chord frets to selected notes
    const notes = [];
    
    chord.frets.forEach((fret, stringIndex) => {
      if (fret !== -1 && fret !== 0) { // Only add fretted notes (not open strings or muted)
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
        <div className="app-header-title">
          <h1>Guitar Learning Studio</h1>
          <p className="subtitle">Interactive Fretboard Explorer</p>
        </div>
        <UserMenu user={user} />
      </header>

      <Navigation activePage={activePage} onPageChange={setActivePage} />

      <main className="app-main">
        {activePage === 'fretboard' ? (
          <>
            <div className="picker-row">
            <ChordPicker 
          onChordSelect={handleChordSelect} 
          chordDatabase={CHORD_DATABASE}
        />
            <ScalePicker onScaleSelect={handleScaleSelect} />
            </div>
        
        <div className="fretboard-container">
          <Fretboard 
            selectedNotes={selectedNotes} 
            onNoteSelect={handleNoteSelect}
            scaleNotes={scaleNotes}
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
            <li><strong>Quick start:</strong> Use the dropdown above to select any chord and see it on the fretboard</li>
            <li>Chords with multiple positions are listed separately (e.g., "C Major (bar 3rd)")</li>
            <li>Or manually click notes on the fretboard to build your own chords</li>
            <li>Click a selected note again to deselect it</li>
            <li>The chord name appears automatically as you select notes</li>
            <li>Over 150 chords available including 7ths, sus, add9, and bar chords</li>
          </ul>
        </div>
          </>
        ) : activePage === 'progressions' ? (
          <ChordProgressions />
        ) : activePage === 'resources' ? (
          <Resources />
        ) : (
          <LessonNotes />
        )}
      </main>

      <footer className="app-footer">
        <p>Built for personal guitar learning • Standard tuning (E A D G B E)</p>
      </footer>
    </div>
  );
}

export default App;
