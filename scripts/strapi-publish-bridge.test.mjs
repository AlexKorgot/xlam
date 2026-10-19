import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { after, test } from 'node:test';

const secret = 'test-secret-with-more-than-32-characters';
const requests = [];
const api = createServer(async (request, response) => {
  requests.push(request.method);
  if (request.method === 'GET') {
    response.writeHead(404);
    response.end();
    return;
  }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString());
  assert.equal(body.branch, 'strapi-integration');
  assert.match(Buffer.from(body.content, 'base64').toString(), /^\d{4}-/);
  response.writeHead(201, { 'content-type': 'application/json' });
  response.end('{}');
});
api.listen(0, '127.0.0.1');
await once(api, 'listening');

const probe = createServer();
probe.listen(0, '127.0.0.1');
await once(probe, 'listening');
const port = probe.address().port;
probe.close();

const bridge = spawn(process.execPath, ['scripts/strapi-publish-bridge.mjs'], {
  env: {
    ...process.env,
    PORT: String(port),
    STRAPI_WEBHOOK_SECRET: secret,
    GITHUB_TRIGGER_TOKEN: 'test-token',
    GITHUB_API_URL: `http://127.0.0.1:${api.address().port}`,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
after(() => {
  bridge.kill();
  api.close();
});
await once(bridge.stdout, 'data');

async function send(event, uid, header = secret) {
  return fetch(`http://127.0.0.1:${port}/strapi-publish`, {
    method: 'POST',
    headers: { 'x-xlam-webhook-secret': header, 'content-type': 'application/json' },
    body: JSON.stringify({ event, uid }),
  });
}

test('rejects invalid webhook secret', async () => {
  assert.equal((await send('entry.publish', 'api::project.project', 'wrong')).status, 401);
  assert.deepEqual(requests, []);
});

test('ignores draft update events', async () => {
  assert.equal((await send('entry.update', 'api::project.project')).status, 204);
  assert.deepEqual(requests, []);
});

test('queues a build for published content', async () => {
  assert.equal((await send('entry.publish', 'api::project.project')).status, 202);
  assert.deepEqual(requests, ['GET', 'PUT']);
});
