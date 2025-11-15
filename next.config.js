/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/Vin-dictive.github.io' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Vin-dictive.github.io/' : '',
}

module.exports = nextConfig