export const TUNINGS = {
  Standard: ['e', 'B', 'G', 'D', 'A', 'E'],
  'Drop D': ['e', 'B', 'G', 'D', 'A', 'D'],
  DADGAD: ['D', 'A', 'G', 'D', 'A', 'D'],
};

export const createBar = () => ({
  id: crypto.randomUUID(),
  chords: Array(16).fill(''),
  strings: Array.from({ length: 6 }, () => Array(16).fill('')),
});

export const resizeBar = (bar, positions) => {
  if (![16, 32].includes(positions)) return null;
  if ([bar.chords, ...bar.strings].some((row) => row.slice(positions).some((value) => value !== ''))) return null;
  const resizeRow = (row) => Array.from({ length: positions }, (_, index) => row[index] ?? '');
  return { ...bar, chords: resizeRow(bar.chords), strings: bar.strings.map(resizeRow) };
};

export const getBarLayout = (bar) => {
  const minimum = bar.spacing === 'wide' ? 28 : bar.spacing === 'roomy' ? 22 : 14;
  const widths = bar.chords.map((chord, position) => Math.max(
    minimum,
    ...bar.strings.map((row) => row[position].length * 9 + 4),
    chord.length ? chord.length * 7 + 8 : 0,
  ));
  return { widths, minimumWidth: 28 + widths.reduce((total, width) => total + width, 0) };
};

export const insertBarPosition = (bar, position) => {
  const insert = (row) => [...row.slice(0, position), '', ...row.slice(position)];
  return { ...bar, chords: insert(bar.chords), strings: bar.strings.map(insert) };
};

export const removeBarPosition = (bar, position) => {
  if (bar.chords.length <= 1) return bar;
  const remove = (row) => row.filter((_, index) => index !== position);
  return { ...bar, chords: remove(bar.chords), strings: bar.strings.map(remove) };
};

export const setBarFret = (bar, stringIndex, position, fret) => {
  const expanded = position >= bar.chords.length ? insertBarPosition(bar, bar.chords.length) : bar;
  const changed = {
    ...expanded,
    strings: expanded.strings.map((row, rowIndex) => rowIndex !== stringIndex ? row : row.map((value, index) => index === position ? fret : value)),
  };
  return fret !== '' && position === changed.chords.length - 1 ? insertBarPosition(changed, changed.chords.length) : changed;
};

export const getPrintFragments = (bar, maximumWidth = 600) => {
  const { widths } = getBarLayout(bar);
  const fragments = [];
  let start = 0;
  let used = 0;
  widths.forEach((width, position) => {
    if (used > 0 && used + width > maximumWidth) {
      fragments.push({ start, end: position, widths: widths.slice(start, position) });
      start = position;
      used = 0;
    }
    used += width;
  });
  fragments.push({ start, end: widths.length, widths: widths.slice(start) });
  return fragments;
};

export const createSection = (name = 'Intro') => ({
  id: crypto.randomUUID(), name, bars: [createBar(), createBar()],
});

export const createSongsheet = () => ({
  version: 1,
  title: 'Untitled songsheet',
  artist: '',
  tuning: 'Standard',
  capo: 0,
  notes: '',
  sections: [createSection()],
});

export const copyBar = (bar) => ({ ...structuredClone(bar), id: crypto.randomUUID() });

export const copySection = (section) => ({
  ...section, id: crypto.randomUUID(), bars: section.bars.map(copyBar),
});

export const encodeSongsheet = (sheet) => ({
  ...sheet,
  sections: sheet.sections.map((section) => ({
    ...section,
    bars: section.bars.map((bar) => ({ ...bar, strings: bar.strings.map((frets) => ({ frets })) })),
  })),
});

export const decodeSongsheet = (sheet) => ({
  ...sheet,
  sections: sheet.sections.map((section) => ({
    ...section,
    bars: section.bars.map((bar) => ({ ...bar, strings: bar.strings.map((row) => row.frets) })),
  })),
});

export const normalizeFret = (value) => {
  const text = value.trim().toLowerCase();
  if (text === '' || text === 'x') return text;
  return /^\d{1,2}$/.test(text) && Number(text) <= 36 ? String(Number(text)) : null;
};

export const updateBar = (sheet, sectionId, barId, update) => ({
  ...sheet,
  sections: sheet.sections.map((section) => section.id !== sectionId ? section : {
    ...section,
    bars: section.bars.map((bar) => bar.id === barId ? update(bar) : bar),
  }),
});