/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/mercoin',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/mercoin/:path*',
        destination: '/404',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
