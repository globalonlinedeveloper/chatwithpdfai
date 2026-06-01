/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hostinger prunes node_modules aggressively. These tell Next.js to keep deps
  // for our server-only routes. Add new entries whenever a route imports a new pkg.
  experimental: {
    outputFileTracingIncludes: {
      '/api/contact':  ['./node_modules/mysql2/**/*', './node_modules/nodemailer/**/*'],
      '/api/waitlist': ['./node_modules/mysql2/**/*'],
      '/api/documents': ['./node_modules/mysql2/**/*'],
      '/api/documents/[id]': ['./node_modules/mysql2/**/*'],
      '/api/documents/[id]/file': ['./node_modules/mysql2/**/*'],
      '/api/chat': ['./node_modules/mysql2/**/*'],
      '/api/chat/estimate': ['./node_modules/mysql2/**/*'],
      '/api/credits': ['./node_modules/mysql2/**/*'],
      '/api/documents/upload': ['./node_modules/mysql2/**/*', './node_modules/unpdf/**/*'],
      '/api/auth/signup': ['./node_modules/mysql2/**/*'],
      '/api/auth/signin': ['./node_modules/mysql2/**/*'],
      '/api/auth/signout': ['./node_modules/mysql2/**/*'],
      '/api/auth/me': ['./node_modules/mysql2/**/*'],
      '/api/auth/verify': ['./node_modules/mysql2/**/*'],
      '/api/auth/forgot': ['./node_modules/mysql2/**/*', './node_modules/nodemailer/**/*'],
      '/api/auth/reset': ['./node_modules/mysql2/**/*'],
      '/api/payments/order': ['./node_modules/mysql2/**/*'],
      '/api/payments/verify': ['./node_modules/mysql2/**/*'],
      '/api/payments/webhook': ['./node_modules/mysql2/**/*'],
    },
    serverComponentsExternalPackages: ['mysql2', 'nodemailer'],
  },

  async redirects() {
    return [
      { source: '/studio', destination: '/question-paper-generator', permanent: true },
      { source: '/papers', destination: '/question-paper-generator', permanent: true },
      { source: '/workspace', destination: '/chat-with-pdf', permanent: true },
      { source: '/chat', destination: '/chat-with-pdf', permanent: true },
      { source: '/home', destination: '/dashboard', permanent: true },
      { source: '/api/studio/:path*', destination: '/api/papers/:path*', permanent: false },
      { source: '/api/papers/papers', destination: '/api/papers/library', permanent: false },
      { source: '/api/papers/paper', destination: '/api/papers/generate', permanent: false },
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/signin.html', destination: '/signin', permanent: true },
      { source: '/signup.html', destination: '/signup', permanent: true },
      { source: '/forgot.html', destination: '/forgot', permanent: true },
      { source: '/reset.html', destination: '/reset', permanent: true },
      { source: '/library.html', destination: '/library', permanent: true },
      { source: '/account.html', destination: '/account', permanent: true },
      { source: '/buy.html', destination: '/buy', permanent: true },
      { source: '/landing.html', destination: '/', permanent: true },
      { source: '/pricing.html', destination: '/pricing', permanent: true },
      { source: '/legal/cookies.html', destination: '/legal/cookies', permanent: true },
      { source: '/legal/dpa.html', destination: '/legal/dpa', permanent: true },
      { source: '/legal/privacy.html', destination: '/legal/privacy', permanent: true },
      { source: '/legal/security.html', destination: '/legal/security', permanent: true },
      { source: '/legal/sub-processors.html', destination: '/legal/sub-processors', permanent: true },
      { source: '/legal/terms.html', destination: '/legal/terms', permanent: true },
      { source: '/help/index.html', destination: '/help', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/manifesto.html', destination: '/', permanent: true },
      { source: '/blog.html', destination: '/', permanent: true },
      { source: '/chat.html', destination: '/chat-with-pdf', permanent: true },
      { source: '/upload.html', destination: '/chat-with-pdf', permanent: true },
      { source: '/search.html', destination: '/', permanent: true },
      { source: '/invoice.html', destination: '/', permanent: true },
      { source: '/webhooks.html', destination: '/', permanent: true },
      { source: '/onboarding.html', destination: '/', permanent: true },
      { source: '/help/getting-started.html', destination: '/help/getting-started', permanent: true },
      { source: '/help/credits.html', destination: '/help/credits', permanent: true },
      { source: '/help/citations.html', destination: '/help/citations', permanent: true },
      { source: '/help/multi-pdf-chat.html', destination: '/help/multi-pdf-chat', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
