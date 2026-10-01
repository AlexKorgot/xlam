export type SocialLink = {
  label: string;
  url?: string;
  column: 'left' | 'right';
};

export type SiteSettings = {
  contactTitle: string;
  contactDescription: string;
  phoneNumber: string;
  emailAddress: string;
  socialLinks: SocialLink[];
};
