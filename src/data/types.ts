import type { Locale } from '../i18n';
export interface Section { title: string; paragraphs: string[]; items?: string[]; }
export interface AppCopy {
  category: string;
  tagline: string;
  description: string;
  features: { title: string; text: string }[];
  installNote: string;
  steps: { title: string; text: string; command?: string; scriptUrl?: string }[];
  faq: { question: string; answer: string }[];
  supportIntro: string;
  support: Section[];
  privacyTitle: string;
  privacyIntro: string;
  privacy: Section[];
  screenshotAlt?: string;
}
export interface App {
  slug: string;
  repoName: string;
  name: string;
  repo: string;
  platform: string;
  icon: string;
  screenshot?: string;
  appStoreUrl?: string;
  companions: string[];
  translations: Record<Locale, AppCopy>;
}
