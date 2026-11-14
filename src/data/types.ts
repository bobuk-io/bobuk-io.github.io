import type { Locale } from '../i18n';
export interface Section { title: string; paragraphs: string[]; items?: string[]; }
/** A real screenshot of the released app with demo data. `alt` describes it; `caption` is the short visible line. */
export interface Shot { src: string; width: number; height: number; alt: string; caption: string; }
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
  shots: Shot[];
}
export interface App {
  slug: string;
  repoName: string;
  name: string;
  repo: string;
  platform: string;
  icon: string;
  /** PNG used for social previews and structured data; falls back to the icon. */
  socialImage?: string;
  appStoreUrl?: string;
  companions: string[];
  translations: Record<Locale, AppCopy>;
}
