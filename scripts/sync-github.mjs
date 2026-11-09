import { writeFile, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Intentionally anonymous. Private repositories must never enter the snapshot,
// even when the developer has a GitHub token in their environment.
const repositories = [];
for (let page = 1; ; page++) {
  const response = await fetch(`https://api.github.com/orgs/bobuk-io/repos?type=public&per_page=100&page=${page}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'bobuk-io-landing' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}. Snapshot was not modified.`);
  const batch = await response.json();
  if (!Array.isArray(batch)) throw new Error('Unexpected GitHub response. Snapshot was not modified.');
  for (const repo of batch) {
    if (repo.private !== false || repo.visibility !== 'public' || repo.owner?.login?.toLowerCase() !== 'bobuk-io') {
      throw new Error('Repository visibility or owner could not be verified. Snapshot was not modified.');
    }
    if (!repo.archived && !repo.fork) repositories.push(repo.name);
  }
  if (batch.length < 100) break;
}
const target = fileURLToPath(new URL('../src/data/public-repos.json', import.meta.url));
const temporary = `${target}.tmp`;
try {
  await writeFile(temporary, JSON.stringify({ organization: 'bobuk-io', repositories: repositories.sort() }, null, 2) + '\n');
  await rename(temporary, target);
} finally { await rm(temporary, { force: true }); }
console.log(`Verified ${repositories.length} public repositories: ${repositories.join(', ') || '(none)'}.`);
console.log('Only curated entries in src/data/apps.ts become product pages.');
