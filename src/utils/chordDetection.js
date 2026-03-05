// Guitar tuning: Standard tuning (E A D G B E)
export const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];
export const NOTE_SEQUENCE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Note colors for visualization
export const NOTE_COLORS = {
  'C': '#FF6B6B',
  'C#': '#FF8E8E',
  'D': '#FFA07A',
  'D#': '#FFB88C',
  'E': '#FFD93D',
  'F': '#6BCF7F',
  'F#': '#77DD88',
  'G': '#4ECDC4',
  'G#': '#6EDDD8',
  'A': '#95E1D3',
  'A#': '#A8E8DD',
  'B': '#B4A7D6'
};

/**
 * Get the note at a specific string and fret
 * @param {number} stringIndex - 0-indexed from lowest (low E) to highest (high E)
 * @param {number} fret - Fret number (0 = open string)
 * @returns {string} The note name
 */
export function getNoteAtPosition(stringIndex, fret) {
  const openNote = STANDARD_TUNING[stringIndex];
  const noteIndex = NOTE_SEQUENCE.indexOf(openNote);
  const resultIndex = (noteIndex + fret) % 12;
  return NOTE_SEQUENCE[resultIndex];
}

/**
 * Common chord patterns with their fingerings
 * Format: { name: 'Chord Name', frets: [low E, A, D, G, B, high E] }
 * -1 means don't play that string (X), 0 means open string
 */
