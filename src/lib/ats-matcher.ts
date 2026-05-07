/**
 * ATS Matcher — TF-IDF + cosine similarity in pure TypeScript, with bigrams,
 * Porter stemming, tech-skills synonym normalization, and JD section weighting.
 *
 * Resume-Matcher v2+ (https://github.com/srbhr/Resume-Matcher, Apache 2.0) is
 * fully LLM-driven (LiteLLM + prompts). We deliberately skip the LLM dependency
 * here so HT Resume stays free, instant, and zero-key — but we incorporate the
 * spirit of their multi-feature scoring: token coverage, weighted importance,
 * and explicit must-have detection. The implementation below is original.
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
  'company', 'experience', 'years', 'year', 'including', 'etc', 'including',
  'across', 'including', 'including', 'help', 'helping', 'looking', 'seeking',
  'ideal', 'great', 'good', 'best', 'one', 'two', 'three', 'four', 'five',
  'plus', 'preferred', 'nice', 'bonus', 'will', 'want', 'wanted', 'need',
  'needed', 'able', 'ability', 'including',
]);

/**
 * Tech-skills synonym map. Maps colloquial / variant forms to a canonical
 * lowercase token so "Reactjs", "React.js", and "React" all collapse together.
 * Bidirectional: when scoring, we normalize tokens through this map.
 */
const SYNONYMS: Record<string, string> = {
  reactjs: 'react',
  'react.js': 'react',
  nodejs: 'node',
  'node.js': 'node',
  postgres: 'postgresql',
  postgressql: 'postgresql',
  ts: 'typescript',
  js: 'javascript',
  py: 'python',
  golang: 'go',
  k8s: 'kubernetes',
  'amazon web services': 'aws',
  'large language model': 'llm',
  'large language models': 'llm',
  llms: 'llm',
  'machine learning': 'ml',
  'artificial intelligence': 'ai',
  'natural language processing': 'nlp',
  'sentence transformers': 'embeddings',
  'tf-idf': 'tfidf',
  'tf idf': 'tfidf',
  'cosine similarity': 'cosine',
  'cloudflare workers': 'workers',
  'cloudflare pages': 'pages',
  'cloudflare d1': 'd1',
  'gpt-4': 'gpt4',
  gpt4: 'gpt4',
  'claude api': 'claude',
  'anthropic api': 'claude',
  'web sockets': 'websocket',
  websockets: 'websocket',
  'rest api': 'rest',
  'rest apis': 'rest',
  apis: 'api',
  'graphql api': 'graphql',
  oss: 'opensource',
  'open source': 'opensource',
  'ci/cd': 'cicd',
  'ci cd': 'cicd',
  'product manager': 'pm',
  'product management': 'pm',
  'forward deployed': 'fde',
  'forward-deployed': 'fde',
  'forward deployed engineer': 'fde',
  'forward-deployed engineer': 'fde',
};

/**
 * Multi-word synonyms applied BEFORE tokenization so "machine learning" stays
 * as one logical concept. Sorted longest-first so "forward deployed engineer"
 * substitutes before "forward deployed".
 */
const MULTI_WORD_PATTERNS: [RegExp, string][] = Object.entries(SYNONYMS)
  .filter(([k]) => k.includes(' '))
  .sort((a, b) => b[0].length - a[0].length)
  .map(([k, v]) => [new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), v]);

