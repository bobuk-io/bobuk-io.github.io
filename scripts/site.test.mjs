import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
const dist = new URL('../dist/', import.meta.url);
async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const lists = await Promise.all(entries.map(entry => entry.isDirectory() ? htmlFiles(new URL(entry.name + '/', directory)) : entry.name.endsWith('.html') ? [new URL(entry.name, directory)] : []));
  return lists.flat();
}

test('all pages have metadata, one h1, and valid local links/assets/anchors', async () => {
  for (const file of await htmlFiles(dist)) {
    const html = await readFile(file, 'utf8');
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, file.pathname);
    assert.match(html, /<html lang="ru"/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, /rel="canonical"/);
    for (const [, raw] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
      if (!raw.startsWith('/') && !raw.startsWith('#')) continue;
      const url = new URL(raw, new URL(file.pathname.slice(dist.pathname.length).replace(/index\.html$/, ''), 'https://test.invalid/'));
      const path = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
      const localFile = new URL('.' + path, dist);
      await access(localFile);
      if (url.hash && path.endsWith('.html')) {
        const target = await readFile(localFile, 'utf8');
        assert.ok(target.includes(`id="${url.hash.slice(1)}"`), `Missing anchor ${raw} from ${file.pathname}`);
      }
    }
  }
});

test('only verified public repositories receive product pages', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../src/data/public-repos.json', import.meta.url)));
  const dirs = await readdir(new URL('apps/', dist)).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  for (const slug of dirs) assert.ok(snapshot.repositories.includes(slug));
  const homepage = await readFile(new URL('index.html', dist), 'utf8');
  assert.equal(homepage.includes('Splash Finish'), snapshot.repositories.includes('splash-finish'));
  assert.ok(!homepage.includes('apps.apple.com'));
});

test('store foundation has support, privacy, structured metadata and sitemap', async (t) => {
  const snapshot = JSON.parse(await readFile(new URL('../src/data/public-repos.json', import.meta.url)));
  if (!snapshot.repositories.includes('splash-finish')) return t.skip('Splash Finish is no longer public; product routes must be absent.');
  const product = await readFile(new URL('apps/splash-finish/index.html', dist), 'utf8');
  const json = product.match(/type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.equal(JSON.parse(json)['@type'], 'SoftwareApplication');
  for (const route of ['support', 'privacy']) {
    await access(new URL(`apps/splash-finish/${route}/index.html`, dist));
    assert.ok((await readFile(new URL('sitemap.xml', dist), 'utf8')).includes(`/apps/splash-finish/${route}/`));
  }
  assert.match(await readFile(new URL('robots.txt', dist), 'utf8'), /Sitemap:/);
});
