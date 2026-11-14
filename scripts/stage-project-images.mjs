import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const directory = process.argv[2];
const base = process.env.STRAPI_URL;
const token = process.env.STRAPI_API_TOKEN;
if (!directory || !base || !token) throw new Error('Project image staging requires a directory and Strapi configuration.');
const origin = new URL(base).origin;
const names = new Set();
let page = 1;
let pages = 1;
do {
  const url = new URL('/api/projects', origin);
  url.searchParams.set('status', 'published');
  url.searchParams.set('pagination[page]', String(page));
  url.searchParams.set('pagination[pageSize]', '100');
  url.searchParams.set('populate[previews][populate][image]', 'true');
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Project image list returned HTTP ${response.status}.`);
  const data = await response.json();
  if (!Array.isArray(data.data) || !Number.isInteger(data.meta?.pagination?.pageCount)) {
    throw new Error('Invalid project image list.');
  }
  for (const project of data.data) {
    if (!Array.isArray(project.previews)) throw new Error('Invalid project previews.');
    for (const preview of project.previews) {
      const src = preview.image?.url;
      if (typeof src !== 'string' || !src.startsWith('/uploads/')) continue;
      const name = src.slice('/uploads/'.length);
      if (!/^[a-zA-Z0-9._-]+$/.test(name) || name === '.' || name === '..') {
        throw new Error('Invalid uploaded project image name.');
      }
      names.add(name);
    }
  }
  pages = data.meta.pagination.pageCount;
  page += 1;
} while (page <= pages);

await mkdir(directory, { recursive: true });
for (const name of names) {
  const url = new URL(`/uploads/${name}`, origin);
  const response = await fetch(url, { redirect: 'error' });
  if (!response.ok) throw new Error(`Project image ${name} returned HTTP ${response.status}.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error(`Project image ${name} is empty.`);
  await writeFile(path.join(directory, name), bytes, { flag: 'wx' });
}
console.log(`Staged ${names.size} uploaded project images.`);
