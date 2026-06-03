/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.IS_ADMIN === 'true' ? '.next-admin' : '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
