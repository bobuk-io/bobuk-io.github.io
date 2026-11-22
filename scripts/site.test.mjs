import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
const dist = new URL('../dist/', import.meta.url);
const locales = ['en', 'ru', 'uk'];
const catalog = JSON.parse(await readFile(new URL('../src/data/catalog.json', import.meta.url))).map(app => ({ slug: app.slug, repo: app.repoName, name: app.name }));
const snapshot = JSON.parse(await readFile(new URL('../src/data/public-repos.json', import.meta.url)));
const active = catalog.filter(app => snapshot.repositories.includes(app.repo));
const pathFor = (locale, route = '') => `/${locale === 'en' ? '' : locale + '/'}${route ? route + '/' : ''}`;
async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? htmlFiles(new URL(entry.name + '/', directory)) : entry.name.endsWith('.html') ? [new URL(entry.name, directory)] : []))).flat();
}
const html = path => readFile(new URL('.' + path + 'index.html', dist), 'utf8');

test('Splash Finish documents both install methods, updater ownership and removal in every locale', async () => {
  if (!snapshot.repositories.includes('splash-finish')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/splash-finish'));
    for (const text of ['0.3.13', 'brew install --cask bobuk-io/tap/splash-finish',
      'brew trust --cask bobuk-io/tap/splash-finish', 'brew upgrade --cask --greedy bobuk-io/tap/splash-finish',
      'Update Splash Finish via Homebrew', 'Sparkle', 'https://bobuk.io/apps/splash-finish/appcast.xml',
      'install.py', 'python3 -']) assert.ok(app.includes(text), `${locale}: ${text}`);
    const support = await html(pathFor(locale, 'apps/splash-finish/support'));
    for (const text of ['brew uninstall --cask bobuk-io/tap/splash-finish', '--zap', 'splash-finish install-skills']) {
      assert.ok(support.includes(text), `${locale}: ${text}`);
    }
    const privacy = await html(pathFor(locale, 'apps/splash-finish/privacy'));
    for (const text of ['bobuk.io/apps/splash-finish/appcast.xml', 'Homebrew', 'GitHub']) {
      assert.ok(privacy.includes(text), `${locale}: ${text}`);
    }
  }
});

test('Splash Finish feed serves signed versioned GitHub archives', async () => {
  const feed = await readFile(new URL('./apps/splash-finish/appcast.xml', dist), 'utf8');
  assert.match(feed, /^<\?xml/);
  assert.match(feed, /sparkle:version>\d+</);
  const version = feed.match(/sparkle:shortVersionString>([^<]+)</)?.[1];
  assert.ok(version);
  const urls = [...feed.matchAll(/<enclosure\b[^>]*\burl="([^"]+)"/g)].map(match => match[1]);
  assert.ok(urls.length > 0);
  for (const url of urls) assert.ok(url.startsWith('https://github.com/bobuk-io/splash-finish/releases/download/v'));
  assert.ok(urls[0].endsWith(`/v${version}/SplashFinish-${version}-universal.zip`));
  assert.match(feed, /sparkle:edSignature="[^"]+"/);
});

test('Ting shows how to set a second leader in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/ting'));
    const support = await html(pathFor(locale, 'apps/ting/support'));
    assert.ok(app.includes('Ting 0.7.15'), locale);
    assert.ok(support.includes('Settings › General › Second leader'), locale);
  }
});

test('Ting documents Homebrew installation, updates and safe removal in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/ting'));
    for (const command of ['brew install --cask bobuk-io/tap/ting', 'brew trust --cask bobuk-io/tap/ting', 'brew upgrade --cask --greedy bobuk-io/tap/ting']) {
      assert.ok(app.includes(command), `${locale}: missing ${command}`);
    }
    const support = await html(pathFor(locale, 'apps/ting/support'));
    assert.ok(support.includes('brew uninstall --cask bobuk-io/tap/ting'), locale);
    assert.ok(support.includes('--zap'), locale);
  }
});

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

