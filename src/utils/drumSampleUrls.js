// ── Drum sample URL configuration ────────────────────────────────────────────
//
// Samples live in /public/drums/ and are served as static assets alongside the
// app — no Firebase Storage, no external CDN, no cost.
//
// Firebase Storage is still supported as an override: if VITE_FIREBASE_STORAGE_BUCKET
// is set AND samples have been uploaded, the app will prefer Firebase URLs instead.
// Run  node scripts/uploadDrumSamples.js  to upload (requires Firebase Blaze plan).
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;

const fbUrl = (file) =>
  BUCKET
    ? `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/drum-samples%2F${file}?alt=media`
    : null;

// Default: local static assets in /public/drums/ (served with the app, always available)
const url = (file) => fbUrl(file) ?? `/drums/${file}`;

export const DRUM_URLS = {
  kick:  url('kick.mp3'),
  snare: url('snare.mp3'),
  hihat: url('hihat.mp3'),
};

/** 'firebase' | 'local' — which source the URLs point at */
export const drumSource = BUCKET ? 'firebase' : 'local';
