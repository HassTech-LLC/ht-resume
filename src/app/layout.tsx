import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HT Resume — Hassan Algasid',
  description:
    "Hassan Algasid's resume. AI Solutions / Forward Deployed Operator — vertical AI in PropTech and FinTech. Part of HassTech Suite.",
  metadataBase: new URL('https://ht-resume.pages.dev'),
  openGraph: {
    title: 'HT Resume — Hassan Algasid',
    description:
      'AI Solutions / Forward Deployed Operator — vertical AI (PropTech, FinTech). Founder of HassTech LLC.',
    url: 'https://ht-resume.pages.dev',
    siteName: 'HT Resume',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Theme bootstrap — runs before paint to avoid FOUC. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const stored = localStorage.getItem('ht-theme');
                const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = stored ?? (sysDark ? 'dark' : 'dark');
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.classList.toggle('light', theme !== 'dark');
              } catch (_) {
                document.documentElement.classList.add('dark');
              }
            })();`,
          }}
        />
      </head>
      <body className="bg-ht-bg text-ht-text min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