test('Splash Finish 0.3.17, Ting 0.7.19, lowkey 0.1.3 and HAScS 0.3.4 announce BobukKit 0.5.0 updates in every locale', async () => {
  for (const locale of locales) {
    if (snapshot.repositories.includes('splash-finish')) {
      const app = await html(pathFor(locale, 'apps/splash-finish'));
      const support = await html(pathFor(locale, 'apps/splash-finish/support'));
      for (const text of ['0.3.17', 'BobukKit 0.5.0', 'More colors', 'Auto']) {
        assert.ok(app.includes(text), `${locale}: splash-finish missing ${text}`);
      }
      assert.ok(app.indexOf('0.3.17?') < app.indexOf('0.3.16?'), `${locale}: 0.3.17 must come first`);
      assert.ok(support.includes('0.3.17') && support.includes('More colors'), `${locale}: splash-finish support missing 0.3.17`);
    }
    if (snapshot.repositories.includes('ting')) {
      const app = await html(pathFor(locale, 'apps/ting'));
      const support = await html(pathFor(locale, 'apps/ting/support'));
      for (const text of ['Ting 0.7.19', 'More colors', 'Catppuccin', 'Kanagawa']) {
        assert.ok(app.includes(text), `${locale}: ting missing ${text}`);
      }
      assert.ok(support.includes('Ting 0.7.19') && support.includes('BobukKit 0.5.0'), `${locale}: ting support missing 0.7.19`);
    }
    if (snapshot.repositories.includes('lowkey')) {
      const app = await html(pathFor(locale, 'apps/lowkey'));
      const support = await html(pathFor(locale, 'apps/lowkey/support'));
      for (const text of ['lowkey 0.1.3', 'BobukKit 0.5.0', 'More colors', '⌘L']) {
        assert.ok(app.includes(text), `${locale}: lowkey missing ${text}`);
      }
      assert.ok(support.includes('lowkey 0.1.3') && support.includes('More colors'), `${locale}: lowkey support missing 0.1.3`);
    }
    if (snapshot.repositories.includes('HAScS')) {
      const app = await html(pathFor(locale, 'apps/hascs'));
      const support = await html(pathFor(locale, 'apps/hascs/support'));
      assert.ok(app.includes('0.3.4') && app.includes('BobukKit 0.5.0'), `${locale}: hascs missing 0.3.4`);
      assert.ok(support.includes('HAScS 0.3.4') && support.includes('BobukKit 0.5.0'), `${locale}: hascs support missing 0.3.4`);
    }
  }
});

test('Splash Finish 0.3.16 announces Antigravity, Copilot CLI, Codex async questions and Snooze in every locale', async () => {
  if (!snapshot.repositories.includes('splash-finish')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/splash-finish'));
    for (const text of ['0.3.16', 'Antigravity', 'Copilot CLI', 'ask_question', 'Unsnooze']) {
      assert.ok(app.includes(text), `${locale}: missing ${text}`);
    }
    assert.ok(app.indexOf('0.3.16?') < app.indexOf('0.3.15?'), `${locale}: 0.3.16 must come first`);
    const support = await html(pathFor(locale, 'apps/splash-finish/support'));
    for (const text of ['0.3.16', 'ANTIGRAVITY_CONFIG_DIR', 'COPILOT_HOME', 'Unsnooze']) {
      assert.ok(support.includes(text), `${locale}: support missing ${text}`);
    }
  }
});

test('Ting 0.7.18 documents fuzzy search, Clipbawd image previews and ⌘, Settings in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/ting'));
    for (const text of ['Ting 0.7.18', 'Rank by apps you use', 'Clipbawd', 'PNG', '⌘,']) {
      assert.ok(app.includes(text), `${locale}: missing ${text}`);
    }
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of ['Ting 0.7.18', 'app-usage.json', 'Keys &amp; Launch', 'PNG', '⌘,']) {
      assert.ok(support.includes(text), `${locale}: support missing ${text}`);
    }
    const privacy = await html(pathFor(locale, 'apps/ting/privacy'));
    assert.ok(privacy.includes('app-usage.json'), `${locale}: privacy missing app-usage.json`);
  }
});

test('Splash Finish 0.3.15 announces the snooze fix in every locale', async () => {
  if (!snapshot.repositories.includes('splash-finish')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/splash-finish'));
    for (const text of ['0.3.15', 'Snooze', '⌘C', '/Applications', 'BobukKit']) {
      assert.ok(app.includes(text), `${locale}: missing ${text}`);
    }
    assert.ok(app.indexOf('0.3.15?') < app.indexOf('0.3.14?'), `${locale}: 0.3.15 must come first`);
  }
});

test('Splash Finish 0.3.14 announces the BobukKit window in every locale', async () => {
  if (!snapshot.repositories.includes('splash-finish')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/splash-finish'));
    for (const text of ['0.3.14', 'BobukKit', 'Ting', 'lowkey']) {
      assert.ok(app.includes(text), `${locale}: missing ${text}`);
    }
    assert.ok(app.indexOf('0.3.14') < app.indexOf('0.3.13'), `${locale}: 0.3.14 must come first`);
  }
});

test('HAScS 0.3.3 announces shared localized hints in every locale', async () => {
  if (!snapshot.repositories.includes('HAScS')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/hascs'));
    for (const text of ['0.3.3', 'BobukKit', 'Keychain']) {
      assert.ok(app.includes(text), `${locale}: HAScS missing ${text}`);
    }
  }
});

