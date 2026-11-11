/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Cloudflare Pages 초고속 정적 배포 (25MB 제한 에러 원천 방지)
  reactStrictMode: true,
  images: {
    unoptimized: true, // 정적 export 시 이미지 최적화 unoptimized 처리
  },
};

export default nextConfig;
