import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
const dist = new URL('../dist/', import.meta.url);
const locales = ['en', 'ru', 'uk'];
const catalog = [{ slug: 'splash-finish', repo: 'splash-finish', name: 'Splash Finish' }, { slug: 'hascs', repo: 'HAScS', name: 'HAScS' }, { slug: 'ting', repo: 'ting', name: 'Ting' }];
const snapshot = JSON.parse(await readFile(new URL('../src/data/public-repos.json', import.meta.url)));
const active = catalog.filter(app => snapshot.repositories.includes(app.repo));
const pathFor = (locale, route = '') => `/${locale === 'en' ? '' : locale + '/'}${route ? route + '/' : ''}`;
async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? htmlFiles(new URL(entry.name + '/', directory)) : entry.name.endsWith('.html') ? [new URL(entry.name, directory)] : []))).flat();
}
const html = path => readFile(new URL('.' + path + 'index.html', dist), 'utf8');

test('every page has correct language, metadata, one h1, and working local links/assets/anchors', async () => {
  for (const file of await htmlFiles(dist)) {
    const source = await readFile(file, 'utf8');
    const relative = file.pathname.slice(dist.pathname.length);
    const language = relative.startsWith('ru/') ? 'ru' : relative.startsWith('uk/') ? 'uk' : 'en';
    assert.equal((source.match(/<h1[\s>]/g) || []).length, 1, relative);
    assert.ok(source.includes(`<html lang="${language}"`), relative);
    assert.match(source, /<meta name="description"/);
    assert.match(source, /rel="canonical"/);
    for (const [, raw] of source.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
      if (!raw.startsWith('/') && !raw.startsWith('#')) continue;
      const url = new URL(raw, new URL(relative.replace(/index\.html$/, ''), 'https://test.invalid/'));
      const path = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
      const target = new URL('.' + path, dist);
      await access(target);
      if (url.hash && path.endsWith('.html')) {
        assert.ok((await readFile(target, 'utf8')).includes(`id="${url.hash.slice(1)}"`), `Missing anchor ${raw} from ${relative}`);
      }
    }
  }
});

test('language alternatives preserve page identity and canonical language', async () => {
  const routes = ['', 'support', ...active.flatMap(app => ['', '/support', '/privacy'].map(suffix => `apps/${app.slug}${suffix}`))];
  for (const route of routes) for (const locale of locales) {
    const source = await html(pathFor(locale, route));
    for (const alternate of [...locales, 'x-default']) {
      const url = pathFor(alternate === 'x-default' ? 'en' : alternate, route);
      const tag = source.match(new RegExp(`<link rel="alternate" hreflang="${alternate}" href="([^"]+)"`));
      assert.ok(tag, `${locale} ${route} missing ${alternate}`);
      assert.equal(new URL(tag[1]).pathname, url);
      if (alternate !== 'x-default') assert.ok(source.includes(`href="${url}" lang="${alternate}" hreflang="${alternate}"`));
    }
    const canonical = source.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.equal(new URL(canonical).pathname, pathFor(locale, route));
  }
});