test('lowkey has lowercase branding and complete public release facts in every locale', async () => {
  if (!snapshot.repositories.includes('lowkey')) return;
  const entry = catalog.find(app => app.slug === 'lowkey');
  assert.equal(entry?.name, 'lowkey');
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/lowkey'));
    const support = await html(pathFor(locale, 'apps/lowkey/support'));
    const privacy = await html(pathFor(locale, 'apps/lowkey/privacy'));
    for (const text of ['0.1.2', 'save-pdf', 'Tint', 'lowkeyctl', 'lowkey.app', '/Applications', 'Command-Shift-L', 'GitHub Releases', 'SHA-256', 'Homebrew']) {
      assert.ok(app.includes(text), `${locale}: missing lowkey fact ${text}`);
    }
    for (const text of ['~/.config/lowkey/config.json', 'Library/Application Support/Lowkey/history.json', 'WebKit']) {
      assert.ok(support.includes(text), `${locale}: lowkey support missing ${text}`);
      assert.ok(privacy.includes(text), `${locale}: lowkey privacy missing ${text}`);
    }
    assert.ok(!app.includes('TODO(landing)'), `${locale}: unfinished lowkey copy`);
  }
});

test('Ting 0.7.16 documents native lowkey PDF steps in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/ting'));
    const guide = await html(pathFor(locale, 'apps/ting/micro-apps'));
    for (const text of ['0.7.16', '0.1.2', 'save-pdf']) {
      assert.ok(app.includes(text), `${locale}: missing PDF release ${text}`);
      assert.ok(guide.includes(text), `${locale}: missing PDF guide ${text}`);
    }
    for (const text of ['demo-page.pdf', 'timeout: 60', 'A4']) {
      assert.ok(guide.includes(text), `${locale}: missing PDF example ${text}`);
    }
  }
});

test('lowkey guide documents PDF export in every locale', async () => {
  if (!snapshot.repositories.includes('lowkey')) return;
  for (const locale of locales) {
    const guide = await html(pathFor(locale, 'apps/lowkey/lowkeyctl'));
    for (const text of ['save-pdf', 'Save as PDF', 'A4', '0.1.2']) {
      assert.ok(guide.includes(text), `${locale}: missing PDF fact ${text}`);
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
    // Check the historical release sections, not unrelated previews of future versions.
    const released = [...source.matchAll(/<section>[\s\S]*?<\/section>/g)]
      .map(match => match[0]).filter(section => section.includes('Ting 0.3.'));
    assert.ok(released.length > 0, `${locale}: missing released 0.3.x sections`);
    for (const section of released) assert.doesNotMatch(section, /unreleased|ещё не выпущено|ще не випущено/);
  }
});

test('Ting documents release 0.4.0 micro-apps and their security model in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/ting'));
    assert.ok(app.includes('Ting 0.4.0'), `${locale}: missing 0.4.0 on the app page`);
    for (const text of ['~/.config/ting/micro/', 'Copy Agent Prompt', 'Ting --check', '60']) {
      assert.ok(app.includes(text), `${locale}: missing ${text} on the app page`);
    }
    assert.doesNotMatch(app, /Not yet\. Actions open apps or URLs only|Пока нет: только приложения и URL|Поки ні: лише застосунки та URL/);
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of ['Ting 0.4.0', 'FORMAT.md', 'Command-Return', 'micro-errors.log', 'Copy Agent Prompt', 'Ting --check', 'config.json']) {
      assert.ok(support.includes(text), `${locale}: missing ${text} on the support page`);
    }
    const privacy = await html(pathFor(locale, 'apps/ting/privacy'));
    for (const text of ['/bin/sh -c', 'micro-approvals.json', 'micro-values.json', 'remember: false', 'TING_*', '~/Library/Application Support/Ting/', 'Sparkle']) {
      assert.ok(privacy.includes(text), `${locale}: missing privacy fact ${text}`);
    }
  }
});

test('Ting documents release 0.7.0 calculator and the bobuk.io feed in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      assert.ok((await html(pathFor(locale, route))).includes('Ting 0.7.0'), `${locale}: missing 0.7.0 on ${route}`);
    }
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of ['2*(3+4)', '1,5 × 4', 'Calculate in launcha', 'calculator', 'https://bobuk.io/apps/ting/appcast.xml']) {
      assert.ok(support.includes(text), `${locale}: missing ${text} on the support page`);
    }
    const privacy = await html(pathFor(locale, 'apps/ting/privacy'));
    for (const text of ['https://bobuk.io/apps/ting/appcast.xml', 'bobuk.io']) {
      assert.ok(privacy.includes(text), `${locale}: missing privacy fact ${text}`);
    }
    assert.ok(!privacy.includes('this website uses GitHub Pages'), `${locale}: the site is hosted at bobuk.io`);
  }
});

test('Ting update feed is served at apps/ting/appcast.xml and points to signed GitHub archives', async () => {
  const feed = await readFile(new URL('./apps/ting/appcast.xml', dist), 'utf8');
  assert.match(feed, /^<\?xml/);
  assert.match(feed, /sparkle:version>\d+</, 'no build number');
  const version = feed.match(/sparkle:shortVersionString>([^<]+)</)?.[1];
  assert.ok(version, 'no version');
  const urls = [...feed.matchAll(/<enclosure\b[^>]*\burl="([^"]+)"/g)].map(match => match[1]);
  assert.ok(urls.length >= 1, 'no archive');
  for (const url of urls) assert.ok(url.startsWith('https://github.com/bobuk-io/ting/releases/download/v'), url);
  assert.ok(urls[0].endsWith(`/v${version}/Ting-${version}-universal.zip`), urls[0]);
  assert.match(feed, /sparkle:edSignature="[^"]+"/, 'the archive is not signed for Sparkle');
});

