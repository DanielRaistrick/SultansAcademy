import React from 'react';
import './Navigation.css';

const Navigation = ({ activePage, onPageChange }) => {
  return (
    <nav className="navigation">
      <button
        className={`nav-button ${activePage === 'fretboard' ? 'active' : ''}`}
        onClick={() => onPageChange('fretboard')}
      >
        <span className="nav-icon">🎸</span>
        <span className="nav-label">Fretboard</span>
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
    </nav>
  );
};

export default Navigation;
