import assert from 'node:assert/strict';
import { lstat, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSupportedNode } from './security.mjs';

assertSupportedNode();
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const directory = path.resolve(process.argv[2] || path.join(root, 'work/github-pages'));
const site = new URL('https://nyukimin.github.io/RenCrow.Co.Ltd/');
const files = [];
async function walk(current) {
  for (const entry of await readdir(current, { withFileTypes: true })) {
    if (current === directory && entry.name === '.git') continue;
    const file = path.join(current, entry.name);
    const relative = path.relative(directory, file).split(path.sep).join('/');
    assert.ok(!(await lstat(file)).isSymbolicLink(), `Symlink in public export: ${relative}`);
    if (entry.isDirectory()) {
      assert.ok(!entry.name.startsWith('.') && !['content', 'docs', 'scripts', 'node_modules', 'vendor'].includes(entry.name), `Private/source directory: ${relative}`);
      await walk(file);
    } else {
      assert.match(relative, /^(?:index\.html|404\.html|styles\.css|app\.js|viewer\.js|favicon\.svg|robots\.txt|sitemap\.xml|README\.md|\.nojekyll|games\/index\.html|assets\/games\/[a-z][a-z0-9-]*\.webp|characters\/[a-z][a-z0-9-]*\/index\.html|assets\/characters\/[a-z][a-z0-9-]*\.webp)$/);
      files.push(file);
    }
  }
}
await walk(directory);
const htmlFiles = files.filter(file => file.endsWith('.html'));
assert.equal(htmlFiles.length, 44, 'Preserve homepage, games, 41 characters, and 404');
let checkedLinks = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const pageUrl = new URL(path.relative(directory, file).split(path.sep).join('/'), site);
  for (const [, raw] of html.matchAll(/\b(?:href|src|data-sheet-src|data-profile-href)="([^"]+)"/g)) {
    assert.ok(!/^(?:javascript|data):/i.test(raw));
    const url = new URL(raw, pageUrl);
    if (url.origin !== site.origin) continue;
    assert.ok(url.pathname.startsWith(site.pathname), `Unprefixed URL ${raw} in ${path.relative(directory, file)}`);
    let target = path.resolve(directory, decodeURIComponent(url.pathname.slice(site.pathname.length)));
    assert.ok(target === directory || target.startsWith(directory + path.sep), 'Path escapes public export');
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    assert.ok((await stat(target)).isFile());
    if (url.hash) assert.ok((await readFile(target, 'utf8')).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${raw}`);
    checkedLinks++;
  }
  assert.ok(html.includes('<meta name="rencrow-base-path" content="/RenCrow.Co.Ltd/">'));
  assert.ok(html.includes('http-equiv="Content-Security-Policy"'));
  assert.ok(!html.includes('rencrow-coltd.ren-ai-coach.chatgpt.site'), 'Old publication origin in Pages HTML');
  assert.ok(!/(?:\/Users\/yukimi|192\.168\.|127\.0\.0\.1|localhost|[A-Z]:\\)/i.test(html), 'Private path/address in public HTML');
}
assert.ok((await stat(path.join(directory, '.nojekyll'))).isFile());
const sitemap = await readFile(path.join(directory, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, 43);
assert.ok(!sitemap.includes('chatgpt.site'));
assert.ok((await readFile(path.join(directory, 'robots.txt'), 'utf8')).includes(site.href + 'sitemap.xml'));
console.log(`Pages export passed: ${htmlFiles.length} HTML pages, ${checkedLinks} internal URLs, public-file allowlist, CSP and source isolation.`);