test('Ting documents release 0.6.1 Accessibility window in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      assert.ok((await html(pathFor(locale, route))).includes('Ting 0.6.1'), `${locale}: missing 0.6.1 on ${route}`);
    }
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of ['Open Accessibility Settings', 'Settings › Advanced', 'Allow…', 'Check for Updates…']) {
      assert.ok(support.includes(text), `${locale}: missing ${text} on the support page`);
    }
    const guide = await html(pathFor(locale, 'apps/ting/micro-apps'));
    for (const text of ['v0.7.6', 'Settings › Advanced']) {
      assert.ok(guide.includes(text), `${locale}: missing ${text} on the guide page`);
    }
  }
});

test('Ting documents release 0.6.0 context, keys and paste in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  const permissions = {
    en: ['Accessibility', 'Automation'],
    ru: ['универсальный доступ', 'автоматизаци'],
    uk: ['доступність', 'автоматизаці'],
  };
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      assert.ok((await html(pathFor(locale, route))).includes('Ting 0.6.0'), `${locale}: missing 0.6.0 on ${route}`);
    }
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of ['${context.finder.selection}', '$TING_CONTEXT_FINDER_SELECTION', 'keys: [cmd+a, return]', 'to: [app]', '--context', 'Command-C']) {
      assert.ok(support.includes(text), `${locale}: missing ${text} on the support page`);
    }
    const privacy = await html(pathFor(locale, 'apps/ting/privacy'));
    for (const text of ['TING_CONTEXT_*', 'Command-C', ...permissions[locale]]) {
      assert.ok(privacy.includes(text), `${locale}: missing privacy fact ${text}`);
    }
    const guide = await html(pathFor(locale, 'apps/ting/micro-apps'));
    for (const text of ['context: [selection]', '${context.SOURCE.FIELD}', '$TING_CONTEXT_SOURCE_FIELD', 'keys: cmd+t', 'to: [app]', '--context']) {
      assert.ok(guide.includes(text), `${locale}: missing ${text} on the guide page`);
    }
  }
});

test('Ting documents release 0.5.1 performance and aligned keycaps in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  const facts = {
    en: ['preloads app icons', 'activated directly', 'system shadow', 'same minimum width'],
    ru: ['заранее загружает иконки', 'активируются напрямую', 'системную тень', 'одинаковую минимальную ширину'],
    uk: ['заздалегідь завантажує іконки', 'активуються напряму', 'системну тінь', 'однакову мінімальну ширину'],
  };
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      assert.ok((await html(pathFor(locale, route))).includes('Ting 0.5.1'), `${locale}: missing 0.5.1 on ${route}`);
    }
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const fact of facts[locale]) assert.ok(support.includes(fact), `${locale}: missing ${fact}`);
  }
});

test('Ting documents release 0.5.0 steps, libraries and ting-micro in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/ting'));
    for (const text of ['Ting 0.5.0', 'Python', 'Ollama', 'ting-micro']) {
      assert.ok(app.includes(text), `${locale}: missing ${text} on the app page`);
    }
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of ['Ting 0.5.0', '~/.config/ting/micro/libs/', 'call', 'inherit', 'check-config', 'CONFIGURING.md', '300']) {
      assert.ok(support.includes(text), `${locale}: missing ${text} on the support page`);
    }
    const privacy = await html(pathFor(locale, 'apps/ting/privacy'));
    for (const text of ['url', 'ai', '300', 'ting-micro check']) {
      assert.ok(privacy.includes(text), `${locale}: missing privacy fact ${text}`);
    }
  }
});

test('Ting has a micro-app guide in every locale that recommends coding agents', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  const nav = { en: 'Micro-apps', ru: 'Микро-приложения', uk: 'Мікрозастосунки' };
  for (const locale of locales) {
    const guide = await html(pathFor(locale, 'apps/ting/micro-apps'));
    for (const text of ['Copy Agent Prompt', 'Claude Code', 'Codex', 'My task:', 'ting.microapp/2', 'ting.microlib/1',
      'inherit: translate', 'call: translate', '${steps.ID}', '${keychain.SERVICE}', 'ting-micro', 'check-config',
      'security add-generic-password', '--allow-effects', 'Command-Return', 'CONFIGURING.md', 'FORMAT.md']) {
      assert.ok(guide.includes(text), `${locale}: missing ${text} on the guide page`);
    }
    for (const page of ['apps/ting', 'apps/ting/support', 'apps/ting/privacy']) {
      assert.ok((await html(pathFor(locale, page))).includes(`href="${pathFor(locale, 'apps/ting/micro-apps').replace(/index\.html$/, '')}`) || (await html(pathFor(locale, page))).includes(nav[locale]), `${locale}: ${page} does not link the guide`);
    }
  }
});

