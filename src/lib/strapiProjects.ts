import 'server-only';

import { cinematicSlides } from '@/src/components/cinematic_new/data';
import type { CinematicSlide } from '@/src/components/cinematic_new/types';
import { publicAssetPath } from '@/src/lib/publicAssetPath';

type RecordValue = Record<string, unknown>;

const presentationByKey = new Map(
  cinematicSlides.map((slide) => [slide.id, {
    accent: slide.accent,
    thumbnailCount: slide.opened.thumbnailCount,
    videoObjectPosition: slide.videoObjectPosition,
  }]),
);

function object(value: unknown, field: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Strapi Projects: ${field} must be an object`);
  }
  return value as RecordValue;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Strapi Projects: ${field} must be a non-empty string`);
  }
  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  return value == null || value === '' ? undefined : string(value, field);
}

function list(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Strapi Projects: ${field} must be an array`);
  }
  return value;
}

function mediaUrl(
  value: unknown,
  field: string,
  cmsOrigin: string,
  localAsset = false,
): string {
  const url = string(value, field);
  if (/^https:\/\//i.test(url)) return url;
  if (/^http:\/\//i.test(url) && new URL(url).hostname === '127.0.0.1') return url;
  if (!url.startsWith('/') || url.startsWith('//')) {
    throw new Error(`Strapi Projects: ${field} must be an absolute URL or a root-relative path`);
  }
  return localAsset ? publicAssetPath(url as `/${string}`) : new URL(url, cmsOrigin).toString();
}

function projectMedia(
  entry: RecordValue,
  urlField: string,
  mediaField: string,
  cmsOrigin: string,
  required: boolean,
): string | undefined {
  const media = entry[mediaField] == null ? undefined : object(entry[mediaField], mediaField);
  if (media?.url != null) return mediaUrl(media.url, `${mediaField}.url`, cmsOrigin);
  const fallback = optionalString(entry[urlField], urlField);
  if (fallback) return mediaUrl(fallback, urlField, cmsOrigin, true);
  if (required) throw new Error(`Strapi Projects: ${urlField} or ${mediaField} is required`);
  return undefined;
}

function toSlide(value: unknown, cmsOrigin: string): { slide: CinematicSlide; sortOrder: number } {
  const entry = object(value, 'entry');
  const key = string(entry.key, 'key');
  if (!entry.publishedAt) throw new Error(`Strapi Projects: ${key} is not published`);
  const sortOrder = entry.sortOrder;
  if (!Number.isInteger(sortOrder)) throw new Error(`Strapi Projects: ${key} has invalid sortOrder`);

  const presentation = presentationByKey.get(key);
  const tags = list(entry.tags, `${key}.tags`).map((item, index) =>
    string(object(item, `${key}.tags[${index}]`).text, `${key}.tags[${index}].text`),
  );
  const services = list(entry.services, `${key}.services`).map((item, index) =>
    string(object(item, `${key}.services[${index}]`).text, `${key}.services[${index}].text`),
  );
  const previews = list(entry.previews, `${key}.previews`).map((item, index) => {
    const preview = object(item, `${key}.previews[${index}]`);
    const image = preview.image == null ? undefined : object(preview.image, `${key}.previews[${index}].image`);
    const src = image?.url != null
      ? mediaUrl(image.url, `${key}.previews[${index}].image.url`, cmsOrigin)
      : mediaUrl(preview.url, `${key}.previews[${index}].url`, cmsOrigin, true);
    return { src, alt: string(preview.alt, `${key}.previews[${index}].alt`) };
  });
  const videoSrc = projectMedia(entry, 'videoUrl', 'video', cmsOrigin, true)!;
  const posterSrc = projectMedia(entry, 'posterUrl', 'poster', cmsOrigin, true)!;

  return {
    sortOrder: sortOrder as number,
    slide: {
      id: key,
      eyebrow: string(entry.eyebrow, `${key}.eyebrow`),
      title: string(entry.title, `${key}.title`),
      description: string(entry.description, `${key}.description`),
      tags,
      client: string(entry.client, `${key}.client`),
      year: string(entry.year, `${key}.year`),
      accent: presentation?.accent ?? '#66ff66',
      videoSrc,
      mobileVideoSrc: projectMedia(entry, 'mobileVideoUrl', 'mobileVideo', cmsOrigin, false),
      posterSrc,
      videoObjectPosition: presentation?.videoObjectPosition ?? [0.5, 0.58],
      opened: {
        titleLead: string(entry.openedTitleLead, `${key}.openedTitleLead`),
        titleAccent: string(entry.openedTitleAccent, `${key}.openedTitleAccent`),
        body: string(entry.openedBody, `${key}.openedBody`),
        secondaryBody: optionalString(entry.openedSecondaryBody, `${key}.openedSecondaryBody`),
        services,
        previews,
        navLabel: string(entry.navLabel, `${key}.navLabel`),
        thumbnailCount: presentation?.thumbnailCount ?? Math.max(2, previews.length),
      },
    },
  };
}

export async function getProjectSlides(): Promise<CinematicSlide[]> {
  const cmsUrl = process.env.STRAPI_URL?.trim();
  const token = process.env.STRAPI_API_TOKEN?.trim();
  if (!cmsUrl && !token) {
    if (process.env.CI) {
      throw new Error('Strapi Projects: CI requires STRAPI_URL and STRAPI_API_TOKEN');
    }
    return cinematicSlides;
  }
  if (!cmsUrl || !token) {
    throw new Error('Strapi Projects: STRAPI_URL and STRAPI_API_TOKEN must both be set');
  }

  const origin = new URL(cmsUrl).origin;
  const projects: unknown[] = [];
  // A harmless unique filter prevents Next's persistent fetch cache from reusing older content.
  const buildVersion = `__build_${Date.now()}_${crypto.randomUUID()}`;
  let page = 1;
  let pageCount = 1;
  do {
    const url = new URL('/api/projects', cmsUrl);
    url.searchParams.set('status', 'published');
    url.searchParams.set('filters[key][$ne]', buildVersion);
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    for (const field of ['tags', 'services', 'video', 'mobileVideo', 'poster']) {
      url.searchParams.set(`populate[${field}]`, 'true');
    }
    url.searchParams.set('populate[previews][populate][image]', 'true');
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Strapi Projects: API returned ${response.status}`);
    const body = object(await response.json(), 'response');
    projects.push(...list(body.data, 'response.data'));
    const pagination = object(object(body.meta, 'response.meta').pagination, 'response.meta.pagination');
    if (!Number.isInteger(pagination.pageCount) || (pagination.pageCount as number) < 0) {
      throw new Error('Strapi Projects: invalid pagination');
    }
    pageCount = pagination.pageCount as number;
    page += 1;
  } while (page <= pageCount);

  if (projects.length === 0) throw new Error('Strapi Projects: no published projects');
  const entries = projects.map((project) => toSlide(project, origin));
  entries.sort((a, b) => a.sortOrder - b.sortOrder || a.slide.id.localeCompare(b.slide.id));
  if (new Set(entries.map(({ slide }) => slide.id)).size !== entries.length) {
    throw new Error('Strapi Projects: duplicate project keys');
  }
  return entries.map(({ slide }) => slide);
}
