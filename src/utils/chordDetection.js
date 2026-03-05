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
 * Format: { name: 'Chord Name', frets: [string6, string5, string4, string3, string2, string1] }
 * -1 means don't play that string, 0 means open string
 */
export const CHORD_DATABASE = [
  // Open chords
  { name: 'C Major', frets: [-1, 3, 2, 0, 1, 0], notes: ['C', 'E', 'G'] },
  { name: 'C Major (alternate)', frets: [-1, 3, 2, 0, 1, 3], notes: ['C', 'E', 'G'] },
  { name: 'D Major', frets: [-1, -1, 0, 2, 3, 2], notes: ['D', 'F#', 'A'] },
  { name: 'E Major', frets: [0, 2, 2, 1, 0, 0], notes: ['E', 'G#', 'B'] },
  { name: 'G Major', frets: [3, 2, 0, 0, 0, 3], notes: ['G', 'B', 'D'] },
  { name: 'A Major', frets: [-1, 0, 2, 2, 2, 0], notes: ['A', 'C#', 'E'] },
  { name: 'A Minor', frets: [-1, 0, 2, 2, 1, 0], notes: ['A', 'C', 'E'] },
  { name: 'E Minor', frets: [0, 2, 2, 0, 0, 0], notes: ['E', 'G', 'B'] },
  { name: 'D Minor', frets: [-1, -1, 0, 2, 3, 1], notes: ['D', 'F', 'A'] },
  { name: 'F Major', frets: [1, 3, 3, 2, 1, 1], notes: ['F', 'A', 'C'] },
  { name: 'F Major (simplified)', frets: [-1, -1, 3, 2, 1, 1], notes: ['F', 'A', 'C'] },
  { name: 'B♭ Major', frets: [-1, 1, 3, 3, 3, 1], notes: ['Bb', 'D', 'F'] },
  
  // Bar chords - Major (E shape)
  { name: 'F Major (bar)', frets: [1, 3, 3, 2, 1, 1], notes: ['F', 'A', 'C'] },
  { name: 'G Major (bar)', frets: [3, 5, 5, 4, 3, 3], notes: ['G', 'B', 'D'] },
  { name: 'A Major (bar)', frets: [5, 7, 7, 6, 5, 5], notes: ['A', 'C#', 'E'] },
  { name: 'B Major (bar)', frets: [7, 9, 9, 8, 7, 7], notes: ['B', 'D#', 'F#'] },
  
  // Bar chords - Major (A shape)
  { name: 'C Major (bar 3rd)', frets: [-1, 3, 5, 5, 5, 3], notes: ['C', 'E', 'G'] },
  { name: 'D Major (bar 5th)', frets: [-1, 5, 7, 7, 7, 5], notes: ['D', 'F#', 'A'] },
  { name: 'E Major (bar 7th)', frets: [-1, 7, 9, 9, 9, 7], notes: ['E', 'G#', 'B'] },
  
  // Bar chords - Minor (Em shape)
  { name: 'F#m (bar)', frets: [2, 4, 4, 2, 2, 2], notes: ['F#', 'A', 'C#'] },
  { name: 'Gm (bar)', frets: [3, 5, 5, 3, 3, 3], notes: ['G', 'Bb', 'D'] },
  { name: 'Am (bar 5th)', frets: [5, 7, 7, 5, 5, 5], notes: ['A', 'C', 'E'] },
  { name: 'Bm (bar)', frets: [7, 9, 9, 7, 7, 7], notes: ['B', 'D', 'F#'] },
  
  // Bar chords - Minor (Am shape)
  { name: 'Bm (bar 2nd)', frets: [-1, 2, 4, 4, 3, 2], notes: ['B', 'D', 'F#'] },
  { name: 'Cm (bar 3rd)', frets: [-1, 3, 5, 5, 4, 3], notes: ['C', 'Eb', 'G'] },
  { name: 'Dm (bar 5th)', frets: [-1, 5, 7, 7, 6, 5], notes: ['D', 'F', 'A'] },
  { name: 'Em (bar 7th)', frets: [-1, 7, 9, 9, 8, 7], notes: ['E', 'G', 'B'] },
  { name: 'F#m (bar 2nd)', frets: [-1, 2, 4, 4, 2, 2], notes: ['F#', 'A', 'C#'] },
  
  // Power chords (common ones)
  { name: 'E5 (Power Chord)', frets: [0, 2, 2, -1, -1, -1], notes: ['E', 'B'] },
  { name: 'A5 (Power Chord)', frets: [-1, 0, 2, 2, -1, -1], notes: ['A', 'E'] },
  { name: 'G5 (Power Chord)', frets: [3, 5, 5, -1, -1, -1], notes: ['G', 'D'] },
  { name: 'D5 (Power Chord)', frets: [-1, 5, 7, 7, -1, -1], notes: ['D', 'A'] },
  
  // Seventh chords
  { name: 'G7', frets: [3, 2, 0, 0, 0, 1], notes: ['G', 'B', 'D', 'F'] },
  { name: 'C7', frets: [-1, 3, 2, 3, 1, 0], notes: ['C', 'E', 'G', 'Bb'] },
  { name: 'D7', frets: [-1, -1, 0, 2, 1, 2], notes: ['D', 'F#', 'A', 'C'] },
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
