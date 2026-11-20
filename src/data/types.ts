import type { Locale } from '../i18n';
export interface Section { title: string; paragraphs: string[]; items?: string[]; }
/** A real screenshot of the released app with demo data. `alt` describes it; `caption` is the short visible line. */
export interface Shot { src: string; width: number; height: number; alt: string; caption: string; }
/**
 * A block of a guide page. Text may hold `inline code` in backticks.
 * `code` is shown as is in a dark block; `table` rows are cells, the first row is the header.
 */
export type GuideBlock = string | { code: string } | { list: string[] } | { steps: string[] } | { table: string[][] };
export interface GuideSection { title: string; id: string; blocks: GuideBlock[]; }
/** An optional documentation page of an app, at apps/<slug>/<slug of the guide>. */
export interface Guide { slug: string; nav: string; eyebrow: string; title: string; intro: string; sections: GuideSection[]; }
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
  guide?: Guide;
}
export interface App {
  slug: string;
  repoName: string;
  name: string;
  repo: string;
  platform: string;
  icon: string;
  /** Accent of the app's window on the site: the line on top of its window. A hex color from its icon. */
  accent: string;
  /** PNG used for social previews and structured data; falls back to the icon. */
  socialImage?: string;
  appStoreUrl?: string;
  companions: string[];
  translations: Record<Locale, AppCopy>;
}
