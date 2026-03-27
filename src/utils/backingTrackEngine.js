import * as Tone from "tone";

const NOTE_SEMITONES = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
  E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8,
  Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};
const SHARP_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const toneNote = (semi, oct) => `${SHARP_NAMES[((semi % 12) + 12) % 12]}${oct}`;
const parseChordName = (name) => {
  if (!name) return null;
  const m = name.match(/^([A-G][#b]?)(m7|maj7|m|dim7|dim)?/);
  return m ? { root: m[1], quality: m[2] ?? "" } : null;
};
const CHORD_INTERVALS = {
  "":    [0,4,7], m:    [0,3,7], dim:  [0,3,6],
  m7:   [0,3,7,10], maj7: [0,4,7,11], dim7: [0,3,6,9],
};
export const chordNotes = (name, octave = 3) => {
  const parsed = parseChordName(name);
  if (!parsed) return [];
  const rootSemi = NOTE_SEMITONES[parsed.root];
  if (rootSemi === undefined) return [];
  const intervals = CHORD_INTERVALS[parsed.quality] ?? CHORD_INTERVALS[""];
  return intervals.map((i) => { const t = rootSemi + i; return toneNote(t % 12, octave + Math.floor(t / 12)); });
};
export const chordRoot = (name, octave = 2) => {
  const parsed = parseChordName(name);
  if (!parsed) return "C2";
  const rootSemi = NOTE_SEMITONES[parsed.root];
  if (rootSemi === undefined) return "C2";
  return toneNote(rootSemi, octave);
};
export const STYLES = {
  rock:   { label: " Rock",   defaultBpm: 115, kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], bassSteps:[0,8],        padDuration:"1m" },
  blues:  { label: " Blues",  defaultBpm: 88,  kick:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0], hihat:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], bassSteps:[0,6,8,14],   padDuration:"1m" },
  jazz:   { label: " Jazz",   defaultBpm: 140, kick:[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0], snare:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0], hihat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], bassSteps:[0,4,8,12],   padDuration:"2n" },
  funk:   { label: " Funk",   defaultBpm: 96,  kick:[1,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0], snare:[0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1], hihat:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], bassSteps:[0,2,8,10],   padDuration:"2n" },
  ballad: { label: " Ballad", defaultBpm: 68,  kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], bassSteps:[0,8],        padDuration:"1m" },
  latin:  { label: " Latin",  defaultBpm: 110, kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare:[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0], hihat:[1,0,1,0,1,1,0,1,0,1,0,0,1,0,1,0], bassSteps:[0,3,8,11],   padDuration:"2n" },
};

let _kickBuf = null, _snareBuf = null, _hihatBuf = null;
let _samplesLoaded = false, _samplesLoading = false, _pendingUrls = null;
let _bassSynth = null, _padSynth = null;
let _drumGain = null, _bassGain = null, _padGain = null;
let _drumSeq = null, _chordRepeatId = null, _currentChordIdx = 0;
let _transportStarted = false;
let _loadResolvers = [];

const _fetchBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const arr = await res.arrayBuffer();
  return Tone.getContext().rawContext.decodeAudioData(arr);
};

export const loadDrumSamples = (urls) => {
  _pendingUrls = urls;
  return new Promise((resolve) => {
    const check = () => {
      if (_samplesLoaded) { resolve(true); return; }
      if (!_samplesLoading && !_pendingUrls) { resolve(false); return; }
      setTimeout(check, 100);
    };
    check();
  });
};

const _doLoad = async (urls) => {
  _samplesLoading = true;
  try {
    const [k, s, h] = await Promise.all([
      _fetchBuffer(urls.kick),
      _fetchBuffer(urls.snare),
      _fetchBuffer(urls.hihat),
    ]);
    _kickBuf = k; _snareBuf = s; _hihatBuf = h;
    _samplesLoaded = true;
    _loadResolvers.forEach((r) => r(true));
  } catch (err) {
    console.warn("[BackingTrack] Sample load failed:", err.message);
    _loadResolvers.forEach((r) => r(false));
  } finally {
    _loadResolvers = []; _samplesLoading = false; _pendingUrls = null;
  }
};

export const usingSamples = () => _samplesLoaded;

const _fireBuffer = (buf, time) => {
  if (!buf || !_drumGain) return;
  const src = Tone.getContext().rawContext.createBufferSource();
  src.buffer = buf;
  src.connect(_drumGain.input);
  src.start(time);
};

const _disposeCurrent = () => {
  if (_transportStarted) {
    try { Tone.Transport.stop(); } catch (_) {}
    try { Tone.Transport.cancel(); } catch (_) {}
    _transportStarted = false;
  }
  if (_drumSeq) { try { _drumSeq.dispose(); } catch (_) {} _drumSeq = null; }
  if (_chordRepeatId !== null) {
    try { Tone.Transport.clear(_chordRepeatId); } catch (_) {}
    _chordRepeatId = null;
  }
  for (const node of [_bassSynth, _padSynth, _drumGain, _bassGain, _padGain]) {
    try { node?.dispose(); } catch (_) {}
  }
  _bassSynth = _padSynth = _drumGain = _bassGain = _padGain = null;
  _currentChordIdx = 0;
};

