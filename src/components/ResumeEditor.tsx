'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Resume, SectionKey } from '@/lib/resume-schema';
import { DEFAULT_SECTION_ORDER, ALL_SECTIONS, SECTION_LABELS } from '@/lib/resume-schema';
import { TEMPLATES, renderTemplate, type TemplateId } from '@/templates';
import { SectionReorder } from './SectionReorder';
import { AtsPanel } from './AtsPanel';

// react-pdf viewer/renderer must be client-only.
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
  { ssr: false, loading: () => <ViewerSkeleton label="Loading preview…" /> }
);
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false }
);

interface Props {
  resume: Resume;
}

const STORAGE_KEY = 'ht-resume-prefs';

interface Prefs {
  templateId: TemplateId;
  order: SectionKey[];
}

function defaultPrefs(): Prefs {
  return { templateId: 'modern', order: DEFAULT_SECTION_ORDER };
}

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return defaultPrefs();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs();
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    const order = (parsed.order ?? DEFAULT_SECTION_ORDER).filter((k): k is SectionKey =>
      (ALL_SECTIONS as string[]).includes(k as string)
    );
    const validIds: TemplateId[] = ['modern', 'minimal', 'azurill', 'bronzor', 'onyx', 'ditto'];
    const templateId: TemplateId =
      parsed.templateId && (validIds as string[]).includes(parsed.templateId as string)
        ? (parsed.templateId as TemplateId)
        : 'modern';
    return { templateId, order: order.length ? order : DEFAULT_SECTION_ORDER };
  } catch {
    return defaultPrefs();
  }
}

export function ResumeEditor({ resume }: Props) {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore quota / privacy mode
    }
  }, [prefs, hydrated]);

  const doc = useMemo(
    () => renderTemplate(prefs.templateId, resume, prefs.order),
    [prefs.templateId, prefs.order, resume]
  );

  const filename = useMemo(() => {
    const name = resume.basics.name.replace(/\s+/g, '_');
    return `${name}_Resume_${prefs.templateId}.pdf`;
  }, [resume.basics.name, prefs.templateId]);

  return (
    <div className="grid lg:grid-cols-[20rem_1fr_22rem] gap-6">
      {/* Left rail — controls */}
      <aside className="space-y-5">
        <div className="rounded-xl border border-ht-border/60 bg-ht-card/40 p-4 backdrop-blur">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-ht-text mb-3">
            Template
          </h3>
          <div className="space-y-2">
            {TEMPLATES.map((t) => {
              const active = prefs.templateId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setPrefs((p) => ({ ...p, templateId: t.id }))}
                  className={`w-full text-left rounded-md border px-3 py-2 transition ${
                    active
                      ? 'border-ht-cyan/60 bg-ht-cyan/5 shadow-ht-glow'
                      : 'border-ht-border/60 hover:border-ht-violet/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm text-ht-text">{t.name}</span>
                    {active ? (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-ht-cyan">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-ht-muted leading-snug">{t.description}</p>
                  <p className="text-[10px] text-ht-subtle mt-1 italic">{t.recommendedFor}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-ht-border/60 bg-ht-card/40 p-4 backdrop-blur">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-ht-text mb-1">
            Sections
          </h3>
          <p className="text-xs text-ht-muted mb-3">Drag to reorder.</p>
          <SectionReorder
            order={prefs.order}
            onChange={(order) => setPrefs((p) => ({ ...p, order }))}
          />
          <SectionToggle
            order={prefs.order}
            onChange={(order) => setPrefs((p) => ({ ...p, order }))}
          />
        </div>

        <div className="rounded-xl border border-ht-border/60 bg-ht-card/40 p-4 backdrop-blur">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-ht-text mb-2">
            Export
          </h3>
          {hydrated ? (
            <PDFDownloadLink
              document={doc}
              fileName={filename}
              className="block w-full text-center rounded-md bg-ht-gradient px-3 py-2 text-sm font-semibold text-white shadow-ht-glow"
            >
              {({ loading }) => (loading ? 'Preparing PDF…' : 'Download PDF')}
            </PDFDownloadLink>
          ) : (
            <button
              disabled
              className="block w-full text-center rounded-md bg-ht-gradient/60 px-3 py-2 text-sm font-semibold text-white opacity-60"
            >
              Loading…
            </button>
          )}
          <p className="text-[10px] text-ht-muted mt-2 leading-relaxed">
            Generated client-side. Real selectable text — passes ATS parsers.
          </p>
        </div>
      </aside>

      {/* Center — live PDF preview */}
      <section className="min-h-[36rem]">
        <div className="rounded-xl border border-ht-border/60 bg-ht-card/40 p-2 backdrop-blur h-full min-h-[36rem]">
          {hydrated ? (
            <PDFViewer
              showToolbar={false}
              style={{ width: '100%', height: '78vh', border: 'none', borderRadius: 8 }}
            >
              {doc}
            </PDFViewer>
          ) : (
            <ViewerSkeleton label="Loading preview…" />
          )}
        </div>
      </section>

      {/* Right rail — ATS Match panel */}
      <aside>
        <AtsPanel resume={resume} />
      </aside>
    </div>
  );
}

function ViewerSkeleton({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-md bg-ht-bg/50 text-ht-muted text-sm"
      style={{ height: '78vh' }}
    >
      {label}
    </div>
  );
}

function SectionToggle({
  order,
  onChange,
}: {
  order: SectionKey[];
  onChange: (next: SectionKey[]) => void;
}) {
  const inactive = ALL_SECTIONS.filter((s) => !order.includes(s));
  if (!inactive.length) return null;
  return (
    <div className="mt-3 pt-3 border-t border-ht-border/60">
      <div className="text-[10px] uppercase tracking-wider text-ht-muted mb-1">
        Inactive — click to add
      </div>
      <div className="flex flex-wrap gap-1.5">
        {inactive.map((k) => (
          <button
            key={k}
            onClick={() => onChange([...order, k])}
            className="rounded-md border border-ht-border/60 px-2 py-0.5 text-xs text-ht-muted hover:text-ht-text hover:border-ht-violet/50"
          >
            + {SECTION_LABELS[k]}
          </button>
        ))}
      </div>
    </div>
  );
}
