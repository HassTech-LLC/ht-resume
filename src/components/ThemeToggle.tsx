'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = (localStorage.getItem('ht-theme') as 'dark' | 'light' | null) ?? null;
    const initial = stored ?? (document.documentElement.classList.contains('dark') ? 'dark' : 'dark');
    setTheme(initial);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.classList.toggle('light', next === 'light');
    try {
      localStorage.setItem('ht-theme', next);
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-md border border-ht-border/60 px-2.5 py-1 text-xs text-ht-muted hover:text-ht-text hover:border-ht-cyan/50 font-mono uppercase tracking-wider"
    >
      {theme === 'dark' ? '☾ dark' : '☀ light'}
    </button>
  );
}
