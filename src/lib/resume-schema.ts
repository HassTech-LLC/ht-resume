/**
 * JSON Resume schema (https://jsonresume.org/schema, MIT licensed).
 * Ported to TypeScript for type-safe access in templates and ATS scoring.
 */

export interface Location {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface Profile {
  network: string;
  username: string;
  url: string;
}

export interface Basics {
  name: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: Location;
  profiles?: Profile[];
}

export interface WorkItem {
  name: string;
  position: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  location?: string;
}

export interface VolunteerItem {
  organization: string;
  position: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
}

export interface EducationItem {
  institution: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface Award {
  title: string;
  date?: string;
  awarder?: string;
  summary?: string;
}

export interface Certificate {
  name: string;
  date?: string;
  url?: string;
  issuer?: string;
}

export interface Publication {
  name: string;
  publisher?: string;
  releaseDate?: string;
  url?: string;
  summary?: string;
}

export interface Skill {
  name: string;
  level?: string;
  keywords?: string[];
}

export interface Language {
  language: string;
  fluency?: string;
}

export interface Interest {
  name: string;
  keywords?: string[];
}

export interface Reference {
  name: string;
  reference: string;
}

export interface ProjectItem {
  name: string;
  description?: string;
  highlights?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  roles?: string[];
  entity?: string;
  type?: string;
}

export interface Resume {
  basics: Basics;
  work?: WorkItem[];
  volunteer?: VolunteerItem[];
  education?: EducationItem[];
  awards?: Award[];
  certificates?: Certificate[];
  publications?: Publication[];
  skills?: Skill[];
  languages?: Language[];
  interests?: Interest[];
  references?: Reference[];
  projects?: ProjectItem[];
  meta?: {
    canonical?: string;
    version?: string;
    lastModified?: string;
  };
}

export type SectionKey =
  | 'work'
  | 'projects'
  | 'skills'
  | 'education'
  | 'certificates'
  | 'awards'
  | 'publications'
  | 'languages'
  | 'volunteer'
  | 'interests';

export const ALL_SECTIONS: SectionKey[] = [
  'work',
  'projects',
  'skills',
  'education',
  'certificates',
  'awards',
  'publications',
  'languages',
  'volunteer',
  'interests',
];

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'work',
  'projects',
  'skills',
  'education',
  'certificates',
  'awards',
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  work: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  education: 'Education',
  certificates: 'Certifications',
  awards: 'Awards',
  publications: 'Publications',
  languages: 'Languages',
  volunteer: 'Volunteer',
  interests: 'Interests',
};
