import crypto from 'node:crypto';

const NAMA = 'ssl_sess';

export function buatRahasia() {
  return process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
}

function tanda(isi, rahasia) {
  return crypto.createHmac('sha256', rahasia).update(isi).digest('base64url');
}

function sama(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function bacaSesi(req, rahasia) {
  const cookie = String(req.headers.cookie || '')
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(NAMA + '='));
  if (!cookie) return null;
  const nilai = cookie.slice(NAMA.length + 1);
  const titik = nilai.lastIndexOf('.');
  if (titik < 1) return null;
  const isi = nilai.slice(0, titik);
  const ttd = nilai.slice(titik + 1);
  if (!sama(tanda(isi, rahasia), ttd)) return null;
  try {
    const sesi = JSON.parse(Buffer.from(isi, 'base64url').toString('utf8'));
    if (!sesi.exp || sesi.exp < Date.now()) return null;
    return sesi;
  } catch {
    return null;
  }
}

export function cookieSesi(rahasia, jam = 12) {
  const isi = Buffer.from(JSON.stringify({ exp: Date.now() + jam * 3600_000 })).toString('base64url');
  const aman = process.env.COOKIE_SECURE !== '0' ? '; Secure' : '';
  return `${NAMA}=${isi}.${tanda(isi, rahasia)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${jam * 3600}${aman}`;
}

export function cookieKosong() {
  return `${NAMA}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function cocokKata(sandi, kata) {
  const a = crypto.createHash('sha256').update(String(sandi)).digest();
  const b = crypto.createHash('sha256').update(String(kata)).digest();
  return crypto.timingSafeEqual(a, b);
}
