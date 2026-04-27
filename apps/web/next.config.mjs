/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@proai/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

export default nextConfig
