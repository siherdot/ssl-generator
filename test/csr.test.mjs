import test from 'node:test';
import assert from 'node:assert/strict';
import forge from 'node-forge';
import ACME from 'acme';
import { buatCSR, bacaCSR, bersihkanDomain } from '../lib/csr.js';

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

test('bacaCSR: tolak CSR tanpa SAN', () => {
  const forgeLib = forge;
  const k = forgeLib.pki.rsa.generateKeyPair(2048);
  const c = forgeLib.pki.createCertificationRequest();
  c.publicKey = k.publicKey;
  c.setSubject([{ name: 'commonName', value: 'tanpa-san.rsumb.site' }]);
  c.sign(k.privateKey, forgeLib.md.sha256.create());
  assert.throws(() => bacaCSR(forgeLib.pki.certificationRequestToPem(c)), /SAN/);
});