test('Ting has localized launcher copy and screenshots without HAScS claims', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  const expected = { en: 'Your next app. A few keys away.', ru: 'Нужное приложение. Парой клавиш.', uk: 'Потрібний застосунок. Парою клавіш.' };
  for (const locale of locales) {
    const source = await html(pathFor(locale, 'apps/ting'));
    assert.ok(source.includes(expected[locale]));
    assert.ok(source.includes('/images/ting-icon.png'));
    assert.ok(source.includes('/images/shots/ting/selecta.webp'));
    assert.ok(source.includes('~/.config/ting/config.json'));
    assert.ok(source.includes('Home') && source.includes('F13'));
    assert.ok(!source.includes('Home Assistant'));
    assert.ok(!source.includes('apps.apple.com'));
    if (locale === 'uk') {
      assert.ok(source.includes('Темна чи світла тема — на вибір.'));
      assert.ok(!source.includes('Світла чи темна тема'));
    }
    for (const section of ['support', 'privacy']) {
      const page = await html(pathFor(locale, `apps/ting/${section}`));
      assert.ok(page.includes('~/.config/ting/'));
      assert.ok(page.includes('https://github.com/bobuk-io/ting/security/advisories/new'));
      assert.ok(!page.includes('Home Assistant'));
    }
  }
});

test('every public app shows a screenshot carousel on the homepage and its own page', async () => {
  const shots = source => [...source.matchAll(/<li class="shot-slide"[^>]*>[\s\S]*?<img src="([^"]+)"[^>]*alt="([^"]*)"[\s\S]*?<figcaption>([^<]+)<\/figcaption>/g)];
  for (const locale of locales) {
    const homepage = await html(pathFor(locale));
    assert.equal((homepage.match(/aria-roledescription="carousel"/g) || []).length, active.length, `${locale}: one carousel per app`);
    for (const app of active) {
      const page = await html(pathFor(locale, `apps/${app.slug}`));
      for (const [where, source] of [['home', homepage], ['page', page]]) {
        const slides = shots(where === 'home' ? source.slice(source.indexOf(`id="app-${app.slug}"`)) : source).filter(([, src]) => src.startsWith(`/images/shots/${app.slug}/`));
        assert.ok(slides.length >= 3, `${locale} ${where} ${app.slug}: ${slides.length} screenshots`);
        for (const [, src, alt, caption] of slides) {
          assert.ok(alt.length > 20 && caption.trim().length > 5, `${locale} ${app.slug}: ${src} needs alt and caption`);
          if (app.slug === 'hascs') assert.ok(src.endsWith(`-${locale}.webp`), `${locale}: HAScS screenshots follow the page language`);
        }
      }
    }
  }
});

test('the homepage lists the most recently updated app first', async () => {
  const time = app => Date.parse(snapshot.updatedAt?.[app.repo] ?? '') || 0;
  const expected = [...active].sort((a, b) => time(b) - time(a)).map(app => app.slug);
  for (const locale of locales) {
    const homepage = await html(pathFor(locale));
    const order = active.map(app => [app.slug, homepage.indexOf(`id="app-${app.slug}"`)]).sort((a, b) => a[1] - b[1]).map(([slug]) => slug);
    assert.deepEqual(order, expected, `${locale}: homepage order`);
  }
});

test('no scaffold placeholders reach the built site', async () => {
  for (const file of await htmlFiles(dist)) {
    const source = await readFile(file, 'utf8');
    assert.ok(!source.includes('TODO(landing)'), `${file.pathname.slice(dist.pathname.length)} still has TODO(landing) text from npm run app:new`);
  }
});


test('Ting 0.7.3 announces the launcher menu gear in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  const position = { en: 'bottom-right', ru: 'справа внизу', uk: 'праворуч унизу' };
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      const source = await html(pathFor(locale, route));
      for (const text of ['Ting 0.7.3', position[locale], 'selecta', 'launcha', 'Settings', 'Check for Updates']) {
        assert.ok(source.includes(text), `${locale}: missing ${text} on ${route}`);
      }
    }
  }
});

test('Ting 0.7.11 documents the selecta delay in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    assert.ok((await html(pathFor(locale, 'apps/ting'))).includes('Ting 0.7.11'));
    assert.match(await html(pathFor(locale, 'apps/ting/support')), /Show menu after/);
  }
});

test('Ting 0.7.10 documents reopening 1Password in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      assert.match(await html(pathFor(locale, route)), /Ting 0\.7\.10[^<]*1Password/);
    }
  }
});

test('Ting 0.7.9 documents lowkey actions and preview in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/ting'));
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of ['Ting 0.7.9', 'lowkey', 'preview']) assert.ok(app.includes(text), `${locale}: missing ${text}`);
    for (const text of ['lowkeyctl', 'action: inspect', '--allow-effects']) assert.ok(support.includes(text), `${locale}: missing ${text}`);
  }
});

