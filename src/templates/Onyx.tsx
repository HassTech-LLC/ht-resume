'use client';

import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { Resume, SectionKey } from '@/lib/resume-schema';
import { PALETTE, registerFonts } from './shared';
import { RenderSection } from './sections';

registerFonts();

/**
 * Onyx — port of Reactive Resume's Onyx template (MIT).
 * DNA: row-based header (name + headline left, contact stack right) divided
 * from body by a 1px primary-color rule. Single column body. Conservative,
 * corporate, formal — built for traditional ATS pipelines.
 */
const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 38,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: PALETTE.ink,
    lineHeight: 1.5,
    backgroundColor: PALETTE.page,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: PALETTE.ink,
    marginBottom: 14,
  },
  headerLeft: { flex: 1 },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.ink,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 7,
    lineHeight: 1.15,
  },
  label: { fontSize: 10.5, color: PALETTE.muted, fontFamily: 'Helvetica-Bold', lineHeight: 1.35 },
  headerRight: { alignItems: 'flex-end', maxWidth: '40%' },
  contactItem: { fontSize: 9, color: PALETTE.muted, marginBottom: 1, textAlign: 'right' },
  link: { color: PALETTE.ink, textDecoration: 'none' },
  summary: { fontSize: 10, marginBottom: 14, color: PALETTE.text },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.ink,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 7,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: PALETTE.ink,
  },
  itemBlock: { marginBottom: 8 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  itemTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold' },
  itemSubtitle: { fontSize: 10, color: PALETTE.muted, marginBottom: 2 },
  itemDate: { fontSize: 9.5, color: PALETTE.muted, fontFamily: 'Helvetica-Bold' },
  bullet: { flexDirection: 'row', marginBottom: 1.5 },
  bulletDot: { width: 10, fontSize: 9, color: PALETTE.ink },
  bulletText: { flex: 1, fontSize: 9.5 },
});

interface Props {
  resume: Resume;
  sectionOrder: SectionKey[];
}

export function OnyxTemplate({ resume, sectionOrder }: Props) {
  const { basics } = resume;
  const headerContact: { label: string; href?: string }[] = [];
  if (basics.email) headerContact.push({ label: basics.email, href: `mailto:${basics.email}` });
  if (basics.phone) headerContact.push({ label: basics.phone });
  if (basics.location?.city || basics.location?.region) {
    headerContact.push({
      label: [basics.location?.city, basics.location?.region, basics.location?.countryCode]
        .filter(Boolean)
        .join(', '),
    });
  }
  if (basics.url) headerContact.push({ label: basics.url, href: basics.url });
  for (const p of basics.profiles ?? []) {
    headerContact.push({ label: `${p.network}: ${p.username}`, href: p.url });
  }

  return (
    <Document title={`${basics.name} — Resume`} author={basics.name} subject={basics.label ?? 'Resume'}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{basics.name}</Text>
            {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
          </View>
          <View style={styles.headerRight}>
            {headerContact.map((c, i) => (
              <Text key={i} style={styles.contactItem}>
                {c.href ? <Link src={c.href} style={styles.link}>{c.label}</Link> : c.label}
              </Text>
            ))}
          </View>
        </View>

        {basics.summary ? <Text style={styles.summary}>{basics.summary}</Text> : null}

        {sectionOrder.map((key) => (
          <RenderSection
            key={key}
            resume={resume}
            sectionKey={key}
            styles={{
              section: styles.section,
              sectionTitle: styles.sectionTitle,
              itemBlock: styles.itemBlock,
              itemHeader: styles.itemHeader,
              itemTitle: styles.itemTitle,
              itemSubtitle: styles.itemSubtitle,
              itemDate: styles.itemDate,
              bullet: styles.bullet,
              bulletDot: styles.bulletDot,
              bulletText: styles.bulletText,
              link: styles.link,
              bulletGlyph: '•',
            }}
          />
        ))}
      </Page>
    </Document>
  );
}
