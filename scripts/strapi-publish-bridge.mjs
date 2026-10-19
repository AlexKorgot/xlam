import { createServer } from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';

const secret = process.env.STRAPI_WEBHOOK_SECRET;
const githubToken = process.env.GITHUB_TRIGGER_TOKEN;
const port = Number(process.env.PORT ?? 8787);
const githubApi = process.env.GITHUB_API_URL ?? 'https://api.github.com';
const markerPath = '.strapi-publish-trigger';
const branch = 'strapi-integration';
const repository = 'AlexKorgot/xlam';
const acceptedEvents = new Set(['entry.publish', 'entry.unpublish', 'entry.delete']);
const acceptedModels = new Set([
  'api::project.project',
  'api::service.service',
  'api::services-section.services-section',
  'api::team-member.team-member',
  'api::site-settings.site-settings',
  'api::homepage.homepage',
  'api::seo-settings.seo-settings',
]);

if (!secret || secret.length < 32 || !githubToken) {
  throw new Error('STRAPI_WEBHOOK_SECRET (32+ chars) and GITHUB_TRIGGER_TOKEN are required.');
}
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Invalid PORT.');
}

function send(response, status, message) {
  response.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(`${message}\n`);
}

function validSecret(value) {
  if (typeof value !== 'string') return false;
  const received = Buffer.from(value);
  const expected = Buffer.from(secret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error('Webhook payload is too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function githubRequest(method, url, data) {
  const response = await fetch(url, {
    method,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${githubToken}`,
      'content-type': 'application/json',
      'x-github-api-version': '2026-03-10',
    },
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404 && method === 'GET') return { status: 404 };
  if (!response.ok) {
    throw new Error(`GitHub API returned HTTP ${response.status}.`);
  }
  return { status: response.status, body: await response.json() };
}

async function triggerBuild() {
  const url = `${githubApi}/repos/${repository}/contents/${markerPath}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await githubRequest('GET', `${url}?ref=${branch}`);
    const data = {
      message: 'Build published Strapi content',
      branch,
      content: Buffer.from(`${new Date().toISOString()} ${randomUUID()}\n`).toString('base64'),
      ...(current.status === 404 ? {} : { sha: current.body.sha }),
    };
    try {
      await githubRequest('PUT', url, data);
      return;
    } catch (error) {
      if (attempt === 2 || !String(error).includes('HTTP 409')) throw error;
    }
  }
}

createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== '/strapi-publish') {
    send(response, 404, 'Not found');
    return;
  }
  if (!validSecret(request.headers['x-xlam-webhook-secret'])) {
    send(response, 401, 'Unauthorized');
    return;
  }
  let payload;
  try {
    payload = await readJson(request);
  } catch {
    send(response, 400, 'Invalid JSON payload');
    return;
  }
  if (!payload || !acceptedEvents.has(payload.event) || !acceptedModels.has(payload.uid)) {
    send(response, 204, 'Ignored event');
    return;
  }
  try {
    await triggerBuild();
    console.log(`Queued build for ${payload.event}: ${payload.uid}`);
    send(response, 202, 'Build queued');
  } catch (error) {
    console.error('Unable to queue GitHub build:', error);
    send(response, 503, 'Unable to queue build');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Strapi publish bridge listening on 127.0.0.1:${port}`);
});
