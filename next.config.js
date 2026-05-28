/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Clean URLs: /pricing -> /pricing.html, /blog/no-subscription -> /blog/no-subscription.html
  // Rewrites only fire when no real file matches, so /landing.html still serves directly.
  async rewrites() {
    return [
      { source: '/:slug', destination: '/:slug.html' },
      { source: '/:dir/:slug', destination: '/:dir/:slug.html' },
    ];
  },

  // Redirect bare extensions away (canonical URLs without .html)
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
