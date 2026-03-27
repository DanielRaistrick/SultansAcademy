import * as Tone from "tone";

//  Note utilities 
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

//  Permanent audio graph 
// Built once after first interaction; samplers + synths connected permanently.
// Only sequences are created/destroyed per play-stop cycle.
let _graphBuilt = false;
let _drumGain = null, _bassGain = null, _padGain = null;
let _drumReverb = null, _drumComp = null;

// Real instrument samplers (loaded from local public/ files)
let _bassSampler = null, _padSampler = null;
let _bassReady = false, _padReady = false;

// Synthesis fallbacks (always ready, used until samplers load)
let _bassSynth = null, _padSynth = null;

// Raw drum AudioBuffers (loaded once from public/drums/)
let _kickBuf = null, _snareBuf = null, _hihatBuf = null;
let _samplesLoaded = false, _samplesLoading = false, _pendingUrls = null;
let _loadResolvers = [];

// Per-play sequence state
let _drumSeq = null, _chordRepeatId = null, _currentChordIdx = 0;
let _transportStarted = false;
let _fireCount = 0;

//  Build permanent audio graph (called once) 
const _buildPermanentGraph = () => {
  if (_graphBuilt) return;
  _graphBuilt = true;

  _drumGain  = new Tone.Gain(1);
  _bassGain  = new Tone.Gain(0.8);
  _padGain   = new Tone.Gain(0.3);

  // Drums: natural room reverb + compression to glue the kit together
  _drumReverb = new Tone.Reverb({ decay: 1.2, preDelay: 0.015 });
  _drumComp   = new Tone.Compressor({ threshold: -20, ratio: 4, attack: 0.003, release: 0.2 });
  _drumGain.chain(_drumReverb, _drumComp, Tone.Destination);

  _bassGain.toDestination();
  _padGain.toDestination();

  // Synthesis fallbacks  always ready, used until samplers load
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

//  Load real instrument samplers from local public/ files 
const _getBase = () => (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

const _loadSamplers = () => {
  if (_bassSampler || _padSampler) return; // already started
  const base = _getBase();

  // Real acoustic bass (extracted from Musyngkite soundfont, CC0)
  _bassSampler = new Tone.Sampler({
    urls: {
      A1: "A1.mp3",  Db2: "Db2.mp3", F2: "F2.mp3",
      A2: "A2.mp3",  Db3: "Db3.mp3", F3: "F3.mp3", A3: "A3.mp3",
    },
    baseUrl: `${base}/bass/`,
    release: 1.2,
    onload: () => {
      _bassReady = true;
      console.log("[BackingTrack]  Real bass sampler loaded");
    },
  }).connect(_bassGain);

  // Salamander Grand Piano (CC-BY, tonejs.github.io samples downloaded locally)
  _padSampler = new Tone.Sampler({
    urls: {
      A3: "A3.mp3",
      C4: "C4.mp3",  "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
      A4: "A4.mp3",  C5: "C5.mp3",     "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
      A5: "A5.mp3",  C6: "C6.mp3",
    },
    baseUrl: `${base}/piano/`,
    release: 2.0,
    onload: () => {
      _padReady = true;
      console.log("[BackingTrack]  Real piano sampler loaded");
    },
  }).connect(_padGain);
};

// Call this from the BackingTrack component's useEffect to pre-load before Play
export const initInstrumentSamplers = () => {
  _buildPermanentGraph();
  _loadSamplers();
};

export const usingSamples  = () => _samplesLoaded;
export const usingRealBass = () => _bassReady;
export const usingRealPad  = () => _padReady;

//  Drum sample loading (fetch + decodeAudioData, works reliably in Tone v15) 
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
    console.log("[DrumSamples]  Drum samples loaded");
    _loadResolvers.forEach((r) => r(true));
  } catch (err) {
    console.error("[DrumSamples]  Failed:", err.message);
    _loadResolvers.forEach((r) => r(false));
  } finally {
    _loadResolvers = []; _samplesLoading = false; _pendingUrls = null;
  }
};

