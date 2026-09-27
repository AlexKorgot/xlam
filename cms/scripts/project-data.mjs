export function validateProjects(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('Projects must be a non-empty array');
  }

  const keys = new Set();
  const positions = new Set();
  for (const project of projects) {
    for (const field of [
      'key', 'eyebrow', 'title', 'description', 'client', 'year',
      'openedTitleLead', 'openedTitleAccent', 'openedBody', 'navLabel',
    ]) {
      if (typeof project[field] !== 'string' || !project[field].trim()) {
        throw new Error(`Project ${project.key ?? '?'}: missing ${field}`);
      }
    }
    if (keys.has(project.key)) throw new Error(`Duplicate project key: ${project.key}`);
    keys.add(project.key);

    if (!Number.isInteger(project.sortOrder) || positions.has(project.sortOrder)) {
      throw new Error(`Project ${project.key}: invalid or duplicate sortOrder`);
    }
    positions.add(project.sortOrder);

    for (const field of ['tags', 'services']) {
      if (!Array.isArray(project[field]) ||
          project[field].some((item) => typeof item.text !== 'string' || !item.text.trim())) {
        throw new Error(`Project ${project.key}: invalid ${field}`);
      }
    }
    if (!Array.isArray(project.previews) ||
        project.previews.some((item) => typeof item.alt !== 'string' || !item.alt.trim() ||
          !(item.image?.url || item.url))) {
      throw new Error(`Project ${project.key}: invalid previews`);
    }
    if (!(project.video?.url || project.videoUrl) ||
        !(project.poster?.url || project.posterUrl)) {
      throw new Error(`Project ${project.key}: missing video or poster`);
    }
  }
  return [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
}
