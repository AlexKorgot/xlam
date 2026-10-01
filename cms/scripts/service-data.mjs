function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasMediaUrl(value) {
  return hasText(value) && (value.startsWith('https://') || /^\/(?!\/)/.test(value));
}

export function validateServicesSeed(seed) {
  if (!isObject(seed) || !isObject(seed.section) || !hasText(seed.section.closingText)) {
    throw new Error('Services seed requires section.closingText');
  }
  if (!Array.isArray(seed.services) || seed.services.length === 0) {
    throw new Error('Services seed requires a non-empty services array');
  }

  const keys = new Set();
  const positions = new Set();
  for (const service of seed.services) {
    if (!isObject(service) || !hasText(service.key) || !/^[a-z0-9-]+$/.test(service.key)) {
      throw new Error('Service has an invalid key');
    }
    if (keys.has(service.key)) throw new Error(`Duplicate service key: ${service.key}`);
    keys.add(service.key);

    if (!Number.isInteger(service.sortOrder) || positions.has(service.sortOrder)) {
      throw new Error(`Service ${service.key}: invalid or duplicate sortOrder`);
    }
    positions.add(service.sortOrder);

    for (const field of [
      'cardTitle', 'cardDescription', 'detailTitle', 'detailSubtitle',
      'detailDescription', 'ctaIntro', 'ctaLabel',
    ]) {
      if (!hasText(service[field])) throw new Error(`Service ${service.key}: missing ${field}`);
    }

    for (const field of [
      'cardPosterDesktopUrl', 'cardPosterMobileUrl',
      'detailBackgroundDesktopUrl', 'detailBackgroundMobileUrl',
    ]) {
      if (!hasMediaUrl(service[field])) {
        throw new Error(`Service ${service.key}: invalid ${field}`);
      }
    }
    if (service.cardVideoUrl != null && !hasMediaUrl(service.cardVideoUrl)) {
      throw new Error(`Service ${service.key}: invalid cardVideoUrl`);
    }

    if (!Array.isArray(service.features) || service.features.length !== 4 ||
        service.features.some((feature) =>
          !isObject(feature) || !hasText(feature.title) || !hasText(feature.description))) {
      throw new Error(`Service ${service.key}: exactly four complete features are required`);
    }
  }

  return {
    section: seed.section,
    services: [...seed.services].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}
