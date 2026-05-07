'use client';

import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { Resume, SectionKey } from '@/lib/resume-schema';
import { PALETTE, registerFonts } from './shared';
import { RenderSection } from './sections';

registerFonts();

/**
 * Azurill — port of Reactive Resume's Azurill template (MIT).
 * DNA: centered header (name + label + contact row), single-column body with
 * cyan timeline rail running down the left margin of every item block. Each
 * item gets a small dot marker on the rail.
 */
const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 44,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: PALETTE.text,
    lineHeight: 1.45,
    backgroundColor: PALETTE.page,
  },
  header: { alignItems: 'center', marginBottom: 14 },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.ink,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  label: { fontSize: 11, color: PALETTE.violet, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  contactItem: { fontSize: 9, color: PALETTE.muted },
  link: { color: PALETTE.cyan, textDecoration: 'none' },
  summary: { fontSize: 10, marginBottom: 14, color: PALETTE.text, textAlign: 'center' },
  body: { flexDirection: 'column' },
  // Timeline rail container — relative for the absolute-positioned line
  section: { position: 'relative', paddingLeft: 18, marginBottom: 12 },
  rail: {
    position: 'absolute',
    left: 6,
    top: 16,
    bottom: 0,
    width: 1,
    backgroundColor: PALETTE.violet,
    opacity: 0.4,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: PALETTE.violet,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  itemBlock: { marginBottom: 8, position: 'relative' },
  itemDot: {
    position: 'absolute',
    left: -16,
    top: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PALETTE.violet,
    backgroundColor: PALETTE.page,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: PALETTE.ink },
  itemSubtitle: { fontSize: 10, color: PALETTE.muted, marginBottom: 3, fontStyle: 'italic' },
  itemDate: { fontSize: 9, color: PALETTE.subtle, fontFamily: 'Helvetica-Bold' },
  bullet: { flexDirection: 'row', marginBottom: 1.5 },
  bulletDot: { width: 10, fontSize: 9, color: PALETTE.violet },
  bulletText: { flex: 1, fontSize: 9.5 },
});

interface Props {
  resume: Resume;
  sectionOrder: SectionKey[];
}

export function AzurillTemplate({ resume, sectionOrder }: Props) {
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
                {i < contactItems.length - 1 ? '  ·' : ''}
              </Text>
            ))}
          </View>
        </View>

        {basics.summary ? <Text style={styles.summary}>{basics.summary}</Text> : null}

        <View style={styles.body}>
          {sectionOrder.map((key) => (
            <View key={key} style={styles.section}>
              <View style={styles.rail} />
              <SectionWrapper resume={resume} sectionKey={key} />
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

function SectionWrapper({ resume, sectionKey }: { resume: Resume; sectionKey: SectionKey }) {
  return (
    <RenderSection
      resume={resume}
      sectionKey={sectionKey}
      styles={{
        section: { marginBottom: 0 },
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
  );
}
