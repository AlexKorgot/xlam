import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateProjects } from './project-data.mjs';

const fixturePath = fileURLToPath(new URL('../data/projects.seed.json', import.meta.url));
const projects = validateProjects(JSON.parse(await readFile(fixturePath, 'utf8')));
const apply = process.argv.includes('--apply');

if (!apply) {
  console.log(`Validated ${projects.length} Projects: ${projects.map((item) => item.key).join(', ')}`);
  console.log('Dry run. Pass --apply with CMS_BASE_URL and CMS_WRITE_TOKEN to create drafts.');
  process.exit(0);
}

const baseUrl = process.env.CMS_BASE_URL;
const token = process.env.CMS_WRITE_TOKEN;
if (!baseUrl || !token) throw new Error('CMS_BASE_URL and CMS_WRITE_TOKEN are required');
const endpoint = new URL('/api/projects', baseUrl);
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`Strapi request failed: HTTP ${response.status}`);
  }
  return response.json();
}

for (const project of projects) {
  const lookup = new URL(endpoint);
  lookup.searchParams.set('status', 'draft');
  lookup.searchParams.set('filters[key][$eq]', project.key);
  lookup.searchParams.set('pagination[pageSize]', '2');
  const existing = await request(lookup);
  if (!Array.isArray(existing.data)) throw new Error('Unexpected Strapi list response');
  if (existing.data.length > 1) throw new Error(`Multiple entries for ${project.key}`);
  if (existing.data.length === 1) {
    console.log(`Skipped existing draft: ${project.key}`);
    continue;
  }

  const create = new URL(endpoint);
  create.searchParams.set('status', 'draft');
  const result = await request(create, {
    method: 'POST',
    body: JSON.stringify({ data: project }),
  });
  if (!result.data?.documentId || result.data.publishedAt !== null) {
    throw new Error(`Draft creation could not be verified for ${project.key}`);
  }
  console.log(`Created draft: ${project.key}`);
}