test('Ting 0.7.8 documents lowkey integration, privacy and Purr in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const app = await html(pathFor(locale, 'apps/ting'));
    const support = await html(pathFor(locale, 'apps/ting/support'));
    const privacy = await html(pathFor(locale, 'apps/ting/privacy'));
    for (const text of ['Ting 0.7.8', 'lowkey', 'Open', 'Toggle', 'BobukKit', 'Purr']) {
      assert.ok(app.includes(text), `${locale}: Ting 0.7.8 missing ${text}`);
    }
    for (const text of ['lowkey://alias/open', 'lowkey://alias/toggle', 'Purr', 'PATH']) {
      assert.ok(support.includes(text), `${locale}: Ting support missing ${text}`);
    }
    for (const text of ['~/.config/lowkey/config.json', 'cookies', 'io.bobuk.lowkey']) {
      assert.ok(privacy.includes(text), `${locale}: Ting privacy missing ${text}`);
    }
  }
});

test('Ting 0.7.7 documents empty new bindings and explicit saving in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  const localized = {
    en: ['starts empty', 'leaves no new binding'],
    ru: ['начинается без клавиш', 'отменяет создание привязки'],
    uk: ['починається без клавіш', 'скасовує створення прив’язки'],
  };
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      const page = await html(pathFor(locale, route));
      for (const text of ['Ting 0.7.7', 'Done', 'Cancel', 'Escape']) {
        assert.ok(page.includes(text), `${locale}: missing ${text} on ${route}`);
      }
    }
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of localized[locale]) {
      assert.ok(support.includes(text), `${locale}: missing ${text} in binding support`);
    }
  }
});

test('Ting 0.7.17 documents searchable settings and opt-in clipboard retention in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of ['Ting 0.7.17', 'Keys &amp; Launch', 'Micro-apps', 'Tools', 'Retention limits', '100', '50 MiB', '30', '32 MiB', 'MP4/MOV/M4V', 'Keep history between launches']) {
      assert.ok(support.includes(text), `${locale}: missing ${text} in upcoming clipboard/settings copy`);
    }
    const privacy = await html(pathFor(locale, 'apps/ting/privacy'));
    for (const text of ['~/Library/Application Support/Ting/Clipbawd/', 'Clear History', 'Use Clipbawd']) {
      assert.ok(privacy.includes(text), `${locale}: missing ${text} in upcoming history privacy copy`);
    }
  }
});

test('Ting 0.7.6 documents Clipbawd and negative history indices in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const page = await html(pathFor(locale, 'apps/ting'));
    for (const text of ['Ting 0.7.6', 'Clipbawd', 'Use Clipbawd', 'launcha', '${clipboard[-1]}', '${clipboard[-2]}', 'env:', 'Safari', 'Shift-Command-Delete']) {
      assert.ok(page.includes(text), `${locale}: missing ${text} in Clipbawd copy`);
    }
    const guide = await html(pathFor(locale, 'apps/ting/micro-apps'));
    for (const text of ['Ting 0.7.6', '${clipboard[-1]}', '${clipboard[-2]}', '${clipboard[-3]}', 'env:', '$CLIP', 'ting-micro run']) {
      assert.ok(guide.includes(text), `${locale}: missing ${text} in the history guide`);
    }
    const privacy = await html(pathFor(locale, 'apps/ting/privacy'));
    for (const text of ['Clipbawd', 'DNS rebinding', 'Secure Keyboard Entry']) {
      assert.ok(privacy.includes(text), `${locale}: missing ${text} in history privacy copy`);
    }
    assert.ok((await html(pathFor(locale, 'apps/ting/support'))).includes('Ting 0.7.6'));
  }
});

test('Ting 0.7.5 announces shortcuts and other new features in all locales', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  const localized = { en: ['links', 'converter'], ru: ['ссылки', 'конвертер'], uk: ['посилання', 'конвертер'] };
  for (const locale of locales) {
    const page = await html(pathFor(locale, 'apps/ting'));
    for (const text of ['Ting 0.7.5', 'Command-Shift-K', 'Set Global Shortcut', 'Remove Global Shortcut', 'appHotkeys', 'config.json', ...localized[locale]]) {
      assert.ok(page.includes(text), `${locale}: missing ${text} on Ting 0.7.5 page`);
    }
    assert.ok(!page.includes('not yet in a published release'), `${locale}: stale unreleased shortcut copy`);
  }
});

test('Ting 0.7.4 documents interactive steps and sound in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    const guide = await html(pathFor(locale, 'apps/ting/micro-apps'));
    for (const text of ['Ting 0.7.4', 'choose', 'ask', 'placeholder', 'multiline', 'required', '${steps.ID}', 'Command-Return']) {
      assert.ok(guide.includes(text), `${locale}: missing ${text} in the interactive guide`);
    }
    const support = await html(pathFor(locale, 'apps/ting/support'));
    for (const text of ['Ting 0.7.4', 'choose', 'ask', 'soundVolume', 'Purr', '0.5']) {
      assert.ok(support.includes(text), `${locale}: missing ${text} in support`);
    }
    assert.ok((await html(pathFor(locale, 'apps/ting'))).includes('choose'));
  }
});

