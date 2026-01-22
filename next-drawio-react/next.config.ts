import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 简化 Turbopack 配置
  turbopack: {
    resolveAlias: {
      '@drawio/core': '../next-drawio-core/src',
    },
  },

  transpilePackages: ['@drawio/core'],
  
  experimental: {
    optimizePackageImports: [
      'zustand',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-context-menu',
    ],
  },
  
  // 启用 SWC 压缩
  compress: true,
  
  // 启用图片优化
  images: {
    remotePatterns: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 配置页面扩展名
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // 配置 headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // 重写配置
  async rewrites() {
    return [
      {
        source: '/docs/:path*',
        destination: '/api/docs/:path*',
      },
    ];
  },

  // Webpack 配置
  webpack: (config) => {
    // 添加 @drawio/core 解析别名
    config.resolve.alias = {
      ...config.resolve.alias,
      '@drawio/core': require('path').resolve(__dirname, '../next-drawio-core/src'),
    };

    return config;
  },
};

export default nextConfig;
