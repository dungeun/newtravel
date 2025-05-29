const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.NEXT_PUBLIC_ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
// Revalidation configuration
const revalidation = {
  default: 60, // 1 minute
  routes: {
    product: 300, // 5 minutes
    products: 180, // 3 minutes
    checkout: 0,
    mypage: 0,
    profile: 0,
    auth: 0,
    admin: 0,
  },
};
// Optional Sentry configuration
let withSentryConfig = (config) => config;

try {
  // Try to load Sentry if available
  withSentryConfig = require('@sentry/nextjs').withSentryConfig;
} catch (e) {
  console.log('Sentry is not installed, skipping Sentry configuration');
}

// Main Next.js configuration
const nextConfig = {
  // Basic configuration
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Experimental features
  experimental: {
    // Server actions configuration
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Disable static optimization for all pages
  generateEtags: false,
  
  // Images configuration
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    unoptimized: true, // Disable image optimization
  },
  
  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Custom page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        undici: false,
        'undici/lib/web/fetch/util.js': false,
        'cheerio/node_modules/undici': false,
        '@firebase/storage/node_modules/undici': false,
      };
    }
    
    // Ignore Firebase warnings
    config.ignoreWarnings = [
      { module: /firebase/ },
    ];
    
    return config;
  },
  
  // URL rewrites
  async rewrites() {
    return [
      // Add any custom rewrites here if needed
    ];
  },
  
  // Custom headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // URL redirects
  async redirects() {
    return [
      {
        source: '/travel/product',
        destination: '/travel/products',
        permanent: true,
      },
      {
        source: '/travel/product/:path*',
        destination: '/travel/products/:path*',
        permanent: true,
      },
    ];
  },
};

// Apply Sentry configuration if SENTRY_DSN is set
if (process.env.SENTRY_DSN) {
  module.exports = withBundleAnalyzer(
    withSentryConfig(nextConfig, {
      // Additional Sentry configuration
      hideSourceMaps: true,
    })
  );
} else {
  module.exports = withBundleAnalyzer(nextConfig);
}

// 빌드에서 제외할 경로
const excludedPaths = [
  '/app/travel/payment',
  '/app/travel/checkout',
  '/app/styleguide'
];

// 빌드에서 제외할 경로를 필터링하는 웹팩 설정 추가
nextConfig.webpack = (config, { isServer }) => {
  if (!isServer) {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...excludedPaths.reduce((aliases, path) => ({
        ...aliases,
        [path]: false
      }), {})
    };
  }
  return config;
};

// 페이지 확장자 설정 (app 디렉토리 내의 page.tsx를 인식하도록 수정)
nextConfig.pageExtensions = ['tsx', 'jsx', 'js', 'ts'];

module.exports = withBundleAnalyzer(nextConfig);
