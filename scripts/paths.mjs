import path from 'node:path';

const external = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

/** Page-relative URL from a site pathname (`/`, `/games/`, `/characters/mio/`, `/404.html`) to a site-root target. */
export function relativeUrl(fromPathname, target) {
  const raw = String(target ?? '');
  if (raw === '' || external.test(raw)) return raw;
  const hashAt = raw.indexOf('#');
  const hash = hashAt >= 0 ? raw.slice(hashAt) : '';
  let rest = hashAt >= 0 ? raw.slice(0, hashAt) : raw;
  const queryAt = rest.indexOf('?');
  const query = queryAt >= 0 ? rest.slice(queryAt) : '';
  rest = queryAt >= 0 ? rest.slice(0, queryAt) : rest;
  if (rest === '') return `${hash}${query}`;
  const toPath = rest.startsWith('/') ? rest : `/${rest}`;
  const toIsDir = toPath.endsWith('/');
  const toFile = toIsDir ? `${toPath}index.html` : toPath;
  const fromFile = fromPathname.endsWith('/') ? `${fromPathname}index.html` : fromPathname;
  let rel = path.posix.relative(path.posix.dirname(fromFile), toFile);
  if (toIsDir) {
    if (rel === 'index.html') rel = '.';
    else if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
  }
  if (path.posix.normalize(toFile) === path.posix.normalize(fromFile)) {
    return query || hash ? `${query}${hash}` : './';
  }
  if (!rel) rel = '.';
  if (rel === '.') rel = './';
  else if (!rel.startsWith('.')) rel = `./${rel}`;
  return `${rel}${query}${hash}`;
}

/** Site-root path (`/assets/...` or `assets/...`) relative to the static root, for filesystem checks. */
export function siteRelativePath(value) {
  return String(value).replace(/[?#].*$/, '').replace(/^\/+/, '');
}