//  Fire a single drum hit 
const _fireBuffer = (buf, time) => {
  if (!buf || !_drumGain) return;
  const src = Tone.getContext().rawContext.createBufferSource();
  src.buffer = buf;
  const gainNode = _drumGain.input ?? _drumGain._gainNode ?? _drumGain;
  src.connect(gainNode);
  src.start(time);
  if (_fireCount < 2) {
    console.log("[DrumSamples]  Firing hit, duration:", buf.duration.toFixed(3) + "s");
    _fireCount++;
  }
};

//  Dispose only sequences/transport; the audio graph persists 
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
  _currentChordIdx = 0;
  _fireCount = 0;
};

//  Volume helpers 
const _gainFromPercent = (pct) => Math.max(0, Math.min(1, pct / 100));
const _applyVolume = (track, pct, muted) => {
  const map = { drums: _drumGain, bass: _bassGain, pad: _padGain };
  const node = map[track];
  if (!node) return;
  node.gain.value = muted ? 0 : _gainFromPercent(pct);
};
export const setTrackVolume = (track, pct, muted) => { _applyVolume(track, pct, muted); };
export const setLiveBpm = (bpm) => { Tone.Transport.bpm.value = bpm; };

//  Main playback function 
export const startBackingTrack = async ({ chords, style, bpm, volumes, muted, onChordChange }) => {
  await Tone.start();

  // Build the graph on first play (if initInstrumentSamplers() wasn't called earlier)
  _buildPermanentGraph();
  _loadSamplers();

  // Wait for drum samples (local files, should be fast)
  if (_pendingUrls && !_samplesLoaded && !_samplesLoading) {
    const urlsToLoad = _pendingUrls;
    const loadDone = new Promise((resolve) => _loadResolvers.push(resolve));
    _doLoad(urlsToLoad);
    await Promise.race([loadDone, new Promise((r) => setTimeout(r, 8_000))]);
  }

  _disposeCurrent();
  if (!chords?.length) return;

  const styleDef = STYLES[style] ?? STYLES.rock;
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
        // Synth fallback (only if local drum files somehow failed)
        if (styleDef.kick[step]) {
          const k = new Tone.MembraneSynth({ pitchDecay:0.05,octaves:6,envelope:{attack:0.001,decay:0.3,sustain:0,release:0.1} }).connect(_drumGain);
          k.triggerAttackRelease("C1","8n",time); setTimeout(()=>{try{k.dispose();}catch(_){}},1000);
        }
        if (styleDef.snare[step]) {
          const s = new Tone.NoiseSynth({ noise:{type:"white"},envelope:{attack:0.001,decay:0.14,sustain:0,release:0.05} }).connect(_drumGain);
          s.triggerAttackRelease("8n",time); setTimeout(()=>{try{s.dispose();}catch(_){}},1000);
        }
        if (styleDef.hihat[step]) {
          const h = new Tone.MetalSynth({ frequency:400,envelope:{attack:0.001,decay:0.05,release:0.01},harmonicity:5.1,modulationIndex:32,resonance:4000,octaves:1.5 }).connect(_drumGain);
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

    // Bass: use real sampler when loaded, fall back to synth
    if (_bassReady) {
      styleDef.bassSteps.forEach((step) => {
        _bassSampler.triggerAttackRelease(root, "2n", time + step * sixteenth);
      });
    } else {
      styleDef.bassSteps.forEach((step) => {
        _bassSynth.triggerAttackRelease(root, "8n", time + step * sixteenth);
      });
    }

    // Pad: use Salamander piano when loaded, fall back to synth
    const notes = chordNotes(chord, 3);
    if (notes.length) {
      if (_padReady) {
        _padSampler.triggerAttackRelease(notes, styleDef.padDuration, time);
      } else {
        _padSynth.triggerAttackRelease(notes, styleDef.padDuration, time);
      }
    }

    Tone.getDraw().schedule(() => { onChordChange(idx); }, time);
    _currentChordIdx += 1;
  }, "1m", 0);

  _drumSeq.start(0);
  Tone.Transport.start();
  _transportStarted = true;
};

export const stopBackingTrack = () => { _disposeCurrent(); };
