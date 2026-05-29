export const metadata = {
  title: 'CHATWITHPDFAI — Read every PDF at light speed',
  description: 'Drop a PDF. Ask anything. Get cited answers in seconds. Pay per document, no subscription.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/a11y.css" />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="aurora-bg" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}
