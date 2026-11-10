import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { initializeApp, deleteApp } from 'firebase/app';
import { doc, getFirestore, writeBatch } from 'firebase/firestore';
import { createSongsheet, copySection, decodeSongsheet, encodeSongsheet, normalizeFret, updateBar } from './songsheet.js';

globalThis.crypto ||= webcrypto;

test('new sheets have independent six-string, sixteen-position bars', () => {
  const sheet = createSongsheet();
  const [first, second] = sheet.sections[0].bars;
  assert.equal(first.strings.length, 6);
  assert.equal(first.chords.length, 16);
  first.strings[0][0] = '12';
  assert.equal(first.strings[1][0], '');
  assert.equal(second.strings[0][0], '');
});

test('fret entry accepts open strings, multi-digit frets and muted notes', () => {
  for (const [input, expected] of [['0', '0'], ['12', '12'], ['36', '36'], ['X', 'x'], ['', ''], ['37', null], ['-1', null], ['2h4', null]]) {
    assert.equal(normalizeFret(input), expected);
  }
});

test('bar edits preserve chord position and leave the original unchanged', () => {
  const sheet = createSongsheet();
  const section = sheet.sections[0];
  const changed = updateBar(sheet, section.id, section.bars[0].id, (bar) => ({
    ...bar, chords: bar.chords.map((chord, position) => position === 8 ? 'Am7' : chord),
  }));
  assert.equal(changed.sections[0].bars[0].chords[8], 'Am7');
  assert.equal(section.bars[0].chords[8], '');
  assert.equal(changed.sections[0].bars[1], section.bars[1]);
});

test('section copies retain music with fresh IDs and independent note arrays', () => {
  const section = createSongsheet().sections[0];
  section.bars[0].strings[2][4] = '10';
  const copied = copySection(section);
  assert.notEqual(copied.id, section.id);
  assert.notEqual(copied.bars[0].id, section.bars[0].id);
  assert.equal(copied.bars[0].strings[2][4], '10');
  copied.bars[0].strings[2][4] = '7';
  assert.equal(section.bars[0].strings[2][4], '10');
});

test('online storage round-trips and passes the real Firestore write validator', async () => {
  const sheet = createSongsheet();
  sheet.sections[0].bars[0].strings[0][0] = '12';
  sheet.sections[0].bars[0].chords[0] = 'Am7';
  const encoded = encodeSongsheet(sheet);
  assert.deepEqual(decodeSongsheet(encoded), sheet);
  const app = initializeApp({ projectId: 'songsheet-model-test' }, 'songsheet-model-test');
  try {
    const db = getFirestore(app);
    assert.throws(() => writeBatch(db).set(doc(db, 'songsheets', 'invalid'), { sheet }), /nested arrays/i);
    assert.doesNotThrow(() => writeBatch(db).set(doc(db, 'songsheets', 'valid'), { sheet: encoded }));
  } finally { await deleteApp(app); }
});