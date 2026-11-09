import publicRepos from './public-repos.json';
import { splashCopy } from './splash-finish';
import { hascsCopy } from './hascs';
import type { App } from './types';
export type { App } from './types';
const catalog: App[] = [
  { slug: 'splash-finish', repoName: 'splash-finish', name: 'Splash Finish', repo: 'https://github.com/bobuk-io/splash-finish', platform: 'macOS', icon: '/images/splash-finish-icon.png', screenshot: '/images/splash-finish.png', companions: ['Claude Code', 'Codex', 'pi'], translations: splashCopy },
  { slug: 'hascs', repoName: 'HAScS', name: 'HAScS', repo: 'https://github.com/bobuk-io/HAScS', platform: 'macOS', icon: '/images/hascs-icon.png', companions: ['Home Assistant'], translations: hascsCopy },
];
const publicNames = new Set<string>(publicRepos.repositories);
export const apps = catalog.filter(app => publicNames.has(app.repoName));
