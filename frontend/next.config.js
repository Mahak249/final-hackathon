/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Exclude /api/chat from rewrites - it's a Next.js API route for the AI chatbot
      {
        source: "/api/auth/:path*",
        destination: `${BACKEND_URL}/api/auth/:path*`,
      },
      {
        source: "/api/todos/:path*",
        destination: `${BACKEND_URL}/api/todos/:path*`,
      },
      {
        source: "/api/todos",
        destination: `${BACKEND_URL}/api/todos`,
      },
    ];
  },
};

module.exports = nextConfig;
