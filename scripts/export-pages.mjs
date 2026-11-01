import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSupportedNode, assertStaticDirectory } from './security.mjs';

assertSupportedNode();
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, 'dist');
const target = path.resolve(process.argv[2] || path.join(root, 'work/github-pages'));
const pages = new URL('https://nyukimin.github.io/RenCrow.Co.Ltd/');
const workRoot = path.join(root, 'work') + path.sep;
if (!target.startsWith(workRoot) && !target.startsWith('/Users/yukimi/Documents/Codex/2026-10-29/rencrow-coltd-rencrow/work/')) {
  throw new Error('Export to a generated directory under work/, then sync into the public checkout.');
}
await assertStaticDirectory(source);
const homepage = await readFile(path.join(source, 'index.html'), 'utf8');
const canonical = homepage.match(/<link rel="canonical" href="([^"]+)"/);
if (!canonical) throw new Error('Source homepage has no canonical URL');
const sourceOrigin = new URL(canonical[1]).origin;
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
async function transform(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await transform(file); continue; }
    if (!['.html', '.css', '.txt', '.xml'].includes(path.extname(file))) continue;
    let text = await readFile(file, 'utf8');
    text = text.replaceAll(sourceOrigin, pages.href.replace(/\/$/, ''));
    if (file.endsWith('.html')) {
      text = text.replace(/\b(href|src|data-sheet-src|data-profile-href)="(\/(?!\/)[^"]*)"/g, (_, key, value) => `${key}="${pages.pathname}${value.slice(1)}"`);
      text = text.replace('<meta charset="UTF-8">', `<meta charset="UTF-8"><meta name="rencrow-base-path" content="${pages.pathname}">`);
    } else if (file.endsWith('.css')) {
      text = text.replace(/url\((['"]?)(\/(?!\/)[^)'"\s]+)\1\)/g, (_, quote, value) => `url(${quote}${pages.pathname}${value.slice(1)}${quote})`);
    }
    await writeFile(file, text);
  }
}
await transform(target);
await writeFile(path.join(target, '.nojekyll'), '');
await writeFile(path.join(target, 'README.md'), `# RenCrow.Co.Ltd\n\n有限会社RenCrowのキャラクター・クリエイションサイトの公開用ファイルです。\n\nWebサイト: ${pages.href}\n\nこのリポジトリは静的配信用です。ビルド済みHTML・CSS・JavaScript・画像のみを配置し、内部資料・生成プロンプト・秘密情報は含めません。\n\n© RenCrow Co., Ltd.\n`);
console.log(`Exported public static files to ${target}`);
