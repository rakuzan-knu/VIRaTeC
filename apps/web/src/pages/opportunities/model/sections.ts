export const AUDIENCE_SECTION_IDS = ['for-students', 'for-researchers', 'for-partners'] as const;

export type AudienceSectionId = (typeof AUDIENCE_SECTION_IDS)[number];
