/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 允许加载未优化的图片
    unoptimized: false,
    // 允许从任何域名加载图片（如果需要使用外部 CDN）
    remotePatterns: [],
  },
}

module.exports = nextConfig


