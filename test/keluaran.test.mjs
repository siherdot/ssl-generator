import assert from 'node:assert/strict';
import test from 'node:test';
import forge from 'node-forge';
import JSZip from 'jszip';
import { buatPFX, buatBundle } from '../lib/keluaran.js';

function contoh({ punyaKunci = true } = {}) {
  const keys = forge.pki.rsa.generateKeyPair(1024);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date(Date.now() - 3600e3);
  cert.validity.notAfter = new Date(Date.now() + 86400e3);
  cert.setSubject([{ name: 'commonName', value: 'contoh.com' }]);
  cert.setIssuer([{ name: 'commonName', value: 'contoh.com' }]);
  cert.setExtensions([{ name: 'subjectAltName', altNames: [{ type: 2, value: 'contoh.com' }] }]);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const certPem = forge.pki.certificateToPem(cert);
  return {
    domains: ['contoh.com'],
    privateKey: punyaKunci ? forge.pki.privateKeyToPem(keys.privateKey) : null,
    pem: {
      'cert.pem': certPem,
      'chain.pem': '',
      'fullchain.pem': certPem,
      'privkey.pem': punyaKunci ? forge.pki.privateKeyToPem(keys.privateKey) : ''
    }
  };
}

const daftar = (zip) => Object.keys(zip.files).filter((n) => !n.endsWith('/')).sort();

function bacaPFX(pfx, sandi) {
  return forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(pfx.toString('binary')), sandi);
}

test('bundle nginx: fullchain + key, bukan chain terpisah', async () => {
  const zip = await JSZip.loadAsync(await buatBundle(contoh(), 'nginx'));
  assert.deepEqual(daftar(zip), [
    'nginx/PETUNJUK.txt', 'nginx/fullchain.pem', 'nginx/privkey.pem'
  ]);
  const petunjuk = await zip.file('nginx/PETUNJUK.txt').async('string');
  assert.match(petunjuk, /ssl_certificate\s+\/etc\/ssl\/fullchain\.pem/);
  assert.match(petunjuk, /ssl_certificate_key\s+\/etc\/ssl\/privkey\.pem/);
});

test('bundle apache: cert + chain + key', async () => {
  const zip = await JSZip.loadAsync(await buatBundle(contoh(), 'apache'));
  assert.deepEqual(daftar(zip), [
    'apache/PETUNJUK.txt', 'apache/cert.pem', 'apache/chain.pem', 'apache/privkey.pem'
  ]);
  const petunjuk = await zip.file('apache/PETUNJUK.txt').async('string');
  assert.match(petunjuk, /SSLCertificateFile/);
});

test('bundle iis berisi PFX yang bisa dibaca', async () => {
  const zip = await JSZip.loadAsync(await buatBundle(contoh(), 'iis'));
  const pfx = await zip.file('iis/certifikat.pfx').async('nodebuffer');
  const isi = bacaPFX(pfx, '');
  assert.equal(isi.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag].length, 1);
  assert.ok(isi.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag]?.length);
});

test('PFX dengan kata sandi', () => {
  const pfx = buatPFX(contoh(), 'rahasia');
  assert.equal(pfx[0], 0x30);
  const isi = bacaPFX(pfx, 'rahasia');
  assert.equal(isi.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag].length, 1);
});

test('mode CSR tanpa private key menolak PFX', () => {
  assert.throws(() => buatPFX(contoh({ punyaKunci: false })), /private key/);
});
