# 🎸 Guitar Learning Studio

An interactive guitar fretboard explorer for personalized learning. Visualize notes, explore chord shapes, and understand the guitar neck.

## Features

- **Interactive Fretboard**: Click to select notes with beautiful color-coded visualization
- **Chord Detection**: Automatically identifies common chords as you select notes
- **Visual Learning**: Each note has a unique color to help memorize positions
- **Real-time Feedback**: See selected notes and detected chords instantly
- **Responsive Design**: Works on desktop and tablet devices

## Tech Stack

- **React 18** - Component-based UI
- **Vite** - Fast build tool and dev server
- **HTML Canvas** - High-performance fretboard rendering
- **Modern CSS** - Grid, Flexbox, and CSS Variables

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository (or navigate to the project folder)
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## How to Use

1. **Select Notes**: Click on any note on the fretboard to select it
2. **Build Chords**: Select multiple notes to form a chord
3. **View Results**: The detected chord name appears in the display panel
4. **Clear Selection**: Click the "Clear Selection" button to start over

## Deployment

### GitHub Pages

This project includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

1. Push your code to GitHub
2. Go to Settings > Pages
3. Set source to "GitHub Actions"
4. The workflow will automatically build and deploy on push to main

### Manual Deployment

You can deploy the `dist` folder to any static hosting service:
- Netlify
- Vercel
- Cloudflare Pages
- GitHub Pages
- Your own server

## Future Enhancements

- Scale visualization and practice modes
- Additional chord voicings and inversions
- Alternate tunings support
- Save favorite chord shapes
- Audio playback for selected notes
- Ear training exercises

## License

Personal use project - feel free to modify and adapt for your own learning!
