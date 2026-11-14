// Turn window captures into carousel screenshots. See docs/updating.md → «Скриншоты».
//
//   npm run app:shots -- <slug> [--locale en|ru|uk] [--tight] [--force] <capture.png…>
//
// For each PNG: trims transparent margins (--tight also cuts a shadow drawn inside the window),
// saves public/images/shots/<slug>/<name>[-<locale>].webp as lossless WebP and prints `shots`
// entries to paste into src/data/apps/<slug>.ts. The first capture also becomes the social preview
// public/images/<slug>.png when the app has none yet. Needs ImageMagick and cwebp
// (brew install imagemagick webp).
import { parseArgs } from 'node:util';
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const exists = file => access(file).then(() => true, () => false);
const fail = message => { console.error(`app:shots: ${message}`); process.exit(1); };
const run = (command, args) => execFileSync(command, args, { encoding: 'utf8' }).trim();

const { values: options, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    locale: { type: 'string' }, tight: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false }, help: { type: 'boolean', short: 'h', default: false },
  },
});
if (options.help || positionals.length < 2) {
  console.log('Usage: npm run app:shots -- <slug> [--locale en|ru|uk] [--tight] [--force] <capture.png…>');
  process.exit(options.help ? 0 : 1);
}
const [slug, ...captures] = positionals;
if (options.locale && !['en', 'ru', 'uk'].includes(options.locale)) fail('--locale must be en, ru or uk.');
for (const tool of ['magick', 'cwebp']) {
  try { execFileSync('which', [tool], { stdio: 'ignore' }); } catch { fail(`${tool} not found. Install with: brew install imagemagick webp`); }
}
const catalogFile = path.join(root, 'src/data/catalog.json');
const catalog = JSON.parse(await readFile(catalogFile, 'utf8'));
const app = catalog.find(item => item.slug === slug);
if (!app) fail(`no app "${slug}" in src/data/catalog.json. Run npm run app:new first.`);

const folder = path.join(root, 'public/images/shots', slug);
await mkdir(folder, { recursive: true });
const temporary = path.join(tmpdir(), `bobuk-shot-${process.pid}.png`);
const entries = [];
try {
  for (const capture of captures) {
    if (!(await exists(capture))) fail(`${capture} not found.`);
    const base = path.basename(capture, path.extname(capture)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      .replace(new RegExp(`-${options.locale}$`), '') || 'shot';
    const name = options.locale ? `${base}-${options.locale}` : base;
    const target = path.join(folder, `${name}.webp`);
    if ((await exists(target)) && !options.force) fail(`${path.relative(root, target)} exists. Use --force to replace it.`);
    // --tight: crop to the opaque window body, dropping a soft shadow the app draws itself.
    const crop = options.tight ? run('magick', [capture, '-alpha', 'extract', '-threshold', '92%', '-format', '%@', 'info:']) : '';
    run('magick', options.tight ? [capture, '-crop', crop, '+repage', temporary] : [capture, '-trim', '+repage', temporary]);
    run('cwebp', ['-quiet', '-lossless', '-z', '9', temporary, '-o', target]);
    const [width, height] = run('magick', ['identify', '-format', '%w %h', target]).split(' ').map(Number);
    entries.push({ src: `/images/shots/${slug}/${name}.webp`, width, height });
    if (entries.length === 1 && !app.socialImage) {
      const social = path.join(root, 'public/images', `${slug}.png`);
      run('magick', [temporary, social]);
      app.socialImage = `/images/${slug}.png`;
      await writeFile(catalogFile, JSON.stringify(catalog, null, 2) + '\n');
      console.log(`Social preview: public/images/${slug}.png (socialImage set in catalog.json).`);
    }
    console.log(`${path.relative(root, target)}  ${width}×${height}`);
  }
} finally { await rm(temporary, { force: true }); }

console.log(`\nPaste into shots: [] in src/data/apps/${slug}.ts${options.locale ? ` (${options.locale})` : ' for each locale'}, then write caption and alt in that language:`);
for (const { src, width, height } of entries) {
  console.log(`      { src: '${src}', width: ${width}, height: ${height}, caption: 'TODO(landing): short line under the image', alt: 'TODO(landing): what the screenshot shows' },`);
}
console.log('\nLook at every image before publishing: no personal apps, paths, names, messages or tokens.');
