export const metadata = {
  title: 'CHATWITHPDFAI',
  description: 'Drop a PDF. Ask anything. Get cited answers in seconds.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
