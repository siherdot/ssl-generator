import test from 'node:test';
import assert from 'node:assert/strict';
import forge from 'node-forge';
import ACME from 'acme';
import { createRequire } from 'node:module';
import { pasangTambalACME } from '../lib/acme-tambal.js';
import { buatCSR, bacaCSR, bersihkanDomain } from '../lib/csr.js';

const require = createRequire(import.meta.url);

test('bersihkanDomain: rapikan, unik, tolak campuran wildcard', () => {
  assert.deepEqual(bersihkanDomain('Example.COM, www.example.com\nexample.com'), ['example.com', 'www.example.com']);
  assert.throws(() => bersihkanDomain('*.example.com, www.example.com'), /wildcard/i);
  assert.throws(() => bersihkanDomain('localhost'), /tidak valid/);
});

test('buatCSR → bacaCSR: SAN terbaca lengkap, CN pertama', () => {
  const { csr, privateKey, domains } = buatCSR({
    domains: ['uji.rsumb.site', 'www.uji.rsumb.site'],
    country: 'ID', org: 'RSUMB', keySize: 2048
  });
  assert.match(privateKey, /BEGIN RSA PRIVATE KEY/);
  assert.equal(csr.includes('\r'), false);
  const baca = bacaCSR(csr);
  assert.deepEqual(baca.domains, domains);
  assert.equal(baca.privateKey, null);
});

test('ACME finalize: CSR harus trimEnd agar DER tidak trailing data', () => {
  const { csr } = buatCSR({ domains: ['uji.rsumb.site'], keySize: 2048 });
  const badan = csr.split('\n').filter((l) => l && !l.startsWith('-----')).join('');
  const diharapkan = Buffer.from(badan, 'base64').toString('base64url');
  assert.notEqual(ACME._csrToUrlBase64(csr), diharapkan);
  assert.equal(ACME._csrToUrlBase64(csr.trimEnd()), diharapkan);
});

test('buatCSR: CN di luar SAN ditolak', () => {
  assert.throws(
    () => buatCSR({ domains: ['a.contoh.com', 'b.contoh.com'], cn: 'c.contoh.com' }),
    /tidak ada di daftar SAN/
  );
});

test('buatCSR: CN boleh di SAN mana pun, jadi SAN pertama', () => {
  const r = buatCSR({ domains: ['a.contoh.com', 'b.contoh.com'], cn: 'b.contoh.com' });
  assert.deepEqual(r.domains, ['b.contoh.com', 'a.contoh.com']);
});

test('bacaCSR: CN boleh bukan SAN pertama', () => {
  const k = forge.pki.rsa.generateKeyPair(2048);
  const c = forge.pki.createCertificationRequest();
  c.publicKey = k.publicKey;
  c.setSubject([{ name: 'commonName', value: 'kedua.rsumb.site' }]);
  c.addAttribute({
    name: 'extensionRequest',
    extensions: [{
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'pertama.rsumb.site' },
        { type: 2, value: 'kedua.rsumb.site' }
      ]
    }]
  });
  c.sign(k.privateKey, forge.md.sha256.create());
  const r = bacaCSR(forge.pki.certificationRequestToPem(c));
  assert.deepEqual(r.domains, ['pertama.rsumb.site', 'kedua.rsumb.site']);
});

test('tambal ACME: CN dipindah ke depan altnames sebelum pengecekan', () => {
  pasangTambalACME(ACME);
  const CSR = require('@root/csr');
  const k = forge.pki.rsa.generateKeyPair(2048);
  const c = forge.pki.createCertificationRequest();
  c.publicKey = k.publicKey;
  c.setSubject([{ name: 'commonName', value: 'kedua.rsumb.site' }]);
  c.addAttribute({
    name: 'extensionRequest',
    extensions: [{
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'pertama.rsumb.site' },
        { type: 2, value: 'kedua.rsumb.site' }
      ]
    }]
  });
  c.sign(k.privateKey, forge.md.sha256.create());
  const info = CSR._info(forge.pki.certificationRequestToPem(c));
  assert.equal(info.altnames[0], info.subject);
});

test('bacaCSR: tolak CSR tanpa SAN', () => {
  const forgeLib = forge;
  const k = forgeLib.pki.rsa.generateKeyPair(2048);
  const c = forgeLib.pki.createCertificationRequest();
  c.publicKey = k.publicKey;
  c.setSubject([{ name: 'commonName', value: 'tanpa-san.rsumb.site' }]);
  c.sign(k.privateKey, forgeLib.md.sha256.create());
  assert.throws(() => bacaCSR(forgeLib.pki.certificationRequestToPem(c)), /SAN/);
});
