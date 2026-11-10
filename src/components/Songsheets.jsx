import { useEffect, useRef, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { ArrowDown, ArrowUp, Copy, FileMusic, Plus, Printer, Redo2, Save, Trash2, Undo2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { copyBar, copySection, createBar, createSection, createSongsheet, decodeSongsheet, encodeSongsheet, normalizeFret, TUNINGS, updateBar } from '../utils/songsheet';
import './Songsheets.css';

const IconButton = ({ label, children, ...props }) => (
  <button type="button" title={label} aria-label={label} {...props}>{children}</button>
);

function readDraft(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved?.sheet?.version === 1 && Array.isArray(saved.sheet.sections)) return saved;
  } catch {}
  return { sheet: createSongsheet(), id: null, dirty: true };
}

function PrintedBar({ bar, tuning, number }) {
  return (
    <svg className="songsheet-printed-bar" viewBox="0 0 640 108" role="img" aria-label={`Bar ${number}`}>
      <text x="5" y="10" fontSize="9" fill="#666">{number}</text>
      {bar.chords.map((chord, position) => chord && (
        <text key={position} x={42 + position * 36} y="22" fontSize={Math.min(12, 32 / Math.max(chord.length * 0.6, 1))} fontWeight="bold">{chord}</text>
      ))}
      {tuning.map((name, stringIndex) => (
        <g key={stringIndex}>
          <text x="8" y={38 + stringIndex * 12} fontSize="10">{name}</text>
          <line x1="32" y1={34 + stringIndex * 12} x2="628" y2={34 + stringIndex * 12} stroke="#555" strokeWidth="0.7" />
          {bar.strings[stringIndex].map((fret, position) => fret !== '' && (
            <g key={position}>
              <rect x={36 + position * 36} y={28 + stringIndex * 12} width="25" height="12" fill="white" />
              <text x={48 + position * 36} y={38 + stringIndex * 12} textAnchor="middle" fontSize="11" fontFamily="monospace">{fret}</text>
            </g>
          ))}
        </g>
      ))}
      <path d="M32 34V94 M628 34V94" stroke="black" fill="none" />
    </svg>
  );
}

