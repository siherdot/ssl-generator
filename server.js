import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import ACME from 'acme';
import Keypairs from '@root/keypairs';
import CloudflareDNS from 'acme-dns-01-cloudflare';
import { buatCSR, bacaCSR, bersihkanDomain } from './lib/csr.js';
import { bacaTokenCF } from './lib/cf.js';
import { bacaSesi, cookieSesi, cookieKosong, buatRahasia, cocokKata } from './lib/auth.js';
import { pasangTambalACME } from './lib/acme-tambal.js';

pasangTambalACME(ACME);

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const PORT = Number(process.env.PORT || 3000);
const RAHASIA = buatRahasia();
const SANDI = process.env.APP_PASSWORD || '';
const EMAIL = process.env.ACME_EMAIL || 'admin@rsumb.site';
const URL_PROD = 'https://acme-v02.api.letsencrypt.org/directory';
const URL_STAGING = 'https://acme-staging-v02.api.letsencrypt.org/directory';

if (!SANDI) {
  console.error('APP_PASSWORD belum di-set. Tool sengaja tidak dibuka tanpa sandi.');
  process.exit(1);
}

const pesanSesi = new Map();
const pesanOrder = new Map();
const order = new Map();
const challengesHTTP = new Map();

const ip = (req) => String(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '-').split(',')[0].trim();

function catat(o, pesan) {
  o.log.push({ waktu: new Date().toISOString(), pesan: String(pesan).slice(0, 400) });
  if (o.log.length > 120) o.log.shift();
}

function pluginHTTP(o) {
  return {
    async init() {},
    async set({ challenge }) {
      challengesHTTP.set(challenge.token, challenge.keyAuthorization);
      const host = challenge.altname || challenge.hostname || '(domain)';
      o.validasi.push({
        domain: host,
        namaFile: challenge.token,
        isi: challenge.keyAuthorization,
        path: `/.well-known/acme-challenge/${challenge.token}`,
        petunjuk: `Letakkan file ${challenge.token} di http://${host}/.well-known/acme-challenge/${challenge.token} berisi persis: ${challenge.keyAuthorization} (redirect HTTPS diperbolehkan)`,
      });
      catat(o, `HTTP-01 disiapkan untuk ${host}`);
    },
    async get({ challenge }) {
      return { keyAuthorization: challengesHTTP.get(challenge.token) || null };
    },
    async remove({ challenge }) {
      challengesHTTP.delete(challenge.token);
    }
  };
}

