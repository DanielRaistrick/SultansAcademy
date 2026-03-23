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

// beats: 8-element array for 8th-note grid (1 & 2 & 3 & 4 &)
// 'D' = downstroke, 'U' = upstroke, null = arm moves but no contact
export const PROGRESSION_LIBRARY = [
  {
    name: 'Classic Pop',
    mode: 'major',
    degrees: ['I', 'V', 'vi', 'IV'],
    description: 'Modern pop anthems and singer-songwriter choruses.',
    strumming: [
      {
        name: 'Pop Standard',
        beats: ['D', null, 'D', 'U', null, 'U', 'D', 'U'],
        tempo: '90–130 BPM',
        difficulty: 'Beginner',
        tip: 'The most-used pattern in pop — keep your arm moving on every 8th note even when you skip.',
      },
      {
        name: 'Pop Upbeat',
        beats: ['D', null, 'D', 'U', 'D', 'U', 'D', 'U'],
        tempo: '100–140 BPM',
        difficulty: 'Intermediate',
        tip: 'Accent beat 3 slightly to give it a driving, energetic feel.',
      },
    ],
  },
  {
    name: '50s Progression',
    mode: 'major',
    degrees: ['I', 'vi', 'IV', 'V'],
    description: 'Great for doo-wop, ballads, and old-school grooves.',
    strumming: [
      {
        name: 'Doo-Wop Steady',
        beats: ['D', null, 'D', 'U', 'D', null, 'D', 'U'],
        tempo: '70–100 BPM',
        difficulty: 'Beginner',
        tip: 'Emphasise beats 1 and 3 for a classic 50s shuffle feel.',
      },
    ],
  },
  {
    name: 'Axis Variant',
    mode: 'major',
    degrees: ['vi', 'IV', 'I', 'V'],
    description: 'Emotion-forward progression heard in many modern hits.',
    strumming: [
      {
        name: 'Emotional Rock',
        beats: ['D', null, 'D', 'U', null, 'U', 'D', 'U'],
        tempo: '80–120 BPM',
        difficulty: 'Beginner',
        tip: 'This pattern suits full strumming or picked arpeggios equally well.',
      },
    ],
  },
  {
    name: 'Blues-Rock Backbone',
    mode: 'major',
    degrees: ['I', 'IV', 'V', 'IV'],
    description: 'Simple, strong movement for riffs and jams.',
    strumming: [
      {
        name: 'Four on the Floor',
        beats: ['D', null, 'D', null, 'D', null, 'D', null],
        tempo: '90–130 BPM',
        difficulty: 'Beginner',
        tip: 'All downstrokes for a raw, driving rock feel. Keep them firm and even.',
      },
      {
        name: 'Blues Shuffle',
        beats: ['D', null, 'D', 'U', 'D', 'U', null, 'U'],
        tempo: '80–110 BPM',
        difficulty: 'Intermediate',
        tip: 'Lightly palm-mute the upstrokes for a gritty blues tone.',
      },
    ],
  },
  {
    name: 'Minor Mood',
    mode: 'minor',
    degrees: ['i', 'VI', 'III', 'VII'],
    description: 'A cinematic, moody loop used in alt and indie tracks.',
    strumming: [
      {
        name: 'Cinematic Space',
        beats: ['D', null, null, 'U', null, 'U', 'D', 'U'],
        tempo: '60–90 BPM',
        difficulty: 'Intermediate',
        tip: 'Leave space in the pattern — silence is part of the mood.',
      },
    ],
  },
  {
    name: 'Minor Lift',
    mode: 'minor',
    degrees: ['i', 'iv', 'VI', 'V'],
    description: 'Creates tension and release with a darker color.',
    strumming: [
      {
        name: 'Tense Ballad',
        beats: ['D', null, 'D', 'U', null, 'U', 'D', 'U'],
        tempo: '70–100 BPM',
        difficulty: 'Beginner',
        tip: 'Build intensity by striking beat 3 slightly harder than the rest.',
      },
    ],
  },
  {
    name: 'Natural Minor Flow',
    mode: 'minor',
    degrees: ['i', 'VII', 'VI', 'VII'],
    description: 'Common in acoustic and folk-rock minor writing.',
    strumming: [
      {
        name: 'Folk-Rock',
        beats: ['D', null, 'D', null, 'U', null, 'D', 'U'],
        tempo: '80–110 BPM',
        difficulty: 'Beginner',
        tip: 'Works beautifully with a capo on fret 2 or 3 for a brighter tone.',
      },
    ],
  },
  {
    name: 'Gentle Cadence',
    mode: 'both',
    degrees: ['ii', 'V', 'I'],
    description: 'Smooth turnaround for endings and transitions.',
    strumming: [
      {
        name: 'Jazz Bounce',
        beats: ['D', null, null, 'U', 'D', null, null, 'U'],
        tempo: '80–110 BPM',
        difficulty: 'Intermediate',
        tip: 'Lightly mute upstrokes for a smoother jazz-influenced sound.',
      },
    ],
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