export default function Songsheets() {
  const { user } = useAuth();
  const draftKey = `sultans_songsheet_${user.uid}`;
  const [editor, setEditor] = useState(() => readDraft(draftKey));
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draftError, setDraftError] = useState('');
  const [saving, setSaving] = useState(false);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const sheetRef = useRef(null);
  const { sheet, id, dirty } = editor;

  useEffect(() => {
    return onSnapshot(query(collection(db, 'songsheets'), where('userId', '==', user.uid)), (snapshot) => {
      setLibrary(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
        .sort((first, second) => (second.updatedAt?.seconds || 0) - (first.updatedAt?.seconds || 0)));
      setLoading(false);
      setError('');
    }, () => {
      setLoading(false);
      setError('Online songsheets could not be loaded. Check your connection and Firestore permissions. Your browser draft is still available.');
    });
  }, [user.uid]);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(editor));
      setDraftError('');
    } catch {
      setDraftError('Browser draft recovery is unavailable. Save online before leaving this page.');
    }
  }, [draftKey, editor]);

  useEffect(() => {
    const warn = (event) => {
      if (dirty) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const edit = (next) => {
    setPast((history) => [...history.slice(-79), sheet]);
    setFuture([]);
    setEditor((current) => ({ ...current, sheet: typeof next === 'function' ? next(current.sheet) : next, dirty: true }));
  };

  const undo = () => {
    if (!past.length) return;
    setFuture((history) => [...history, sheet]);
    setEditor((current) => ({ ...current, sheet: past.at(-1), dirty: true }));
    setPast((history) => history.slice(0, -1));
  };

  const redo = () => {
    if (!future.length) return;
    setPast((history) => [...history, sheet]);
    setEditor((current) => ({ ...current, sheet: future.at(-1), dirty: true }));
    setFuture((history) => history.slice(0, -1));
  };

  const replaceSheet = (next, nextId = null, nextDirty = true) => {
    if (saving || (dirty && !window.confirm('This sheet has changes not saved online. Replace the browser draft?'))) return;
    setEditor({ sheet: next, id: nextId, dirty: nextDirty });
    setPast([]);
    setFuture([]);
  };

  const save = async () => {
    if (saving) return;
    if (!sheet.title.trim()) { setError('Give your songsheet a title before saving.'); return; }
    const snapshot = sheet;
    const target = id ? doc(db, 'songsheets', id) : doc(collection(db, 'songsheets'));
    setSaving(true);
    setError('');
    try {
      await setDoc(target, { userId: user.uid, sheet: encodeSongsheet(snapshot), title: snapshot.title, updatedAt: serverTimestamp() });
      setEditor((current) => ({ ...current, id: target.id, dirty: current.sheet !== snapshot }));
    } catch {
      setError('Could not save online. Your edits are still here. Check your connection and Firestore permissions, then try again.');
    } finally { setSaving(false); }
  };

  const removeSaved = async (entry) => {
    if (!window.confirm(`Delete "${entry.title}" from your online library?`)) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'songsheets', entry.id));
      if (entry.id === id) setEditor((current) => ({ ...current, id: null, dirty: true }));
    } catch { setError('Could not delete the songsheet. Please try again.'); }
    finally { setSaving(false); }
  };

  const changeSection = (sectionId, transform) => edit((current) => ({
    ...current, sections: current.sections.map((section) => section.id === sectionId ? transform(section) : section),
  }));

  const moveSection = (index, direction) => {
    const sections = [...sheet.sections];
    [sections[index], sections[index + direction]] = [sections[index + direction], sections[index]];
    edit({ ...sheet, sections });
  };

  const moveCell = (event, barId, stringIndex, position) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    const bars = sheet.sections.flatMap((section) => section.bars);
    let barIndex = bars.findIndex((bar) => bar.id === barId);
    let nextPosition = position;
    let nextString = stringIndex;
    if (event.key === 'ArrowLeft') nextPosition--;
    if (event.key === 'ArrowRight' || event.key === 'Enter') nextPosition++;
    if (event.key === 'ArrowUp') nextString--;
    if (event.key === 'ArrowDown') nextString++;
    if (nextPosition < 0) { barIndex--; nextPosition = 15; }
    if (nextPosition > 15) { barIndex++; nextPosition = 0; }
    if (!bars[barIndex] || nextString < 0 || nextString > 5) return;
    const target = sheetRef.current?.querySelector(`[data-cell="${bars[barIndex].id}-${nextString}-${nextPosition}"]`);
    target?.focus();
    target?.select();
  };

  const tuning = TUNINGS[sheet.tuning] || TUNINGS.Standard;
  let barNumber = 0;
  let printedNumber = 0;

  return (
    <div className="songsheets">
      <div className="songsheet-heading songsheet-screen">
        <h2><FileMusic size={25} /> Songsheets</h2>
        <div className="songsheet-toolbar">
          <IconButton label="Undo" disabled={!past.length} onClick={undo}><Undo2 /></IconButton>
          <IconButton label="Redo" disabled={!future.length} onClick={redo}><Redo2 /></IconButton>
          <IconButton label="Duplicate songsheet" disabled={saving} onClick={() => replaceSheet({ ...structuredClone(sheet), title: `${sheet.title} (copy)`.slice(0, 120) })}><Copy /></IconButton>
          <button type="button" onClick={save} disabled={saving}><Save size={17} />{saving ? 'Saving...' : 'Save online'}</button>
          <button type="button" onClick={() => window.print()}><Printer size={17} />Print / PDF</button>
        </div>
      </div>
      <div className="songsheet-status songsheet-screen" role="status">{dirty ? 'Not saved online' : 'Saved online'}{!draftError && ' · Browser draft stored'}</div>
      {(error || draftError) && <div className="songsheet-error songsheet-screen" role="alert">{error}{error && draftError && ' '}{draftError}</div>}
      <div className="songsheet-layout songsheet-screen">
        <aside className="songsheet-library" aria-label="Songsheet library">
          <button type="button" disabled={saving} onClick={() => replaceSheet(createSongsheet())}><Plus size={17} />New songsheet</button>
          <h3>My Songsheets</h3>
          {loading && <p>Loading library...</p>}
          {!loading && !library.length && <p>No saved songsheets.</p>}
          {library.map((entry) => (
            <div className={`songsheet-library-entry ${entry.id === id ? 'selected' : ''}`} key={entry.id}>
              <button type="button" disabled={saving} onClick={() => replaceSheet(decodeSongsheet(structuredClone(entry.sheet)), entry.id, false)}>{entry.title}</button>
              <IconButton label={`Delete ${entry.title}`} disabled={saving} onClick={() => removeSaved(entry)}><Trash2 size={16} /></IconButton>
            </div>
          ))}
        </aside>
        <div className="songsheet-editor" ref={sheetRef}>
          <div className="songsheet-metadata">
            <label className="songsheet-title-field">Title<input maxLength={120} value={sheet.title} onChange={(event) => edit({ ...sheet, title: event.target.value })} /></label>
            <label>Artist<input maxLength={120} value={sheet.artist} onChange={(event) => edit({ ...sheet, artist: event.target.value })} /></label>
            <label>Tuning<select value={sheet.tuning} onChange={(event) => edit({ ...sheet, tuning: event.target.value })}>{Object.keys(TUNINGS).map((name) => <option key={name}>{name}</option>)}</select></label>
            <label>Capo<input type="number" min="0" max="12" value={sheet.capo} onChange={(event) => edit({ ...sheet, capo: Math.max(0, Math.min(12, Number(event.target.value) || 0)) })} /></label>
          </div>
          <div className="songsheet-meter">4/4 <span>16 positions per bar</span></div>
          {sheet.sections.map((section, sectionIndex) => (
            <section className="songsheet-section" key={section.id}>
              <div className="songsheet-section-heading">
                <input aria-label={`Section ${sectionIndex + 1} name`} maxLength={80} value={section.name} onChange={(event) => changeSection(section.id, (current) => ({ ...current, name: event.target.value }))} />
                <div className="songsheet-toolbar">
                  <IconButton label="Move section up" disabled={sectionIndex === 0} onClick={() => moveSection(sectionIndex, -1)}><ArrowUp size={16} /></IconButton>
                  <IconButton label="Move section down" disabled={sectionIndex === sheet.sections.length - 1} onClick={() => moveSection(sectionIndex, 1)}><ArrowDown size={16} /></IconButton>
                  <IconButton label="Copy section" onClick={() => edit({ ...sheet, sections: [...sheet.sections.slice(0, sectionIndex + 1), copySection(section), ...sheet.sections.slice(sectionIndex + 1)] })}><Copy size={16} /></IconButton>
                  <IconButton label="Delete section" disabled={sheet.sections.length === 1} onClick={() => { if (window.confirm(`Delete section "${section.name}"?`)) edit({ ...sheet, sections: sheet.sections.filter((item) => item.id !== section.id) }); }}><Trash2 size={16} /></IconButton>
                </div>
              </div>
              {section.bars.map((bar, barIndex) => {
                const number = ++barNumber;
                return (
                  <div className="songsheet-bar" key={bar.id}>
                    <div className="songsheet-bar-heading"><span>Bar {number}</span><div className="songsheet-toolbar">
                      <IconButton label={`Move bar ${number} up`} disabled={barIndex === 0} onClick={() => changeSection(section.id, (current) => { const bars = [...current.bars]; [bars[barIndex - 1], bars[barIndex]] = [bars[barIndex], bars[barIndex - 1]]; return { ...current, bars }; })}><ArrowUp size={14} /></IconButton>
                      <IconButton label={`Move bar ${number} down`} disabled={barIndex === section.bars.length - 1} onClick={() => changeSection(section.id, (current) => { const bars = [...current.bars]; [bars[barIndex], bars[barIndex + 1]] = [bars[barIndex + 1], bars[barIndex]]; return { ...current, bars }; })}><ArrowDown size={14} /></IconButton>
                      <IconButton label={`Copy bar ${number}`} onClick={() => changeSection(section.id, (current) => ({ ...current, bars: [...current.bars.slice(0, barIndex + 1), copyBar(bar), ...current.bars.slice(barIndex + 1)] }))}><Copy size={14} /></IconButton>
                      <IconButton label={`Delete bar ${number}`} disabled={section.bars.length === 1} onClick={() => { if (window.confirm(`Delete bar ${number}?`)) changeSection(section.id, (current) => ({ ...current, bars: current.bars.filter((item) => item.id !== bar.id) })); }}><Trash2 size={14} /></IconButton>
                    </div></div>
                    <div className="songsheet-tab-scroll">
                      <div className="songsheet-tab-grid">
                        <div className="songsheet-grid-row songsheet-beats"><span />{bar.chords.map((_, position) => <span key={position}>{position % 4 === 0 ? position / 4 + 1 : '·'}</span>)}</div>
                        <div className="songsheet-grid-row songsheet-chords"><span /><div className="songsheet-chord-cells">{bar.chords.map((chord, position) => <input key={position} aria-label={`Bar ${number} chord position ${position + 1}`} title={chord || `Chord at position ${position + 1}`} maxLength={12} value={chord} onChange={(event) => edit(updateBar(sheet, section.id, bar.id, (current) => ({ ...current, chords: current.chords.map((value, index) => index === position ? event.target.value : value) })))} />)}</div></div>
                        {bar.strings.map((string, stringIndex) => <div className="songsheet-grid-row songsheet-string" key={stringIndex}>
                          <span>{tuning[stringIndex]}</span>{string.map((fret, position) => <input key={position} data-cell={`${bar.id}-${stringIndex}-${position}`} aria-label={`Bar ${number} string ${stringIndex + 1} position ${position + 1}`} autoComplete="off" spellCheck={false} inputMode="text" maxLength={2} value={fret} onFocus={(event) => event.target.select()} onKeyDown={(event) => moveCell(event, bar.id, stringIndex, position)} onChange={(event) => { const next = normalizeFret(event.target.value); if (next !== null) edit(updateBar(sheet, section.id, bar.id, (current) => ({ ...current, strings: current.strings.map((row, rowIndex) => rowIndex !== stringIndex ? row : row.map((value, index) => index === position ? next : value)) }))); }} />)}
                        </div>)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <button type="button" className="songsheet-add" onClick={() => changeSection(section.id, (current) => ({ ...current, bars: [...current.bars, createBar()] }))}><Plus size={16} />Add bar</button>
            </section>
          ))}
          <button type="button" className="songsheet-add" onClick={() => edit({ ...sheet, sections: [...sheet.sections, createSection('Verse')] })}><Plus size={17} />Add section</button>
          <label className="songsheet-notes">Notes<textarea rows={3} maxLength={5000} value={sheet.notes} onChange={(event) => edit({ ...sheet, notes: event.target.value })} /></label>
        </div>
      </div>
      <article className="songsheet-print">
        <header><h1>{sheet.title}</h1>{sheet.artist && <p>{sheet.artist}</p>}<p>{sheet.tuning} ({[...tuning].reverse().join(' ')}) · Capo {sheet.capo} · 4/4</p></header>
        {sheet.sections.map((section) => <section key={section.id}><h2>{section.name}</h2><div className="songsheet-print-bars">{section.bars.map((bar) => <PrintedBar key={bar.id} bar={bar} tuning={tuning} number={++printedNumber} />)}</div></section>)}
        {sheet.notes && <p className="songsheet-print-notes">{sheet.notes}</p>}
      </article>
    </div>
  );
}