test('only verified public apps appear in each language; private apps leave no routes', async () => {
  for (const locale of locales) {
    const homepage = await html(pathFor(locale));
    const folders = await readdir(new URL('.' + pathFor(locale, 'apps'), dist)).catch(error => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    assert.deepEqual(folders.sort(), active.map(app => app.slug).sort());
    for (const app of catalog) assert.equal(homepage.includes(app.name), snapshot.repositories.includes(app.repo));
    assert.ok(!homepage.includes('apps.apple.com'));
  }
});

test('all products have their own translated content, structured data, and store URLs', async () => {
  const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
  for (const app of active) for (const locale of locales) {
    const root = pathFor(locale, `apps/${app.slug}`);
    const source = await html(root);
    const schema = JSON.parse(source.match(/type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@type'], 'SoftwareApplication');
    assert.equal(schema.name, app.name);
    assert.equal(schema.inLanguage, locale);
    for (const route of ['support', 'privacy']) {
      const page = await html(root + route + '/');
      assert.ok(sitemap.includes(root + route + '/'));
      assert.ok(page.includes(app.name));
      if (app.slug === 'hascs') {
        assert.ok(page.includes('Keychain') || page.includes('ключ'));
        assert.ok(!page.includes('splash-finish uninstall-skills'));
      }
    }
  }
  assert.match(sitemap, /hreflang="uk"/);
  assert.match(await readFile(new URL('robots.txt', dist), 'utf8'), /Sitemap:/);
});

test('Splash Finish release and upgrade instructions are available in every locale', async () => {
  if (!snapshot.repositories.includes('splash-finish')) return;
  for (const locale of locales) {
    for (const section of ['', '/support']) {
      const source = await html(pathFor(locale, `apps/splash-finish${section}`));
      assert.ok(source.includes('0.3.8'), `${locale}${section}: release version`);
      assert.ok(source.includes('/jewter') || section === '/support');
      assert.ok(source.includes('SPLASH_FINISH_DISABLED=1'), `${locale}${section}: worker opt-out`);
      assert.ok(source.includes('splash-finish install-skills'), `${locale}${section}: integration refresh`);
      assert.ok(source.includes('/reload'), `${locale}${section}: pi reload`);
    }
  }
});

test('Splash Finish 0.3.12 documents Rex setup in every locale', async () => {
  if (!snapshot.repositories.includes('splash-finish')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/splash-finish'));
    assert.ok(app.includes('0.3.12'), `${locale}: Rex release version`);
    for (const text of ['Rex', 'Remote Control', 'splash-finish install-skills', '/reload']) {
      assert.ok(app.includes(text), `${locale}: missing ${text}`);
    }
    const support = await html(pathFor(locale, 'apps/splash-finish/support'));
    assert.ok(support.includes('Rex CLI') && support.includes('Remote Control'), `${locale}: Rex requirements`);
  }
});

test('UI copy is translated, not just the language selector', async () => {
  const expected = { en: ['Less noise.', 'Support'], ru: ['Меньше шума.', 'Поддержка'], uk: ['Менше шуму.', 'Підтримка'] };
  for (const locale of locales) {
    const source = await html(pathFor(locale));
    for (const text of expected[locale]) assert.ok(source.includes(text));
    for (const other of locales.filter(other => other !== locale)) assert.ok(!source.includes(expected[other][0]));
  }
});


test('Ting documents release 0.3.1 panel spacing and local launcha data in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  const headings = {
    en: 'launcha — Ting 0.3.0',
    ru: 'launcha — Ting 0.3.0',
    uk: 'launcha — Ting 0.3.0',
  };
  for (const locale of locales) {
    const source = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of [headings[locale], 'selecta', '/System/Applications', '~/Desktop',
      '~/Library', 'Spotlight', 'Command-Return', 'Show panel title',
      '~/Library/Application Support/Ting/launcha-history.json', 'launcha-consent.json']) {
      assert.ok(source.includes(text), `${locale}: missing ${text}`);
    }
    const app = await html(pathFor(locale, 'apps/ting'));
    assert.ok(app.includes('Ting 0.3.3') && app.includes('Ting 0.3.2') && app.includes('Ting 0.3.1') && app.includes('launcha'));
    assert.ok(source.includes('Ting 0.3.3') && source.includes('Ting 0.3.2'));
    assert.ok(source.includes('playSound') && source.includes('Play a “ting” when opening an app, link or file'));
    assert.ok(app.includes('Check for Updates'));
    assert.ok(source.includes('0.3.1'));
    assert.ok(source.includes('amber top rule') || source.includes('янтарной полосой') || source.includes('бурштиновою смугою'));
    const privacy = await html(pathFor(locale, 'apps/ting/privacy'));
    for (const text of ['launcha-history.json', 'launcha-consent.json', '~/Library', 'Desktop']) {
      assert.ok(privacy.includes(text), `${locale}: missing privacy fact ${text}`);
    }
    assert.doesNotMatch(source, /unreleased|ещё не выпущено|ще не випущено/);
  }
});

test('Ting has localized launcher copy and icon-only artwork without HAScS claims', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  const expected = { en: 'Your next app. A few keys away.', ru: 'Нужное приложение. Несколькими клавишами.', uk: 'Потрібний застосунок. Кількома клавішами.' };
  for (const locale of locales) {
    const source = await html(pathFor(locale, 'apps/ting'));
    assert.ok(source.includes(expected[locale]));
    assert.ok(source.includes('/images/ting-icon.png'));
    assert.ok(source.includes('icon-artwork'));
    assert.ok(source.includes('~/.config/ting/config.json'));
    assert.ok(source.includes('Home') && source.includes('F13'));
    assert.ok(!source.includes('Home Assistant'));
    assert.ok(!source.includes('apps.apple.com'));
    for (const section of ['support', 'privacy']) {
      const page = await html(pathFor(locale, `apps/ting/${section}`));
      assert.ok(page.includes('~/.config/ting/'));
      assert.ok(page.includes('https://github.com/bobuk-io/ting/security/advisories/new'));
      assert.ok(!page.includes('Home Assistant'));
    }
  }
});
