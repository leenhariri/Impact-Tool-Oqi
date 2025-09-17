/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*", // ✅ No env var, fully relative
      },
    ];
  },
};

module.exports = nextConfig;