export const CHORD_DATABASE = [
  // Open Major chords
  { name: 'C Major', frets: [-1, 3, 2, 0, 1, 0], notes: ['C', 'E', 'G'] },
  { name: 'C Major (alternate)', frets: [-1, 3, 2, 0, 1, 3], notes: ['C', 'E', 'G'] },
  { name: 'D Major', frets: [-1, -1, 0, 2, 3, 2], notes: ['D', 'F#', 'A'] },
  { name: 'E Major', frets: [0, 2, 2, 1, 0, 0], notes: ['E', 'G#', 'B'] },
  { name: 'G Major', frets: [3, 2, 0, 0, 0, 3], notes: ['G', 'B', 'D'] },
  { name: 'G Major (alt)', frets: [3, 2, 0, 0, 3, 3], notes: ['G', 'B', 'D'] },
  { name: 'A Major', frets: [-1, 0, 2, 2, 2, 0], notes: ['A', 'C#', 'E'] },
  
  // Open Minor chords
  { name: 'A Minor', frets: [-1, 0, 2, 2, 1, 0], notes: ['A', 'C', 'E'] },
  { name: 'E Minor', frets: [0, 2, 2, 0, 0, 0], notes: ['E', 'G', 'B'] },
  { name: 'D Minor', frets: [-1, -1, 0, 2, 3, 1], notes: ['D', 'F', 'A'] },
  { name: 'B Minor', frets: [-1, 2, 4, 4, 3, 2], notes: ['B', 'D', 'F#'] },
  
  // Open Dominant 7th chords
  { name: 'A7', frets: [-1, 0, 2, 0, 2, 0], notes: ['A', 'C#', 'E', 'G'] },
  { name: 'B7', frets: [-1, 2, 1, 2, 0, 2], notes: ['B', 'D#', 'F#', 'A'] },
  { name: 'C7', frets: [-1, 3, 2, 3, 1, 0], notes: ['C', 'E', 'G', 'Bb'] },
  { name: 'D7', frets: [-1, -1, 0, 2, 1, 2], notes: ['D', 'F#', 'A', 'C'] },
  { name: 'E7', frets: [0, 2, 0, 1, 0, 0], notes: ['E', 'G#', 'B', 'D'] },
  { name: 'G7', frets: [3, 2, 0, 0, 0, 1], notes: ['G', 'B', 'D', 'F'] },
  
  // Open Major 7th chords
  { name: 'Amaj7', frets: [-1, 0, 2, 1, 2, 0], notes: ['A', 'C#', 'E', 'G#'] },
  { name: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], notes: ['C', 'E', 'G', 'B'] },
  { name: 'Dmaj7', frets: [-1, -1, 0, 2, 2, 2], notes: ['D', 'F#', 'A', 'C#'] },
  { name: 'Emaj7', frets: [0, 2, 1, 1, 0, 0], notes: ['E', 'G#', 'B', 'D#'] },
  { name: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], notes: ['G', 'B', 'D', 'F#'] },
  
  // Open Minor 7th chords
  { name: 'Am7', frets: [-1, 0, 2, 0, 1, 0], notes: ['A', 'C', 'E', 'G'] },
  { name: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], notes: ['D', 'F', 'A', 'C'] },
  { name: 'Em7', frets: [0, 2, 0, 0, 0, 0], notes: ['E', 'G', 'B', 'D'] },
  { name: 'Em7 (alt)', frets: [0, 2, 2, 0, 3, 0], notes: ['E', 'G', 'B', 'D'] },
  
  // Suspended chords
  { name: 'Asus2', frets: [-1, 0, 2, 2, 0, 0], notes: ['A', 'B', 'E'] },
  { name: 'Asus4', frets: [-1, 0, 2, 2, 3, 0], notes: ['A', 'D', 'E'] },
  { name: 'Dsus2', frets: [-1, -1, 0, 2, 3, 0], notes: ['D', 'E', 'A'] },
  { name: 'Dsus4', frets: [-1, -1, 0, 2, 3, 3], notes: ['D', 'G', 'A'] },
  { name: 'Esus4', frets: [0, 2, 2, 2, 0, 0], notes: ['E', 'A', 'B'] },
  { name: 'Gsus4', frets: [3, 3, 0, 0, 1, 3], notes: ['G', 'C', 'D'] },
  
  // 6th chords
  { name: 'A6', frets: [-1, 0, 2, 2, 2, 2], notes: ['A', 'C#', 'E', 'F#'] },
  { name: 'C6', frets: [-1, 3, 2, 2, 1, 0], notes: ['C', 'E', 'G', 'A'] },
  { name: 'E6', frets: [0, 2, 2, 1, 2, 0], notes: ['E', 'G#', 'B', 'C#'] },
  { name: 'Am6', frets: [-1, 0, 2, 2, 1, 2], notes: ['A', 'C', 'E', 'F#'] },
  
  // Add9 chords
  { name: 'Aadd9', frets: [-1, 0, 2, 4, 2, 0], notes: ['A', 'C#', 'E', 'B'] },
  { name: 'Cadd9', frets: [-1, 3, 2, 0, 3, 0], notes: ['C', 'E', 'G', 'D'] },
  { name: 'Dadd9', frets: [-1, -1, 0, 2, 3, 0], notes: ['D', 'F#', 'A', 'E'] },
  { name: 'Gadd9', frets: [3, 2, 0, 0, 0, 3], notes: ['G', 'B', 'D', 'A'] },
  
  // Diminished chords
  { name: 'Adim', frets: [-1, 0, 1, 2, 1, 2], notes: ['A', 'C', 'Eb'] },
  { name: 'Bdim', frets: [-1, 2, 3, 4, 3, 4], notes: ['B', 'D', 'F'] },
  { name: 'Cdim', frets: [-1, 3, 4, 5, 4, 5], notes: ['C', 'Eb', 'Gb'] },
  { name: 'Ddim', frets: [-1, -1, 0, 1, 0, 1], notes: ['D', 'F', 'Ab'] },
  { name: 'Edim', frets: [-1, -1, 2, 3, 2, 3], notes: ['E', 'G', 'Bb'] },
  
  // Augmented chords
  { name: 'Caug', frets: [-1, 3, 2, 1, 1, 0], notes: ['C', 'E', 'G#'] },
  { name: 'Eaug', frets: [0, 3, 2, 1, 1, 0], notes: ['E', 'G#', 'C'] },
  { name: 'Gaug', frets: [3, 2, 1, 0, 0, 3], notes: ['G', 'B', 'D#'] },
  
  // Bar chords - Major (E shape)
  { name: 'F Major', frets: [1, 3, 3, 2, 1, 1], notes: ['F', 'A', 'C'] },
  { name: 'F Major (simplified)', frets: [-1, -1, 3, 2, 1, 1], notes: ['F', 'A', 'C'] },
  { name: 'F# Major (bar)', frets: [2, 4, 4, 3, 2, 2], notes: ['F#', 'A#', 'C#'] },
  { name: 'G Major (bar)', frets: [3, 5, 5, 4, 3, 3], notes: ['G', 'B', 'D'] },
  { name: 'Ab Major (bar)', frets: [4, 6, 6, 5, 4, 4], notes: ['Ab', 'C', 'Eb'] },
  { name: 'A Major (bar)', frets: [5, 7, 7, 6, 5, 5], notes: ['A', 'C#', 'E'] },
  { name: 'Bb Major (bar)', frets: [6, 8, 8, 7, 6, 6], notes: ['Bb', 'D', 'F'] },
  { name: 'B Major (bar)', frets: [7, 9, 9, 8, 7, 7], notes: ['B', 'D#', 'F#'] },
  
  // Bar chords - Major (A shape)
  { name: 'B♭ Major', frets: [-1, 1, 3, 3, 3, 1], notes: ['Bb', 'D', 'F'] },
  { name: 'C Major (bar 3rd)', frets: [-1, 3, 5, 5, 5, 3], notes: ['C', 'E', 'G'] },
  { name: 'C# Major (bar 4th)', frets: [-1, 4, 6, 6, 6, 4], notes: ['C#', 'F', 'G#'] },
  { name: 'D Major (bar 5th)', frets: [-1, 5, 7, 7, 7, 5], notes: ['D', 'F#', 'A'] },
  { name: 'Eb Major (bar 6th)', frets: [-1, 6, 8, 8, 8, 6], notes: ['Eb', 'G', 'Bb'] },
  { name: 'E Major (bar 7th)', frets: [-1, 7, 9, 9, 9, 7], notes: ['E', 'G#', 'B'] },
  { name: 'F Major (bar 8th)', frets: [-1, 8, 10, 10, 10, 8], notes: ['F', 'A', 'C'] },
  
  // Bar chords - Minor (Em shape)
  { name: 'Fm (bar)', frets: [1, 3, 3, 1, 1, 1], notes: ['F', 'Ab', 'C'] },
  { name: 'F#m (bar)', frets: [2, 4, 4, 2, 2, 2], notes: ['F#', 'A', 'C#'] },
  { name: 'Gm (bar)', frets: [3, 5, 5, 3, 3, 3], notes: ['G', 'Bb', 'D'] },
  { name: 'G#m (bar)', frets: [4, 6, 6, 4, 4, 4], notes: ['G#', 'B', 'D#'] },
  { name: 'Am (bar 5th)', frets: [5, 7, 7, 5, 5, 5], notes: ['A', 'C', 'E'] },
  { name: 'Bbm (bar)', frets: [6, 8, 8, 6, 6, 6], notes: ['Bb', 'Db', 'F'] },
  { name: 'Bm (bar 7th)', frets: [7, 9, 9, 7, 7, 7], notes: ['B', 'D', 'F#'] },
  
  // Bar chords - Minor (Am shape)
  { name: 'Bm (bar 2nd)', frets: [-1, 2, 4, 4, 3, 2], notes: ['B', 'D', 'F#'] },
  { name: 'Cm (bar 3rd)', frets: [-1, 3, 5, 5, 4, 3], notes: ['C', 'Eb', 'G'] },
  { name: 'C#m (bar 4th)', frets: [-1, 4, 6, 6, 5, 4], notes: ['C#', 'E', 'G#'] },
  { name: 'Dm (bar 5th)', frets: [-1, 5, 7, 7, 6, 5], notes: ['D', 'F', 'A'] },
  { name: 'Ebm (bar 6th)', frets: [-1, 6, 8, 8, 7, 6], notes: ['Eb', 'Gb', 'Bb'] },
  { name: 'Em (bar 7th)', frets: [-1, 7, 9, 9, 8, 7], notes: ['E', 'G', 'B'] },
  { name: 'Fm (bar 8th)', frets: [-1, 8, 10, 10, 9, 8], notes: ['F', 'Ab', 'C'] },
  { name: 'F#m (bar 2nd)', frets: [-1, 2, 4, 4, 2, 2], notes: ['F#', 'A', 'C#'] },
  { name: 'Gm (bar 3rd)', frets: [-1, 3, 5, 5, 3, 3], notes: ['G', 'Bb', 'D'] },
  
  // Bar chords - Dominant 7th (E7 shape)
  { name: 'F7 (bar)', frets: [1, 3, 1, 2, 1, 1], notes: ['F', 'A', 'C', 'Eb'] },
  { name: 'G7 (bar)', frets: [3, 5, 3, 4, 3, 3], notes: ['G', 'B', 'D', 'F'] },
  { name: 'A7 (bar)', frets: [5, 7, 5, 6, 5, 5], notes: ['A', 'C#', 'E', 'G'] },
  { name: 'B7 (bar)', frets: [7, 9, 7, 8, 7, 7], notes: ['B', 'D#', 'F#', 'A'] },
  
  // Bar chords - Dominant 7th (A7 shape)
  { name: 'B7 (bar 2nd)', frets: [-1, 2, 1, 2, 0, 2], notes: ['B', 'D#', 'F#', 'A'] },
  { name: 'C7 (bar 3rd)', frets: [-1, 3, 2, 3, 1, 0], notes: ['C', 'E', 'G', 'Bb'] },
  { name: 'D7 (bar 5th)', frets: [-1, 5, 4, 5, 3, 5], notes: ['D', 'F#', 'A', 'C'] },
  { name: 'E7 (bar 7th)', frets: [-1, 7, 6, 7, 5, 7], notes: ['E', 'G#', 'B', 'D'] },
  
  // Bar chords - Minor 7th (Em7 shape)
  { name: 'Fm7 (bar)', frets: [1, 3, 1, 1, 1, 1], notes: ['F', 'Ab', 'C', 'Eb'] },
  { name: 'Gm7 (bar)', frets: [3, 5, 3, 3, 3, 3], notes: ['G', 'Bb', 'D', 'F'] },
  { name: 'Am7 (bar 5th)', frets: [5, 7, 5, 5, 5, 5], notes: ['A', 'C', 'E', 'G'] },
  { name: 'Bm7 (bar)', frets: [7, 9, 7, 7, 7, 7], notes: ['B', 'D', 'F#', 'A'] },
  
  // Bar chords - Major 7th (Emaj7 shape)
  { name: 'Fmaj7 (bar)', frets: [1, 3, 2, 2, 1, 1], notes: ['F', 'A', 'C', 'E'] },
  { name: 'Gmaj7 (bar)', frets: [3, 5, 4, 4, 3, 3], notes: ['G', 'B', 'D', 'F#'] },
  { name: 'Amaj7 (bar)', frets: [5, 7, 6, 6, 5, 5], notes: ['A', 'C#', 'E', 'G#'] },
  { name: 'Bmaj7 (bar)', frets: [7, 9, 8, 8, 7, 7], notes: ['B', 'D#', 'F#', 'A#'] },
  
  // Power chords
  { name: 'E5', frets: [0, 2, 2, -1, -1, -1], notes: ['E', 'B'] },
  { name: 'F5', frets: [1, 3, 3, -1, -1, -1], notes: ['F', 'C'] },
  { name: 'F#5', frets: [2, 4, 4, -1, -1, -1], notes: ['F#', 'C#'] },
  { name: 'G5', frets: [3, 5, 5, -1, -1, -1], notes: ['G', 'D'] },
  { name: 'A5', frets: [-1, 0, 2, 2, -1, -1], notes: ['A', 'E'] },
  { name: 'B5', frets: [-1, 2, 4, 4, -1, -1], notes: ['B', 'F#'] },
  { name: 'C5', frets: [-1, 3, 5, 5, -1, -1], notes: ['C', 'G'] },
  { name: 'D5', frets: [-1, 5, 7, 7, -1, -1], notes: ['D', 'A'] },
  
  // 9th chords
  { name: 'A9', frets: [-1, 0, 2, 4, 2, 3], notes: ['A', 'C#', 'E', 'G', 'B'] },
  { name: 'E9', frets: [0, 2, 0, 1, 0, 2], notes: ['E', 'G#', 'B', 'D', 'F#'] },
  { name: 'G9', frets: [3, 2, 0, 2, 0, 1], notes: ['G', 'B', 'D', 'F', 'A'] },
  { name: 'D9', frets: [-1, -1, 0, 2, 1, 0], notes: ['D', 'F#', 'A', 'C', 'E'] },
];

