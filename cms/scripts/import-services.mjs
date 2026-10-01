import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateServicesSeed } from './service-data.mjs';

const seedPath = fileURLToPath(new URL('../data/services.seed.json', import.meta.url));
const publicRoot = path.resolve(fileURLToPath(new URL('../../public/', import.meta.url)));
const { section, services } = validateServicesSeed(JSON.parse(await readFile(seedPath, 'utf8')));

for (const service of services) {
  for (const field of [
    'cardVideoUrl', 'cardPosterDesktopUrl', 'cardPosterMobileUrl',
    'detailBackgroundDesktopUrl', 'detailBackgroundMobileUrl',
  ]) {
    const url = service[field];
    if (!url?.startsWith('/')) continue;
    const filePath = path.resolve(publicRoot, url.slice(1));
    if (!filePath.startsWith(`${publicRoot}${path.sep}`)) {
      throw new Error(`Service ${service.key}: unsafe local path in ${field}`);
    }
    await access(filePath);
  }
}

const apply = process.argv.includes('--apply');
console.log(`Validated ${services.length} Services and the section text: ${services.map(({ key }) => key).join(', ')}`);
if (!apply) {
  console.log('Dry run. Pass --apply with CMS_BASE_URL and CMS_WRITE_TOKEN to create drafts locally.');
  process.exit(0);
}

const baseUrl = process.env.CMS_BASE_URL;
const token = process.env.CMS_WRITE_TOKEN;
if (!baseUrl || !token) throw new Error('CMS_BASE_URL and CMS_WRITE_TOKEN are required');
const cmsOrigin = new URL(baseUrl);
if (!['http:', 'https:'].includes(cmsOrigin.protocol)) {
  throw new Error('CMS_BASE_URL must use HTTP or HTTPS');
}
if (!['127.0.0.1', 'localhost'].includes(cmsOrigin.hostname) &&
    !process.argv.includes('--allow-remote')) {
  throw new Error('Remote CMS import requires the explicit --allow-remote flag');
}

const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
async function request(url, options = {}, allowMissing = false) {
  const response = await fetch(url, { ...options, headers });
  if (allowMissing && response.status === 404) return null;
  if (!response.ok) throw new Error(`Strapi request failed: HTTP ${response.status}`);
  return response.json();
}

const servicesEndpoint = new URL('/api/services', cmsOrigin);
for (const service of services) {
  const lookup = new URL(servicesEndpoint);
  lookup.searchParams.set('status', 'draft');
  lookup.searchParams.set('filters[key][$eq]', service.key);
  lookup.searchParams.set('pagination[pageSize]', '2');
  const existing = await request(lookup);
  if (!Array.isArray(existing.data)) throw new Error('Unexpected Strapi services response');
  if (existing.data.length > 1) throw new Error(`Multiple entries for ${service.key}`);
  if (existing.data.length === 1) {
    console.log(`Skipped existing draft: ${service.key}`);
    continue;
  }

  const create = new URL(servicesEndpoint);
  create.searchParams.set('status', 'draft');
  const result = await request(create, {
    method: 'POST',
    body: JSON.stringify({ data: service }),
  });
  if (!result.data?.documentId || result.data.publishedAt !== null) {
    throw new Error(`Draft creation could not be verified for ${service.key}`);
  }
  console.log(`Created draft: ${service.key}`);
}

const sectionEndpoint = new URL('/api/services-section', cmsOrigin);
sectionEndpoint.searchParams.set('status', 'draft');
const existingSection = await request(sectionEndpoint, {}, true);
if (existingSection?.data) {
  console.log('Skipped existing Services Section draft');
} else {
  const result = await request(sectionEndpoint, {
    method: 'PUT',
    body: JSON.stringify({ data: section }),
  });
  if (!result.data?.documentId || result.data.publishedAt !== null) {
    throw new Error('Services Section draft creation could not be verified');
  }
  console.log('Created Services Section draft');
}
