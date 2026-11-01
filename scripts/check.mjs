import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSupportedNode, assertStaticDirectory } from './security.mjs';
assertSupportedNode();

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicRoot = path.join(root, 'public');
const characters = JSON.parse(await readFile(path.join(root, 'content/characters.json'), 'utf8'));
assert.equal(characters.length, 41, 'Expected 9 AI/friend/support characters and 32 IP characters');
assert.equal(new Set(characters.map(c => c.id)).size, 41, 'Duplicate character IDs');
for (const [group, expected] of Object.entries({ main: 4, friend: 1, support: 4, ip: 32 })) {
  assert.equal(characters.filter(c => c.group === group).length, expected, `${group} count`);
}
assert.deepEqual(characters.filter(c => c.group === 'main').map(c => c.english), ['Mio', 'Midori', 'Shiro', 'Kuro']);
assert.deepEqual(characters.filter(c => c.group === 'friend').map(c => c.english), ['Lumina']);
assert.deepEqual(characters.filter(c => c.group === 'support').map(c => c.english), ['Aka', 'Ao', 'Kin', 'Gin']);
for (const c of characters) {
  assert.match(c.id, /^[a-z][a-z0-9-]*$/);
  assert.ok(c.name && c.english && c.width > 0 && c.height > 0);
  assert.ok((await stat(path.join(publicRoot, c.image))).size > 0);
  assert.match(c.sheet, /^\/assets\/characters\/[a-z]+-sheet\.webp$/);
  assert.ok((await stat(path.join(publicRoot, c.sheet))).size > 0);
  assert.ok(c.sheetWidth > 0 && c.sheetHeight > 0);
  const profile = await readFile(path.join(publicRoot, 'characters', c.id, 'index.html'), 'utf8');
  assert.ok(profile.includes(`<h1 id="profile-name">${c.name}</h1>`), `Profile mismatch: ${c.id}`);
  assert.ok(profile.includes('作品の公開が始まり次第'), `Missing empty-work state: ${c.id}`);
  assert.ok(profile.includes(`data-sheet-src="${c.sheet}"`), `Missing sheet viewer trigger: ${c.id}`);
  if (c.group === 'ip') {
    assert.equal(c.gallery.length, 5, `Expected all 5 supplied image types: ${c.id}`);
    assert.equal(new Set(c.gallery.map(asset => asset.src)).size, 5, `Duplicate gallery images: ${c.id}`);
    for (const kind of ['portrait', 'fullbody', 'concept', 'sheet', c.number <= 22 ? 'datasheet' : 'poster']) {
      assert.ok(c.gallery.some(asset => asset.kind === kind), `Missing ${kind}: ${c.id}`);
    }
    for (const asset of c.gallery) {
      assert.match(asset.src, /^\/assets\/characters\/[a-z][a-z0-9-]*\.webp$/);
      assert.ok((await stat(path.join(publicRoot, asset.src))).size > 0);
      assert.ok((await stat(path.join(publicRoot, asset.thumbnail))).size > 0);
      assert.ok(asset.width > 0 && asset.height > 0 && asset.thumbWidth > 0 && asset.thumbHeight > 0);
      assert.ok(profile.includes(`data-sheet-src="${asset.src}"`), `Unreachable gallery image: ${asset.src}`);
    }
    assert.ok(c.details.personality.length > 0, `Missing personality: ${c.id}`);
    assert.equal(c.details.scenes.length, 3, `Missing scene descriptions: ${c.id}`);
    assert.equal((profile.match(/data-gallery-item\b/g) || []).length, 5, `Gallery item count: ${c.id}`);
    for (const id of ['personality', 'visual-world', 'gallery', 'character-works']) {
      assert.ok(profile.includes(`id="${id}"`), `Missing profile section ${id}: ${c.id}`);
    }
  }
}
const htmlFiles = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith('.html')) htmlFiles.push(file);
  }
}
await walk(publicRoot);
assert.equal(htmlFiles.length, 45, 'Homepage, games, IP gallery, 41 profiles, and 404 expected');
let checkedLinks = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `Expected one h1: ${file}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `Duplicate HTML ids: ${file}`);
  assert.ok(html.includes('http-equiv="Content-Security-Policy"'), `Missing CSP: ${file}`);
  assert.ok(html.includes('content="no-referrer"'), `Missing referrer policy: ${file}`);
  assert.ok(html.includes('src="/viewer.js"'), `Missing viewer script: ${file}`);
  assert.ok(!/\son\w+\s*=/i.test(html), `Inline event handler: ${file}`);
  assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>\s*\S/i.test(html), `Inline script: ${file}`);
  for (const [, attribute, raw] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (/^https?:/.test(raw)) continue;
    assert.ok(raw && !/^(javascript|data):/i.test(raw), `Invalid ${attribute}: ${raw}`);
    const url = new URL(raw, 'http://local/' + path.relative(publicRoot, file));
    let target = path.join(publicRoot, decodeURIComponent(url.pathname));
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    assert.ok((await stat(target)).isFile(), `Missing target: ${raw} in ${file}`);
    if (url.hash) {
      const targetHtml = await readFile(target, 'utf8');
      assert.ok(targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor: ${raw}`);
    }
    checkedLinks++;
  }
}
const index = await readFile(path.join(publicRoot, 'index.html'), 'utf8');
assert.equal((index.match(/data-character data-group=/g) || []).length, 41);
assert.equal((index.match(/class="coming-label"/g) || []).length, 4);
assert.ok(!index.includes('Webサイト準備中'));
for (const id of ['momoka', 'rei']) {
  assert.equal(characters.find(character => character.id === id).details.quotes.length, 0, `Do not invent quotes for ${id}`);
}
await assertStaticDirectory(publicRoot);
await assertStaticDirectory(path.join(root, 'dist'));
console.log(`Passed: ${characters.length} characters, 32 detailed IP profiles, 160 gallery entries, ${htmlFiles.length} HTML pages, ${checkedLinks} internal links/assets, CSP and static artifact checks.`);

