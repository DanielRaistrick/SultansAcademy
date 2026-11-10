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

## Songsheets

The Songsheets page supports one six-string guitar part in 4/4, with 16 fixed
positions per bar. Enter frets 0-36 or `x` for a muted note; chord names sit above
the corresponding position. Arrow keys move between strings and positions, and
Enter moves to the next position. Frets are relative to the selected capo.

Sheets include title, artist, tuning, capo, sections, and notes. Bars and sections
can be copied, reordered, and deleted. Undo/redo applies to edits. Browser drafts
are stored per signed-in user on the current browser; **Save online** saves the
editable sheet to Firestore for use on other devices. Browser drafts are not an
online backup. Opening or creating another sheet replaces the current draft
after confirmation if it has unsaved changes.

**Print / PDF** uses an A4 layout with chord headings and string labels. Select
Save as PDF in the browser print dialog. There is no playback, Guitar Pro import,
standard notation, or explicit note-duration editing in this version. Fixed grid
positions do not represent a complete rhythmic score.

### Firestore Access

Songsheets use the top-level `songsheets` collection, queried by `userId`, matching
the existing lesson-note ownership pattern. Owner-only access and basic document
validation are defined in [firestore.songsheets.rules](firestore.songsheets.rules).
String rows are encoded as maps containing fret arrays because Firestore rejects
directly nested arrays.

Run `node scripts/deploySongsheetRules.js` to fetch the live rules and compile
the additional rule without activating it. Add `--deploy` to publish. The helper
preserves existing collection rules and refuses to overwrite an unexpected
ruleset or an existing, different songsheet rule. It uses the credential file in
`GOOGLE_APPLICATION_CREDENTIALS`, or the existing ignored local admin key file.
Credentials are never included in the frontend bundle.

The songsheet rule has been compiled and deployed. Live client checks verified
owner saving, reading, and library queries, plus denial of cross-account reads
and ownership changes. Temporary verification data and accounts were removed.

Run the model checks with `node --test src/utils/songsheet.test.js` and build with
`npm run build`. GitHub Pages deployment remains the existing workflow on pushes
to `main`.

## Future Enhancements

- Scale visualization and practice modes
- Additional chord voicings and inversions
- Alternate tunings support
- Save favorite chord shapes
- Audio playback for selected notes
- Ear training exercises

## License

Personal use project - feel free to modify and adapt for your own learning!
