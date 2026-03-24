// Drum samples are bundled as static assets in /public/drums/
// BASE_URL is injected by Vite and handles subdirectory deployments (e.g. GitHub Pages)

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const DRUM_URLS = {
  kick:  `${base}/drums/kick.mp3`,
  snare: `${base}/drums/snare.mp3`,
  hihat: `${base}/drums/hihat.mp3`,
};
