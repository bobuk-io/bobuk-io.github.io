import publicRepos from './public-repos.json';
import catalogEntries from './catalog.json';
import type { Locale } from '../i18n';
import type { App, AppCopy } from './types';
export type { App } from './types';

// Each app has an entry in catalog.json and its copy in src/data/apps/<slug>.ts (default export).
// `npm run app:new` creates both; see docs/updating.md.
const copies = import.meta.glob<Record<Locale, AppCopy>>('./apps/*.ts', { eager: true, import: 'default' });
const catalog: App[] = catalogEntries.map(entry => {
  const translations = copies[`./apps/${entry.slug}.ts`];
  if (!translations) throw new Error(`Missing src/data/apps/${entry.slug}.ts for ${entry.name} (catalog.json).`);
  return { ...entry, translations };
});
const orphans = Object.keys(copies).filter(path => !catalogEntries.some(entry => path === `./apps/${entry.slug}.ts`));
if (orphans.length) throw new Error(`No catalog.json entry for ${orphans.join(', ')}.`);

const publicNames = new Set<string>(publicRepos.repositories);
// Latest published release per repository (last push if it has none), from `npm run sync:github`.
const updatedAt: Record<string, string | undefined> = publicRepos.updatedAt;
const updated = (app: App) => Date.parse(updatedAt[app.repoName] ?? '') || 0;
/** Public apps, most recently updated first; the catalog.json order breaks ties (the sort is stable). */
export const apps = catalog.filter(app => publicNames.has(app.repoName)).sort((a, b) => updated(b) - updated(a));
