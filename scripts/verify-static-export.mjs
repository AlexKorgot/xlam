import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const exportDir = path.resolve(process.argv[2] ?? 'out');
const requiredPages = ['index.html', 'main/index.html', 'about/index.html', 'contacts/index.html'];
const textExtensions = new Set(['.html', '.js', '.json', '.txt']);
const forbiddenCmsAddress = /https?:\/\/(?:localhost|127\.0\.0\.1):1337\b/i;
const token = process.env.STRAPI_API_TOKEN?.trim();

async function* textFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* textFiles(entryPath);
    } else if (entry.isFile() && textExtensions.has(path.extname(entry.name))) {
      yield entryPath;
    }
  }
}

for (const page of requiredPages) {
  const file = path.join(exportDir, page);
  if (!(await stat(file)).isFile()) {
    throw new Error(`Missing static page: ${page}`);
  }

  const html = await readFile(file, 'utf8');
  if (!/<title>[^<]+<\/title>/i.test(html) || !/<meta name="description" content="[^"]+"/i.test(html)) {
    throw new Error(`Missing SEO metadata: ${page}`);
  }
}

for await (const file of textFiles(exportDir)) {
  const content = await readFile(file, 'utf8');
  const relativeFile = path.relative(exportDir, file);
  if (forbiddenCmsAddress.test(content)) {
    throw new Error(`Local CMS address leaked into export: ${relativeFile}`);
  }
  if (token && content.includes(token)) {
    throw new Error(`CMS API token leaked into export: ${relativeFile}`);
  }
}

if (process.env.GITHUB_SHA) {
  await writeFile(
    path.join(exportDir, 'build-info.json'),
    `${JSON.stringify({
      commit: process.env.GITHUB_SHA,
      runId: process.env.GITHUB_RUN_ID ?? null,
      builtAt: new Date().toISOString(),
    }, null, 2)}\n`,
  );
}

console.log(`Verified ${requiredPages.length} static pages and checked exported text files.`);
