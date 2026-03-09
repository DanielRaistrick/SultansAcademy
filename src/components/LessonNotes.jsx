import { useState, useEffect } from 'react';
import './LessonNotes.css';

const STORAGE_KEY = 'sultans_academy_lesson_notes';

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  toWorkOn: '',
  goalsRepertoire: '',
  goalsTechnique: '',
  goalsTheory: '',
};

const parseBullets = (text) =>
  text
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

const LessonNotes = () => {
  const [notes, setNotes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.date) return;

    const entry = {
      id: editingId ?? Date.now(),
      date: form.date,
      toWorkOn: parseBullets(form.toWorkOn),
      goals: {
        repertoire: parseBullets(form.goalsRepertoire),
        technique: parseBullets(form.goalsTechnique),
        theory: parseBullets(form.goalsTheory),
      },
    };

    setNotes((prev) => {
      if (editingId !== null) {
        return prev
          .map((n) => (n.id === editingId ? entry : n))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      return [entry, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setExpandedId(entry.id);
  };

  const handleEdit = (note) => {
    setForm({
      date: note.date,
      toWorkOn: note.toWorkOn.map((s) => `- ${s}`).join('\n'),
      goalsRepertoire: note.goals.repertoire.map((s) => `- ${s}`).join('\n'),
      goalsTechnique: note.goals.technique.map((s) => `- ${s}`).join('\n'),
      goalsTheory: note.goals.theory.map((s) => `- ${s}`).join('\n'),
    });
    setEditingId(note.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this lesson note?')) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="lesson-notes">
      <div className="lesson-notes-header">
        <div>
          <h2>Lesson Notes</h2>
          <p className="lesson-notes-subtitle">
            Keep track of everything your teacher assigns each week
          </p>
        </div>
        {!showForm && (
          <button className="btn-add-lesson" onClick={() => setShowForm(true)}>
            <span>+</span> Add Lesson
          </button>
        )}
      </div>

      {showForm && (
        <form className="lesson-form" onSubmit={handleSubmit}>
          <h3 className="form-title">
            {editingId !== null ? 'Edit Lesson Notes' : 'New Lesson Notes'}
          </h3>

          <div className="form-field">
            <label htmlFor="date">Lesson Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-section-label">To Work On This Week</div>

          <div className="form-field">
            <label htmlFor="toWorkOn">
              Items <span className="form-hint">One per line, hyphens optional</span>
            </label>
            <textarea
              id="toWorkOn"
              name="toWorkOn"
              rows={5}
              placeholder={
                '- Intervals in Natural & Harmonic Minor scale\n- Converting open chords to power chords\n- Open strings in non-movable chords'
              }
              value={form.toWorkOn}
              onChange={handleChange}
            />
          </div>

          <div className="form-section-label">Goals</div>

          <div className="form-field">
            <label htmlFor="goalsRepertoire">
              Repertoire <span className="form-hint">Full songs to learn</span>
            </label>
            <textarea
              id="goalsRepertoire"
              name="goalsRepertoire"
              rows={4}
              placeholder={'- KITN\n- Get Lucky\n- Wonderwall'}
              value={form.goalsRepertoire}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="goalsTechnique">
              Technique
            </label>
            <textarea
              id="goalsTechnique"
              name="goalsTechnique"
              rows={3}
              placeholder={'- Strummed single notes + muting'}
              value={form.goalsTechnique}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="goalsTheory">
              Theory
            </label>
            <textarea
              id="goalsTheory"
              name="goalsTheory"
              rows={3}
              placeholder={'- Notes on Neck\n- Sus/7th chord options\n- Intervals in chords'}
              value={form.goalsTheory}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {editingId !== null ? 'Save Changes' : 'Save Lesson'}
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 && !showForm && (
        <div className="notes-empty">
          <span className="notes-empty-icon">📋</span>
          <p>No lesson notes yet. Add your first lesson above!</p>
        </div>
      )}

      <div className="notes-list">
        {notes.map((note) => {
          const isOpen = expandedId === note.id;
          const hasAnyGoals =
            note.goals.repertoire.length > 0 ||
            note.goals.technique.length > 0 ||
            note.goals.theory.length > 0;

          return (
            <div key={note.id} className={`note-card ${isOpen ? 'note-card--open' : ''}`}>
              <button
                className="note-card-header"
                onClick={() => setExpandedId(isOpen ? null : note.id)}
                aria-expanded={isOpen}
              >
                <div className="note-card-header-left">
                  <span className="note-date-icon">📅</span>
                  <span className="note-date">{formatDate(note.date)}</span>
                </div>
                <div className="note-card-header-right">
                  <span className="note-count">
                    {note.toWorkOn.length} task{note.toWorkOn.length !== 1 ? 's' : ''}
                  </span>
                  <span className="note-chevron">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="note-card-body">
                  {note.toWorkOn.length > 0 && (
                    <div className="note-section">
                      <h4 className="note-section-title">
                        <span>🎯</span> To Work On This Week
                      </h4>
                      <ul className="note-list">
                        {note.toWorkOn.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hasAnyGoals && (
                    <div className="note-section">
                      <h4 className="note-section-title">
                        <span>🏆</span> Goals
                      </h4>

                      {note.goals.repertoire.length > 0 && (
                        <div className="note-sub-section">
                          <h5>Repertoire</h5>
                          <ul className="note-list">
                            {note.goals.repertoire.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {note.goals.technique.length > 0 && (
                        <div className="note-sub-section">
                          <h5>Technique</h5>
                          <ul className="note-list">
                            {note.goals.technique.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {note.goals.theory.length > 0 && (
                        <div className="note-sub-section">
                          <h5>Theory</h5>
                          <ul className="note-list">
                            {note.goals.theory.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="note-card-actions">
                    <button className="btn-edit" onClick={() => handleEdit(note)}>
                      ✏️ Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(note.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonNotes;
