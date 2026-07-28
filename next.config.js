/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // TypeScript 7 removed the compiler API Next used to embed; run `tsc` via CLI instead.
  experimental: {
    useTypeScriptCli: true,
  },
}

module.exports = nextConfig
