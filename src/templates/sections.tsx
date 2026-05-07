'use client';

import { Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { Resume, SectionKey } from '@/lib/resume-schema';
import { SECTION_LABELS } from '@/lib/resume-schema';
import { formatDateRange } from './shared';

/**
 * Section renderer parameterized by a style bundle, so each template can
 * inject its own typographic and chrome treatment while sharing the data
 * iteration logic.
 */
export interface SectionStyles {
  section: Style;
  sectionTitle: Style;
  itemBlock: Style;
  itemHeader: Style;
  itemTitle: Style;
  itemSubtitle: Style;
  itemDate: Style;
  bullet: Style;
  bulletDot: Style;
  bulletText: Style;
  link: Style;
  /** Optional: chip-list rendering for skills/keywords. */
  chip?: Style;
  chipText?: Style;
  /** Optional: split-row variant (heading-on-left layout). */
  itemRow?: Style;
  itemRowMain?: Style;
  /** Bullet glyph: '▸', '•', '–', '·'. */
  bulletGlyph?: string;
}

interface Props {
  resume: Resume;
  sectionKey: SectionKey;
  styles: SectionStyles;
}

export function RenderSection({ resume, sectionKey, styles }: Props) {
  const glyph = styles.bulletGlyph ?? '•';
  const renderBullets = (highlights?: string[]) =>
    highlights?.map((h, j) => (
      <View key={j} style={styles.bullet}>
        <Text style={styles.bulletDot}>{glyph}</Text>
        <Text style={styles.bulletText}>{h}</Text>
      </View>
    ));

  switch (sectionKey) {
    case 'work':
      return resume.work?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.work}</Text>
          {resume.work.map((w, i) => (
            <View key={i} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {w.position} · {w.name}
                </Text>
                <Text style={styles.itemDate}>{formatDateRange(w.startDate, w.endDate)}</Text>
              </View>
              {w.summary ? <Text style={styles.itemSubtitle}>{w.summary}</Text> : null}
              {renderBullets(w.highlights)}
            </View>
          ))}
        </View>
      ) : null;

    case 'projects':
      return resume.projects?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.projects}</Text>
          {resume.projects.map((p, i) => (
            <View key={i} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {p.url ? <Link src={p.url} style={styles.link}>{p.name}</Link> : p.name}
                </Text>
                <Text style={styles.itemDate}>{formatDateRange(p.startDate, p.endDate)}</Text>
              </View>
              {p.description ? <Text style={styles.itemSubtitle}>{p.description}</Text> : null}
              {renderBullets(p.highlights)}
              {p.keywords?.length ? (
                <Text style={[styles.itemSubtitle, { marginTop: 2, fontSize: 8.5 }]}>
                  {p.keywords.join(' · ')}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null;

    case 'skills':
      return resume.skills?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.skills}</Text>
          {styles.chip ? (
            // Chip-style rendering: keywords as inline tags
            <View style={{ flexDirection: 'column', gap: 6 }}>
              {resume.skills.map((s, i) => (
                <View key={i} style={{ flexDirection: 'column', marginBottom: 2 }}>
                  <Text style={[styles.itemTitle, { marginBottom: 2 }]}>{s.name}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {(s.keywords ?? []).map((k, j) => (
                      <View key={j} style={styles.chip}>
                        <Text style={styles.chipText}>{k}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            resume.skills.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 4, gap: 6 }}>
                <Text style={[styles.itemTitle, { width: 130, fontSize: 9.5 }]}>{s.name}</Text>
                <Text style={[styles.bulletText, { color: styles.itemSubtitle.color }]}>
                  {(s.keywords ?? []).join(' · ')}
                </Text>
              </View>
            ))
          )}
        </View>
      ) : null;

    case 'education':
      return resume.education?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.education}</Text>
          {resume.education.map((e, i) => (
            <View key={i} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {e.studyType ? `${e.studyType}, ` : ''}{e.area ?? ''}
                </Text>
                <Text style={styles.itemDate}>{formatDateRange(e.startDate, e.endDate)}</Text>
              </View>
              <Text style={styles.itemSubtitle}>{e.institution}</Text>
            </View>
          ))}
        </View>
      ) : null;

    case 'certificates':
      return resume.certificates?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.certificates}</Text>
          {resume.certificates.map((c, i) => (
            <View key={i} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {c.url ? <Link src={c.url} style={styles.link}>{c.name}</Link> : c.name}
                </Text>
                <Text style={styles.itemDate}>{c.date ?? ''}</Text>
              </View>
              {c.issuer ? <Text style={styles.itemSubtitle}>{c.issuer}</Text> : null}
            </View>
          ))}
        </View>
      ) : null;

    case 'awards':
      return resume.awards?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.awards}</Text>
          {resume.awards.map((a, i) => (
            <View key={i} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{a.title}</Text>
                <Text style={styles.itemDate}>{a.date ?? ''}</Text>
              </View>
              {a.awarder ? <Text style={styles.itemSubtitle}>{a.awarder}</Text> : null}
              {a.summary ? <Text style={styles.bulletText}>{a.summary}</Text> : null}
            </View>
          ))}
        </View>
      ) : null;

    case 'publications':
      return resume.publications?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.publications}</Text>
          {resume.publications.map((p, i) => (
            <View key={i} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {p.url ? <Link src={p.url} style={styles.link}>{p.name}</Link> : p.name}
                </Text>
                <Text style={styles.itemDate}>{p.releaseDate ?? ''}</Text>
              </View>
              {p.publisher ? <Text style={styles.itemSubtitle}>{p.publisher}</Text> : null}
              {p.summary ? <Text style={styles.bulletText}>{p.summary}</Text> : null}
            </View>
          ))}
        </View>
      ) : null;

    case 'languages':
      return resume.languages?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.languages}</Text>
          {resume.languages.map((l, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
              <Text style={[styles.itemTitle, { width: 130, fontSize: 9.5 }]}>{l.language}</Text>
              <Text style={[styles.bulletText, { color: styles.itemSubtitle.color }]}>
                {l.fluency ?? ''}
              </Text>
            </View>
          ))}
        </View>
      ) : null;

    case 'volunteer':
      return resume.volunteer?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.volunteer}</Text>
          {resume.volunteer.map((v, i) => (
            <View key={i} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {v.position} · {v.organization}
                </Text>
                <Text style={styles.itemDate}>{formatDateRange(v.startDate, v.endDate)}</Text>
              </View>
              {v.summary ? <Text style={styles.itemSubtitle}>{v.summary}</Text> : null}
              {renderBullets(v.highlights)}
            </View>
          ))}
        </View>
      ) : null;

    case 'interests':
      return resume.interests?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.interests}</Text>
          {resume.interests.map((it, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
              <Text style={[styles.itemTitle, { width: 130, fontSize: 9.5 }]}>{it.name}</Text>
              <Text style={[styles.bulletText, { color: styles.itemSubtitle.color }]}>
                {(it.keywords ?? []).join(' · ')}
              </Text>
            </View>
          ))}
        </View>
      ) : null;
  }
}

export const sharedStyles = StyleSheet;
