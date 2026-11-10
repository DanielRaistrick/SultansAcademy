import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { initializeApp, deleteApp } from 'firebase/app';
import { doc, getFirestore, writeBatch } from 'firebase/firestore';
import { createSongsheet, copySection, decodeSongsheet, encodeSongsheet, getBarLayout, getPrintFragments, insertBarPosition, normalizeFret, removeBarPosition, resizeBar, setBarFret, updateBar } from './songsheet.js';

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

test('expanding a bar preserves frets and chord positions and creates independent empty slots', () => {
  const bar = createSongsheet().sections[0].bars[0];
  bar.strings[0][15] = '12';
  bar.chords[15] = 'Am7';
  const expanded = resizeBar(bar, 32);
  assert.equal(expanded.chords.length, 32);
  assert.equal(expanded.strings[0][15], '12');
  assert.equal(expanded.chords[15], 'Am7');
  assert.equal(expanded.strings[0][31], '');
  assert.equal(bar.strings[0].length, 16);
  expanded.strings[0][31] = '7';
  assert.equal(expanded.strings[1][31], '');
});

test('shrinking a bar never discards notes or chord headings', () => {
  const bar = resizeBar(createSongsheet().sections[0].bars[0], 32);
  bar.strings[4][20] = '0';
  assert.equal(resizeBar(bar, 16), null);
  bar.strings[4][20] = '';
  bar.chords[31] = 'D';
  assert.equal(resizeBar(bar, 16), null);
  bar.chords[31] = '';
  assert.equal(resizeBar(bar, 16).strings[0].length, 16);
  assert.equal(resizeBar(bar, 4), null);
});

test('bar width grows automatically with positions and chord headings and supports manual spacing', () => {
  const bar = createSongsheet().sections[0].bars[0];
  const regular = getBarLayout(bar);
  const expanded = getBarLayout(resizeBar(bar, 32));
  assert.equal(regular.widths.length, 16);
  assert.ok(expanded.minimumWidth > regular.minimumWidth);
  bar.chords[3] = 'F#m7add11';
  assert.ok(getBarLayout(bar).widths[3] > regular.widths[3]);
  assert.equal(getBarLayout(bar).widths[4], regular.widths[4]);
  assert.ok(getBarLayout({ ...bar, spacing: 'wide' }).minimumWidth > getBarLayout(bar).minimumWidth);
});

test('expanded bars and manual spacing survive online storage encoding', () => {
  const sheet = createSongsheet();
  sheet.sections[0].bars[0] = { ...resizeBar(sheet.sections[0].bars[0], 32), spacing: 'wide' };
  sheet.sections[0].bars[0].strings[5][31] = '24';
  assert.deepEqual(decodeSongsheet(encodeSongsheet(sheet)), sheet);
});

test('compact columns only widen for double-digit frets and chord headings', () => {
  const bar = createSongsheet().sections[0].bars[0];
  bar.strings[0][0] = '1';
  bar.strings[1][1] = '12';
  const { widths, minimumWidth } = getBarLayout(bar);
  assert.equal(widths[0], 14);
  assert.equal(widths[1], 22);
  assert.equal(widths[2], 14);
  assert.ok(minimumWidth < 300);
});

test('typing at the end grows every string and leaves a new cursor column', () => {
  const bar = createSongsheet().sections[0].bars[0];
  const typed = setBarFret(bar, 0, 15, '7');
  assert.equal(typed.chords.length, 17);
  assert.equal(typed.strings[0][15], '7');
  assert.ok(typed.strings.every((row) => row.length === 17 && row[16] === ''));
  assert.equal(bar.strings[0][15], '');
  const more = setBarFret(typed, 0, 16, '12');
  assert.equal(more.chords.length, 18);
  assert.equal(more.strings[0][16], '12');
});

test('inserting and removing a space moves all notes and chord headings together', () => {
  const bar = createSongsheet().sections[0].bars[0];
  bar.chords[3] = 'Am';
  bar.strings[0][3] = '7';
  bar.strings[5][3] = '0';
  const inserted = insertBarPosition(bar, 3);
  assert.equal(inserted.chords[3], '');
  assert.equal(inserted.chords[4], 'Am');
  assert.equal(inserted.strings[0][4], '7');
  assert.equal(inserted.strings[5][4], '0');
  assert.deepEqual(removeBarPosition(inserted, 3), bar);
  assert.equal(bar.chords[3], 'Am');
});

test('print lines pack compact columns by actual width, without losing positions', () => {
  const bar = resizeBar(createSongsheet().sections[0].bars[0], 32);
  assert.equal(getPrintFragments(bar).length, 1);
  const long = { ...bar, spacing: 'wide' };
  const fragments = getPrintFragments(long);
  assert.ok(fragments.length > 1);
  assert.equal(fragments[0].start, 0);
  assert.equal(fragments.at(-1).end, 32);
  assert.deepEqual(fragments.flatMap((fragment) => fragment.widths), getBarLayout(long).widths);
  assert.ok(fragments.every((fragment) => fragment.widths.reduce((sum, width) => sum + width, 0) <= 600));
});