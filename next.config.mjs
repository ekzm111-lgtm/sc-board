/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true, // Cloudflare Pages에서 /admin, /about 등 서브 경로 404 원천 방지
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
