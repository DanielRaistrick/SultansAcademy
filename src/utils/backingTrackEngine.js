import * as Tone from 'tone';

// ─── Note utilities ────────────────────────────────────────────────────────────

const NOTE_SEMITONES = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3,
  E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8,
  Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const toneNote = (semi, oct) =>
  `${SHARP_NAMES[((semi % 12) + 12) % 12]}${oct}`;

const parseChordName = (name) => {
  if (!name) return null;
  const m = name.match(/^([A-G][#b]?)(m7|maj7|m|dim7|dim)?/);
  return m ? { root: m[1], quality: m[2] ?? '' } : null;
};

const CHORD_INTERVALS = {
  '':     [0, 4, 7],
  m:      [0, 3, 7],
  dim:    [0, 3, 6],
  m7:     [0, 3, 7, 10],
  maj7:   [0, 4, 7, 11],
  dim7:   [0, 3, 6, 9],
};

export const chordNotes = (name, octave = 3) => {
  const parsed = parseChordName(name);
  if (!parsed) return [];
  const rootSemi = NOTE_SEMITONES[parsed.root];
  if (rootSemi === undefined) return [];
  const intervals = CHORD_INTERVALS[parsed.quality] ?? CHORD_INTERVALS[''];
  return intervals.map((i) => {
    const total = rootSemi + i;
    return toneNote(total % 12, octave + Math.floor(total / 12));
  });
};

export const chordRoot = (name, octave = 2) => {
  const parsed = parseChordName(name);
  if (!parsed) return 'C2';
  const rootSemi = NOTE_SEMITONES[parsed.root];
  if (rootSemi === undefined) return 'C2';
  return toneNote(rootSemi, octave);
};

// ─── Style definitions ──────────────────────────────────────────────────────────
// Each style has a 16-step (16th-note) drum pattern and bass step positions.

export const STYLES = {
  rock: {
    label: '🤘 Rock',
    defaultBpm: 115,
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    bassSteps: [0, 8],
    padDuration: '1m',
  },
  blues: {
    label: '🎷 Blues',
    defaultBpm: 88,
    kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,1, 1,0,0,0],
    hihat: [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,1],
    bassSteps: [0, 6, 8, 14],
    padDuration: '1m',
  },
  jazz: {
    label: '🎺 Jazz',
    defaultBpm: 140,
    kick:  [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
    hihat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    bassSteps: [0, 4, 8, 12],
    padDuration: '2n',
  },
  funk: {
    label: '🕺 Funk',
    defaultBpm: 96,
    kick:  [1,0,0,0, 1,0,0,1, 0,0,1,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,1,0, 0,0,0,0, 1,0,0,1],
    hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    bassSteps: [0, 2, 8, 10],
    padDuration: '2n',
  },
  ballad: {
    label: '🌙 Ballad',
    defaultBpm: 68,
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    bassSteps: [0, 8],
    padDuration: '1m',
  },
  latin: {
    label: '💃 Latin',
    defaultBpm: 110,
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    hihat: [1,0,1,0, 1,1,0,1, 0,1,0,0, 1,0,1,0],
    bassSteps: [0, 3, 8, 11],
    padDuration: '2n',
  },
};

// ─── Engine state ──────────────────────────────────────────────────────────────

let _kickSynth = null;
let _snareSynth = null;
let _hihatSynth = null;
let _bassSynth = null;
let _padSynth = null;
let _drumGain = null;
let _bassGain = null;
let _padGain = null;
let _drumSeq = null;
let _chordRepeatId = null;
let _currentChordIdx = 0;

// ─── Internal helpers ──────────────────────────────────────────────────────────

const _disposeCurrent = () => {
  Tone.Transport.stop();
  Tone.Transport.cancel();

  if (_drumSeq) { _drumSeq.stop(); _drumSeq.dispose(); _drumSeq = null; }
  if (_chordRepeatId !== null) {
    Tone.Transport.clear(_chordRepeatId);
    _chordRepeatId = null;
  }

  for (const node of [_kickSynth, _snareSynth, _hihatSynth, _bassSynth, _padSynth, _drumGain, _bassGain, _padGain]) {
    try { node?.dispose(); } catch (_) { /* already disposed */ }
  }

  _kickSynth = _snareSynth = _hihatSynth = _bassSynth = _padSynth = null;
  _drumGain = _bassGain = _padGain = null;
  _currentChordIdx = 0;
};

const _buildSynths = () => {
  _drumGain = new Tone.Gain(1).toDestination();
  _bassGain = new Tone.Gain(0.9).toDestination();
  _padGain  = new Tone.Gain(0.35).toDestination();

  _kickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
  }).connect(_drumGain);

  _snareSynth = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.05 },
  }).connect(_drumGain);

  _hihatSynth = new Tone.MetalSynth({
    frequency: 400,
    envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).connect(_drumGain);

  _bassSynth = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.25 },
    filterEnvelope: {
      attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2,
      baseFrequency: 200, octaves: 2.5,
    },
  }).connect(_bassGain);

  _padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.35, decay: 0.2, sustain: 0.7, release: 1.8 },
  }).connect(_padGain);
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Start the backing track.
 * @param {object} opts
 * @param {string[]} opts.chords  - chord names in order, e.g. ['C', 'Am', 'F', 'G']
 * @param {string}   opts.style   - key of STYLES
 * @param {number}   opts.bpm
 * @param {object}   opts.volumes - { drums, bass, pad } as 0–100
 * @param {object}   opts.muted   - { drums, bass, pad } booleans
 * @param {function} opts.onChordChange - called with (chordIndex) on each bar start
 */
