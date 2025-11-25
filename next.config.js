/** @type {import('next').NextConfig} */
const nextConfig = {
  // next.config.js
async rewrites() {
  const backend = process.env.NODE_ENV === "production" ? process.env.BACKEND_URL : "http://localhost:4000";
  return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
}

};

module.exports = nextConfig;
