import { randomBytes } from 'node:crypto';
import { closeSync, openSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appDirectory = '/srv/xlam-cms/app';
const envPath = resolve(appDirectory, '.env');

if (process.platform !== 'linux' || process.cwd() !== appDirectory || process.getuid() === 0) {
  throw new Error('Run as the xlam-cms user from /srv/xlam-cms/app.');
}

const secret = () => randomBytes(32).toString('hex');
const values = {
  NODE_ENV: 'production',
  HOST: '127.0.0.1',
  PORT: '1337',
  PUBLIC_URL: 'https://cms.xlam.media',
  TRUST_PROXY: 'true',
  DATABASE_CLIENT: 'sqlite',
  DATABASE_FILENAME: '/srv/xlam-cms/data/local-check.db',
  APP_KEYS: Array.from({ length: 4 }, secret).join(','),
  API_TOKEN_SALT: secret(),
  ADMIN_JWT_SECRET: secret(),
  TRANSFER_TOKEN_SALT: secret(),
  JWT_SECRET: secret(),
  ENCRYPTION_KEY: secret(),
};

const descriptor = openSync(envPath, 'wx', 0o600);
try {
  writeFileSync(descriptor, Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n');
} finally {
  closeSync(descriptor);
}

console.log('Created private Strapi configuration at /srv/xlam-cms/app/.env');
