# Third Party Notices

This project's source is MIT-licensed (see `LICENSE`). It depends on, draws
inspiration from, or ports algorithms from the following open-source projects:

## Direct dependencies

| Project | License | Notes |
|---------|---------|-------|
| Next.js | MIT | App Router |
| React, react-dom | MIT | UI |
| @react-pdf/renderer | MIT | PDF generation |
| @dnd-kit/* | MIT | Drag-and-drop section reorder |
| Tailwind CSS | MIT | Styling |

## Architectural inspiration / algorithm port

| Project | License | Use |
|---------|---------|-----|
| [JSON Resume](https://jsonresume.org) | MIT | Data schema reused verbatim. |
| [Reactive Resume](https://github.com/AmruthPillai/Reactive-Resume) | MIT | Reference for resume-builder architecture. No code copied; HT Resume is a fresh implementation. |
| [Resume-Matcher](https://github.com/srbhr/Resume-Matcher) | Apache 2.0 | The TF-IDF + cosine similarity approach in `src/lib/ats-matcher.ts` was inspired by their methodology. The TypeScript implementation is original. |

No GPL or AGPL code is included.