export const startBackingTrack = async ({ chords, style, bpm, volumes, muted, onChordChange }) => {
  await Tone.start();
  _disposeCurrent();

  if (!chords?.length) return;

  const styleDef = STYLES[style] ?? STYLES.rock;
  _buildSynths();

  // Apply initial volumes/mutes
  _applyVolume('drums', volumes.drums, muted.drums);
  _applyVolume('bass',  volumes.bass,  muted.bass);
  _applyVolume('pad',   volumes.pad,   muted.pad);

  Tone.Transport.bpm.value = bpm;

  // 16th-note duration in seconds (computed after bpm is set)
  const sixteenth = Tone.Time('16n').toSeconds();

  // ── Drum sequence (16 steps × 16th notes) ──────────────────────
  _drumSeq = new Tone.Sequence(
    (time, step) => {
      if (styleDef.kick[step])  _kickSynth.triggerAttackRelease('C1', '8n', time);
      if (styleDef.snare[step]) _snareSynth.triggerAttackRelease('8n', time);
      if (styleDef.hihat[step]) _hihatSynth.triggerAttackRelease('16n', time);
    },
    Array.from({ length: 16 }, (_, i) => i),
    '16n',
  );

  // ── Chord / bass repeat every measure ──────────────────────────
  _chordRepeatId = Tone.Transport.scheduleRepeat((time) => {
    const idx = _currentChordIdx % chords.length;
    const chord = chords[idx];

    // Bass — root note at each bassStep position within the bar
    const root = chordRoot(chord, 2);
    styleDef.bassSteps.forEach((step) => {
      _bassSynth.triggerAttackRelease(root, '8n', time + step * sixteenth);
    });

    // Pad — full chord voicing
    const notes = chordNotes(chord, 3);
    if (notes.length) {
      _padSynth.triggerAttackRelease(notes, styleDef.padDuration, time);
    }

    // Notify React via the draw scheduler (fires on the animation frame)
    Tone.getDraw().schedule(() => {
      onChordChange(idx);
    }, time);

    _currentChordIdx += 1;
  }, '1m', 0);

  _drumSeq.start(0);
  Tone.Transport.start();
};

export const stopBackingTrack = () => {
  _disposeCurrent();
};

const _gainFromPercent = (pct) => Math.max(0, Math.min(1, pct / 100));

const _applyVolume = (track, pct, muted) => {
  const map = { drums: _drumGain, bass: _bassGain, pad: _padGain };
  const node = map[track];
  if (!node) return;
  node.gain.value = muted ? 0 : _gainFromPercent(pct);
};

/** Update a single track's volume while the track is running. */
export const setTrackVolume = (track, pct, muted) => {
  _applyVolume(track, pct, muted);
};

/** Change transport BPM live. */
export const setLiveBpm = (bpm) => {
  Tone.Transport.bpm.value = bpm;
};
