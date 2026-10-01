export const HOMEPAGE_FEATURE_KEYS = [
  'equipment', 'format', 'worlds', 'contractor', 'senior',
  'platforms', 'ai', 'scale', 'cycle',
] as const;

export const HOMEPAGE_STATEMENT_KEYS = [
  'smooth', 'noise', 'idea', 'welcome',
] as const;

export type HomepageFeatureKey = typeof HOMEPAGE_FEATURE_KEYS[number];
export type HomepageStatementKey = typeof HOMEPAGE_STATEMENT_KEYS[number];

export type HomepageContent = {
  production: {
    lineOne: string;
    lineTwoBeforeHighlight: string;
    lineTwoHighlight: string;
    lineTwoAfterHighlight: string;
    lineThree: string;
  };
  whyUs: {
    headingBeforeHighlight: string;
    headingHighlight: string;
    features: Record<HomepageFeatureKey, string>;
  };
  statements: Record<HomepageStatementKey, string[]>;
};
