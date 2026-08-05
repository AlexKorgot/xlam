import type { NextConfig } from 'next'

function normalizeBasePath(value?: string) {
    const trimmedValue = value?.trim()

    if (!trimmedValue || trimmedValue === '/') {
        return ''
    }

    return `/${trimmedValue.replace(/^\/+|\/+$/g, '')}`
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)
const mediaBaseUrl = (
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ??
    'https://s3.regru.cloud/xlam.storage'
).replace(/\/+$/g, '')

const nextConfig: NextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
        remotePatterns: [new URL(`${mediaBaseUrl}/**`)],
    },
    trailingSlash: true,
    basePath,
    env: {
        NEXT_PUBLIC_BASE_PATH: basePath,
        NEXT_PUBLIC_MEDIA_BASE_URL: mediaBaseUrl,
    },
}

module.exports = nextConfig
