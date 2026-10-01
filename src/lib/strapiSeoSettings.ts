import 'server-only';

import localSeoSettings from '@/cms/data/seo-settings.seed.json';

type RecordValue = Record<string, unknown>;

export type SeoSettings = {
  title: string;
  description: string;
};

function object(value: unknown, field: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Strapi SEO Settings: ${field} must be an object`);
  }
  return value as RecordValue;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Strapi SEO Settings: ${field} must be a non-empty string`);
  }
  return value;
}

function toSettings(value: unknown): SeoSettings {
  const entry = object(value, 'data');
  if (!entry.publishedAt) {
    throw new Error('Strapi SEO Settings: SEO Settings are not published');
  }
  return {
    title: string(entry.title, 'title'),
    description: string(entry.description, 'description'),
  };
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const cmsUrl = process.env.STRAPI_URL?.trim();
  const token = process.env.STRAPI_API_TOKEN?.trim();
  if (!cmsUrl && !token) {
    if (process.env.CI) {
      throw new Error('Strapi SEO Settings: CI requires STRAPI_URL and STRAPI_API_TOKEN');
    }
    return toSettings({ ...localSeoSettings, publishedAt: 'local' });
  }
  if (!cmsUrl || !token) {
    throw new Error('Strapi SEO Settings: STRAPI_URL and STRAPI_API_TOKEN must both be set');
  }

  const url = new URL('/api/seo-settings', cmsUrl);
  url.searchParams.set('status', 'published');
  url.searchParams.set('filters[title][$ne]', `__build_${Date.now()}_${crypto.randomUUID()}`);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Strapi SEO Settings: API returned ${response.status}`);
  }
  const body = object(await response.json(), 'response');
  return toSettings(body.data);
}
