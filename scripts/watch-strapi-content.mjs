import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';

const sourceDir = '/srv/xlam-deploy/source';
const statePath = '/srv/xlam-deploy/published-content.sha256';
const cmsOrigin = 'https://cms.xlam.media';
const intervalMs = 60_000;
const failedBuildRetryMs = 5 * 60_000;
const token = process.env.STRAPI_API_TOKEN;
const collections = ['projects', 'services', 'team-members'];
const singleTypes = ['homepage', 'services-section', 'site-settings', 'seo-settings'];

if (!token || process.env.XLAM_ACTIVATE === undefined) {
  throw new Error('STRAPI_API_TOKEN and XLAM_ACTIVATE are required.');
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)])
    );
  }
  return value;
}

async function getJson(path, parameters) {
  const url = new URL(path, cmsOrigin);
  url.search = parameters.toString();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  return response.json();
}

async function collectionSnapshot(name) {
  const entries = [];
  let page = 1;
  let pageCount = 1;
  while (page <= pageCount) {
    const parameters = new URLSearchParams({
      status: 'published',
      'pagination[page]': String(page),
      'pagination[pageSize]': '100',
    });
    const body = await getJson(`/api/${name}`, parameters);
    if (!Array.isArray(body.data) || !Number.isInteger(body.meta?.pagination?.pageCount)) {
      throw new Error(`${name} returned an invalid collection response`);
    }
    entries.push(...body.data);
    pageCount = body.meta.pagination.pageCount;
    page += 1;
  }
  entries.sort((left, right) => String(left.documentId).localeCompare(String(right.documentId)));
  return entries;
}

async function publishedDigest() {
  const results = await Promise.all([
    ...collections.map(async (name) => [name, await collectionSnapshot(name)]),
    ...singleTypes.map(async (name) => {
      const body = await getJson(`/api/${name}`, new URLSearchParams({ status: 'published' }));
      if (!Object.hasOwn(body, 'data')) throw new Error(`${name} returned an invalid single type response`);
      return [name, body.data];
    }),
  ]);
  return createHash('sha256').update(JSON.stringify(canonical(Object.fromEntries(results)))).digest('hex');
}

async function savedDigest() {
  try {
    return (await readFile(statePath, 'utf8')).trim();
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function saveDigest(digest) {
  const temporary = `${statePath}.${process.pid}.tmp`;
  await writeFile(temporary, `${digest}\n`, { mode: 0o600 });
  await rename(temporary, statePath);
}

async function buildSite() {
  await new Promise((resolve, reject) => {
    const child = spawn('bash', ['scripts/build-strapi-on-vps.sh'], {
      cwd: sourceDir,
      env: process.env,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Static build exited with ${signal || `code ${code}`}`));
    });
  });
}

let failedDigest;
let retryAfter = 0;

async function poll() {
  const latest = await publishedDigest();
  const previous = await savedDigest();
  if (previous === null) {
    await saveDigest(latest);
    console.log('Recorded initial published Strapi content.');
  } else if (latest !== previous) {
    if (latest === failedDigest && Date.now() < retryAfter) return;
    console.log('Published Strapi content changed; building the static site.');
    try {
      await buildSite();
    } catch (error) {
      failedDigest = latest;
      retryAfter = Date.now() + failedBuildRetryMs;
      throw error;
    }
    await saveDigest(latest);
    failedDigest = undefined;
    console.log('Static build completed and published content recorded.');
  }
}

if (process.argv.includes('--once')) {
  await poll();
} else {
  console.log('Watching published Strapi content every 60 seconds.');
  for (;;) {
    try {
      await poll();
    } catch (error) {
      console.error('Strapi content check failed:', error);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
