'use client';

import { useMemo, useState } from 'react';
import type { Resume } from '@/lib/resume-schema';
import { matchResumeToJd, resumeToText, type MatchResult } from '@/lib/ats-matcher';

interface Props {
  resume: Resume;
}

export function AtsPanel({ resume }: Props) {
  const [jd, setJd] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);

  const resumeText = useMemo(() => resumeToText(resume), [resume]);

  function score() {
    if (!jd.trim()) return;
    setResult(matchResumeToJd(resumeText, jd));
  }

  function reset() {
    setJd('');
    setResult(null);
  }

  return (
    <div className="rounded-xl border border-ht-border/60 bg-ht-card/40 p-4 backdrop-blur">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-ht-text">
          ATS Match
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-ht-muted font-mono">
          TF-IDF · cosine
        </span>
      </div>
      <p className="text-xs text-ht-muted mb-3">
        Paste a job description. Score reflects keyword overlap weighted by JD importance.
        Treat as guidance, not gospel.
      </p>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste job description here…"
        rows={8}
        className="w-full resize-y rounded-md border border-ht-border bg-ht-bg/60 px-3 py-2 text-sm placeholder:text-ht-muted focus:outline-none focus:ring-2 focus:ring-ht-cyan/40 font-mono"
      />

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={score}
          disabled={!jd.trim()}
          className="rounded-md bg-ht-gradient px-3 py-1.5 text-sm font-semibold text-white shadow-ht-glow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Score
        </button>
        <button
          onClick={reset}
          className="rounded-md border border-ht-border px-3 py-1.5 text-sm text-ht-muted hover:text-ht-text"
        >
          Reset
        </button>
      </div>

      {result ? <ResultView result={result} /> : null}
    </div>
  );
}

function ResultView({ result }: { result: MatchResult }) {
  const tier =
    result.score >= 70 ? 'strong' : result.score >= 45 ? 'moderate' : 'weak';
  const tierColor =
    tier === 'strong' ? 'text-emerald-400' : tier === 'moderate' ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ht-muted">Match score</div>
          <div className={`text-3xl font-bold font-mono ${tierColor}`}>{result.score}</div>
          <div className="text-xs text-ht-muted capitalize">{tier} alignment</div>
        </div>
        <div className="text-right text-[10px] text-ht-muted font-mono leading-tight">
          <div>resume: {result.resumeTokenCount} tokens</div>
          <div>jd: {result.jdTokenCount} tokens</div>
        </div>
      </div>

      {result.missingKeywords.length ? (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ht-muted mb-1">
            Missing — consider adding
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.missingKeywords.map((kw) => (
              <span
                key={kw}
                className="rounded-md border border-rose-400/30 bg-rose-400/5 px-2 py-0.5 text-xs font-mono text-rose-300"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {result.matchedKeywords.length ? (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ht-muted mb-1">
            Matched
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.matchedKeywords.slice(0, 18).map((kw) => (
              <span
                key={kw}
                className="rounded-md border border-emerald-400/30 bg-emerald-400/5 px-2 py-0.5 text-xs font-mono text-emerald-300"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
