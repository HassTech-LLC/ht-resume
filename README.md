# HT Resume

Hassan Algasid's personal resume site and ATS-aware resume builder.

Part of the HassTech Suite alongside [HT Calc](https://htcalc.com),
[HassTech API](https://hasstechapi.com), HTPdf, NeuronScope,
[HT Meter](https://github.com/algasid7e/ht-meter),
[HT Career](https://career.hasstechapi.com),
and [HT Folio](https://ht-folio.pages.dev).

## What it is

A single-page resume editor + live preview + PDF export, with an integrated ATS Match
panel that scores the current resume against any pasted job description.

- **Single source of truth:** `data/resume.json` (JSON Resume schema, MIT)
- **Templates:** Modern (HT-branded violet rule) and Minimal (ATS-clean black ink)
- **PDF export:** real selectable text via `@react-pdf/renderer` — passes ATS parsers
- **ATS Match:** TF-IDF + cosine similarity in pure TypeScript, runs client-side
- **Section reorder:** `dnd-kit` drag-to-reorder with localStorage persistence
- **Brand:** matches HT Folio's design tokens exactly (cyan/violet gradient, dark-default)
- **Hosted:** Cloudflare Pages free tier, static export

## Architecture

```
data/resume.json           → JSON Resume schema (Hassan's data)
src/lib/resume-schema.ts   → TS types + section keys
src/lib/ats-matcher.ts     → TF-IDF + cosine, no Python sidecar
src/templates/             → react-pdf documents (Modern, Minimal)
src/components/            → editor UI (reorder, ATS panel, PDF viewer)
src/app/                   → Next.js 15 App Router (static export)
```

## OSS attribution

This project is a fresh build but draws heavily from three open-source projects:

| Project | License | Use |
|---------|---------|-----|
| [JSON Resume](https://jsonresume.org) | MIT | Data schema |
| [Reactive Resume](https://github.com/AmruthPillai/Reactive-Resume) | MIT | Architectural inspiration |
| [Resume-Matcher](https://github.com/srbhr/Resume-Matcher) | Apache 2.0 | ATS matching algorithm |

## Editing the resume

```bash
# Edit Hassan's data:
$EDITOR data/resume.json

# Or ask Claude / Cursor to make changes — the schema is enforced via TS types.
```

The file follows the [JSON Resume schema](https://jsonresume.org/schema). Sections you don't
populate are skipped automatically.

## Local dev

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run build        # static export to ./out
```

## Deploy

```bash
npm run deploy       # builds + wrangler pages deploy out
```

CF Pages project: `ht-resume` (free tier).

## License

MIT — see LICENSE.
