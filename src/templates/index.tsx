import { ModernTemplate } from './Modern';
import { MinimalTemplate } from './Minimal';
import type { Resume, SectionKey } from '@/lib/resume-schema';
import type { ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';

export type TemplateId = 'modern' | 'minimal';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  recommendedFor: string;
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
  }
}
