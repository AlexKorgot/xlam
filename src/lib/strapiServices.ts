import 'server-only';

import { access } from 'node:fs/promises';
import path from 'node:path';
import {
  serviceClosingText,
  serviceSlides,
} from '@/src/components/ui/ServicesSliderSection/services.data';
import type {
  ServiceSlide,
  ServicesContent,
} from '@/src/components/ui/ServicesSliderSection/services.types';
import { publicAssetPath } from '@/src/lib/publicAssetPath';

type RecordValue = Record<string, unknown>;

function object(value: unknown, field: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Strapi Services: ${field} must be an object`);
  }
  return value as RecordValue;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Strapi Services: ${field} must be a non-empty string`);
  }
  return value;
}

function list(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Strapi Services: ${field} must be an array`);
  }
  return value;
}

function mediaUrl(
  value: unknown,
  field: string,
  cmsOrigin: string,
  localAsset: boolean,
  localAssets: Set<string>,
): string {
  const url = string(value, field);
  if (/^https:\/\//i.test(url)) return url;
  if (/^http:\/\//i.test(url) &&
      ['localhost', '127.0.0.1'].includes(new URL(url).hostname)) return url;
  if (!url.startsWith('/') || url.startsWith('//')) {
    throw new Error(`Strapi Services: ${field} must be HTTPS or a root-relative path`);
  }
  if (!localAsset) return new URL(url, cmsOrigin).toString();

  if (url.includes('?') || url.includes('#') || url.includes('\\')) {
    throw new Error(`Strapi Services: ${field} has an invalid local path`);
  }
  const decodedPath = decodeURIComponent(url.slice(1));
  if (decodedPath.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error(`Strapi Services: ${field} has an unsafe local path`);
  }
  localAssets.add(decodedPath);
  return publicAssetPath(url as `/${string}`);
}

function source(
  entry: RecordValue,
  urlField: string,
  mediaField: string,
  cmsOrigin: string,
  localAssets: Set<string>,
  required = true,
): string | undefined {
  const media = entry[mediaField] == null
    ? undefined
    : object(entry[mediaField], mediaField);
  if (media?.url != null) {
    return mediaUrl(media.url, `${mediaField}.url`, cmsOrigin, false, localAssets);
  }
  const fallback = entry[urlField];
  if (fallback != null && fallback !== '') {
    return mediaUrl(fallback, urlField, cmsOrigin, true, localAssets);
  }
  if (required) {
    throw new Error(`Strapi Services: ${urlField} or ${mediaField} is required`);
  }
  return undefined;
}

function toSlide(
  value: unknown,
  cmsOrigin: string,
  localAssets: Set<string>,
): { slide: ServiceSlide; sortOrder: number } {
  const entry = object(value, 'service');
  const key = string(entry.key, 'key');
  if (!entry.publishedAt) throw new Error(`Strapi Services: ${key} is not published`);
  if (!Number.isInteger(entry.sortOrder)) {
    throw new Error(`Strapi Services: ${key} has invalid sortOrder`);
  }
  const features = list(entry.features, `${key}.features`).map((value, index) => {
    const feature = object(value, `${key}.features[${index}]`);
    return {
      title: string(feature.title, `${key}.features[${index}].title`),
      description: string(feature.description, `${key}.features[${index}].description`),
    };
  });
  if (features.length === 0) throw new Error(`Strapi Services: ${key} has no features`);

  return {
    sortOrder: entry.sortOrder as number,
    slide: {
      id: key,
      title: string(entry.cardTitle, `${key}.cardTitle`),
      description: string(entry.cardDescription, `${key}.cardDescription`),
      videoSrc: source(entry, 'cardVideoUrl', 'cardVideo', cmsOrigin, localAssets, false),
      poster: {
        desktop: { src: source(entry, 'cardPosterDesktopUrl', 'cardPosterDesktop', cmsOrigin, localAssets)! },
        mobile: { src: source(entry, 'cardPosterMobileUrl', 'cardPosterMobile', cmsOrigin, localAssets)! },
      },
      modal: {
        title: string(entry.detailTitle, `${key}.detailTitle`),
        subtitle: string(entry.detailSubtitle, `${key}.detailSubtitle`),
        description: string(entry.detailDescription, `${key}.detailDescription`),
        ctaIntro: string(entry.ctaIntro, `${key}.ctaIntro`),
        ctaLabel: string(entry.ctaLabel, `${key}.ctaLabel`),
        backgroundImage: {
          desktop: { src: source(entry, 'detailBackgroundDesktopUrl', 'detailBackgroundDesktop', cmsOrigin, localAssets)! },
          mobile: { src: source(entry, 'detailBackgroundMobileUrl', 'detailBackgroundMobile', cmsOrigin, localAssets)! },
        },
        features,
      },
    },
  };
}

async function request(url: URL, token: string): Promise<RecordValue> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Strapi Services: API returned ${response.status}`);
  return object(await response.json(), 'response');
}