function applyMultiwordSynonyms(text: string): string {
  let out = text;
  for (const [pattern, replacement] of MULTI_WORD_PATTERNS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * Minimal Porter stemmer — covers the most common English suffixes.
 * Not a full Porter implementation but enough to collapse the most common
 * inflections (deploying / deployed / deployment / deploys → deploy).
 */
function stem(word: string): string {
  if (word.length <= 3) return word;
  let w = word;

  // Step 1a: plurals
  if (w.endsWith('sses')) w = w.slice(0, -2);
  else if (w.endsWith('ies')) w = w.slice(0, -2);
  else if (w.endsWith('ss')) {
    // keep
  } else if (w.endsWith('s')) w = w.slice(0, -1);

  // Step 1b: -ed / -ing
  if (w.endsWith('eed')) w = w.slice(0, -1);
  else if (/(ed|ing)$/.test(w) && /[aeiou]/.test(w.slice(0, w.endsWith('ed') ? -2 : -3))) {
    w = w.replace(/(ed|ing)$/, '');
    if (/(at|bl|iz)$/.test(w)) w += 'e';
    else if (/([^aeiouylsz])\1$/.test(w)) w = w.slice(0, -1);
  }

  // Step 2: common derivational endings
  const step2: [RegExp, string][] = [
    [/ational$/, 'ate'],
    [/tional$/, 'tion'],
    [/ization$/, 'ize'],
    [/ation$/, 'ate'],
    [/ator$/, 'ate'],
    [/iveness$/, 'ive'],
    [/fulness$/, 'ful'],
    [/ousness$/, 'ous'],
    [/aliti$/, 'al'],
    [/iviti$/, 'ive'],
    [/biliti$/, 'ble'],
    [/ment$/, ''],
    [/ness$/, ''],
    [/ity$/, ''],
    [/ly$/, ''],
  ];
  for (const [re, rep] of step2) {
    if (re.test(w) && w.length > 4) {
      w = w.replace(re, rep);
      break;
    }
  }

  return w;
}

function tokenize(text: string): string[] {
  const normalized = applyMultiwordSynonyms(text)
    .toLowerCase()
    // Keep alnum + a few separators that matter (#, +, .) for tech terms
    .replace(/[^a-z0-9+#.\s-]/g, ' ');

  return normalized
    .split(/\s+/)
    .map((t) => t.replace(/^[.+#-]+|[.+#-]+$/g, ''))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
    // Apply unigram synonyms after tokenization
    .map((t) => SYNONYMS[t] ?? t);
}

function bigrams(tokens: string[]): string[] {
  const bigs: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigs.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return bigs;
}

/**
 * Generate the full feature set for a document: stems + bigrams.
 * Each feature is weighted 1.0, with stems and unstemmed both kept so a
 * concrete-skill mention ("Kubernetes") doesn't lose specificity to its stem.
 */
function featureize(text: string): { tokens: string[]; features: Map<string, number> } {
  const tokens = tokenize(text);
  const features = new Map<string, number>();

  for (const t of tokens) {
    features.set(t, (features.get(t) ?? 0) + 1.0);
    const s = stem(t);
    if (s !== t && s.length >= 2) {
      // stems get half-weight to avoid double-counting
      features.set(`§${s}`, (features.get(`§${s}`) ?? 0) + 0.5);
    }
  }
  for (const b of bigrams(tokens)) {
    // bigrams weighted higher — multi-word tech concepts are usually load-bearing
    features.set(`«${b}»`, (features.get(`«${b}»`) ?? 0) + 1.5);
  }

  return { tokens, features };
}

function tfidfWeight(tf: Map<string, number>, docs: Map<string, number>[]): Map<string, number> {
  const weighted = new Map<string, number>();
  const N = docs.length;
  for (const [term, count] of tf) {
    let df = 0;
    for (const doc of docs) if (doc.has(term)) df += 1;
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
 * Detect "requirements" / "must-have" sections in a JD and weight them higher.
 * Recognizes common JD heading phrases.
 */
const REQ_HEADERS = [
  /\brequirements?\b/i,
  /\brequired\b/i,
  /\bmust[- ]?have\b/i,
  /\bqualifications?\b/i,
  /\byou (?:will )?(?:need|must|have)\b/i,
  /\bwhat (?:we'?re|you'?ll) need\b/i,
  /\bwho you are\b/i,
];
const NICE_HEADERS = [
  /\bnice[- ]?to[- ]?have\b/i,
  /\bbonus\b/i,
  /\bpreferred\b/i,
  /\bplus\b/i,
  /\bgood to have\b/i,
];

interface JdSegment {
  text: string;
  weight: number;
}

function segmentJd(jdText: string): JdSegment[] {
  const lines = jdText.split(/\r?\n/);
  const segments: JdSegment[] = [];
  let current: JdSegment = { text: '', weight: 1.0 };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (current.text) {
        segments.push(current);
        current = { text: '', weight: 1.0 };
      }
      continue;
    }
    // Heading detection: short line ending with ':' or all caps or matches a known phrase
    const isHeading =
      line.length < 80 &&
      (/[:]\s*$/.test(line) || /^[A-Z][A-Za-z\s/&-]{2,79}$/.test(line) ||
        REQ_HEADERS.some((r) => r.test(line)) ||
        NICE_HEADERS.some((r) => r.test(line)));
    if (isHeading) {
      if (current.text) segments.push(current);
      const isReq = REQ_HEADERS.some((r) => r.test(line));
      const isNice = NICE_HEADERS.some((r) => r.test(line));
      const weight = isReq ? 1.6 : isNice ? 0.6 : 1.0;
      current = { text: '', weight };
    } else {
      current.text += line + '\n';
    }
  }
  if (current.text) segments.push(current);
  if (!segments.length) segments.push({ text: jdText, weight: 1.0 });
  return segments;
}

function buildWeightedJdFeatures(segments: JdSegment[]): {
  features: Map<string, number>;
  totalTokens: number;
  requiredTerms: Set<string>;
} {
  const features = new Map<string, number>();
  const requiredTerms = new Set<string>();
  let totalTokens = 0;

  for (const seg of segments) {
    const { tokens, features: segFeatures } = featureize(seg.text);
    totalTokens += tokens.length;
    for (const [term, count] of segFeatures) {
      features.set(term, (features.get(term) ?? 0) + count * seg.weight);
      if (seg.weight >= 1.5) requiredTerms.add(term);
    }
  }
  return { features, totalTokens, requiredTerms };
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

/**
 * For display: strip internal feature prefixes (§ for stems, « » for bigrams).
 */
function presentTerm(term: string): string {
  if (term.startsWith('§')) return term.slice(1);
  if (term.startsWith('«') && term.endsWith('»')) {
    return term.slice(1, -1).replace(/_/g, ' ');
  }
  return term;
}

export interface MatchResult {
  /** 0–100 cosine-similarity score, rounded. */
  score: number;
  /** % of required-section terms covered by the resume (0-100). */
  requiredCoverage: number;
  /** JD keywords NOT present in the resume, ranked by weighted importance. */
  missingKeywords: string[];
  /** JD keywords present in the resume, ranked the same way. */
  matchedKeywords: string[];
  /** Top JD terms by weighted frequency (display form). */
  topJdTerms: string[];
  /** Required terms (from "Requirements"-style sections) that are missing. */
  criticalGaps: string[];
  /** Token counts for transparency. */
  resumeTokenCount: number;
  jdTokenCount: number;
  /** Number of JD segments detected (sectioning fidelity). */
  jdSegments: number;
}

export function matchResumeToJd(resumeText: string, jdText: string): MatchResult {
  const segments = segmentJd(jdText);
  const { features: jdFeatures, totalTokens: jdTokenCount, requiredTerms } =
    buildWeightedJdFeatures(segments);
  const { tokens: resumeTokens, features: resumeFeatures } = featureize(resumeText);

  if (resumeTokens.length === 0 || jdTokenCount === 0) {
    return {
      score: 0,
      requiredCoverage: 0,
      missingKeywords: [],
      matchedKeywords: [],
      topJdTerms: [],
      criticalGaps: [],
      resumeTokenCount: resumeTokens.length,
      jdTokenCount,
      jdSegments: segments.length,
    };
  }

  const docs = [resumeFeatures, jdFeatures];
  const resumeWeighted = tfidfWeight(resumeFeatures, docs);
  const jdWeighted = tfidfWeight(jdFeatures, docs);

  // Primary score: weighted JD coverage. "Of all the importance the JD signals,
  // how much does the resume cover?" — directly interpretable, robust to
  // asymmetric feature counts (which break raw cosine when one side has many
  // bigrams/stems the other doesn't).
  let totalJdMass = 0;
  let coveredJdMass = 0;
  for (const [term, w] of jdWeighted) {
    totalJdMass += w;
    if (resumeFeatures.has(term)) coveredJdMass += w;
  }
  const coverage = totalJdMass === 0 ? 0 : coveredJdMass / totalJdMass;

  // Cosine as secondary signal — useful for tie-breaking and corroboration
  const sim = cosineSimilarity(resumeWeighted, jdWeighted);

  // Blend coverage (primary) with cosine (regularizer) so a resume that
  // matches all JD terms but is otherwise irrelevant doesn't get a perfect
  // score. 70/30 weighting tracks user intuition: "covered the JD" beats
  // "vector-aligned with JD."
  const score = Math.round((coverage * 0.7 + sim * 0.3) * 100);

  // Surface JD terms by weighted importance, then split into matched/missing.
  const ranked = [...jdWeighted.entries()].sort((a, b) => b[1] - a[1]);
  const matchedTerms: string[] = [];
  const missingTerms: string[] = [];
  for (const [term] of ranked) {
    if (resumeFeatures.has(term)) matchedTerms.push(term);
    else missingTerms.push(term);
  }

  // Required-section coverage
  let reqHit = 0;
  for (const t of requiredTerms) if (resumeFeatures.has(t)) reqHit += 1;
  const requiredCoverage = requiredTerms.size
    ? Math.round((reqHit / requiredTerms.size) * 100)
    : 100;

  // Critical gaps: required terms missing, ranked by JD weight.
  const criticalGaps = [...requiredTerms]
    .filter((t) => !resumeFeatures.has(t))
    .map((t) => [t, jdWeighted.get(t) ?? 0] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([t]) => presentTerm(t));

  // Dedupe display terms (stem and unigram of same root collapse together)
  function dedupeDisplay(terms: string[], cap: number): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of terms) {
      const display = presentTerm(t);
      const key = display.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(display);
      if (out.length >= cap) break;
    }
    return out;
  }

  return {
    score,
    requiredCoverage,
    missingKeywords: dedupeDisplay(missingTerms, 25),
    matchedKeywords: dedupeDisplay(matchedTerms, 25),
    topJdTerms: dedupeDisplay(
      ranked.map(([t]) => t),
      15
    ),
    criticalGaps,
    resumeTokenCount: resumeTokens.length,
    jdTokenCount,
    jdSegments: segments.length,
  };
}
