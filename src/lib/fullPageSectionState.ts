export type SectionRenderState = 'active' | 'nearby' | 'distant';

export function getSectionRenderState(
  sectionIndex: number,
  activeSectionIndex: number,
): SectionRenderState {
  const distance = Math.abs(sectionIndex - activeSectionIndex);

  if (distance === 0) {
    return 'active';
  }

  return distance === 1 ? 'nearby' : 'distant';
}