/**
 * Normalize selected notes to comparable format
 * @param {Array} selectedNotes - Array of {string, fret} objects
 * @returns {Array} Sorted array of fret positions
 */
function normalizeSelection(selectedNotes) {
  const frets = new Array(6).fill(-1);
  selectedNotes.forEach(({ string, fret }) => {
    frets[string] = fret;
  });
  return frets;
}

/**
 * Check if two fret patterns match exactly
 */
function fretsMatch(frets1, frets2) {
  return frets1.every((fret, index) => fret === frets2[index]);
}

/**
 * Check if selected frets match a chord pattern (with open string support)
 */
function fretsMatchPartial(selectedFrets, chordFrets) {
  for (let i = 0; i < 6; i++) {
    const selectedFret = selectedFrets[i];
    const chordFret = chordFrets[i];
    
    // If chord doesn't play this string, user shouldn't either
    if (chordFret === -1) {
      if (selectedFret !== -1) {
        return false; // User played a string that should be muted
      }
      continue;
    }
    
    // If chord plays this string (including open strings)
    if (selectedFret === -1) {
      // User didn't select this string
      if (chordFret === 0) {
        // It's an open string - that's OK, open strings play by default
        continue;
      } else {
        // It's a fretted note - user must select it
        return false;
      }
    }
    
    // Both have selections - they must match
    if (selectedFret !== chordFret) {
      return false;
    }
  }
  return true;
}