const _buildAudio = () => {
  _drumGain = new Tone.Gain(1).toDestination();
  _bassGain = new Tone.Gain(0.85).toDestination();
  _padGain  = new Tone.Gain(0.3).toDestination();
  _bassSynth = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.3 },
    filterEnvelope: { attack: 0.005, decay: 0.15, sustain: 0.4, release: 0.3, baseFrequency: 180, octaves: 3 },
  }).connect(_bassGain);
  _padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
    envelope: { attack: 0.4, decay: 0.3, sustain: 0.6, release: 2.5 },
    volume: -6,
  }).connect(_padGain);
};

export const startBackingTrack = async ({ chords, style, bpm, volumes, muted, onChordChange }) => {
  await Tone.start();

  if (_pendingUrls && !_samplesLoaded && !_samplesLoading) {
    const urlsToLoad = _pendingUrls;
    const loadDone = new Promise((resolve) => _loadResolvers.push(resolve));
    _doLoad(urlsToLoad);
    await Promise.race([loadDone, new Promise((r) => setTimeout(r, 8_000))]);
  }

  _disposeCurrent();
  if (!chords?.length) return;

  const styleDef = STYLES[style] ?? STYLES.rock;
  _buildAudio();
  _applyVolume("drums", volumes.drums, muted.drums);
  _applyVolume("bass",  volumes.bass,  muted.bass);
  _applyVolume("pad",   volumes.pad,   muted.pad);

  Tone.Transport.bpm.value = bpm;
  const sixteenth = Tone.Time("16n").toSeconds();

  _drumSeq = new Tone.Sequence(
    (time, step) => {
      if (_samplesLoaded) {
        if (styleDef.kick[step])  _fireBuffer(_kickBuf,  time);
        if (styleDef.snare[step]) _fireBuffer(_snareBuf, time);
        if (styleDef.hihat[step]) _fireBuffer(_hihatBuf, time);
      } else {
        if (styleDef.kick[step]) {
          const k = new Tone.MembraneSynth({ pitchDecay:0.05, octaves:6, envelope:{attack:0.001,decay:0.3,sustain:0,release:0.1} }).connect(_drumGain);
          k.triggerAttackRelease("C1","8n",time); setTimeout(()=>{try{k.dispose();}catch(_){}},1000);
        }
        if (styleDef.snare[step]) {
          const s = new Tone.NoiseSynth({ noise:{type:"white"}, envelope:{attack:0.001,decay:0.14,sustain:0,release:0.05} }).connect(_drumGain);
          s.triggerAttackRelease("8n",time); setTimeout(()=>{try{s.dispose();}catch(_){}},1000);
        }
        if (styleDef.hihat[step]) {
          const h = new Tone.MetalSynth({ frequency:400, envelope:{attack:0.001,decay:0.05,release:0.01}, harmonicity:5.1, modulationIndex:32, resonance:4000, octaves:1.5 }).connect(_drumGain);
          h.triggerAttackRelease("16n",time); setTimeout(()=>{try{h.dispose();}catch(_){}},500);
        }
      }
    },
    Array.from({ length: 16 }, (_, i) => i),
    "16n",
  );

  _chordRepeatId = Tone.Transport.scheduleRepeat((time) => {
    const idx = _currentChordIdx % chords.length;
    const chord = chords[idx];
    const root = chordRoot(chord, 2);
    styleDef.bassSteps.forEach((step) => {
      _bassSynth.triggerAttackRelease(root, "8n", time + step * sixteenth);
    });
    const notes = chordNotes(chord, 3);
    if (notes.length) _padSynth.triggerAttackRelease(notes, styleDef.padDuration, time);
    Tone.getDraw().schedule(() => { onChordChange(idx); }, time);
    _currentChordIdx += 1;
  }, "1m", 0);

  _drumSeq.start(0);
  Tone.Transport.start();
  _transportStarted = true;
};

export const stopBackingTrack = () => { _disposeCurrent(); };

const _gainFromPercent = (pct) => Math.max(0, Math.min(1, pct / 100));
const _applyVolume = (track, pct, muted) => {
  const map = { drums: _drumGain, bass: _bassGain, pad: _padGain };
  const node = map[track];
  if (!node) return;
  node.gain.value = muted ? 0 : _gainFromPercent(pct);
};
export const setTrackVolume = (track, pct, muted) => { _applyVolume(track, pct, muted); };
export const setLiveBpm = (bpm) => { Tone.Transport.bpm.value = bpm; };
