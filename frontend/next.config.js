/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Exclude /api/chat from rewrites - it's a Next.js API route for the AI chatbot
      {
        source: "/api/auth/:path*",
        destination: "http://127.0.0.1:8000/api/auth/:path*",
      },
      {
        source: "/api/todos/:path*",
        destination: "http://127.0.0.1:8000/api/todos/:path*",
      },
      {
        source: "/api/todos",
        destination: "http://127.0.0.1:8000/api/todos",
      },
    ];
  },
};

module.exports = nextConfig;
