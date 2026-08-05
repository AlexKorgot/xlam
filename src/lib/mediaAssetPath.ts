import type { StaticImageData } from 'next/image';

export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ??
  'https://s3.regru.cloud/xlam.storage';

export function mediaAssetPath(filename: `/${string}`) {
  return `${MEDIA_BASE_URL.replace(/\/+$/, '')}${filename}`;
}

export function remoteImageAsset(
  filename: `/${string}`,
  width: number,
  height: number,
): StaticImageData {
  return {
    src: mediaAssetPath(filename),
    width,
    height,
  };
}
