'use client';

import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { Resume, SectionKey } from '@/lib/resume-schema';
import { SECTION_LABELS } from '@/lib/resume-schema';
import { PALETTE, formatDateRange, registerFonts } from './shared';

registerFonts();

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: PALETTE.text,
    lineHeight: 1.45,
    backgroundColor: PALETTE.page,
  },
  headerRule: {
    height: 3,
    marginBottom: 14,
    // Solid violet — react-pdf doesn't support gradients on borders/blocks
    // reliably across renderers. Violet ties to HT brand.
    backgroundColor: PALETTE.violet,
    borderBottomWidth: 0,
    width: 64,
  },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: PALETTE.ink, marginBottom: 2, letterSpacing: 0.2 },
  label: { fontSize: 10.5, color: PALETTE.violet, marginBottom: 8, fontFamily: 'Helvetica-Bold' },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  contactItem: { fontSize: 9, color: PALETTE.muted, marginRight: 10 },
  link: { color: PALETTE.cyan, textDecoration: 'none' },
  summary: { fontSize: 10, marginBottom: 16, color: PALETTE.text },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.ink,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.hairline,
    paddingBottom: 3,
  },
  itemBlock: { marginBottom: 8 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: PALETTE.ink },
  itemSubtitle: { fontSize: 10, color: PALETTE.muted, marginBottom: 3 },
  itemDate: { fontSize: 9, color: PALETTE.subtle },
  bullet: { flexDirection: 'row', marginBottom: 1.5 },
  bulletDot: { width: 10, fontSize: 9, color: PALETTE.violet },
  bulletText: { flex: 1, fontSize: 9.5 },
  skillRow: { flexDirection: 'row', marginBottom: 4, gap: 6 },
  skillName: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: PALETTE.ink, width: 130 },
  skillKeywords: { flex: 1, fontSize: 9.5, color: PALETTE.muted },
});

interface Props {
  resume: Resume;
  sectionOrder: SectionKey[];
}

export function ModernTemplate({ resume, sectionOrder }: Props) {
  const { basics } = resume;
  const contactItems: { label: string; href?: string }[] = [];
  if (basics.email) contactItems.push({ label: basics.email, href: `mailto:${basics.email}` });
  if (basics.phone) contactItems.push({ label: basics.phone });
  if (basics.location?.city || basics.location?.region) {
    contactItems.push({
      label: [basics.location?.city, basics.location?.region, basics.location?.countryCode]
        .filter(Boolean)
        .join(', '),
    });
  }
  if (basics.url) contactItems.push({ label: basics.url, href: basics.url });
  for (const p of basics.profiles ?? []) {
    contactItems.push({ label: `${p.network}: ${p.username}`, href: p.url });
  }

  return (
    <Document
      title={`${basics.name} — Resume`}
      author={basics.name}
      subject={basics.label ?? 'Resume'}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRule} />
        <Text style={styles.name}>{basics.name}</Text>
        {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
        <View style={styles.contactRow}>
          {contactItems.map((c, i) => (
            <Text key={i} style={styles.contactItem}>
              {c.href ? <Link src={c.href} style={styles.link}>{c.label}</Link> : c.label}
            </Text>
          ))}
        </View>
        {basics.summary ? <Text style={styles.summary}>{basics.summary}</Text> : null}

        {sectionOrder.map((key) => (
          <SectionRenderer key={key} sectionKey={key} resume={resume} />
        ))}
      </Page>
    </Document>
  );
}

function SectionRenderer({
  sectionKey,
  resume,
}: {
  sectionKey: SectionKey;
  resume: Resume;
}) {
  switch (sectionKey) {
    case 'work':
      return resume.work && resume.work.length ? (
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
              {w.highlights?.map((h, j) => (
                <View key={j} style={styles.bullet}>
                  <Text style={styles.bulletDot}>▸</Text>
                  <Text style={styles.bulletText}>{h}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null;
    case 'projects':
      return resume.projects && resume.projects.length ? (
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
              {p.highlights?.map((h, j) => (
                <View key={j} style={styles.bullet}>
                  <Text style={styles.bulletDot}>▸</Text>
                  <Text style={styles.bulletText}>{h}</Text>
                </View>
              ))}
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
      return resume.skills && resume.skills.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.skills}</Text>
          {resume.skills.map((s, i) => (
            <View key={i} style={styles.skillRow}>
              <Text style={styles.skillName}>{s.name}</Text>
              <Text style={styles.skillKeywords}>{(s.keywords ?? []).join(' · ')}</Text>
            </View>
          ))}
        </View>
      ) : null;
    case 'education':
      return resume.education && resume.education.length ? (
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
      return resume.certificates && resume.certificates.length ? (
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
      return resume.awards && resume.awards.length ? (
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
      return resume.publications && resume.publications.length ? (
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
      return resume.languages && resume.languages.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.languages}</Text>
          {resume.languages.map((l, i) => (
            <View key={i} style={styles.skillRow}>
              <Text style={styles.skillName}>{l.language}</Text>
              <Text style={styles.skillKeywords}>{l.fluency ?? ''}</Text>
            </View>
          ))}
        </View>
      ) : null;
    case 'volunteer':
      return resume.volunteer && resume.volunteer.length ? (
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
              {v.highlights?.map((h, j) => (
                <View key={j} style={styles.bullet}>
                  <Text style={styles.bulletDot}>▸</Text>
                  <Text style={styles.bulletText}>{h}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null;
    case 'interests':
      return resume.interests && resume.interests.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.interests}</Text>
          {resume.interests.map((it, i) => (
            <View key={i} style={styles.skillRow}>
              <Text style={styles.skillName}>{it.name}</Text>
              <Text style={styles.skillKeywords}>{(it.keywords ?? []).join(' · ')}</Text>
            </View>
          ))}
        </View>
      ) : null;
    default:
      return null;
  }
}
