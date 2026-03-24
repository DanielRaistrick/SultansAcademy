#!/usr/bin/env node
/**
 * Upload drum samples to Firebase Storage.
 *
 * This is a ONE-TIME setup script. After running it, the app automatically uses
 * your Firebase Storage samples whenever VITE_FIREBASE_STORAGE_BUCKET is set.
 *
 * ── Setup ──────────────────────────────────────────────────────────────────────
 *
 * 1. Install script dependencies (if not already present):
 *      npm install --save-dev firebase-admin dotenv
 *
 * 2. Download a service account key:
 *      Firebase Console → Project Settings → Service Accounts
 *      → "Generate new private key" → save as  serviceAccountKey.json  in the
 *      project root (it is already in .gitignore so it won't be committed).
 *
 * 3. Run:
 *      node scripts/uploadDrumSamples.js
 *
 * ── What it does ───────────────────────────────────────────────────────────────
 *  • Downloads CC-licensed drum one-shots from the Tone.js public CDN.
 *  • Uploads them to  gs://{your-bucket}/drum-samples/
 *  • Makes each file publicly readable so the browser can fetch them.
 *  • The app resolves the URLs automatically from VITE_FIREBASE_STORAGE_BUCKET.
 *  • No code changes needed after uploading.
 *
 * ── Storage rules ──────────────────────────────────────────────────────────────
 *  If your Firebase Storage rules deny public reads, add this to storage.rules:
 *
 *    match /drum-samples/{file} {
 *      allow read: if true;
 *    }
 *
 * ───────────────────────────────────────────────────────────────────────────────
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env and .env.local so VITE_FIREBASE_STORAGE_BUCKET is available
// (Vite projects store secrets in .env.local, so load both)
for (const f of ['.env', '.env.local']) {
  const abs = join(__dirname, '..', f);
  if (existsSync(abs)) dotenv.config({ path: abs });
}

// ── Load service account ──────────────────────────────────────────────────────
const keyPath = join(__dirname, '../serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
} catch {
  console.error('\n❌  serviceAccountKey.json not found.');
  console.error('    Download it from:');
  console.error('    Firebase Console → Project Settings → Service Accounts → Generate new private key\n');
  process.exit(1);
}

const storageBucket =
  process.env.VITE_FIREBASE_STORAGE_BUCKET ||
  // Newer Firebase projects use .firebasestorage.app; legacy projects use .appspot.com
  `${serviceAccount.project_id}.firebasestorage.app`;

console.log(`\n   Resolved bucket: ${storageBucket}`);
console.log('   (If this is wrong, set VITE_FIREBASE_STORAGE_BUCKET in .env.local)');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket,
});

const bucket = admin.storage().bucket();

// ── Ensure bucket exists ───────────────────────────────────────────────────────
const [bucketExists] = await bucket.exists();
if (!bucketExists) {
  console.log(`\n   Bucket not found — creating gs://${storageBucket} ...`);
  try {
    await bucket.create({ location: 'US' });
    console.log('   ✓  Bucket created.\n');
  } catch (err) {
    console.error(`\n❌  Could not create bucket: ${err.message}`);
    console.error('\n   → Go to Firebase Console → Build → Storage → Get Started');
    console.error('     This initialises your Storage bucket. Then re-run this script.\n');
    await admin.app().delete();
    process.exit(1);
  }
}

// ── Sample sources ────────────────────────────────────────────────────────────
// Tone.js hosts these as part of their open-source audio examples (CC licence).
const CDN = 'https://tonejs.github.io/audio/drum-samples/CR78';

const SAMPLES = {
  'kick.mp3':  `${CDN}/kick.mp3`,
  'snare.mp3': `${CDN}/snare.mp3`,
  'hihat.mp3': `${CDN}/hihat.mp3`,
};

// ── Upload ────────────────────────────────────────────────────────────────────
const upload = async (filename, sourceUrl) => {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${sourceUrl}`);

  const data = Buffer.from(await res.arrayBuffer());
  const file = bucket.file(`drum-samples/${filename}`);

  await file.save(data, {
    metadata: { contentType: 'audio/mpeg' },
    public: true,      // Makes the file readable without a token
    resumable: false,
  });

  // Stable public URL served by Google Cloud Storage CDN (includes CORS headers)
  return `https://storage.googleapis.com/${storageBucket}/drum-samples/${filename}`;
};

// ── Main ──────────────────────────────────────────────────────────────────────
console.log(`\n🥁  Uploading drum samples to  gs://${storageBucket}/drum-samples/\n`);

let ok = 0;
let fail = 0;

for (const [filename, sourceUrl] of Object.entries(SAMPLES)) {
  try {
    const url = await upload(filename, sourceUrl);
    console.log(`  ✓  ${filename}`);
    console.log(`     ${url}`);
    ok++;
  } catch (err) {
    console.error(`  ✗  ${filename}: ${err.message}`);
    fail++;
  }
}

console.log(`\n${ok} uploaded, ${fail} failed.`);

if (ok > 0) {
  console.log('\n✅  Done!');
  console.log(`   VITE_FIREBASE_STORAGE_BUCKET is "${storageBucket}" — the app`);
  console.log('   will automatically use these samples on the next build/deploy.\n');
} else {
  console.log('\n⚠️   No samples were uploaded. The app will fall back to synthesis.\n');
}

await admin.app().delete();
