export const MUSICAL_KEYS = [
  {
    id: 'C_major',
    label: 'C Major',
    mode: 'major',
    scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  },
  {
    id: 'G_major',
    label: 'G Major',
    mode: 'major',
    scale: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  },
  {
    id: 'D_major',
    label: 'D Major',
    mode: 'major',
    scale: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  },
  {
    id: 'A_major',
    label: 'A Major',
    mode: 'major',
    scale: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  },
  {
    id: 'E_major',
    label: 'E Major',
    mode: 'major',
    scale: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  },
  {
    id: 'F_major',
    label: 'F Major',
    mode: 'major',
    scale: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  },
  {
    id: 'Bb_major',
    label: 'Bb Major',
    mode: 'major',
    scale: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  },
  {
    id: 'Eb_major',
    label: 'Eb Major',
    mode: 'major',
    scale: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  },
  {
    id: 'A_minor',
    label: 'A Minor',
    mode: 'minor',
    scale: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  },
  {
    id: 'E_minor',
    label: 'E Minor',
    mode: 'minor',
    scale: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
  },
  {
    id: 'B_minor',
    label: 'B Minor',
    mode: 'minor',
    scale: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
  },
  {
    id: 'D_minor',
    label: 'D Minor',
    mode: 'minor',
    scale: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
  },
  {
    id: 'G_minor',
    label: 'G Minor',
    mode: 'minor',
    scale: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
  },
  {
    id: 'C_minor',
    label: 'C Minor',
    mode: 'minor',
    scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
  },
];

const DEGREE_TO_INDEX = {
  i: 0,
  ii: 1,
  iii: 2,
  iv: 3,
  v: 4,
  vi: 5,
  vii: 6,
};

const CHORD_QUALITIES = {
  major: ['', 'm', 'm', '', '', 'm', 'dim'],
  minor: ['m', 'dim', '', 'm', 'm', '', ''],
};

export const PROGRESSION_LIBRARY = [
  {
    name: 'Classic Pop',
    mode: 'major',
    degrees: ['I', 'V', 'vi', 'IV'],
    description: 'Modern pop anthems and singer-songwriter choruses.',
  },
  {
    name: '50s Progression',
    mode: 'major',
    degrees: ['I', 'vi', 'IV', 'V'],
    description: 'Great for doo-wop, ballads, and old-school grooves.',
  },
  {
    name: 'Axis Variant',
    mode: 'major',
    degrees: ['vi', 'IV', 'I', 'V'],
    description: 'Emotion-forward progression heard in many modern hits.',
  },
  {
    name: 'Blues-Rock Backbone',
    mode: 'major',
    degrees: ['I', 'IV', 'V', 'IV'],
    description: 'Simple, strong movement for riffs and jams.',
  },
  {
    name: 'Minor Mood',
    mode: 'minor',
    degrees: ['i', 'VI', 'III', 'VII'],
    description: 'A cinematic, moody loop used in alt and indie tracks.',
  },
  {
    name: 'Minor Lift',
    mode: 'minor',
    degrees: ['i', 'iv', 'VI', 'V'],
    description: 'Creates tension and release with a darker color.',
  },
  {
    name: 'Natural Minor Flow',
    mode: 'minor',
    degrees: ['i', 'VII', 'VI', 'VII'],
    description: 'Common in acoustic and folk-rock minor writing.',
  },
  {
    name: 'Gentle Cadence',
    mode: 'both',
    degrees: ['ii', 'V', 'I'],
    description: 'Smooth turnaround for endings and transitions.',
  },
];

export const buildChordFromDegree = (keyData, degree) => {
  if (!keyData || !degree) return '';

  const normalized = degree.toLowerCase().replace('°', '');
  const degreeIndex = DEGREE_TO_INDEX[normalized];

  if (degreeIndex === undefined) return degree;

  const rootNote = keyData.scale[degreeIndex];
  const chordSuffix = CHORD_QUALITIES[keyData.mode][degreeIndex] || '';

  return `${rootNote}${chordSuffix}`;
};

export const getProgressionsForKey = (keyData) => {
  if (!keyData) return [];

  return PROGRESSION_LIBRARY
    .filter((item) => item.mode === 'both' || item.mode === keyData.mode)
    .map((item) => ({
      ...item,
      chords: item.degrees.map((degree) => buildChordFromDegree(keyData, degree)),
    }));
};
