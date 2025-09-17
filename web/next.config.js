/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
  //    basePath: '/oqi-impact-tool',     // ✅ needed for routing
  // assetPrefix: '/oqi-impact-tool',  // ✅ needed for static files (images, CSS)
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
