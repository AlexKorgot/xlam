import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cmsRoot = fileURLToPath(new URL('../', import.meta.url));
const seedPath = fileURLToPath(new URL('../data/homepage.seed.json', import.meta.url));
const seed = JSON.parse(await readFile(seedPath, 'utf8'));
const args = process.argv.slice(2);
const featureKeys = ['equipment', 'format', 'worlds', 'contractor', 'senior', 'platforms', 'ai', 'scale', 'cycle'];
const statementKeys = ['smooth', 'noise', 'idea', 'welcome'];

if (args.some((arg) => arg !== '--apply-local')) {
  throw new Error('Only --apply-local is supported; omit it for a dry run');
}

for (const field of [
  'productionLineOne', 'productionLineTwoBeforeHighlight',
  'productionLineTwoHighlight', 'productionLineTwoAfterHighlight',
  'productionLineThree', 'whyHeadingBeforeHighlight', 'whyHeadingHighlight',
]) {
  if (typeof seed[field] !== 'string' || !seed[field].trim()) {
    throw new Error(`Homepage: missing ${field}`);
  }
}
for (const [field, keys, textField] of [
  ['whyFeatures', featureKeys, 'label'],
  ['statements', statementKeys, 'lines'],
]) {
  const entries = seed[field];
  if (!Array.isArray(entries) || entries.length !== keys.length ||
      new Set(entries.map((entry) => entry.key)).size !== keys.length ||
      entries.some((entry) => !keys.includes(entry.key) ||
        typeof entry[textField] !== 'string' || !entry[textField].trim())) {
    throw new Error(`Homepage: ${field} must contain every fixed slot exactly once`);
  }
}
for (const statement of seed.statements) {
  const lines = statement.lines.split('\n');
  if (lines.some((line) => !line.trim()) || lines.length > 4 ||
      (statement.key === 'welcome' && lines.length !== 1)) {
    throw new Error(`Homepage: invalid lines for ${statement.key}`);
  }
}

console.log('Validated Homepage headings, 9 features and 4 statements');
if (!args.includes('--apply-local')) {
  console.log('Dry run. Pass --apply-local to create and publish only if local Homepage is empty.');
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
  const documents = app.documents('api::homepage.homepage');
  const existingDraft = await documents.findFirst({ status: 'draft' });
  const existingPublished = await documents.findFirst({ status: 'published' });
  if (existingDraft || existingPublished) {
    console.log('Skipped existing Homepage; no content was overwritten or published');
  } else {
    const created = await documents.create({ data: seed, status: 'draft' });
    if (!created?.documentId || created.publishedAt !== null) {
      throw new Error('Homepage draft creation could not be verified');
    }
    await documents.publish({ documentId: created.documentId });
    const published = await documents.findFirst({ status: 'published' });
    if (!published?.publishedAt) {
      throw new Error('Homepage publication could not be verified');
    }
    console.log('Created and published local Homepage');
  }
} finally {
  await app.destroy();
}
process.exit(0);
