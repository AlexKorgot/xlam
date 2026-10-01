import 'server-only';

import localSettings from '@/cms/data/site-settings.seed.json';
import type { SiteSettings, SocialLink } from '@/src/lib/siteSettings.types';

type RecordValue = Record<string, unknown>;

function object(value: unknown, field: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Strapi Site Settings: ${field} must be an object`);
  }
  return value as RecordValue;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Strapi Site Settings: ${field} must be a non-empty string`);
  }
  return value;
}

function toSettings(value: unknown): SiteSettings {
  const entry = object(value, 'data');
  if (!entry.publishedAt) {
    throw new Error('Strapi Site Settings: Site Settings are not published');
  }
  const phoneNumber = string(entry.phoneNumber, 'phoneNumber');
  const emailAddress = string(entry.emailAddress, 'emailAddress');
  if (!/^\+?[\d\s()\-]{7,}$/.test(phoneNumber)) {
    throw new Error('Strapi Site Settings: invalid phoneNumber');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
    throw new Error('Strapi Site Settings: invalid emailAddress');
  }

  if (!Array.isArray(entry.socialLinks) || entry.socialLinks.length === 0) {
    throw new Error('Strapi Site Settings: socialLinks must be a non-empty array');
  }
  const socialLinks: SocialLink[] = entry.socialLinks.map((value, index) => {
    const link = object(value, `socialLinks[${index}]`);
    const label = string(link.label, `socialLinks[${index}].label`);
    const column = string(link.column, `socialLinks[${index}].column`);
    if (column !== 'left' && column !== 'right') {
      throw new Error(`Strapi Site Settings: invalid column for ${label}`);
    }
    const url = link.url == null || link.url === ''
      ? undefined
      : string(link.url, `socialLinks[${index}].url`);
    if (url && new URL(url).protocol !== 'https:') {
      throw new Error(`Strapi Site Settings: ${label} must use an HTTPS URL`);
    }
    return { label, column, url };
  });
  if (new Set(socialLinks.map(({ label }) => label)).size !== socialLinks.length) {
    throw new Error('Strapi Site Settings: duplicate social labels');
  }

  return {
    contactTitle: string(entry.contactTitle, 'contactTitle'),
    contactDescription: string(entry.contactDescription, 'contactDescription'),
    phoneNumber,
    emailAddress,
    socialLinks,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const cmsUrl = process.env.STRAPI_URL?.trim();
  const token = process.env.STRAPI_API_TOKEN?.trim();
  if (!cmsUrl && !token) {
    if (process.env.CI) {
      throw new Error('Strapi Site Settings: CI requires STRAPI_URL and STRAPI_API_TOKEN');
    }
    return localSettings as SiteSettings;
  }
  if (!cmsUrl || !token) {
    throw new Error('Strapi Site Settings: STRAPI_URL and STRAPI_API_TOKEN must both be set');
  }

  const url = new URL('/api/site-settings', cmsUrl);
  url.searchParams.set('status', 'published');
  url.searchParams.set('filters[contactTitle][$ne]', `__build_${Date.now()}_${crypto.randomUUID()}`);
  url.searchParams.set('populate[socialLinks]', 'true');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Strapi Site Settings: API returned ${response.status}`);
  }
  const body = object(await response.json(), 'response');
  return toSettings(body.data);
}