/**
 * Calculate similarity score between selected notes and chord
 */
function calculateChordSimilarity(selectedFrets, chordFrets) {
  let matches = 0;
  let total = 0;
  
  for (let i = 0; i < 6; i++) {
    const chordFret = chordFrets[i];
    const selectedFret = selectedFrets[i];
    
    if (chordFret !== -1) {
      total++;
      // If chord needs this string played
      if (chordFret === 0 && selectedFret === -1) {
        // Open string - count as match even if not explicitly selected
        matches++;
      } else if (selectedFret === chordFret) {
        // Exact match
        matches++;
      }
    }
  }
  
  return total > 0 ? matches / total : 0;
}

/**
 * Get note names from chord by name
 */
function getChordNotes(chordName) {
  const chord = CHORD_DATABASE.find(c => c.name === chordName);
  return chord ? chord.notes : [];
}

/**
 * Detect chord from selected notes
 * @param {Array} selectedNotes - Array of {string, fret, note} objects
 * @returns {Object} { name: string, confidence: string }
 */
export function detectChord(selectedNotes) {
  if (selectedNotes.length < 2) {
    return null;
  }

  const normalizedFrets = normalizeSelection(selectedNotes);
  
  // First, try exact match
  for (const chord of CHORD_DATABASE) {
    if (fretsMatch(normalizedFrets, chord.frets)) {
      return { name: chord.name, confidence: 'exact' };
    }
  }
  
  // Try partial match (all selected notes match, but not all chord notes selected)
  let bestMatch = null;
  let bestScore = 0;
  
  for (const chord of CHORD_DATABASE) {
    if (fretsMatchPartial(normalizedFrets, chord.frets)) {
      const score = calculateChordSimilarity(normalizedFrets, chord.frets);
      if (score > bestScore && score >= 0.6) { // At least 60% match
        bestScore = score;
        bestMatch = chord;
      }
    }
  }
  
  if (bestMatch) {
    const complete = bestScore === 1.0;
    return { 
      name: bestMatch.name, 
      confidence: complete ? 'complete' : 'partial',
      score: bestScore
    };
  }

  // If no match, show the notes being played
  const uniqueNotes = [...new Set(selectedNotes.map(n => n.note))].sort();
  return { name: `Notes: ${uniqueNotes.join(', ')}`, confidence: 'none' };
}
