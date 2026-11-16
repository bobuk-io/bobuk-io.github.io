import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
// Use gh authentication, but accept only explicitly verified public repositories.
// Credentials stay inside gh and are never written into the snapshot.
const api = async path => {
  try {
    const { stdout } = await execFileAsync('gh', ['api', path], {
      timeout: 20000, maxBuffer: 8 * 1024 * 1024,
    });
    const data = JSON.parse(stdout);
    return { ok: true, status: 200, json: async () => data };
  } catch (error) {
    const status = Number(error.stderr?.match(/HTTP (\d{3})/)?.[1]) || 0;
    return { ok: false, status };
  }
};
const repositories = [];
const pushedAt = {};
for (let page = 1; ; page++) {
  const response = await api(`orgs/bobuk-io/repos?type=public&per_page=100&page=${page}`);
  if (!response.ok) throw new Error(`GitHub returned ${response.status}. Snapshot was not modified.`);
  const batch = await response.json();
  if (!Array.isArray(batch)) throw new Error('Unexpected GitHub response. Snapshot was not modified.');
  for (const repo of batch) {
    if (repo.private !== false || repo.visibility !== 'public' || repo.owner?.login?.toLowerCase() !== 'bobuk-io') {
      throw new Error('Repository visibility or owner could not be verified. Snapshot was not modified.');
    }
    if (!repo.archived && !repo.fork) { repositories.push(repo.name); pushedAt[repo.name] = repo.pushed_at; }
  }
  if (batch.length < 100) break;
}
const target = fileURLToPath(new URL('../src/data/public-repos.json', import.meta.url));
const previous = await readFile(target, 'utf8').then(JSON.parse).catch(() => ({}));

// The homepage lists the most recently updated app first: the date of its latest published
// release (drafts and prereleases excluded), or the last push for a repository without releases.
// Visibility above is critical; these dates are not. If a release lookup fails (for example,
// a rate limit), keep the previous date rather than fail the deploy.
const updatedAt = {};
for (const name of repositories) {
  const response = await api(`repos/bobuk-io/${encodeURIComponent(name)}/releases/latest`).catch(() => null);
  const release = response?.ok ? await response.json().catch(() => null) : null;
  if (release?.published_at) updatedAt[name] = release.published_at;
  else if (response?.status === 404) updatedAt[name] = pushedAt[name];
  else {
    updatedAt[name] = previous.updatedAt?.[name] ?? pushedAt[name];
    console.warn(`Could not read the latest ${name} release (${response?.status ?? 'network error'}); using ${updatedAt[name]}.`);
  }
}
const temporary = `${target}.tmp`;
try {
  repositories.sort();
  const snapshot = { organization: 'bobuk-io', repositories, updatedAt: Object.fromEntries(repositories.map(name => [name, updatedAt[name]])) };
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n');
  await rename(temporary, target);
} finally { await rm(temporary, { force: true }); }
console.log(`Verified ${repositories.length} public repositories: ${repositories.join(', ') || '(none)'}.`);
console.log('Only apps listed in src/data/catalog.json become product pages.');
