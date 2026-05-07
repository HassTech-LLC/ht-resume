/**
 * ATS Matcher — TF-IDF + cosine similarity in pure TypeScript.
 *
 * Approach inspired by Resume-Matcher (Apache 2.0,
 * https://github.com/srbhr/Resume-Matcher) which uses term-frequency vectors
 * with cosine similarity over a domain stopword list. We port the algorithm to
 * TS so it runs entirely in the browser — no Python sidecar, no server.
 *
 * Scoring is intentionally interpretable: we surface raw cosine similarity as
 * a 0–100 score, plus the missing-keyword set so Hassan can tune the resume.
 */

import type { Resume } from './resume-schema';

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was',
  'were', 'will', 'with', 'we', 'our', 'their', 'they', 'you', 'your', 'i',
  'me', 'my', 'about', 'into', 'over', 'than', 'so', 'such', 'these', 'those',
  'do', 'does', 'did', 'but', 'not', 'no', 'all', 'any', 'each', 'other',
  'some', 'if', 'then', 'else', 'while', 'also', 'us', 'who', 'what', 'when',
  'where', 'how', 'which', 'whose', 'whom', 'within', 'across', 'per', 'via',
  'using', 'use', 'can', 'must', 'should', 'could', 'would', 'may', 'might',
  's', 't', 'd', 'll', 're', 've', 'm', 'job', 'role', 'work', 'team', 'teams',
  'company', 'experience', 'years', 'year', 'including', 'etc',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    // Keep alnum + a few separators that matter (#, +, .) for tech terms like c++, c#, .net, node.js
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[.+#-]+|[.+#-]+$/g, ''))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

function tfidfWeight(tf: Map<string, number>, docs: string[][]): Map<string, number> {
  const weighted = new Map<string, number>();
  const N = docs.length;
  for (const [term, count] of tf) {
    let df = 0;
    for (const doc of docs) if (doc.includes(term)) df += 1;
    const idf = Math.log((N + 1) / (df + 1)) + 1;
    weighted.set(term, count * idf);
  }
  return weighted;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const [, v] of a) magA += v * v;
  for (const [, v] of b) magB += v * v;
  for (const [term, v] of a) {
    const w = b.get(term);
    if (w !== undefined) dot += v * w;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Flatten a Resume into a single searchable text blob.
 */
export function resumeToText(resume: Resume): string {
  const parts: string[] = [];
  parts.push(resume.basics.name);
  if (resume.basics.label) parts.push(resume.basics.label);
  if (resume.basics.summary) parts.push(resume.basics.summary);

  for (const w of resume.work ?? []) {
    parts.push(w.position, w.name);
    if (w.summary) parts.push(w.summary);
    if (w.highlights) parts.push(...w.highlights);
  }
  for (const p of resume.projects ?? []) {
    parts.push(p.name);
    if (p.description) parts.push(p.description);
    if (p.highlights) parts.push(...p.highlights);
    if (p.keywords) parts.push(...p.keywords);
  }
  for (const s of resume.skills ?? []) {
    parts.push(s.name);
    if (s.keywords) parts.push(...s.keywords);
  }
  for (const e of resume.education ?? []) {
    if (e.area) parts.push(e.area);
    if (e.studyType) parts.push(e.studyType);
    parts.push(e.institution);
  }
  for (const c of resume.certificates ?? []) parts.push(c.name);
  for (const a of resume.awards ?? []) parts.push(a.title);

  return parts.join(' \n ');
}

export interface MatchResult {
  /** 0–100 cosine-similarity score, rounded. */
  score: number;
  /** JD keywords NOT present in the resume, ranked by JD frequency × IDF. */
  missingKeywords: string[];
  /** JD keywords present in the resume, ranked the same way. */
  matchedKeywords: string[];
  /** Top JD terms by weighted frequency. */
  topJdTerms: string[];
  /** Token counts for transparency. */
  resumeTokenCount: number;
  jdTokenCount: number;
}

export function matchResumeToJd(resumeText: string, jdText: string): MatchResult {
  const resumeTokens = tokenize(resumeText);
  const jdTokens = tokenize(jdText);

  if (resumeTokens.length === 0 || jdTokens.length === 0) {
    return {
      score: 0,
      missingKeywords: [],
      matchedKeywords: [],
      topJdTerms: [],
      resumeTokenCount: resumeTokens.length,
      jdTokenCount: jdTokens.length,
    };
  }

  const resumeTf = termFrequency(resumeTokens);
  const jdTf = termFrequency(jdTokens);

  const docs = [resumeTokens, jdTokens];
  const resumeWeighted = tfidfWeight(resumeTf, docs);
  const jdWeighted = tfidfWeight(jdTf, docs);

  const sim = cosineSimilarity(resumeWeighted, jdWeighted);
  const score = Math.round(sim * 100);

  // Surface JD terms by weighted importance, then split into matched/missing.
  const ranked = [...jdWeighted.entries()].sort((a, b) => b[1] - a[1]);
  const resumeSet = new Set(resumeTokens);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const [term] of ranked) {
    if (resumeSet.has(term)) matched.push(term);
    else missing.push(term);
  }

  return {
    score,
    missingKeywords: missing.slice(0, 25),
    matchedKeywords: matched.slice(0, 25),
    topJdTerms: ranked.slice(0, 15).map(([t]) => t),
    resumeTokenCount: resumeTokens.length,
    jdTokenCount: jdTokens.length,
  };
}
