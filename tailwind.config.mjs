/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS-variable-driven so dark/light themes can swap without recompile.
        // Matches HT Folio brand exactly.
        'ht-bg':      'rgb(var(--ht-bg) / <alpha-value>)',
        'ht-surface': 'rgb(var(--ht-surface) / <alpha-value>)',
        'ht-card':    'rgb(var(--ht-card) / <alpha-value>)',
        'ht-border':  'rgb(var(--ht-border) / <alpha-value>)',
        'ht-cyan':    'rgb(var(--ht-cyan) / <alpha-value>)',
        'ht-violet':  'rgb(var(--ht-violet) / <alpha-value>)',
        'ht-text':    'rgb(var(--ht-text) / <alpha-value>)',
        'ht-muted':   'rgb(var(--ht-muted) / <alpha-value>)',
        'ht-subtle':  'rgb(var(--ht-subtle) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      backgroundImage: {
        'ht-gradient': 'linear-gradient(135deg, rgb(var(--ht-cyan)), rgb(var(--ht-violet)))',
        'ht-gradient-text': 'linear-gradient(90deg, rgb(var(--ht-cyan)), rgb(var(--ht-violet)))',
      },
      boxShadow: {
        'ht-glow':   '0 0 24px rgb(var(--ht-cyan) / 0.15)',
        'ht-glow-v': '0 0 24px rgb(var(--ht-violet) / 0.15)',
      },
    },
  },
  plugins: [],
};
