const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.NEXT_PUBLIC_ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
// Import our revalidation configuration
const { revalidation } = require('./app/config/revalidation');
const { withSentryConfig } = require('@sentry/nextjs');

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
    // Disable static optimization
    isrMemoryCacheSize: 0,
    // Server actions configuration
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Force all pages to be server-rendered
    forceServerRendering: true,
  },
  
  // Disable static optimization for all pages
  generateEtags: false,
  
  // API configuration
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  
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
  typescript: {
    // !! 중요: 타입스크립트 에러가 있어도 빌드를 허용
    ignoreBuildErrors: true,
  },
  // 빌드 오류 무시
  eslint: {
    // ESLint 오류 무시
    ignoreDuringBuilds: true,
  },
  // 정적 내보내기 설정
  experimental: {
    // 빌드 실패 시 계속 진행
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
    // 컴파일 오류 무시
    esmExternals: 'loose',
  },
  eslint: {
    // ESLint 오류 무시
    ignoreDuringBuilds: true,
  },
  // 빌드 시 발생하는 모든 오류 무시
  onDemandEntries: {
    // 페이지 버퍼 크기
    maxInactiveAge: 25 * 1000,
    // 동시에 유지할 페이지 수
    pagesBufferLength: 2,
  },
  // Next.js 서버 사이드 렌더링 사용
  experimental: {
    forceSwcTransforms: true,
    serverComponentsExternalPackages: ['firebase', 'firebase-admin'],
    // 동적 페이지 처리 개선
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // 빌드 오류 무시 설정
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint 에러가 있어도 빌드를 허용
    ignoreDuringBuilds: true,
  },
};

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