test('Ting 0.7.4 announces Homebrew updates in every locale', async () => {
  if (!snapshot.repositories.includes('ting')) return;
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      const source = await html(pathFor(locale, route));
      for (const text of ['Ting 0.7.4', 'Update Ting via Homebrew', 'brew upgrade --cask --greedy bobuk-io/tap/ting', 'Sparkle']) {
        assert.ok(source.includes(text), `${locale}: missing ${text} on ${route}`);
      }
    }
  }
});

test('Ukrainian home page closing text says "розберемося"', async () => {
  const source = await html('/uk/');
  assert.ok(source.includes('А якщо щось пішло не так — розберемося.'));
  assert.ok(!source.includes('розберімося'));
});

test('Reviewed site copy uses the agreed wording in every locale', async () => {
  const shared = {
    ru: ['Инструмент для конкретной задачи.', 'Не универсальный трансформер на все случаи жизни, а компактный инструмент, которому есть место в повседневности.', 'Код — не тайна.', 'У каждого приложения свои инструкции, информация о данных и отдельная страница поддержки.', 'Посмотреть'],
    uk: ['Інструмент для конкретної справи.', 'Не універсальний трансформер на всі випадки життя, а компактний інструмент, якому є місце у повсякденні.', 'Код — не таємниця.', 'Кожен застосунок має свої інструкції, інформацію про дані та окрему сторінку підтримки.', 'Ознайомитися'],
  };
  const apps = {
    ting: {
      ru: ['Нужное приложение. Парой клавиш.', 'откроется приложение или URL либо запустится микро-приложение.'],
      uk: ['Потрібний застосунок. Парою клавіш.', 'Лаунчер для macOS через початкову клавішу. Натисніть початкову клавішу, а далі — призначену клавішу або послідовність для запуску застосунку, URL або мікрозастосунку. Наприклад: Home, потім w, g — і ви на GitHub. Натисніть початкову клавішу двічі, щоб відкрити пошук застосунків launcha.'],
    },
    lowkey: {
      ru: ['Компактный браузер для macOS на системном WebKit. Без вкладок и постоянной адресной строки: сохранённые сайты открываются по алиасу, каждый с отдельным профилем и авторизацией.'],
      uk: ['Компактний браузер для macOS на системному WebKit. Без вкладок і постійного адресного рядка: збережені сайти відкриваються за аліасом, кожен з окремим профілем і авторизацією.'],
    },
    hascs: { ru: ['Нажмите номер, чтобы запустить сцену.'], uk: ['Натисніть номер, щоб запустити сцену.'] },
    'splash-finish': {
      en: ['One tidy inbox for Claude Code, Codex, GitHub Copilot CLI, Antigravity (agy), and pi. Know when work is done or an agent needs a decision, then return to the right session.'],
      ru: ['Один чистый инбокс для Claude Code, Codex, GitHub Copilot CLI, Antigravity (agy) и pi. Узнавайте, что работа закончена или что агенту нужно ваше решение, — и возвращайтесь к нужной сессии.'],
      uk: ['Один чистий інбокс для Claude Code, Codex, GitHub Copilot CLI, Antigravity (agy) і pi. Дізнавайтеся, що роботу завершено або що агенту потрібне ваше рішення, — і повертайтесь до потрібної сесії.'],
    },
  };
  for (const locale of ['ru', 'uk']) {
    const home = await html(pathFor(locale));
    for (const text of shared[locale]) assert.ok(home.includes(text), `${locale} home: ${text}`);
  }
  for (const [slug, byLocale] of Object.entries(apps)) {
    const repo = catalog.find(app => app.slug === slug)?.repo ?? slug;
    if (!snapshot.repositories.includes(repo)) continue;
    for (const [locale, texts] of Object.entries(byLocale)) {
      const page = await html(pathFor(locale, `apps/${slug}`));
      for (const text of texts) assert.ok(page.includes(text), `${locale} ${slug}: ${text}`);
    }
  }
  const old = ['Кількома клавішами', 'Несколькими клавишами', 'Познайомитися', 'Познакомиться', 'тихий інбокс', 'тихий инбокс', 'quiet inbox',
    'Одна справа. Добре.', 'Одна задача. Хорошо.', 'комбайн', 'Код — не секрет.', 'Натисніть цифру', 'Нажмите цифру',
    'невеликий мікрозастосунок', 'небольшое микро-приложение', 'Невеликий браузер', 'Небольшой браузер'];
  for (const file of await htmlFiles(dist)) {
    const source = await readFile(file, 'utf8');
    for (const text of old) assert.ok(!source.includes(text), `${file.pathname}: ${text}`);
  }
});

