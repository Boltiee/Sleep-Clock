// PWA temporarily disabled due to next-pwa v5.6.0 compatibility issues with Node.js v22
// To re-enable: npm install next-pwa@latest and uncomment the withPWA wrapper

// const withPWA = require('next-pwa')({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
//   skipWaiting: true,
//   runtimeCaching: [
//     {
//       urlPattern: /^https?.*/,
//       handler: 'NetworkFirst',
//       options: {
//         cacheName: 'offlineCache',
//         expiration: {
//           maxEntries: 200,
//         },
//       },
//     },
//   ],
// })

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
// module.exports = withPWA(nextConfig)  // Uncomment when PWA is re-enabled

