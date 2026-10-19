import { spawn } from 'node:child_process';
import { timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

const secret = process.env.STRAPI_WEBHOOK_SECRET;
const token = process.env.STRAPI_API_TOKEN;
const port = Number(process.env.PORT ?? 8787);
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

if (!secret || secret.length < 32 || !token) {
  throw new Error('STRAPI_WEBHOOK_SECRET (32+ chars) and STRAPI_API_TOKEN are required.');
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

let running = false;
let pending = false;
let timer;

function scheduleBuild() {
  if (running || timer || !pending) return;
  timer = setTimeout(() => {
    timer = undefined;
    if (!pending) return;
    pending = false;
    running = true;
    const build = spawn('bash', ['scripts/build-strapi-on-vps.sh'], {
      cwd: '/srv/xlam-deploy/source',
      env: process.env,
      stdio: 'inherit',
    });
    build.on('error', (error) => {
      console.error('Unable to start static build:', error);
      running = false;
      scheduleBuild();
    });
    build.on('exit', (code) => {
      if (code !== 0) console.error(`Static build failed with exit code ${code}.`);
      else console.log('Static build and deployment completed.');
      running = false;
      scheduleBuild();
    });
  }, 3000);
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
  pending = true;
  scheduleBuild();
  console.log(`Queued static build for ${payload.event}: ${payload.uid}`);
  send(response, 202, 'Build queued');
}).listen(port, '127.0.0.1', () => {
  console.log(`Strapi publish bridge listening on 127.0.0.1:${port}`);
});
