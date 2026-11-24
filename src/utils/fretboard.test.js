import test from 'node:test';
import assert from 'node:assert/strict';
import { CHORD_DATABASE, detectChord, getNoteAtPosition } from './chordDetection.js';
import { FRET_COUNT } from './fretboardConfig.js';
import { INTERVAL_LABELS, getScaleNotesOnFretboard, getScalePositions } from './scaleDatabase.js';

test('scale notes and selectable patterns extend through the 22nd fret', () => {
  const intervals = [0, 2, 4, 5, 7, 9, 11];
  const notes = getScaleNotesOnFretboard('C', intervals);
  const positions = getScalePositions('C', { intervals });

  assert.equal(FRET_COUNT, 22);
  assert.ok(notes.some((note) => note.fret === FRET_COUNT));
  assert.ok(positions.some((position) => position.startFret === FRET_COUNT));
  assert.ok(positions.every((position) => position.notes.every((note) => note.fret <= FRET_COUNT)));
});

test('scale notes carry their interval from the root', () => {
  const notes = getScaleNotesOnFretboard('C', [0, 4, 7]);
  const byNote = Object.fromEntries(notes.map((n) => [n.note, n.interval]));

  assert.deepEqual(byNote, { C: 0, E: 4, G: 7 });
  assert.equal(INTERVAL_LABELS[4].name, 'Major 3rd');
  assert.equal(INTERVAL_LABELS[5].name, 'Perfect 4th');
});

test('movable barre chord positions are available above the original voicings', () => {
  const chord = CHORD_DATABASE.find((entry) => entry.name === 'F# Major (bar) (fret 14)');

  assert.ok(chord);
  assert.deepEqual(chord.frets, [14, 16, 16, 15, 14, 14]);
  assert.deepEqual(chord.notes, ['F#', 'A#', 'C#']);
  assert.ok(chord.frets.every((fret) => fret <= FRET_COUNT));
  assert.deepEqual(
    detectChord(chord.frets.map((fret, string) => ({
      string,
      fret,
      note: getNoteAtPosition(string, fret),
    }))),
    { name: chord.name, confidence: 'exact' },
  );
});

test('movable power chord positions extend through the 22nd fret', () => {
  const chord = CHORD_DATABASE.find((entry) => entry.name === 'F5 (fret 13)');

  assert.ok(chord);
  assert.deepEqual(chord.frets, [13, 15, 15, -1, -1, -1]);
  assert.ok(chord.frets.every((fret) => fret <= FRET_COUNT));
});
