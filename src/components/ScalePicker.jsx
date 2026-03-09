import { useMemo, useState } from 'react';
import {
  SCALE_TYPES,
  ROOT_NOTES,
  ROOT_DISPLAY,
  getScaleNoteNames,
  getScaleNotesOnFretboard,
  getScalePositions,
} from '../utils/scaleDatabase';
import './ScalePicker.css';

const GROUPS = [...new Set(SCALE_TYPES.map((s) => s.group))];

const ScalePicker = ({ onScaleSelect }) => {
  const [root, setRoot] = useState('');
  const [scaleId, setScaleId] = useState('');
  const [positionId, setPositionId] = useState('all');

  const scaleType = useMemo(() => SCALE_TYPES.find((s) => s.id === scaleId) ?? null, [scaleId]);
  const noteNames = useMemo(
    () => (root && scaleType ? getScaleNoteNames(root, scaleType.intervals) : []),
    [root, scaleType],
  );
  const positions = useMemo(
    () => (root && scaleType ? getScalePositions(root, scaleType) : []),
    [root, scaleType],
  );

  const isActive = !!(root && scaleId);

  // Emit the correct notes array upward.
  const emitNotes = (r, type, posId, poss) => {
    if (!r || !type) { onScaleSelect([]); return; }
    if (posId === 'all') {
      onScaleSelect(getScaleNotesOnFretboard(r, type.intervals));
    } else {
      const pos = poss.find((p) => p.id === posId);
      onScaleSelect(pos ? pos.notes : getScaleNotesOnFretboard(r, type.intervals));
    }
  };

  const handleRootChange = (e) => {
    const val = e.target.value;
    setRoot(val);
    setPositionId('all');
    const type = SCALE_TYPES.find((s) => s.id === scaleId) ?? null;
    emitNotes(val, type, 'all', []);
  };

  const handleScaleChange = (e) => {
    const val = e.target.value;
    setScaleId(val);
    setPositionId('all');
    const type = SCALE_TYPES.find((s) => s.id === val) ?? null;
    emitNotes(root, type, 'all', []);
  };

  const handlePositionChange = (e) => {
    const val = e.target.value;
    setPositionId(val);
    emitNotes(root, scaleType, val, positions);
  };

  const handleClear = () => {
    setRoot('');
    setScaleId('');
    setPositionId('all');
    onScaleSelect([]);
  };

  return (
    <div className={`scale-picker${isActive ? ' scale-picker--active' : ''}`}>
      <div className="scale-picker-header">
        <span className="scale-picker-label">🎼 Choose a Scale</span>
        {isActive && (
          <button className="scale-picker-clear" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      {/* Row 1 – root note + scale type */}
      <div className="scale-picker-dropdowns">
        <select
          className="scale-picker-select scale-picker-root"
          value={root}
          onChange={handleRootChange}
        >
          <option value="">Root note…</option>
          {ROOT_NOTES.map((n) => (
            <option key={n} value={n}>
              {ROOT_DISPLAY[n]}
            </option>
          ))}
        </select>

        <select
          className="scale-picker-select scale-picker-type"
          value={scaleId}
          onChange={handleScaleChange}
        >
          <option value="">Scale type…</option>
          {GROUPS.map((group) => (
            <optgroup key={group} label={group}>
              {SCALE_TYPES.filter((s) => s.group === group).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Row 2 – position / pattern picker (visible once root + scale chosen) */}
      {isActive && positions.length > 0 && (
        <div className="scale-picker-position-row">
          <select
            className="scale-picker-select scale-picker-position"
            value={positionId}
            onChange={handlePositionChange}
          >
            <option value="all">All patterns (full neck)</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {isActive && noteNames.length > 0 && (
        <div className="scale-picker-info">
          <div className="scale-info-title">
            {root} {scaleType.name}
            {positionId !== 'all' && (
              <span className="scale-info-pattern-tag">
                &nbsp;·&nbsp;{positions.find((p) => p.id === positionId)?.label}
              </span>
            )}
          </div>
          <div className="scale-info-notes">
            {noteNames.map((n, i) => (
              <span
                key={i}
                className={`scale-note-pill${i === 0 ? ' scale-note-pill--root' : ''}`}
              >
                {n}
              </span>
            ))}
          </div>
          <div className="scale-legend">
            <span className="legend-item legend-root">● Root</span>
            <span className="legend-item legend-scale">● Scale note</span>
            <span className="legend-item legend-chord">⊙ Chord selection</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScalePicker;