test('Ukrainian pages use the agreed terms', async () => {
  const unescape = text => text.replaceAll('&#39;', "'").replaceAll('&#x27;', "'").replaceAll('&amp;', '&');
  const files = (await htmlFiles(new URL('uk/', dist))).filter(file => file.pathname.includes('/uk/'));
  assert.ok(files.length > 0, 'no built Ukrainian pages');
  for (const file of files) {
    const page = await readFile(file, 'utf8');
    assert.doesNotMatch(page, /типов|сполучен/i, `old term in ${file.pathname}`);
  }
  const ting = unescape(await html('/uk/apps/ting/'));
  for (const text of ['За замовчуванням selecta з’являється одразу', 'відтворює звуковий сигнал', 'вікно закривається самостійно', 'показує, що саме мікрозастосунок читає й надсилає', 'зокрема кирилицею']) {
    assert.ok(ting.includes(text), `missing: ${text}`);
  }
  for (const text of ['Новий типовий звук', 'явно вибраний звук не змінюється', 'закривається саме', 'зокрема українською та російською']) {
    assert.ok(!ting.includes(text), `still present: ${text}`);
  }
});

test('Ting announces the version in its update feed in every locale', async () => {
  const feed = await readFile(new URL('./apps/ting/appcast.xml', dist), 'utf8');
  const version = feed.match(/sparkle:shortVersionString>([^<]+)</)?.[1];
  assert.ok(version);
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      const page = await html(pathFor(locale, route));
      assert.ok(page.includes(`>Ting ${version}<`) || page.includes(`>Ting ${version}:`));
    }
  }
});

test('Ting 0.7.14 documents Finder and Safari search in every locale', async () => {
  for (const locale of locales) {
    for (const route of ['apps/ting', 'apps/ting/support']) {
      const page = await html(pathFor(locale, route));
      assert.match(page, /Ting 0\.7\.14<[^>]+>\s*<p[^>]*>[^<]*Finder[^<]*Safari/);
    }
  }
});

test('every app window uses its catalog accent and the newest app gets the wide window', async () => {
  const accents = Object.fromEntries(JSON.parse(await readFile(new URL('../src/data/catalog.json', import.meta.url))).map(app => [app.slug, app.accent]));
  const time = app => Date.parse(snapshot.updatedAt?.[app.repo] ?? '') || 0;
  const newest = [...active].sort((a, b) => time(b) - time(a))[0];
  for (const locale of locales) {
    const homepage = await html(pathFor(locale));
    for (const app of active) {
      assert.match(accents[app.slug] ?? '', /^#[0-9a-fA-F]{6}$/, `${app.slug}: accent in catalog.json`);
      const window = homepage.slice(0, homepage.indexOf(`id="app-${app.slug}"`)).lastIndexOf('<article');
      const tag = homepage.slice(window, homepage.indexOf('>', window));
      assert.ok(tag.includes(`--accent: ${accents[app.slug]}`), `${locale} ${app.slug}: window accent`);
      assert.equal(tag.includes('wide'), app.slug === newest.slug, `${locale} ${app.slug}: wide window`);
    }
  }
});

test('the latest releases come from the GitHub snapshot, newest first', async () => {
  const releases = Object.entries(snapshot.releases ?? {}).filter(([repo]) => active.some(app => app.repo === repo))
    .sort((a, b) => Date.parse(b[1].publishedAt) - Date.parse(a[1].publishedAt));
  for (const locale of locales) {
    const homepage = await html(pathFor(locale));
    const positions = releases.map(([, release]) => homepage.indexOf(`href="${release.url}"`));
    assert.ok(positions.every(position => position > 0), `${locale}: every release is linked`);
    assert.deepEqual([...positions].sort((a, b) => a - b), positions, `${locale}: newest release first`);
    for (const [repo, release] of releases) {
      const name = active.find(app => app.repo === repo).name;
      assert.ok(homepage.includes(`${name} ${release.tag.replace(/^v/, '')}`), `${locale}: ${name} version`);
    }
  }
});

test('the homepage does not state how many apps there are in its copy', async () => {
  for (const locale of locales) {
    const text = (await html(pathFor(locale))).replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /\b(four|four small|четыре|чотири)\b/i, `${locale}: app count in copy`);
  }
});

test('app pages show the four newest updates and keep the rest under All updates', async () => {
  for (const app of active) for (const locale of locales) {
    const page = await html(pathFor(locale, `apps/${app.slug}`));
    const visible = page.slice(page.indexOf('<section class="features'), page.indexOf('</section>', page.indexOf('<section class="features')));
    assert.ok((visible.match(/<h2>/g) || []).length <= 4, `${locale} ${app.slug}: at most four visible updates`);
    const hidden = page.includes('class="more-features');
    const total = (page.match(/<span class="index">/g) || []).length;
    assert.equal(hidden, total > 4, `${locale} ${app.slug}: All updates only for long histories`);
  }
});
