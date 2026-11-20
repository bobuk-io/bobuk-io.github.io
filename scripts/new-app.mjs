// Scaffold a new public bobuk-io app on the landing site. See docs/updating.md.
//
//   npm run app:new -- <repo> [--slug <slug>] [--name "<Name>"] [--icon <png>]
//                     [--platform macOS] [--companions "A, B"] [--accent "#RRGGBB"] [--dry-run]
//
// Creates src/data/apps/<slug>.ts (copy in en, ru and uk with TODO(landing) placeholders),
// adds the app to src/data/catalog.json, installs a 256 px icon, creates the screenshot folder
// and refreshes public-repos.json. The repository must already be public: the landing repo is
// public too, so a private app must not appear even in its source.
import { parseArgs } from 'node:util';
import { access, copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const at = (...parts) => path.join(root, ...parts);
const exists = file => access(file).then(() => true, () => false);
const fail = message => { console.error(`app:new: ${message}`); process.exit(1); };

const { values: options, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    slug: { type: 'string' }, name: { type: 'string' }, icon: { type: 'string' },
    platform: { type: 'string', default: 'macOS' }, companions: { type: 'string', default: '' }, accent: { type: 'string', default: '#E7BB74' },
    'dry-run': { type: 'boolean', default: false }, help: { type: 'boolean', short: 'h', default: false },
  },
});
if (options.help || positionals.length !== 1) {
  console.log('Usage: npm run app:new -- <repo> [--slug <slug>] [--name "<Name>"] [--icon <png>] [--platform macOS] [--companions "A, B"] [--accent "#RRGGBB"] [--dry-run]');
  process.exit(options.help ? 0 : 1);
}
const [repoName] = positionals;
const slug = options.slug ?? repoName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const name = options.name ?? repoName;
const companions = options.companions.split(',').map(item => item.trim()).filter(Boolean);
const dryRun = options['dry-run'];
if (!/^[A-Za-z0-9._-]+$/.test(repoName)) fail(`"${repoName}" is not a GitHub repository name.`);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`slug "${slug}" must be lower-case letters, digits and single hyphens. It becomes the permanent URL /apps/${slug}/.`);
if (/['\\\n]/.test(name) || companions.some(item => /['\\\n]/.test(item))) fail('names must not contain quotes, backslashes or line breaks.');

// 1. Nothing collides with an existing app.
const catalogFile = at('src/data/catalog.json');
const catalog = JSON.parse(await readFile(catalogFile, 'utf8'));
const taken = catalog.find(app => app.slug === slug || app.repoName.toLowerCase() === repoName.toLowerCase());
if (taken) fail(`${taken.name} already uses slug "${taken.slug}" or repository "${taken.repoName}".`);
const copyPath = at('src/data/apps', `${slug}.ts`);
const iconFile = at('public/images', `${slug}-icon.png`);
for (const file of [copyPath, iconFile]) if (await exists(file)) fail(`${path.relative(root, file)} already exists.`);

// 2. The repository is public, owned by bobuk-io, not a fork and not archived (anonymous request).
const response = await fetch(`https://api.github.com/repos/bobuk-io/${repoName}`, {
  headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'bobuk-io-landing' },
  signal: AbortSignal.timeout(20000),
}).catch(error => fail(`GitHub is unreachable (${error.message}).`));
if (response.status === 404) fail(`bobuk-io/${repoName} is not found or not public. Make it public first; private apps never enter the landing repo.`);
if (!response.ok) fail(`GitHub returned ${response.status}.`);
const repo = await response.json();
if (repo.private !== false || repo.visibility !== 'public' || repo.owner?.login?.toLowerCase() !== 'bobuk-io') fail('visibility or owner could not be verified.');
if (repo.fork || repo.archived) fail(`bobuk-io/${repoName} is ${repo.fork ? 'a fork' : 'archived'}; the catalog lists neither.`);
if (repo.name !== repoName) fail(`the repository is called "${repo.name}" (case matters). Use that name.`);

// 3. Find the icon: --icon, or the app checkout next to this one.
async function findIcon() {
  if (options.icon) return (await exists(options.icon)) ? path.resolve(options.icon) : fail(`icon ${options.icon} not found.`);
  const siblings = await readdir(path.join(root, '..')).catch(() => []);
  const folders = siblings.filter(entry => [repoName.toLowerCase(), slug].includes(entry.toLowerCase()));
  for (const folder of folders) for (const candidate of ['Assets/AppIcon/png/256.png', 'Assets/AppIcon/png/512.png', 'Assets/AppIcon.png', 'Assets/AppIcon/png/1024.png']) {
    const file = path.join(root, '..', folder, candidate);
    if (await exists(file)) return file;
  }
  fail(`no app icon found in ../${repoName}/Assets. Pass --icon <png>.`);
}
const iconSource = await findIcon();

