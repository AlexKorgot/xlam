import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cmsRoot = fileURLToPath(new URL('../', import.meta.url));
const seedPath = fileURLToPath(new URL('../data/site-settings.seed.json', import.meta.url));
const seed = JSON.parse(await readFile(seedPath, 'utf8'));
const args = process.argv.slice(2);

if (args.some((arg) => arg !== '--apply-local')) {
  throw new Error('Only --apply-local is supported; omit it for a dry run');
}

for (const field of ['contactTitle', 'contactDescription', 'phoneNumber', 'emailAddress']) {
  if (typeof seed[field] !== 'string' || !seed[field].trim()) {
    throw new Error(`Site Settings: missing ${field}`);
  }
}
if (!/^\+?[\d\s()\-]{7,}$/.test(seed.phoneNumber) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(seed.emailAddress)) {
  throw new Error('Site Settings: invalid phone number or email address');
}
if (!Array.isArray(seed.socialLinks) || seed.socialLinks.length === 0) {
  throw new Error('Site Settings: socialLinks must be a non-empty array');
}
const labels = new Set();
for (const link of seed.socialLinks) {
  if (!link || typeof link.label !== 'string' || !link.label.trim() ||
      !['left', 'right'].includes(link.column) || labels.has(link.label)) {
    throw new Error('Site Settings: invalid or duplicate social link');
  }
  labels.add(link.label);
  if (link.url !== undefined &&
      (typeof link.url !== 'string' || new URL(link.url).protocol !== 'https:')) {
    throw new Error(`Site Settings: ${link.label} must use an HTTPS link`);
  }
}

console.log(`Validated Site Settings and ${seed.socialLinks.length} social links`);
if (!args.includes('--apply-local')) {
  console.log('Dry run. Pass --apply-local to create and publish only if local Site Settings are empty.');
  process.exit(0);
}

process.loadEnvFile(path.join(cmsRoot, '.env'));
const databasePath = path.resolve(cmsRoot, process.env.DATABASE_FILENAME ?? '');
if (process.env.DATABASE_CLIENT !== 'sqlite' ||
    databasePath !== path.join(cmsRoot, '.tmp', 'local-check.db')) {
  throw new Error('--apply-local is restricted to cms/.tmp/local-check.db (SQLite)');
}

const { compileStrapi, createStrapi } = createRequire(import.meta.url)('@strapi/core');
const app = await createStrapi(await compileStrapi({ appDir: cmsRoot })).load();
try {
  const documents = app.documents('api::site-settings.site-settings');
  const existingDraft = await documents.findFirst({ status: 'draft' });
  const existingPublished = await documents.findFirst({ status: 'published' });
  if (existingDraft || existingPublished) {
    console.log('Skipped existing Site Settings; no content was overwritten or published');
  } else {
    const created = await documents.create({ data: seed, status: 'draft' });
    if (!created?.documentId || created.publishedAt !== null) {
      throw new Error('Site Settings draft creation could not be verified');
    }
    await documents.publish({ documentId: created.documentId });
    const published = await documents.findFirst({ status: 'published' });
    if (!published?.publishedAt) {
      throw new Error('Site Settings publication could not be verified');
    }
    console.log('Created and published local Site Settings');
  }
} finally {
  await app.destroy();
}
process.exit(0);
