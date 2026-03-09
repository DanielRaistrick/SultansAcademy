import { useState } from 'react';
import { SCALE_TYPES, ROOT_NOTES, ROOT_DISPLAY, getScaleNoteNames } from '../utils/scaleDatabase';
import './ScalePicker.css';

const GROUPS = [...new Set(SCALE_TYPES.map((s) => s.group))];

const ScalePicker = ({ onScaleSelect }) => {
  const [root, setRoot] = useState('');
  const [scaleId, setScaleId] = useState('');

  const scaleType = SCALE_TYPES.find((s) => s.id === scaleId) ?? null;
  const noteNames = root && scaleType ? getScaleNoteNames(root, scaleType.intervals) : [];
  const isActive = root && scaleId;

  const notify = (newRoot, newId) => {
    const type = SCALE_TYPES.find((s) => s.id === newId) ?? null;
    if (newRoot && type) {
      onScaleSelect(newRoot, type);
    } else {
      onScaleSelect(null, null);
    }
  };

  const handleRootChange = (e) => {
    const val = e.target.value;
    setRoot(val);
    notify(val, scaleId);
  };

  const handleScaleChange = (e) => {
    const val = e.target.value;
    setScaleId(val);
    notify(root, val);
  };

  const handleClear = () => {
    setRoot('');
    setScaleId('');
    onScaleSelect(null, null);
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

      {isActive && noteNames.length > 0 && (
        <div className="scale-picker-info">
          <div className="scale-info-title">
            {root} {scaleType.name}
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
