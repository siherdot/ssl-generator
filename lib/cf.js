import fs from 'node:fs/promises';

let cache = null;

export async function bacaTokenCF() {
  if (process.env.CF_API_TOKEN) return process.env.CF_API_TOKEN.trim();
  const berkas = process.env.CF_TOKEN_FILE;
  if (!berkas) return null;
  if (cache && cache.path === berkas) {
    try {
      const sekarang = (await fs.stat(berkas)).mtimeMs;
      if (sekarang === cache.mtime) return cache.token;
    } catch {
      cache = null;
    }
  }
  try {
    const token = (await fs.readFile(berkas, 'utf8')).trim();
    if (!token) return null;
    cache = { path: berkas, mtime: (await fs.stat(berkas)).mtimeMs, token };
    return token;
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}
