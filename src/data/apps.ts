import publicRepos from './public-repos.json';
import { splashCopy } from './splash-finish';
import { hascsCopy } from './hascs';
import { tingCopy } from './ting';
import type { App } from './types';
export type { App } from './types';
const catalog: App[] = [
  { slug: 'splash-finish', repoName: 'splash-finish', name: 'Splash Finish', repo: 'https://github.com/bobuk-io/splash-finish', platform: 'macOS', icon: '/images/splash-finish-icon.png', socialImage: '/images/splash-finish.png', companions: ['Claude Code', 'Codex', 'pi'], translations: splashCopy },
  { slug: 'hascs', repoName: 'HAScS', name: 'HAScS', repo: 'https://github.com/bobuk-io/HAScS', platform: 'macOS', icon: '/images/hascs-icon.png', socialImage: '/images/hascs.png', companions: ['Home Assistant'], translations: hascsCopy },
  { slug: 'ting', repoName: 'ting', name: 'Ting', repo: 'https://github.com/bobuk-io/ting', platform: 'macOS', icon: '/images/ting-icon.png', socialImage: '/images/ting.png', companions: [], translations: tingCopy },
];
const publicNames = new Set<string>(publicRepos.repositories);
// Latest published release per repository (last push if it has none), from `npm run sync:github`.
const updatedAt: Record<string, string | undefined> = publicRepos.updatedAt;
const updated = (app: App) => Date.parse(updatedAt[app.repoName] ?? '') || 0;
/** Public apps, most recently updated first; the catalog order above breaks ties (the sort is stable). */
export const apps = catalog.filter(app => publicNames.has(app.repoName)).sort((a, b) => updated(b) - updated(a));
