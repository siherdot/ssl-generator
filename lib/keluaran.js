import forge from 'node-forge';
import JSZip from 'jszip';

const PEM = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g;

export function slugOrder(o) {
  return String(o.domains[0] || 'ssl')
    .replace(/^\*\./, 'wildcard-')
    .replace(/[^a-z0-9.-]/gi, '-');
}

function daftarSertifikat(pem) {
  return String(pem).match(PEM) || [];
}

export function buatPFX(o, kataSandi = '') {
  if (!o.privateKey) throw new Error('Mode CSR tidak menyimpan private key. PFX harus dibuat di tempat key berada.');
  const kunci = forge.pki.privateKeyFromPem(o.privateKey);
  const rantai = [o.pem['cert.pem'], ...daftarSertifikat(o.pem['chain.pem'])];
  const asn1 = forge.pkcs12.toPkcs12Asn1(kunci, rantai, String(kataSandi ?? ''), { algorithm: '3des' });
  return Buffer.from(forge.asn1.toDer(asn1).getBytes(), 'binary');
}

const PETUNJUK = {
  nginx: (o) => [
    'NGINX',
    '',
    'Letakkan fullchain.pem dan privkey.pem di /etc/ssl/',
    '',
    'ssl_certificate     /etc/ssl/fullchain.pem;',
    'ssl_certificate_key /etc/ssl/privkey.pem;',
    'ssl_protocols       TLSv1.2 TLSv1.3;',
    '',
    'Uji: nginx -t && systemctl reload nginx'
  ].join('\n'),
  apache: (o) => [
    'APACHE',
    '',
    'Letakkan berkas di /etc/ssl/',
    '',
    'SSLEngine on',
    'SSLCertificateFile      /etc/ssl/cert.pem',
    'SSLCertificateChainFile /etc/ssl/chain.pem',
    'SSLCertificateKeyFile   /etc/ssl/privkey.pem',
    '',
    'Alternatif satu berkas: SSLCertificateFile /etc/ssl/fullchain.pem',
    'Uji: apachectl configtest && systemctl reload apache2'
  ].join('\n'),
  iis: (o) => [
    'IIS / WINDOWS',
    '',
    '1. Salin certifikat.pfx ke server.',
    '2. IIS Manager → Server Certificates → Import…',
    '3. Isi kata sandi yang dimasukkan di halaman ini (kosong bila tidak diisi).',
    '4. Sites → Bindings → https → pilih certificate ini.',
    '',
    'PFX berisi private key + sertifikat + intermediate, sudah urut.'
  ].join('\n'),
  umum: (o) => [
    'PEM UMUM',
    '',
    'cert.pem      = leaf / sertifikat domain',
    'chain.pem     = intermediate (urut dari leaf ke root)',
    'fullchain.pem = cert.pem + chain.pem',
    'privkey.pem   = kunci privat (hanya mode form)',
    'request.csr   = CSR yang dipakai',
    '',
    `Domain: ${o.domains.join(', ')}`
  ].join('\n')
};

export async function buatBundle(o, format = 'umum') {
  const bentuk = Object.hasOwn(PETUNJUK, format) ? format : 'umum';
  const zip = new JSZip();
  const mapu = (nama, isi) => zip.file(`${bentuk}/${nama}`, isi);
  mapu('PETUNJUK.txt', PETUNJUK[bentuk](o));

  if (bentuk === 'nginx') {
    mapu('fullchain.pem', o.pem['fullchain.pem']);
    if (o.privateKey) mapu('privkey.pem', o.privateKey);
  } else if (bentuk === 'apache') {
    mapu('cert.pem', o.pem['cert.pem']);
    mapu('chain.pem', o.pem['chain.pem']);
    if (o.privateKey) mapu('privkey.pem', o.privateKey);
  } else if (bentuk === 'iis') {
    if (o.privateKey) zip.file(`${bentuk}/certifikat.pfx`, buatPFX(o, ''), { binary: true });
  } else {
    for (const [nama, isi] of Object.entries(o.pem)) mapu(nama, isi);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