export async function getServicesContent(): Promise<ServicesContent> {
  const cmsUrl = process.env.STRAPI_URL?.trim();
  const token = process.env.STRAPI_API_TOKEN?.trim();
  if (!cmsUrl && !token) {
    if (process.env.CI) {
      throw new Error('Strapi Services: CI requires STRAPI_URL and STRAPI_API_TOKEN');
    }
    return { slides: serviceSlides, closingText: serviceClosingText };
  }
  if (!cmsUrl || !token) {
    throw new Error('Strapi Services: STRAPI_URL and STRAPI_API_TOKEN must both be set');
  }

  const cmsOrigin = new URL(cmsUrl).origin;
  const buildVersion = `__build_${Date.now()}_${crypto.randomUUID()}`;
  const services: unknown[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const url = new URL('/api/services', cmsUrl);
    url.searchParams.set('status', 'published');
    url.searchParams.set('filters[key][$ne]', buildVersion);
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    for (const field of [
      'features', 'cardVideo', 'cardPosterDesktop', 'cardPosterMobile',
      'detailBackgroundDesktop', 'detailBackgroundMobile',
    ]) {
      url.searchParams.set(`populate[${field}]`, 'true');
    }
    const body = await request(url, token);
    services.push(...list(body.data, 'response.data'));
    const pagination = object(object(body.meta, 'response.meta').pagination, 'response.meta.pagination');
    if (!Number.isInteger(pagination.pageCount) || (pagination.pageCount as number) < 0) {
      throw new Error('Strapi Services: invalid pagination');
    }
    pageCount = pagination.pageCount as number;
    page += 1;
  } while (page <= pageCount);

  if (services.length === 0) throw new Error('Strapi Services: no published services');
  const localAssets = new Set<string>();
  const entries = services.map((item) => toSlide(item, cmsOrigin, localAssets));
  entries.sort((a, b) => a.sortOrder - b.sortOrder || a.slide.id.localeCompare(b.slide.id));
  if (new Set(entries.map(({ slide }) => slide.id)).size !== entries.length) {
    throw new Error('Strapi Services: duplicate service keys');
  }
  if (new Set(entries.map(({ sortOrder }) => sortOrder)).size !== entries.length) {
    throw new Error('Strapi Services: duplicate sortOrder values');
  }

  const sectionUrl = new URL('/api/services-section', cmsUrl);
  sectionUrl.searchParams.set('status', 'published');
  sectionUrl.searchParams.set('filters[closingText][$ne]', buildVersion);
  const section = object((await request(sectionUrl, token)).data, 'section');
  if (!section.publishedAt) throw new Error('Strapi Services: section is not published');

  const publicRoot = path.join(process.cwd(), 'public');
  await Promise.all([...localAssets].map(async (asset) => {
    const file = path.resolve(publicRoot, asset);
    if (!file.startsWith(`${publicRoot}${path.sep}`)) {
      throw new Error(`Strapi Services: unsafe local asset ${asset}`);
    }
    await access(file);
  }));

  return {
    slides: entries.map(({ slide }) => slide),
    closingText: string(section.closingText, 'section.closingText'),
  };
}
