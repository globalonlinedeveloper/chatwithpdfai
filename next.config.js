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
      '/api/documents/upload': ['./node_modules/mysql2/**/*', './node_modules/unpdf/**/*'],
      '/api/auth/signup': ['./node_modules/mysql2/**/*'],
      '/api/auth/signin': ['./node_modules/mysql2/**/*'],
      '/api/auth/signout': ['./node_modules/mysql2/**/*'],
      '/api/auth/me': ['./node_modules/mysql2/**/*'],
    },
    serverComponentsExternalPackages: ['mysql2', 'nodemailer'],
  },

  async rewrites() {
    return [
      { source: '/:slug', destination: '/:slug.html' },
      { source: '/:dir/:slug', destination: '/:dir/:slug.html' },
    ];
  },

  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
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
