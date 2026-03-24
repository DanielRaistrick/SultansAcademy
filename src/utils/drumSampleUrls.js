// ── Drum sample URL configuration ────────────────────────────────────────────
//
// By default the app loads open-source samples from the Tone.js public CDN.
// No setup is required for this to work.
//
// For your own copy (better reliability, zero third-party dependency) upload the
// samples once to your Firebase Storage bucket by running:
//   node scripts/uploadDrumSamples.js
//
// Once uploaded, the VITE_FIREBASE_STORAGE_BUCKET env var (already present in your
// .env) makes the app automatically prefer Firebase Storage over the CDN.
// ─────────────────────────────────────────────────────────────────────────────

const CDN_BASE = 'https://tonejs.github.io/audio/drum-samples/CR78';

const BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;

// Firebase Storage CDN path — no token required for publicly readable files.
// firebasestorage.googleapis.com always includes CORS headers.
const fbUrl = (file) =>
  BUCKET
    ? `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/drum-samples%2F${file}?alt=media`
    : null;

const url = (file) => fbUrl(file) ?? `${CDN_BASE}/${file}`;

export const DRUM_URLS = {
  kick:  url('kick.mp3'),
  snare: url('snare.mp3'),
  hihat: url('hihat_close.mp3'),
};

/** 'firebase' | 'cdn' — which source the URLs point at */
export const drumSource = BUCKET ? 'firebase' : 'cdn';