const games = JSON.parse(await readFile(path.join(root, 'content/games.json'), 'utf8'));
const gamesHtml = await readFile(path.join(publicRoot, 'games/index.html'), 'utf8');
assert.equal(games.length, 11, 'Expected 11 games');
assert.equal(new Set(games.map(g => g.slug)).size, 11, 'Duplicate game slugs');
assert.ok(index.includes('href="/games/"'));
const sitemap = await readFile(path.join(publicRoot, 'sitemap.xml'), 'utf8');
assert.ok(sitemap.includes('/games/</loc>'));
assert.ok(sitemap.includes('/ip-gallery/</loc>'), 'IP gallery should be in sitemap');
for (const g of games) {
  assert.match(g.slug, /^[a-z][a-z0-9-]*$/);
  assert.match(g.screenshot, /^\/assets\/games\/[a-z][a-z0-9-]*\.(webp|svg)$/);
  assert.ok((await stat(path.join(publicRoot, g.screenshot))).size > 0);
  assert.ok(gamesHtml.includes(`id="${g.slug}"`));
  assert.ok(gamesHtml.includes(`src="${g.screenshot}"`));
  assert.ok(g.title && g.name && g.intro && g.controls && g.testStatus && g.screenshotAlt);
  if (g.videoUrl) {
    assert.match(g.videoUrl, /^\/assets\/games\/videos\/[a-z][a-z0-9-]*\.mp4$/);
    assert.ok((await stat(path.join(publicRoot, g.videoUrl))).size > 0, `Video missing: ${g.videoUrl}`);
    assert.ok(gamesHtml.includes(`src="${g.videoUrl}"`), `Video not embedded: ${g.videoUrl}`);
    assert.ok(gamesHtml.includes('イメージ動画（コンセプト映像）'), 'Video label missing');
  }
  if (g.playUrl === null) assert.ok(gamesHtml.includes('未公開・テストURL未発行'));
  else {
    const url = new URL(g.playUrl);
    assert.equal(url.protocol, 'https:');
    assert.ok(['www.roblox.com', 'roblox.com'].includes(url.hostname), 'Only verified Roblox play URLs');
  }
}
assert.ok(!/(?:[A-Z]:\\|127\.0\.0\.1|localhost|192\.168\.)/i.test(gamesHtml), 'No private paths or local addresses');
assert.ok(gamesHtml.includes('実機モバイル・ネットワーク環境での検証は未実施'));
console.log(`Passed: ${games.length} game cards, screenshot assets, test-link states and games sitemap entry.`);
