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