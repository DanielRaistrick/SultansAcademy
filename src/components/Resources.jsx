import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { sanitizeText, sanitizeUrl, extractYouTubeId } from '../utils/sanitize';
import './Resources.css';

const emptyForm = { url: '', title: '', description: '' };

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setResources(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'url') setUrlError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUrl = sanitizeUrl(form.url);
    if (!cleanUrl) {
      setUrlError('Please enter a valid https:// URL');
      return;
    }
    setSaving(true);
    const youtubeId = extractYouTubeId(cleanUrl);
    const data = {
      url: cleanUrl,
      title: sanitizeText(form.title, 200) || 'Untitled',
      description: sanitizeText(form.description, 500),
      youtubeId: youtubeId || null,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'resources'), data);
      setForm(emptyForm);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setShowForm(false);
    setUrlError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this resource?')) return;
    await deleteDoc(doc(db, 'resources', id));
  };

  return (
    <div className="resources">
      <div className="resources-header-row">
        <div className="resources-header">
          <h2>Learning Resources</h2>
          <p className="resources-subtitle">Video tutorials and links to help you learn guitar</p>
        </div>
        {!showForm && (
          <button className="btn-add-resource" onClick={() => setShowForm(true)}>
            <span>+</span> Add Resource
          </button>
        )}
      </div>

      {showForm && (
        <form className="resource-form" onSubmit={handleSubmit}>
          <h3 className="resource-form-title">Add New Resource</h3>

          <div className="resource-form-field">
            <label htmlFor="res-url">URL</label>
            <input
              id="res-url"
              name="url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.url}
              onChange={handleChange}
              required
            />
            {urlError && <p className="resource-form-error">{urlError}</p>}
          </div>

          <div className="resource-form-field">
            <label htmlFor="res-title">Title</label>
            <input
              id="res-title"
              name="title"
              type="text"
              placeholder="e.g. Fast Car – Full Tutorial"
              value={form.title}
              onChange={handleChange}
              maxLength={200}
              required
            />
          </div>

          <div className="resource-form-field">
            <label htmlFor="res-description">
              Description <span className="resource-form-hint">Optional</span>
            </label>
            <input
              id="res-description"
              name="description"
              type="text"
              placeholder="e.g. Covers the intro fingerpicking pattern"
              value={form.description}
              onChange={handleChange}
              maxLength={500}
            />
          </div>

          <div className="resource-form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save Resource'}
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="resources-empty">
          <span className="resources-empty-icon">⏳</span>
          <p>Loading resources…</p>
        </div>
      )}

      {!loading && resources.length === 0 && !showForm && (
        <div className="resources-empty">
          <span className="resources-empty-icon">🎬</span>
          <p>No resources yet. Add a YouTube link or any useful URL above!</p>
        </div>
      )}

      <div className="resources-grid">
        {resources.map((r) =>
          r.youtubeId ? (
            <div key={r.id} className="resource-card-wrapper">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="video-card"
              >
                <div className="video-thumbnail">
                  <img
                    src={`https://img.youtube.com/vi/${r.youtubeId}/mqdefault.jpg`}
                    alt={r.title}
                    loading="lazy"
                  />
                  <div className="play-overlay">
                    <div className="play-button">▶</div>
                  </div>
                </div>
                <div className="video-info">
                  <h3 className="video-title">{r.title}</h3>
                  {r.description && (
                    <p className="video-description">{r.description}</p>
                  )}
                  <div className="video-badge">
                    <span className="badge-icon">📺</span>
                    <span>YouTube</span>
                  </div>
                </div>
              </a>
              <button
                className="resource-delete-btn"
                onClick={() => handleDelete(r.id)}
                title="Remove resource"
                aria-label="Remove resource"
              >
                ✕
              </button>
            </div>
          ) : (
            <div key={r.id} className="resource-card-wrapper">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="video-card link-card"
              >
                <div className="link-icon-area">🔗</div>
                <div className="video-info">
                  <h3 className="video-title">{r.title}</h3>
                  {r.description && (
                    <p className="video-description">{r.description}</p>
                  )}
                  <div className="video-badge link-badge">
                    <span className="badge-icon">🌐</span>
                    <span>Link</span>
                  </div>
                </div>
              </a>
              <button
                className="resource-delete-btn"
                onClick={() => handleDelete(r.id)}
                title="Remove resource"
                aria-label="Remove resource"
              >
                ✕
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Resources;

