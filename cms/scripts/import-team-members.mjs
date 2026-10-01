import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cmsRoot = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = path.resolve(cmsRoot, '../public');
const seedPath = fileURLToPath(new URL('../data/team-members.seed.json', import.meta.url));
const seed = JSON.parse(await readFile(seedPath, 'utf8'));
const args = process.argv.slice(2);

if (args.some((arg) => arg !== '--apply-local')) {
  throw new Error('Only --apply-local is supported; omit it for a dry run');
}

if (!Array.isArray(seed.members) || seed.members.length === 0) {
  throw new Error('Team seed requires a non-empty members array');
}

const keys = new Set();
const positions = new Set();
for (const member of seed.members) {
  if (!member || typeof member !== 'object' || Array.isArray(member) ||
      typeof member.key !== 'string' || !/^[a-z0-9-]+$/.test(member.key)) {
    throw new Error('Team member has an invalid key');
  }
  if (keys.has(member.key)) throw new Error(`Duplicate team key: ${member.key}`);
  keys.add(member.key);

  if (!Number.isInteger(member.sortOrder) || member.sortOrder < 0 ||
      positions.has(member.sortOrder)) {
    throw new Error(`Team member ${member.key}: invalid or duplicate sortOrder`);
  }
  positions.add(member.sortOrder);

  for (const field of ['name', 'role', 'portraitUrl']) {
    if (typeof member[field] !== 'string' || !member[field].trim()) {
      throw new Error(`Team member ${member.key}: missing ${field}`);
    }
  }
  for (const field of ['portraitUrl', 'videoUrl']) {
    const url = member[field];
    if (url == null) continue;
    if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//') ||
        /[?#\\]/.test(url)) {
      throw new Error(`Team member ${member.key}: invalid ${field}`);
    }
    const decodedPath = decodeURIComponent(url.slice(1));
    if (decodedPath.split('/').some((part) => part === '.' || part === '..')) {
      throw new Error(`Team member ${member.key}: unsafe ${field}`);
    }
    const file = path.resolve(publicRoot, decodedPath);
    if (!file.startsWith(`${publicRoot}${path.sep}`)) {
      throw new Error(`Team member ${member.key}: unsafe ${field}`);
    }
    await access(file);
  }
}

const members = [...seed.members].sort((a, b) => a.sortOrder - b.sortOrder);
console.log(`Validated ${members.length} Team Members: ${members.map(({ key }) => key).join(', ')}`);
if (!args.includes('--apply-local')) {
  console.log('Dry run. Pass --apply-local to create drafts in the local SQLite database.');
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
  const documents = app.documents('api::team-member.team-member');
  for (const member of members) {
    const filters = { key: member.key };
    const existingDraft = await documents.findFirst({ filters, status: 'draft' });
    const existingPublished = await documents.findFirst({ filters, status: 'published' });
    if (existingDraft || existingPublished) {
      console.log(`Skipped existing team member: ${member.key}`);
      continue;
    }
    const created = await documents.create({ data: member, status: 'draft' });
    if (!created?.documentId || created.publishedAt !== null) {
      throw new Error(`Draft creation could not be verified for ${member.key}`);
    }
    console.log(`Created draft: ${member.key}`);
  }
} finally {
  await app.destroy();
}
process.exit(0);
