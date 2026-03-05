import React, { useRef, useEffect, useState } from 'react';
import { getNoteAtPosition, NOTE_COLORS } from '../utils/chordDetection';

const FRET_COUNT = 12;
const STRING_COUNT = 6;

const Fretboard = ({ selectedNotes, onNoteSelect }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 350 });
  const [hoveredNote, setHoveredNote] = useState(null);

  // Resize canvas based on window size, with minimum width for mobile
  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      const minWidth = isMobile ? 900 : 800; // Keep it usable on mobile
      const maxWidth = Math.min(1200, window.innerWidth - 40);
      const width = Math.max(minWidth, maxWidth);
      const aspectRatio = 350 / 1200;
      const newHeight = width * aspectRatio;
      setDimensions({ width, height: newHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Canvas drawing parameters
  const padding = { left: 80, right: 40, top: 40, bottom: 40 };
  const fretWidth = (dimensions.width - padding.left - padding.right) / FRET_COUNT;
  const stringSpacing = (dimensions.height - padding.top - padding.bottom) / (STRING_COUNT - 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size for retina displays
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);

    drawFretboard(ctx);
  }, [dimensions, selectedNotes, hoveredNote]);

  const drawFretboard = (ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw fretboard background with premium wood finish
    const gradient = ctx.createLinearGradient(padding.left, 0, dimensions.width - padding.right, 0);
    gradient.addColorStop(0, '#5c3a21');
    gradient.addColorStop(0.3, '#7d4f2e');
    gradient.addColorStop(0.5, '#8b5a3c');
    gradient.addColorStop(0.7, '#7d4f2e');
    gradient.addColorStop(1, '#5c3a21');
    ctx.fillStyle = gradient;
    ctx.fillRect(padding.left, padding.top, dimensions.width - padding.left - padding.right, dimensions.height - padding.top - padding.bottom);

    // Draw frets with premium look
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const x = padding.left + fret * fretWidth;
      ctx.strokeStyle = fret === 0 ? '#e8d7b0' : '#c9b037';
      ctx.lineWidth = fret === 0 ? 7 : 2.5;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, dimensions.height - padding.bottom);
      ctx.stroke();
      
      // Add subtle shadow for depth
      if (fret > 0) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 1, padding.top);
        ctx.lineTo(x + 1, dimensions.height - padding.bottom);
        ctx.stroke();
      }
    }

    // Draw fret markers with premium inlay style
    const markerFrets = [3, 5, 7, 9, 12];
    const doubleFrets = [12];
    markerFrets.forEach(fret => {
      const x = padding.left + (fret - 0.5) * fretWidth;
      const centerY = padding.top + (dimensions.height - padding.top - padding.bottom) / 2;
      
      // Premium pearloid-style inlays
      ctx.fillStyle = 'rgba(240, 240, 255, 0.4)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      
      if (doubleFrets.includes(fret)) {
        // Draw two diamond-shaped markers for 12th fret
        [centerY - 35, centerY + 35].forEach(y => {
          ctx.beginPath();
          ctx.moveTo(x, y - 10);
          ctx.lineTo(x + 8, y);
          ctx.lineTo(x, y + 10);
          ctx.lineTo(x - 8, y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      } else {
        // Single dot markers for other frets
        ctx.beginPath();
        ctx.arc(x, centerY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });

    // Draw strings (reversed so high E is at top)
    for (let string = 0; string < STRING_COUNT; string++) {
      const y = padding.top + string * stringSpacing;
      // Reverse thickness so high E (visual top) is thinnest
      const thickness = 1 + string * 0.5;
      
      ctx.strokeStyle = '#c0c0c0';
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(dimensions.width - padding.right, y);
      ctx.stroke();
    }

    // Draw fret numbers
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    for (let fret = 1; fret <= FRET_COUNT; fret++) {
      const x = padding.left + (fret - 0.5) * fretWidth;
      ctx.fillText(fret.toString(), x, dimensions.height - 15);
    }

    // Draw string names (tuning) - reversed so high E is at top
    ctx.textAlign = 'right';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    const tuning = ['E', 'B', 'G', 'D', 'A', 'E']; // High E to Low E
    for (let string = 0; string < STRING_COUNT; string++) {
      const y = padding.top + string * stringSpacing;
      ctx.fillStyle = '#fff';
      ctx.fillText(tuning[string], padding.left - 20, y + 6);
    }

    // Draw notes on fretboard
    for (let visualString = 0; visualString < STRING_COUNT; visualString++) {
      // Convert visual string position to actual string index (reverse)
      const string = STRING_COUNT - 1 - visualString;
      for (let fret = 1; fret <= FRET_COUNT; fret++) { // Start from fret 1, skip open strings
        const note = getNoteAtPosition(string, fret);
        const x = padding.left + (fret - 0.5) * fretWidth;
        const y = padding.top + visualString * stringSpacing;

        // Check if this note is selected
        const isSelected = selectedNotes.some(
          selected => selected.string === string && selected.fret === fret
        );

        // Check if this note is hovered
        const isHovered = hoveredNote && 
          hoveredNote.string === string && 
          hoveredNote.fret === fret;

        // Draw note circle
        const radius = isSelected ? 20 : (isHovered ? 17 : 13);
        const alpha = isSelected ? 1 : (isHovered ? 0.85 : 0.7);
        
        ctx.fillStyle = NOTE_COLORS[note];
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw border for selected notes
        if (isSelected) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Draw note name
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000';
        ctx.font = isSelected ? 'bold 13px "Segoe UI"' : '11px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(note, x, y + 4);
      }
    }

    ctx.globalAlpha = 1;
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find which note was clicked
    for (let visualString = 0; visualString < STRING_COUNT; visualString++) {
      const string = STRING_COUNT - 1 - visualString; // Convert to actual string index
      for (let fret = 1; fret <= FRET_COUNT; fret++) { // Start from fret 1
        const noteX = padding.left + (fret - 0.5) * fretWidth;
        const noteY = padding.top + visualString * stringSpacing;

        const distance = Math.sqrt(Math.pow(x - noteX, 2) + Math.pow(y - noteY, 2));
        
        if (distance < 20) {
          const note = getNoteAtPosition(string, fret);
          onNoteSelect({ string, fret, note });
          return;
        }
      }
    }
  };

  const handleCanvasMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find which note is being hovered
    let found = false;
    for (let visualString = 0; visualString < STRING_COUNT; visualString++) {
      const string = STRING_COUNT - 1 - visualString; // Convert to actual string index
      for (let fret = 1; fret <= FRET_COUNT; fret++) { // Start from fret 1
        const noteX = padding.left + (fret - 0.5) * fretWidth;
        const noteY = padding.top + visualString * stringSpacing;

        const distance = Math.sqrt(Math.pow(x - noteX, 2) + Math.pow(y - noteY, 2));
        
        if (distance < 20) {
          setHoveredNote({ string, fret });
          found = true;
          return;
        }
      }
    }

    if (!found) {
      setHoveredNote(null);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '20px',
      cursor: 'pointer'
    }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onMouseLeave={() => setHoveredNote(null)}
        style={{ 
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}
      />
    </div>
  );
};

export default Fretboard;