// 4. Copy template. Every visible text is a TODO(landing) placeholder: tests fail until it is replaced.
const description = (repo.description || '').replace(/[\\'`]/g, '').replace(/\s+/g, ' ').trim();
const todo = text => `TODO(landing): ${text}`;
const locale = (code, label) => `  ${code}: {
    category: '${todo(`category (${label})`)}', tagline: '${todo(`short tagline (${label})`)}',
    description: '${todo(`one or two sentences (${label})${code === 'en' && description ? `. GitHub says: ${description}` : ''}`)}',
    // Real screenshots only: \`npm run app:shots -- ${slug} <png…>\` prints entries to paste here. At least three.
    shots: [],
    features: [
      { title: '${todo('feature')}', text: '${todo('what it does for the reader')}' },
      { title: '${todo('feature')}', text: '${todo('what it does for the reader')}' },
      { title: '${todo('feature')}', text: '${todo('what it does for the reader')}' },
      { title: '${todo('feature')}', text: '${todo('what it does for the reader')}' },
    ],
    installNote: '${todo('extra requirements, or remove the sentence')}',
    steps: [
      { title: '${todo('install step')}', text: '${todo(`as in the README of ${repoName}`)}' },
      { title: '${todo('first launch / setup')}', text: '${todo('permissions, settings')}' },
    ],
    faq: [
      { question: '${todo('question')}', answer: '${todo('answer')}' },
    ],
    supportIntro: '${todo('what the support page covers')}',
    support: [
      { title: '${todo('troubleshooting')}', paragraphs: [], items: ['${todo('step')}'] },
      { title: '${todo('report a problem safely')}', paragraphs: ['${todo('what to include and what never to post')}'] },
      { title: '${todo('uninstall')}', paragraphs: [], items: ['${todo('step')}'] },
    ],
    privacyTitle: '${todo('privacy title')}', privacyIntro: '${todo('privacy intro')}',
    privacy: [
      { title: '${todo('data stored on the Mac')}', paragraphs: ['${todo('from the README and the code')}'] },
      { title: '${todo('network requests')}', paragraphs: ['${todo('what is sent where, or that nothing is')}'] },
      { title: '${todo('deleting data')}', paragraphs: ['${todo('how to remove everything')}'] },
    ],
  },
`;
const source = `import type { AppCopy } from '../types';
import type { Locale } from '../../i18n';
// ${name}: ${repo.html_url}. Keep facts consistent with its README and release notes; write all three locales.
const copy: Record<Locale, AppCopy> = {
${locale('en', 'English')}${locale('ru', 'русский')}${locale('uk', 'українська')}};
export default copy;
`;
if (!/^#[0-9a-fA-F]{6}$/.test(options.accent)) fail('--accent must be a #RRGGBB color.');
const entry = { slug, repoName, name, repo: repo.html_url, platform: options.platform, icon: `/images/${slug}-icon.png`, accent: options.accent, companions };

if (dryRun) {
  console.log(`Dry run. Would create src/data/apps/${slug}.ts, public/images/${slug}-icon.png (from ${iconSource}), public/images/shots/${slug}/ and add to catalog.json:`);
  console.log(JSON.stringify(entry, null, 2));
  process.exit(0);
}

// 5. Write files.
await writeFile(copyPath, source);
catalog.push(entry);
await writeFile(catalogFile, JSON.stringify(catalog, null, 2) + '\n');
await mkdir(at('public/images/shots', slug), { recursive: true });
try {
  execFileSync('sips', ['-s', 'format', 'png', '-Z', '256', iconSource, '--out', iconFile], { stdio: 'ignore' });
} catch {
  try { execFileSync('magick', [iconSource, '-resize', '256x256', iconFile], { stdio: 'ignore' }); }
  catch { await copyFile(iconSource, iconFile); console.warn('Neither sips nor magick is available: the icon was copied without resizing to 256 px.'); }
}
execFileSync(process.execPath, [at('scripts/sync-github.mjs')], { stdio: 'inherit' });

let release = '';
const latest = await fetch(`https://api.github.com/repos/bobuk-io/${repoName}/releases/latest`, { headers: { 'User-Agent': 'bobuk-io-landing' } }).catch(() => null);
if (latest?.ok) release = (await latest.json()).tag_name ?? '';

console.log(`
Added ${name} (/apps/${slug}/). Next, see docs/updating.md → «Новое приложение»:
  1. Write src/data/apps/${slug}.ts in en, ru and uk from the README${release ? ` and the ${release} release notes` : ''}. Replace every TODO(landing).
  2. Take at least three real screenshots with demo data, then:
       npm run app:shots -- ${slug} <file.png…>          (add --locale <xx> for a localized UI)
     and paste the printed entries into shots: [] for each locale.
  3. Check companions/platform in src/data/catalog.json. If the requirements differ from
     "macOS 14+ · Apple silicon and Intel", see docs/updating.md first.
  4. npm run sync:github && npm run build && npm test, look at the pages (npm run preview), then publish.`);
