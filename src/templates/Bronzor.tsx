'use client';

import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { Resume, SectionKey } from '@/lib/resume-schema';
import { PALETTE, registerFonts } from './shared';
import { RenderSection } from './sections';

registerFonts();

/**
 * Bronzor — port of Reactive Resume's Bronzor template (MIT).
 * DNA: editorial split-row layout. Each section has its title in a left rail
 * (~20% width), with the content beside it. Header is centered like Azurill
 * but the body uses the distinctive heading-on-the-left treatment.
 */
const SIDEBAR = '20%';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: PALETTE.text,
    lineHeight: 1.45,
    backgroundColor: PALETTE.page,
  },
  header: { alignItems: 'center', marginBottom: 18 },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.ink,
    marginBottom: 9,
    lineHeight: 1.15,
  },
  label: { fontSize: 11, color: PALETTE.cyan, marginBottom: 10, lineHeight: 1.35 },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  contactItem: { fontSize: 9, color: PALETTE.muted },
  link: { color: PALETTE.ink, textDecoration: 'none' },
  divider: {
    height: 1,
    backgroundColor: PALETTE.hairline,
    marginBottom: 14,
  },
  summaryRow: { flexDirection: 'row', marginBottom: 14 },
  summaryHeading: {
    width: SIDEBAR,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.cyan,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  summaryBody: { flex: 1, fontSize: 10 },
  splitRow: { flexDirection: 'row', marginBottom: 12 },
  splitHeading: {
    width: SIDEBAR,
    paddingRight: 12,
  },
  splitContent: { flex: 1 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.cyan,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 0,
  },
  itemBlock: { marginBottom: 8 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: PALETTE.ink },
  itemSubtitle: { fontSize: 10, color: PALETTE.muted, marginBottom: 3 },
  itemDate: { fontSize: 9, color: PALETTE.subtle },
  bullet: { flexDirection: 'row', marginBottom: 1.5 },
  bulletDot: { width: 10, fontSize: 9, color: PALETTE.cyan },
  bulletText: { flex: 1, fontSize: 9.5 },
});

interface Props {
  resume: Resume;
  sectionOrder: SectionKey[];
}

export function BronzorTemplate({ resume, sectionOrder }: Props) {
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
    <Document title={`${basics.name} — Resume`} author={basics.name} subject={basics.label ?? 'Resume'}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{basics.name}</Text>
          {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
          <View style={styles.contactRow}>
            {contactItems.map((c, i) => (
              <Text key={i} style={styles.contactItem}>
                {c.href ? <Link src={c.href} style={styles.link}>{c.label}</Link> : c.label}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.divider} />

        {basics.summary ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryHeading}>Summary</Text>
            <Text style={styles.summaryBody}>{basics.summary}</Text>
          </View>
        ) : null}

        {sectionOrder.map((key) => (
          <View key={key} style={styles.splitRow}>
            <View style={styles.splitHeading}>
              <Text style={styles.sectionTitle}>{labelFor(key)}</Text>
            </View>
            <View style={styles.splitContent}>
              <RenderSection
                resume={resume}
                sectionKey={key}
                styles={{
                  // Title is rendered in the left rail — hide the inner one
                  section: { marginBottom: 0 },
                  sectionTitle: { display: 'none' },
                  itemBlock: styles.itemBlock,
                  itemHeader: styles.itemHeader,
                  itemTitle: styles.itemTitle,
                  itemSubtitle: styles.itemSubtitle,
                  itemDate: styles.itemDate,
                  bullet: styles.bullet,
                  bulletDot: styles.bulletDot,
                  bulletText: styles.bulletText,
                  link: styles.link,
                  bulletGlyph: '·',
                }}
              />
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}

function labelFor(key: SectionKey): string {
  const map: Record<SectionKey, string> = {
    work: 'Experience',
    projects: 'Projects',
    skills: 'Skills',
    education: 'Education',
    certificates: 'Certs',
    awards: 'Awards',
    publications: 'Pubs',
    languages: 'Languages',
    volunteer: 'Volunteer',
    interests: 'Interests',
  };
  return map[key];
}
