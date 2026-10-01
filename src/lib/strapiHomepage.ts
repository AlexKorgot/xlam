import 'server-only';

import localHomepage from '@/cms/data/homepage.seed.json';
import {
  HOMEPAGE_FEATURE_KEYS,
  HOMEPAGE_STATEMENT_KEYS,
  type HomepageContent,
} from '@/src/lib/homepage.types';

type RecordValue = Record<string, unknown>;

function object(value: unknown, field: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Strapi Homepage: ${field} must be an object`);
  }
  return value as RecordValue;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Strapi Homepage: ${field} must be a non-empty string`);
  }
  return value;
}

function keyedText(
  value: unknown,
  field: string,
  keys: readonly string[],
  textField: string,
): Record<string, string> {
  if (!Array.isArray(value) || value.length !== keys.length) {
    throw new Error(`Strapi Homepage: ${field} must contain ${keys.length} entries`);
  }
  const entries = value.map((item, index) => {
    const entry = object(item, `${field}[${index}]`);
    const key = string(entry.key, `${field}[${index}].key`);
    if (!keys.includes(key)) {
      throw new Error(`Strapi Homepage: unknown ${field} key ${key}`);
    }
    return [key, string(entry[textField], `${field}[${index}].${textField}`)] as const;
  });
  if (new Set(entries.map(([key]) => key)).size !== keys.length) {
    throw new Error(`Strapi Homepage: duplicate or missing ${field} keys`);
  }
  return Object.fromEntries(entries);
}

function toContent(value: unknown): HomepageContent {
  const entry = object(value, 'data');
  if (!entry.publishedAt) {
    throw new Error('Strapi Homepage: Homepage is not published');
  }
  const features = keyedText(entry.whyFeatures, 'whyFeatures', HOMEPAGE_FEATURE_KEYS, 'label');
  const statements = keyedText(entry.statements, 'statements', HOMEPAGE_STATEMENT_KEYS, 'lines');
  const lines = Object.fromEntries(HOMEPAGE_STATEMENT_KEYS.map((key) => {
    const split = statements[key].split(/\r?\n/);
    if (split.some((line) => !line.trim()) || split.length > 4 ||
        (key === 'welcome' && split.length !== 1)) {
      throw new Error(`Strapi Homepage: invalid lines for ${key}`);
    }
    return [key, split];
  })) as HomepageContent['statements'];

  return {
    production: {
      lineOne: string(entry.productionLineOne, 'productionLineOne'),
      lineTwoBeforeHighlight: string(entry.productionLineTwoBeforeHighlight, 'productionLineTwoBeforeHighlight'),
      lineTwoHighlight: string(entry.productionLineTwoHighlight, 'productionLineTwoHighlight'),
      lineTwoAfterHighlight: string(entry.productionLineTwoAfterHighlight, 'productionLineTwoAfterHighlight'),
      lineThree: string(entry.productionLineThree, 'productionLineThree'),
    },
    whyUs: {
      headingBeforeHighlight: string(entry.whyHeadingBeforeHighlight, 'whyHeadingBeforeHighlight'),
      headingHighlight: string(entry.whyHeadingHighlight, 'whyHeadingHighlight'),
      features: features as HomepageContent['whyUs']['features'],
    },
    statements: lines,
  };
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const cmsUrl = process.env.STRAPI_URL?.trim();
  const token = process.env.STRAPI_API_TOKEN?.trim();
  if (!cmsUrl && !token) {
    if (process.env.CI) {
      throw new Error('Strapi Homepage: CI requires STRAPI_URL and STRAPI_API_TOKEN');
    }
    return toContent({ ...localHomepage, publishedAt: 'local' });
  }
  if (!cmsUrl || !token) {
    throw new Error('Strapi Homepage: STRAPI_URL and STRAPI_API_TOKEN must both be set');
  }

  const url = new URL('/api/homepage', cmsUrl);
  url.searchParams.set('status', 'published');
  url.searchParams.set('filters[productionLineOne][$ne]', `__build_${Date.now()}_${crypto.randomUUID()}`);
  url.searchParams.set('populate[whyFeatures]', 'true');
  url.searchParams.set('populate[statements]', 'true');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Strapi Homepage: API returned ${response.status}`);
  }
  const body = object(await response.json(), 'response');
  return toContent(body.data);
}
