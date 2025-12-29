/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 需要静态导出
  output: 'export',
  // 如果仓库名是 username.github.io，basePath 为空字符串
  // 如果仓库名是其他名称，basePath 应该是 '/仓库名'
  // 例如：basePath: '/meme-generator'
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  // 资源路径前缀（与 basePath 保持一致）
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // 图片优化在 GitHub Pages 上不可用，需要禁用
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  // 禁用严格模式以避免某些兼容性问题
  reactStrictMode: true,
  // 确保所有路由都被正确导出
  trailingSlash: true,
}

module.exports = nextConfig


