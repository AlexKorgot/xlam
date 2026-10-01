import 'server-only';

import { access } from 'node:fs/promises';
import path from 'node:path';
import {
  localTeamMembers,
  type TeamMember,
} from '@/src/components/ui/TeamSection/team.data';
import { publicAssetPath } from '@/src/lib/publicAssetPath';

type RecordValue = Record<string, unknown>;

function object(value: unknown, field: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Strapi Team: ${field} must be an object`);
  }
  return value as RecordValue;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Strapi Team: ${field} must be a non-empty string`);
  }
  return value;
}

function list(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Strapi Team: ${field} must be an array`);
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
    throw new Error(`Strapi Team: ${field} must be HTTPS or a root-relative path`);
  }
  if (!localAsset) return new URL(url, cmsOrigin).toString();

  if (url.includes('?') || url.includes('#') || url.includes('\\')) {
    throw new Error(`Strapi Team: ${field} has an invalid local path`);
  }
  const decodedPath = decodeURIComponent(url.slice(1));
  if (decodedPath.includes('\\') || decodedPath.includes('\0') ||
      decodedPath.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error(`Strapi Team: ${field} has an unsafe local path`);
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
  required: boolean,
): { url: string; media?: RecordValue } | undefined {
  const media = entry[mediaField] == null
    ? undefined
    : object(entry[mediaField], mediaField);
  if (media?.url != null) {
    return {
      url: mediaUrl(media.url, `${mediaField}.url`, cmsOrigin, false, localAssets),
      media,
    };
  }
  const fallback = entry[urlField];
  if (fallback != null && fallback !== '') {
    return { url: mediaUrl(fallback, urlField, cmsOrigin, true, localAssets) };
  }
  if (required) {
    throw new Error(`Strapi Team: ${urlField} or ${mediaField} is required`);
  }
  return undefined;
}

function toMember(
  value: unknown,
  cmsOrigin: string,
  localAssets: Set<string>,
): { member: TeamMember; sortOrder: number } {
  const entry = object(value, 'team member');
  const key = string(entry.key, 'key');
  if (!/^[a-z0-9-]+$/.test(key)) {
    throw new Error(`Strapi Team: invalid key ${key}`);
  }
  if (!entry.publishedAt) throw new Error(`Strapi Team: ${key} is not published`);
  if (!Number.isInteger(entry.sortOrder) || (entry.sortOrder as number) < 0) {
    throw new Error(`Strapi Team: ${key} has invalid sortOrder`);
  }

  const portrait = source(entry, 'portraitUrl', 'portrait', cmsOrigin, localAssets, true)!;
  const video = source(entry, 'videoUrl', 'video', cmsOrigin, localAssets, false);
  const width = portrait.media?.width;
  const height = portrait.media?.height;
  const hasDimensions = Number.isInteger(width) && (width as number) > 0 &&
    Number.isInteger(height) && (height as number) > 0;

  return {
    sortOrder: entry.sortOrder as number,
    member: {
      id: key,
      name: string(entry.name, `${key}.name`),
      role: string(entry.role, `${key}.role`),
      image: {
        src: portrait.url,
        width: hasDimensions ? width as number : 460,
        height: hasDimensions ? height as number : 800,
      },
      videoSrc: video?.url,
    },
  };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const cmsUrl = process.env.STRAPI_URL?.trim();
  const token = process.env.STRAPI_API_TOKEN?.trim();
  if (!cmsUrl && !token) {
    if (process.env.CI) {
      throw new Error('Strapi Team: CI requires STRAPI_URL and STRAPI_API_TOKEN');
    }
    return localTeamMembers;
  }
  if (!cmsUrl || !token) {
    throw new Error('Strapi Team: STRAPI_URL and STRAPI_API_TOKEN must both be set');
  }

  const cmsOrigin = new URL(cmsUrl).origin;
  const buildVersion = `__build_${Date.now()}_${crypto.randomUUID()}`;
  const members: unknown[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const url = new URL('/api/team-members', cmsUrl);
    url.searchParams.set('status', 'published');
    url.searchParams.set('filters[key][$ne]', buildVersion);
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    url.searchParams.set('populate[portrait]', 'true');
    url.searchParams.set('populate[video]', 'true');

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Strapi Team: API returned ${response.status}`);
    const body = object(await response.json(), 'response');
    members.push(...list(body.data, 'response.data'));
    const pagination = object(object(body.meta, 'response.meta').pagination, 'response.meta.pagination');
    if (!Number.isInteger(pagination.pageCount) || (pagination.pageCount as number) < 0) {
      throw new Error('Strapi Team: invalid pagination');
    }
    pageCount = pagination.pageCount as number;
    page += 1;
  } while (page <= pageCount);

  if (members.length === 0) throw new Error('Strapi Team: no published team members');
  const localAssets = new Set<string>();
  const entries = members.map((member) => toMember(member, cmsOrigin, localAssets));
  entries.sort((a, b) => a.sortOrder - b.sortOrder || a.member.id.localeCompare(b.member.id));
  if (new Set(entries.map(({ member }) => member.id)).size !== entries.length) {
    throw new Error('Strapi Team: duplicate member keys');
  }
  if (new Set(entries.map(({ sortOrder }) => sortOrder)).size !== entries.length) {
    throw new Error('Strapi Team: duplicate sortOrder values');
  }

  const publicRoot = path.resolve(process.cwd(), 'public');
  await Promise.all([...localAssets].map(async (asset) => {
    const file = path.resolve(publicRoot, asset);
    if (!file.startsWith(`${publicRoot}${path.sep}`)) {
      throw new Error(`Strapi Team: unsafe local asset ${asset}`);
    }
    await access(file);
  }));

  return entries.map(({ member }) => member);
}
