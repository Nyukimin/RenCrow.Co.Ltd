import { lstat, readdir } from 'node:fs/promises';
import path from 'node:path';

// 2026-10-21 security fixes are included in the pinned 26.13.0 LTS build.
export function assertSupportedNode(version = process.versions.node) {
  const [major, minor] = version.split('.').map(Number);
  if (major !== 26 || minor < 13) {
    throw new Error(`Node.js ${version} is not approved for this project. Use Node.js 26.13.0 or a newer 26.x security release.`);
  }
}

export const contentSecurityPolicy = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; media-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests";

// The deployed artifact must contain only known static files, never source,
// server executables, secrets, dependencies, or symlinks to other directories.
export async function assertStaticDirectory(directory) {
  const allowedFile = /^(?:index\.html|404\.html|styles\.css|app\.js|viewer\.js|ip-gallery\.js|favicon\.svg|robots\.txt|sitemap\.xml|games\/index\.html|ip-gallery\/index\.html|assets\/games\/[a-z][a-z0-9-]*\.(?:webp|svg)|assets\/games\/videos\/[a-z][a-z0-9-]*\.mp4|characters\/[a-z][a-z0-9-]*\/index\.html|assets\/characters\/[a-z][a-z0-9-]*\.webp)$/;
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      const info = await lstat(file);
      if (info.isSymbolicLink() || entry.name.startsWith('.') || ['node_modules', 'vendor'].includes(entry.name)) {
        throw new Error(`Unsafe deployment entry: ${path.relative(directory, file)}`);
      }
      if (info.isDirectory()) await walk(file);
      else if (!info.isFile() || !allowedFile.test(path.relative(directory, file).split(path.sep).join('/'))) {
        throw new Error(`Unexpected deployment file: ${path.relative(directory, file)}`);
      }
    }
  }
  await walk(directory);
}
