import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@democratia/ui', '@democratia/auth', '@democratia/config', '@democratia/db', '@democratia/llm', '@democratia/clustering'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
};

export default nextConfig;
