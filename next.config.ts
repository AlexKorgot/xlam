import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
const repo = 'xlam'
const basePath = isProd ? `/${repo}` : ''

const nextConfig: NextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    basePath,
    assetPrefix: isProd ? `${basePath}/` : '',
    env: {
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
}

module.exports = nextConfig
