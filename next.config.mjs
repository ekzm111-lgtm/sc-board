/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Next.js 정적 빌드 -> out 폴더 생성
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
