import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const sourceDirectory = path.join(
  projectRoot,
  'src',
  'components',
  'textSection',
  'assets',
  'img',
);
const outputDirectory = path.join(projectRoot, 'public', 'text-section');

const compactPortraitWidth = 390;
const tallPortraitWidth = 414;
const webpOptions = {
  quality: 82,
  alphaQuality: 96,
  effort: 6,
  smartSubsample: true,
};

const artwork = [
  { name: 'blue-top', source: 'blue_top.png', compactHeight: 480, tallHeight: 750 },
  { name: 'blue-bottom', source: 'blue_bottom.png', compactHeight: 440, tallHeight: 750 },
  { name: 'green-top', source: 'green_top.png', compactHeight: 500, tallHeight: 850 },
  { name: 'green-bottom', source: 'green_bottom.png', compactHeight: 500, tallHeight: 850 },
  { name: 'gray-top', source: 'gray_top.png', compactHeight: 460, tallHeight: 750 },
  { name: 'gray-bottom', source: 'gray_bottom.png', compactHeight: 480, tallHeight: 850 },
];

function largestContainedSize(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const scale = Math.min(sourceWidth / targetWidth, sourceHeight / targetHeight);

  return {
    width: Math.floor(targetWidth * scale),
    height: Math.floor(targetHeight * scale),
  };
}

async function writePortraitVariant(sourcePath, name, profile, width, height) {
  const outputPath = path.join(
    outputDirectory,
    `${name}-portrait-${profile}-${width}w.webp`,
  );

  await sharp(sourcePath)
    .resize({
      width,
      height,
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true,
    })
    .webp(webpOptions)
    .toFile(outputPath);

  return outputPath;
}

async function generateArtworkVariants(item) {
  const sourcePath = path.join(sourceDirectory, item.source);
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${sourcePath}`);
  }

  const compactMaximum = largestContainedSize(
    metadata.width,
    metadata.height,
    compactPortraitWidth,
    item.compactHeight,
  );
  const tallMaximum = largestContainedSize(
    metadata.width,
    metadata.height,
    tallPortraitWidth,
    item.tallHeight,
  );
  const compactWidths = [...new Set([compactPortraitWidth, compactMaximum.width])];

  const compactOutputs = await Promise.all(
    compactWidths.map((width) => {
      const height = Math.round((width * item.compactHeight) / compactPortraitWidth);

      return writePortraitVariant(sourcePath, item.name, 'compact', width, height);
    }),
  );
  const tallOutput = await writePortraitVariant(
    sourcePath,
    item.name,
    'tall',
    tallMaximum.width,
    tallMaximum.height,
  );

  return [...compactOutputs, tallOutput];
}

async function generateBackgroundVariant() {
  const sourcePath = path.join(sourceDirectory, 'general_bg.png');
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${sourcePath}`);
  }

  const maximum = largestContainedSize(
    metadata.width,
    metadata.height,
    414,
    896,
  );
  const outputPath = path.join(
    outputDirectory,
    `general-bg-portrait-${maximum.width}w.webp`,
  );

  await sharp(sourcePath)
    .resize({
      width: maximum.width,
      height: maximum.height,
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true,
    })
    .webp({ ...webpOptions, quality: 80 })
    .toFile(outputPath);

  return outputPath;
}

await mkdir(outputDirectory, { recursive: true });

const generatedFiles = (
  await Promise.all([
    ...artwork.map(generateArtworkVariants),
    generateBackgroundVariant().then((output) => [output]),
  ])
).flat();

for (const generatedFile of generatedFiles) {
  console.log(path.relative(projectRoot, generatedFile));
}
