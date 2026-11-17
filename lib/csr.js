import forge from 'node-forge';

const DOMAIN = /^(?:\*\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

export function bersihkanDomain(input) {
  const mentah = Array.isArray(input) ? input : String(input ?? '').split(/[\s,;]+/);
  const hasil = [];
  for (const item of mentah) {
    let d = String(item).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.$/, '');
    if (!d) continue;
    if (!DOMAIN.test(d)) throw new Error(`Domain tidak valid: ${item}`);
    if (!hasil.includes(d)) hasil.push(d);
  }
  if (!hasil.length) throw new Error('Minimal satu domain wajib diisi.');
  if (hasil.length > 10) throw new Error('Maksimal 10 domain per sertifikat.');
  const wildcard = hasil.filter((d) => d.startsWith('*.'));
  if (wildcard.length && hasil.some((d) => !d.startsWith('*.'))) {
    throw new Error('Domain wildcard tidak boleh dicampur dengan domain biasa dalam satu permintaan.');
  }
  return hasil;
}

export function buatCSR({ domains, cn, country, state, city, org, unit, email, keySize }) {
  const daftar = bersihkanDomain(domains);
  const cnAkhir = cn ? String(cn).trim().toLowerCase() : daftar[0];
  if (!daftar.includes(cnAkhir)) {
    throw new Error(`CN (${cnAkhir}) tidak ada di daftar SAN. Tambahkan ke SAN atau kosongkan CN.`);
  }
  const daftarDomain = [cnAkhir, ...daftar.filter((d) => d !== cnAkhir)];
  const subjek = [{ name: 'commonName', value: cnAkhir }];
  for (const [name, value] of [
    ['countryName', country],
    ['stateOrProvinceName', state],
    ['localityName', city],
    ['organizationName', org],
    ['organizationalUnitName', unit],
    ['emailAddress', email]
  ]) {
    if (value && String(value).trim()) subjek.push({ name, value: String(value).trim() });
  }
  const kunci = forge.pki.rsa.generateKeyPair(Number(keySize) === 4096 ? 4096 : Number(keySize) === 3072 ? 3072 : 2048);
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = kunci.publicKey;
  csr.setSubject(subjek);
  csr.addAttribute({
    name: 'extensionRequest',
    extensions: [{ name: 'subjectAltName', altNames: daftarDomain.map((d) => ({ type: 2, value: d })) }]
  });
  csr.sign(kunci.privateKey, forge.md.sha256.create());
  const csrPem = forge.pki.certificationRequestToPem(csr).replace(/\r\n/g, '\n');
  const csrCheck = forge.pki.certificationRequestFromPem(csrPem);
  if (!csrCheck.verify()) throw new Error('Gagal memverifikasi CSR yang dibuat.');
  return {
    csr: csrPem,
    privateKey: forge.pki.privateKeyToPem(kunci.privateKey),
    domains: daftarDomain
  };
}

export function bacaCSR(pem) {
  const teks = String(pem ?? '').trim();
  if (!/-----BEGIN (?:NEW )?CERTIFICATE REQUEST-----/.test(teks)) {
    throw new Error('Tempel CSR dalam format PEM (-----BEGIN CERTIFICATE REQUEST-----).');
  }
  let csr;
  try {
    csr = forge.pki.certificationRequestFromPem(teks);
  } catch {
    throw new Error('CSR tidak bisa dibaca. Periksa format PEM-nya.');
  }
  if (!csr.verify()) throw new Error('Tanda tangan CSR tidak valid.');
  const cn = (csr.subject.attributes.find((a) => a.name === 'commonName') || {}).value;
  const attr = csr.getAttribute({ name: 'extensionRequest' });
  const san = (attr?.extensions || []).find((e) => e.name === 'subjectAltName');
  const daftar = (san?.altNames || [])
    .filter((a) => a.type === 2)
    .map((a) => String(a.value).toLowerCase().replace(/^\*\./, '*.'));
  if (!daftar.length) throw new Error('CSR tidak memiliki SAN (Subject Alternative Name). Buat CSR baru dengan SAN.');
  for (const d of daftar) if (!DOMAIN.test(d)) throw new Error(`SAN di CSR tidak valid: ${d}`);
  if (!cn) throw new Error('CSR harus memiliki Common Name (CN). Buat ulang dengan CN = salah satu SAN.');
  const cnBersih = String(cn).toLowerCase();
  if (!daftar.includes(cnBersih)) {
    throw new Error(`CN (${cnBersih}) tidak ada di daftar SAN (${daftar.join(', ')}). Buat ulang CSR dengan CN termasuk SAN.`);
  }
  const domains = daftar;
  if (domains.length > 10) throw new Error('Maksimal 10 domain per sertifikat.');
  return { csr: forge.pki.certificationRequestToPem(csr).replace(/\r\n/g, '\n'), domains, privateKey: null };
}
