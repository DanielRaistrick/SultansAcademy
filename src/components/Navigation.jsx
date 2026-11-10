import React from 'react';
import { FileMusic } from 'lucide-react';
import './Navigation.css';

const Navigation = ({ activePage, onPageChange }) => {
  return (
    <nav className="navigation">
      <button
        className={`nav-button ${activePage === 'songsheets' ? 'active' : ''}`}
        onClick={() => onPageChange('songsheets')}
      >
        <FileMusic size={24} />
        <span className="nav-label">Songsheets</span>
      </button>
      <button
        className={`nav-button ${activePage === 'fretboard' ? 'active' : ''}`}
        onClick={() => onPageChange('fretboard')}
      >
        <span className="nav-icon">🎸</span>
        <span className="nav-label">Fretboard</span>
      </button>
      <button
        className={`nav-button ${activePage === 'progressions' ? 'active' : ''}`}
        onClick={() => onPageChange('progressions')}
      >
        <span className="nav-icon">🎶</span>
        <span className="nav-label">Progressions</span>
      </button>
      <button
        className={`nav-button ${activePage === 'resources' ? 'active' : ''}`}
        onClick={() => onPageChange('resources')}
      >
        <span className="nav-icon">📚</span>
        <span className="nav-label">Learning Resources</span>
      </button>
      <button
        className={`nav-button ${activePage === 'lessons' ? 'active' : ''}`}
        onClick={() => onPageChange('lessons')}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-label">Lesson Notes</span>
      </button>
      <button
        className={`nav-button ${activePage === 'recorder' ? 'active' : ''}`}
        onClick={() => onPageChange('recorder')}
      >
        <span className="nav-icon">🎙️</span>
        <span className="nav-label">Recorder</span>
      </button>
      <button
        className={`nav-button ${activePage === 'backing' ? 'active' : ''}`}
        onClick={() => onPageChange('backing')}
      >
        <span className="nav-icon">🥁</span>
        <span className="nav-label">Backing Track</span>
      </button>
    </nav>
  );
};

export default Navigation;