async function kunciAkun(staging) {
  await fs.mkdir(DATA, { recursive: true, mode: 0o700 });
  const berkas = path.join(DATA, staging ? 'akun-staging.json' : 'akun-prod.json');
  try {
    return JSON.parse(await fs.readFile(berkas, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    const pasangan = await Keypairs.generate({ kty: 'EC', curve: 'P-256' });
    await fs.writeFile(berkas, JSON.stringify(pasangan.private), { mode: 0o600 });
    return pasangan.private;
  }
}

async function akunACME(acme, staging, accountKey) {
  await fs.mkdir(DATA, { recursive: true, mode: 0o700 });
  const berkas = path.join(DATA, staging ? 'akun-staging.info.json' : 'akun-prod.info.json');
  try {
    return JSON.parse(await fs.readFile(berkas, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    const akun = await acme.accounts.create({ accountKey, subscriberEmail: EMAIL, agreeToTerms: true });
    await fs.writeFile(berkas, JSON.stringify(akun), { mode: 0o600 });
    return akun;
  }
}

async function terbitkan(o) {
  try {
    o.status = 'memproses';
    catat(o, 'Menghubungi ACME Let’s Encrypt…');
    const staging = Boolean(o.staging);
    const acme = ACME.create({
      maintainerEmail: EMAIL,
      packageAgent: 'ssl-rsumb/1.0',
      skipChallengeTest: true,
      notify: (ev, args) => {
        if (ev === 'challenge_select') catat(o, `Pilih validasi ${args.type} untuk ${args.altname}`);
        if (ev === 'challenge_status' && args.status) catat(o, `Status ${args.altname}: ${args.status}`);
        if (ev === 'warning') catat(o, `Peringatan: ${args.message || 'tidak diketahui'}`);
      }
    });
    if (process.env.ACME_DEBUG === '1') {
      const asli = acme.__request;
      acme.__request = (opts) => {
        if (String(opts.url).includes('finalize')) console.error('ACME finalize request:', String(opts.body).slice(0, 300), 'len', String(opts.body || '').length);
        return asli(opts);
      };
    }
    await acme.init(staging ? URL_STAGING : URL_PROD);
    const accountKey = await kunciAkun(staging);
    const akun = await akunACME(acme, staging, accountKey);

    let plugin;
    if (o.challenge === 'dns') {
      const token = await bacaTokenCF();
      if (!token) throw new Error('Token Cloudflare tidak tersedia.');
      plugin = new CloudflareDNS({ token, propagationDelay: 6000 });
      catat(o, 'DNS-01: menambah record TXT _acme-challenge via Cloudflare…');
    } else {
      plugin = pluginHTTP(o);
      catat(o, 'HTTP-01: token siap. Letakkan file di webserver domain bila domain tidak mengarah ke server ini.');
    }

    const sert = await acme.certificates.create({
      account: akun,
      accountKey,
      csr: o.csr.trimEnd(),
      domains: o.domains,
      challenges: { [o.challenge === 'dns' ? 'dns-01' : 'http-01']: plugin },
      customerEmail: EMAIL,
      skipDryRun: true,
      skipChallengeTests: true
    });

    const zip = new JSZip();
    zip.file('cert.pem', sert.cert);
    zip.file('chain.pem', sert.chain);
    zip.file('fullchain.pem', `${sert.cert.trim()}\n${sert.chain.trim()}\n`);
    if (o.privateKey) zip.file('privkey.pem', o.privateKey);
    zip.file('request.csr', o.csr);
    zip.file('PETUNJUK.txt', [
      'Sertifikat dari Let’s Encrypt (valid 90 hari).',
      '',
      'Nginx : ssl_certificate     fullchain.pem;',
      '        ssl_certificate_key privkey.pem;',
      'Apache: SSLCertificateFile      cert.pem',
      '        SSLCertificateChainFile chain.pem',
      '        SSLCertificateKeyFile   privkey.pem',
      '',
      'Mode CSR sendiri: file privat key ada di pemohon, tidak disimpan server.',
      `Domain: ${o.domains.join(', ')}`
    ].join('\n'));
    o.zip = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    o.pem = {
      'cert.pem': sert.cert,
      'chain.pem': sert.chain,
      'fullchain.pem': `${sert.cert.trim()}\n${sert.chain.trim()}\n`,
      ...(o.privateKey ? { 'privkey.pem': o.privateKey } : {}),
      'request.csr': o.csr
    };
    o.status = 'selesai';
    catat(o, 'Sertifikat terbit. Unduh sebelum halaman ditutup.');
  } catch (err) {
    o.status = 'gagal';
    o.error = String(err?.message || err).slice(0, 600);
    catat(o, `Gagal: ${o.error}`);
  } finally {
    o.selesai = Date.now();
    for (const v of o.validasi) for (const [token, isi] of challengesHTTP) if (isi === v.isi) challengesHTTP.delete(token);
  }
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/.well-known/acme-challenge/:token', (req, res) => {
  const isi = challengesHTTP.get(req.params.token);
  if (!isi) return res.status(404).type('text/plain').send('not found');
  res.type('text/plain').send(isi);
});

app.use('/api', (req, res, next) => {
  if (req.path === '/login') return next();
  const s = bacaSesi(req, RAHASIA);
  if (!s) return res.status(401).json({ error: 'Sesi habis. Masukkan sandi lagi.' });
  req.sesi = s;
  next();
});

app.get('/api/sesi', (req, res) => res.json({ ok: true }));

app.post('/api/login', (req, res) => {
  const alamat = ip(req);
  const rec = pesanSesi.get(alamat) || { n: 0, sampai: 0 };
  if (rec.sampai > Date.now() && rec.n >= 5) {
    return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 10 menit.' });
  }
  if (!cocokKata(SANDI, req.body?.password || '')) {
    rec.n = rec.sampai > Date.now() ? rec.n + 1 : 1;
    rec.sampai = Date.now() + 10 * 60_000;
    pesanSesi.set(alamat, rec);
    return res.status(401).json({ error: 'Sandi salah.' });
  }
  pesanSesi.delete(alamat);
  res.setHeader('Set-Cookie', cookieSesi(RAHASIA));
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', cookieKosong());
  res.json({ ok: true });
});

app.post('/api/order', (req, res) => {
  const alamat = ip(req);
  const sekarang = Date.now();
  const riwayat = (pesanOrder.get(alamat) || []).filter((w) => w > sekarang - 3600_000);
  const batas = Number(process.env.BATAS_ORDER_PER_JAM ?? 50);
  if (batas > 0 && riwayat.length >= batas) {
    return res.status(429).json({ error: `Batas ${batas} permintaan per jam tercapai.` });
  }
  riwayat.push(sekarang);
  pesanOrder.set(alamat, riwayat);

  const b = req.body || {};
  let csr, privateKey, domains;
  try {
    if (b.mode === 'csr') {
      const hasil = bacaCSR(b.csr);
      csr = hasil.csr;
      privateKey = hasil.privateKey;
      domains = hasil.domains;
    } else {
      domains = bersihkanDomain(b.domains);
      const hasil = buatCSR({
        domains,
        cn: b.cn || domains[0],
        country: b.country,
        state: b.state,
        city: b.city,
        org: b.org,
        unit: b.unit,
        email: b.email,
        keySize: b.keySize
      });
      csr = hasil.csr;
      privateKey = hasil.privateKey;
      domains = hasil.domains;
    }
  } catch (err) {
    return res.status(400).json({ error: String(err.message || err) });
  }
  const challenge = b.challenge === 'http' ? 'http' : 'dns';
  const id = crypto.randomUUID();
  const o = {
    id,
    status: 'antrean',
    domains,
    challenge,
    staging: Boolean(b.staging),
    csr,
    privateKey,
    log: [],
    validasi: [],
    dibuat: sekarang,
    selesai: null,
    zip: null,
    pem: null,
    error: null
  };
  order.set(id, o);
  catat(o, `Permintaan diterima: ${domains.join(', ')}`);
  setImmediate(() => terbitkan(o));
  res.status(202).json({ id });
});

function ringkas(o) {
  return {
    id: o.id,
    status: o.status,
    domains: o.domains,
    challenge: o.challenge,
    staging: o.staging,
    log: o.log,
    validasi: o.validasi.map((v) => ({ domain: v.domain, path: v.path, isi: v.isi, petunjuk: v.petunjuk })),
    error: o.error,
    punyaKunci: Boolean(o.privateKey),
    punyaZip: Boolean(o.zip)
  };
}

app.get('/api/order/:id', (req, res) => {
  const o = order.get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Permintaan tidak ditemukan.' });
  res.json(ringkas(o));
});

app.get('/api/order/:id/file/:nama', (req, res) => {
  const o = order.get(req.params.id);
  if (!o || !o.pem) return res.status(404).json({ error: 'Berkas belum tersedia.' });
  const nama = req.params.nama;
  const aman = /^[\w.\-]+$/.test(nama) && Object.hasOwn(o.pem, nama);
  if (!aman) return res.status(400).json({ error: 'Nama berkas tidak dikenal.' });
  const slug = o.domains[0].replace(/\*\./g, 'wildcard-').replace(/[^a-z0-9.-]/gi, '-');
  res.setHeader('Content-Disposition', `attachment; filename="${slug}-${nama}"`);
  res.type('text/plain').send(o.pem[nama]);
});

app.get('/api/order/:id/zip', (req, res) => {
  const o = order.get(req.params.id);
  if (!o || !o.zip) return res.status(404).json({ error: 'Berkas belum tersedia.' });
  const slug = o.domains[0].replace(/\*\./g, 'wildcard-').replace(/[^a-z0-9.-]/gi, '-');
  res.setHeader('Content-Disposition', `attachment; filename="${slug}-ssl.zip"`);
  res.type('application/zip').send(o.zip);
});

app.use(express.static(path.join(ROOT, 'public'), { index: 'index.html' }));

setInterval(() => {
  const batas = Date.now() - 2 * 3600_000;
  for (const [id, o] of order) if (o.selesai && o.selesai < batas) order.delete(id);
  for (const [id, rec] of pesanOrder) {
    const sisa = rec.filter((w) => w > Date.now() - 3600_000);
    if (sisa.length) pesanOrder.set(id, sisa);
    else pesanOrder.delete(id);
  }
}, 10 * 60_000).unref();

app.listen(PORT, '0.0.0.0', () => console.log(`ssl-rsumb siap di :${PORT}`));
