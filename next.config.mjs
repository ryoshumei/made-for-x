/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.madeforx.com',
          },
        ],
        destination: 'https://madeforx.com/:path*',
        permanent: true, // 301 redirect
      },
    ];
  },
};

export default nextConfig;
