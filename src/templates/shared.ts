/**
 * Font strategy: react-pdf ships with Helvetica/Times-Roman/Courier embedded.
 * Helvetica is the safest default for ATS parsers (every parser supports it,
 * and there's no network dependency for PDF generation). We deliberately do
 * not register external web fonts — keeps PDFs deterministic and fast.
 */
export function registerFonts() {
  // No-op. Templates inherit Helvetica from react-pdf defaults.
}

export function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  const s = start ? humanDate(start) : '';
  const e = end ? humanDate(end) : 'Present';
  return s ? `${s} – ${e}` : e;
}

function humanDate(iso: string): string {
  // Accept "YYYY", "YYYY-MM", "YYYY-MM-DD"
  const parts = iso.split('-');
  const year = parts[0];
  if (parts.length === 1) return year;
  const month = parseInt(parts[1], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1] ?? ''} ${year}`.trim();
}

export const PALETTE = {
  cyan: '#06b6d4',
  violet: '#8b5cf6',
  ink: '#0f172a',
  text: '#1e293b',
  muted: '#475569',
  subtle: '#64748b',
  hairline: '#e2e8f0',
  page: '#ffffff',
  accentBg: '#f8fafc',
};
