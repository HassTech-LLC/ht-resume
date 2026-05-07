import resumeData from '@data/resume.json';
import type { Resume } from '@/lib/resume-schema';
import { ResumeEditor } from '@/components/ResumeEditor';
import { ThemeToggle } from '@/components/ThemeToggle';

const resume = resumeData as Resume;

export default function Home() {
  return (
    <div className="relative atmosphere min-h-screen">
      <header className="relative z-10 border-b border-ht-border/40 bg-ht-bg/40 backdrop-blur sticky top-0">
        <div className="mx-auto max-w-[88rem] flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-ht-gradient shadow-ht-glow" aria-hidden />
            <div>
              <div className="text-sm font-semibold tracking-tight">
                <span className="gradient-text">HT Resume</span>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-ht-muted">
                Part of HassTech Suite
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a
              href="https://hasstechapi.com"
              className="text-ht-muted hover:text-ht-text transition"
              target="_blank"
              rel="noreferrer"
            >
              hasstechapi.com
            </a>
            <a
              href="https://github.com/HassTech-LLC/ht-resume"
              className="text-ht-muted hover:text-ht-text transition"
              target="_blank"
              rel="noreferrer"
            >
              source
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[88rem] px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">{resume.basics.name}</span>
          </h1>
          <p className="text-ht-subtle text-sm mt-1">{resume.basics.label}</p>
        </div>
        <ResumeEditor resume={resume} />
      </main>

      <footer className="relative z-10 border-t border-ht-border/40 mt-10 py-6">
        <div className="mx-auto max-w-[88rem] px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ht-muted">
          <div>
            HT Resume · Built on JSON Resume schema, react-pdf, and a TF-IDF ATS matcher.
            All rendering client-side — your job description never leaves the browser.
          </div>
          <div className="font-mono">
            © {new Date().getFullYear()} HassTech LLC
          </div>
        </div>
      </footer>
    </div>
  );
}
