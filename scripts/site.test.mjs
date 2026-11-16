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
    for (const text of ['v0.6.1', 'Settings › Advanced']) {
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
  const expected = { en: 'Your next app. A few keys away.', ru: 'Нужное приложение. Несколькими клавишами.', uk: 'Потрібний застосунок. Кількома клавішами.' };
  for (const locale of locales) {
    const source = await html(pathFor(locale, 'apps/ting'));
    assert.ok(source.includes(expected[locale]));
    assert.ok(source.includes('/images/ting-icon.png'));
    assert.ok(source.includes('/images/shots/ting/selecta.webp'));
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
