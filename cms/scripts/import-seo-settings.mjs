import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cmsRoot = fileURLToPath(new URL('../', import.meta.url));
const seedPath = fileURLToPath(new URL('../data/seo-settings.seed.json', import.meta.url));
const seed = JSON.parse(await readFile(seedPath, 'utf8'));
const args = process.argv.slice(2);

if (args.some((arg) => arg !== '--apply-local')) {
  throw new Error('Only --apply-local is supported; omit it for a dry run');
}
for (const field of ['title', 'description']) {
  if (typeof seed[field] !== 'string' || !seed[field].trim()) {
    throw new Error(`SEO Settings: missing ${field}`);
  }
}

console.log('Validated SEO title and description');
if (!args.includes('--apply-local')) {
  console.log('Dry run. Pass --apply-local to create and publish only if local SEO Settings are empty.');
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
  const documents = app.documents('api::seo-settings.seo-settings');
  const existingDraft = await documents.findFirst({ status: 'draft' });
  const existingPublished = await documents.findFirst({ status: 'published' });
  if (existingDraft || existingPublished) {
    console.log('Skipped existing SEO Settings; no content was overwritten or published');
  } else {
    const created = await documents.create({ data: seed, status: 'draft' });
    if (!created?.documentId || created.publishedAt !== null) {
      throw new Error('SEO Settings draft creation could not be verified');
    }
    await documents.publish({ documentId: created.documentId });
    const published = await documents.findFirst({ status: 'published' });
    if (!published?.publishedAt) {
      throw new Error('SEO Settings publication could not be verified');
    }
    console.log('Created and published local SEO Settings');
  }
} finally {
  await app.destroy();
}
process.exit(0);
