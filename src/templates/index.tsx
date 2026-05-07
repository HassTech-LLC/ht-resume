import { ModernTemplate } from './Modern';
import { MinimalTemplate } from './Minimal';
import { AzurillTemplate } from './Azurill';
import { BronzorTemplate } from './Bronzor';
import { OnyxTemplate } from './Onyx';
import { DittoTemplate } from './Ditto';
import type { Resume, SectionKey } from '@/lib/resume-schema';
import type { ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';

export type TemplateId =
  | 'modern'
  | 'minimal'
  | 'azurill'
  | 'bronzor'
  | 'onyx'
  | 'ditto';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  recommendedFor: string;
  /** Where the design lineage came from. */
  inspiration?: string;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Single-column, violet rule, brand-leaning. Pairs with HT site.',
    recommendedFor: 'Recruiter outreach, founder/operator roles, vertical-AI gigs.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Pure black ink, generous whitespace, no decorative chrome.',
    recommendedFor: 'ATS-heavy pipelines, traditional industries, conservative recruiters.',
  },
  {
    id: 'azurill',
    name: 'Azurill',
    description: 'Centered header + violet timeline rail down the body.',
    recommendedFor: 'Visual story-telling for design/product/founder roles.',
    inspiration: 'Reactive Resume — Azurill',
  },
  {
    id: 'bronzor',
    name: 'Bronzor',
    description: 'Editorial split-row: section titles in left rail, content beside.',
    recommendedFor: 'Senior roles where reviewers skim by section heading.',
    inspiration: 'Reactive Resume — Bronzor',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    description: 'Bordered header divider, uppercase name, formal tone.',
    recommendedFor: 'Banking, legal, F500 — pipelines that prefer convention.',
    inspiration: 'Reactive Resume — Onyx',
  },
  {
    id: 'ditto',
    name: 'Ditto',
    description: 'Violet header band — high-impact, dramatic.',
    recommendedFor: 'Creative, brand-leaning, founder/exec opportunities.',
    inspiration: 'Reactive Resume — Ditto',
  },
];

export function renderTemplate(
  id: TemplateId,
  resume: Resume,
  sectionOrder: SectionKey[]
): ReactElement<DocumentProps> {
  switch (id) {
    case 'modern':
      return <ModernTemplate resume={resume} sectionOrder={sectionOrder} />;
    case 'minimal':
      return <MinimalTemplate resume={resume} sectionOrder={sectionOrder} />;
    case 'azurill':
      return <AzurillTemplate resume={resume} sectionOrder={sectionOrder} />;
    case 'bronzor':
      return <BronzorTemplate resume={resume} sectionOrder={sectionOrder} />;
    case 'onyx':
      return <OnyxTemplate resume={resume} sectionOrder={sectionOrder} />;
    case 'ditto':
      return <DittoTemplate resume={resume} sectionOrder={sectionOrder} />;
  }
}
