import Analytics from './_components/Analytics';

export const metadata = {
  metadataBase: new URL('https://chatwithpdfai.com'),
  title: 'CHATWITHPDFAI — Read every PDF at light speed',
  description: 'Drop a PDF. Ask anything. Get cited answers in seconds. Pay per document, no subscription.',
  applicationName: 'CHATWITHPDFAI',
  keywords: ['chat with pdf', 'ask questions about pdf', 'pdf ai chat', 'cited pdf answers', 'question paper generator', 'pay per document'],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    siteName: 'CHATWITHPDFAI',
    title: 'CHATWITHPDFAI — Read every PDF at light speed',
    description: 'Drop a PDF. Ask anything. Get cited answers in seconds. Pay per document, no subscription.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'CHATWITHPDFAI — chat with any PDF and get cited answers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHATWITHPDFAI — Read every PDF at light speed',
    description: 'Drop a PDF. Ask anything. Get cited answers in seconds.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-latin-500-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/fonts.css" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/a11y.css" />
        <link rel="stylesheet" href="/prose.css" />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="aurora-bg" aria-hidden="true"></div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
