/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
       destination: process.env.NEXT_PUBLIC_API_BASE + "/api/:path*",

      },
    ];
  },
};

module.exports = nextConfig;
