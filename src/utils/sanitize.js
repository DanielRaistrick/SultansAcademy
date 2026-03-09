/**
 * Strips HTML tags and dangerous patterns from free-text input before
 * storing to Firestore. React escapes on render, but this also protects
 * the stored data layer against injection payloads.
 */
export const sanitizeText = (str, maxLen = 5000) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')        // strip HTML tags
    .replace(/javascript:/gi, '')   // strip JS protocol references
    .replace(/on\w+\s*=/gi, '')     // strip inline event attributes
    .trim()
    .slice(0, maxLen);
};

/**
 * Validates a URL — only allows http/https, rejects everything else
 * (data:, javascript:, etc.).
 */
export const sanitizeUrl = (str) => {
  if (typeof str !== 'string') return '';
  const trimmed = str.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return trimmed.slice(0, 500);
  } catch {
    return '';
  }
};

/**
 * Extracts a YouTube video ID from common YouTube URL formats.
 */
export const extractYouTubeId = (url) => {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};
