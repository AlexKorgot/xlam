import { validateProjects } from './project-data.mjs';

const baseUrl = process.env.CMS_BASE_URL;
const token = process.env.CMS_READ_TOKEN;
if (!baseUrl || !token) throw new Error('CMS_BASE_URL and CMS_READ_TOKEN are required');
const projects = [];
let page = 1;
let pageCount;

do {
  const url = new URL('/api/projects', baseUrl);
  url.searchParams.set('status', 'published');
  url.searchParams.set('sort[0]', 'sortOrder:asc');
  url.searchParams.set('pagination[page]', String(page));
  url.searchParams.set('pagination[pageSize]', '100');
  for (const field of ['tags', 'services', 'video', 'mobileVideo', 'poster']) {
    url.searchParams.set(`populate[${field}]`, 'true');
  }
  url.searchParams.set('populate[previews][populate][image]', 'true');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Strapi request failed: HTTP ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload.data)) throw new Error('Unexpected Strapi list response');
  for (const project of payload.data) {
    if (!project.publishedAt) throw new Error(`Unpublished project in published response: ${project.key}`);
    projects.push(project);
  }
  pageCount = payload.meta?.pagination?.pageCount;
  if (!Number.isInteger(pageCount)) throw new Error('Missing Strapi pagination metadata');
  page += 1;
} while (page <= pageCount);

const sorted = validateProjects(projects);
console.log(`Validated ${sorted.length} published Projects: ${sorted.map((item) => item.key).join(', ')}`);
