/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Cloudflare Pages 25MB 제한 에러 해결을 위해 Webpack 캐시 비활성화
    config.cache = false;
    return config;
  },
};

export default nextConfig;
