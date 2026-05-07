'use client';

import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { Resume, SectionKey } from '@/lib/resume-schema';
import { PALETTE, registerFonts } from './shared';
import { RenderSection } from './sections';

registerFonts();

/**
 * Ditto — port of Reactive Resume's Ditto template (MIT).
 * DNA: bold "header band" — name and headline render INSIDE a primary-color
 * filled rectangle that spans the page width. The rest of the body is
 * understated by contrast. Designed for high-impact creative / founder roles.
 */
const styles = StyleSheet.create({
  page: {
    padding: 0, // Header band breaks the page padding
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: PALETTE.text,
    lineHeight: 1.45,
    backgroundColor: PALETTE.page,
  },
  band: {
    backgroundColor: PALETTE.violet,
    paddingHorizontal: 44,
    paddingTop: 32,
    paddingBottom: 24,
    marginBottom: 16,
  },
  bandName: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 10,
    lineHeight: 1.15,
  },
  bandLabel: {
    fontSize: 11.5,
    color: '#e9d8fd',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 14,
    lineHeight: 1.35,
  },
  bandContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  bandContactItem: { fontSize: 9, color: '#f3e8ff' },
  bandLink: { color: '#f3e8ff', textDecoration: 'none' },
  body: { paddingHorizontal: 44, paddingBottom: 36 },
  summary: { fontSize: 10, marginBottom: 14, color: PALETTE.text },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.violet,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  itemBlock: { marginBottom: 8 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: PALETTE.ink },
  itemSubtitle: { fontSize: 10, color: PALETTE.muted, marginBottom: 3 },
  itemDate: { fontSize: 9, color: PALETTE.subtle, fontFamily: 'Helvetica-Bold' },
  bullet: { flexDirection: 'row', marginBottom: 1.5 },
  bulletDot: { width: 10, fontSize: 9, color: PALETTE.violet },
  bulletText: { flex: 1, fontSize: 9.5 },
  link: { color: PALETTE.violet, textDecoration: 'none' },
});

interface Props {
  resume: Resume;
  sectionOrder: SectionKey[];
}

export function DittoTemplate({ resume, sectionOrder }: Props) {
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
        <View style={styles.band}>
          <Text style={styles.bandName}>{basics.name}</Text>
          {basics.label ? <Text style={styles.bandLabel}>{basics.label}</Text> : null}
          <View style={styles.bandContactRow}>
            {contactItems.map((c, i) => (
              <Text key={i} style={styles.bandContactItem}>
                {c.href ? <Link src={c.href} style={styles.bandLink}>{c.label}</Link> : c.label}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.body}>
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
                bulletGlyph: '▸',
              }}
            />
          ))}
        </View>
      </Page>
    </Document>
  );
}
