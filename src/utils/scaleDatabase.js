import { NOTE_SEQUENCE, STANDARD_TUNING } from './chordDetection';

export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const ROOT_DISPLAY = {
  'C':  'C',        'C#': 'C# / D♭',
  'D':  'D',        'D#': 'D# / E♭',
  'E':  'E',        'F':  'F',
  'F#': 'F# / G♭', 'G':  'G',
  'G#': 'G# / A♭', 'A':  'A',
  'A#': 'A# / B♭', 'B':  'B',
};

export const SCALE_TYPES = [
  // ── Major family ───────────────────────────────────────────
  { id: 'major',         name: 'Major (Ionian)',          group: 'Major Scales',    intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'major_pent',    name: 'Major Pentatonic',        group: 'Major Scales',    intervals: [0, 2, 4, 7, 9] },
  { id: 'major_blues',   name: 'Major Blues',             group: 'Major Scales',    intervals: [0, 2, 3, 4, 7, 9] },
  { id: 'lydian',        name: 'Lydian',                  group: 'Major Scales',    intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: 'mixolydian',    name: 'Mixolydian',              group: 'Major Scales',    intervals: [0, 2, 4, 5, 7, 9, 10] },

  // ── Minor family ───────────────────────────────────────────
  { id: 'natural_minor', name: 'Natural Minor (Aeolian)', group: 'Minor Scales',    intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'harmonic_minor',name: 'Harmonic Minor',          group: 'Minor Scales',    intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: 'melodic_minor', name: 'Melodic Minor',           group: 'Minor Scales',    intervals: [0, 2, 3, 5, 7, 9, 11] },
  { id: 'minor_pent',    name: 'Minor Pentatonic',        group: 'Minor Scales',    intervals: [0, 3, 5, 7, 10] },
  { id: 'dorian',        name: 'Dorian',                  group: 'Minor Scales',    intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'phrygian',      name: 'Phrygian',                group: 'Minor Scales',    intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: 'locrian',       name: 'Locrian',                 group: 'Minor Scales',    intervals: [0, 1, 3, 5, 6, 8, 10] },

  // ── Blues ──────────────────────────────────────────────────
  { id: 'blues',         name: 'Blues (Minor Blues)',     group: 'Blues',           intervals: [0, 3, 5, 6, 7, 10] },

  // ── Modes ──────────────────────────────────────────────────
  { id: 'ionian',        name: 'Ionian (= Major)',        group: 'Church Modes',    intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'dorian_mode',   name: 'Dorian',                  group: 'Church Modes',    intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'phrygian_mode', name: 'Phrygian',                group: 'Church Modes',    intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: 'lydian_mode',   name: 'Lydian',                  group: 'Church Modes',    intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: 'mixo_mode',     name: 'Mixolydian',              group: 'Church Modes',    intervals: [0, 2, 4, 5, 7, 9, 10] },
  { id: 'aeolian_mode',  name: 'Aeolian (= Nat. Minor)',  group: 'Church Modes',    intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'locrian_mode',  name: 'Locrian',                 group: 'Church Modes',    intervals: [0, 1, 3, 5, 6, 8, 10] },

  // ── Exotic ─────────────────────────────────────────────────
  { id: 'phrygian_dom',  name: 'Phrygian Dominant',       group: 'Exotic & Jazz',   intervals: [0, 1, 4, 5, 7, 8, 10] },
  { id: 'hungarian_min', name: 'Hungarian Minor',         group: 'Exotic & Jazz',   intervals: [0, 2, 3, 6, 7, 8, 11] },
  { id: 'whole_tone',    name: 'Whole Tone',              group: 'Exotic & Jazz',   intervals: [0, 2, 4, 6, 8, 10] },
  { id: 'dim_wh',        name: 'Diminished (W–H)',        group: 'Exotic & Jazz',   intervals: [0, 2, 3, 5, 6, 8, 9, 11] },
  { id: 'dim_hw',        name: 'Diminished (H–W)',        group: 'Exotic & Jazz',   intervals: [0, 1, 3, 4, 6, 7, 9, 10] },
  { id: 'altered',       name: 'Altered (Super Locrian)', group: 'Exotic & Jazz',   intervals: [0, 1, 3, 4, 6, 8, 10] },
  { id: 'augmented',     name: 'Augmented',               group: 'Exotic & Jazz',   intervals: [0, 3, 4, 7, 8, 11] },
  { id: 'bebop_dom',     name: 'Bebop Dominant',          group: 'Exotic & Jazz',   intervals: [0, 2, 4, 5, 7, 9, 10, 11] },
  { id: 'japanese',      name: 'Japanese (In)',           group: 'Exotic & Jazz',   intervals: [0, 1, 5, 7, 8] },
];

/**
 * Returns all positions of scale notes on a standard-tuned guitar (frets 1–12).
 * Each entry: { string, fret, note, isRoot }
 */
export const getScaleNotesOnFretboard = (root, intervals) => {
  const rootIndex = NOTE_SEQUENCE.indexOf(root);
  if (rootIndex === -1) return [];

  const scaleSet = new Set(intervals.map((i) => (rootIndex + i) % 12));

  const result = [];
  for (let string = 0; string < 6; string++) {
    const openIdx = NOTE_SEQUENCE.indexOf(STANDARD_TUNING[string]);
    for (let fret = 1; fret <= 12; fret++) {
      const noteIdx = (openIdx + fret) % 12;
      if (scaleSet.has(noteIdx)) {
        result.push({
          string,
          fret,
          note: NOTE_SEQUENCE[noteIdx],
          isRoot: noteIdx === rootIndex,
        });
      }
    }
  }
  return result;
};

/** Returns the note names in the scale (in interval order). */
export const getScaleNoteNames = (root, intervals) => {
  const rootIndex = NOTE_SEQUENCE.indexOf(root);
  return intervals.map((i) => NOTE_SEQUENCE[(rootIndex + i) % 12]);
};
