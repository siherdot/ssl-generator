# ssl-rsumb

Generator sertifikat SSL gratis (Let's Encrypt / ACME v2) untuk domain `*.rsumb.site`, di-host di `ssl.rsumb.site`.

Dua cara CSR:
- **Form isi**: isi domain, negara, organisasi; aplikasi membuat private key + CSR. `privkey.pem` ikut dikirim.
- **CSR jadi**: tempel CSR yang sudah dibuat. Private key tidak ada di server, jadi `privkey.pem` tidak disediakan.

Validasi:
- **DNS-01** via token Cloudflare (server yang simpan token; token tidak pernah dikirim ke browser).
- **HTTP-01**: aplikasi menampilkan token + isi file yang harus diletakkan di `http://<domain>/.well-known/acme-challenge/<token>`. Token juga disajikan aplikasi di path tersebut; pakai ini hanya bila domain yang diverifikasi diarahkan ke aplikasi ini.

Output ZIP: `cert.pem`, `chain.pem`, `fullchain.pem`, `request.csr`, `PETUNJUK.txt` (+ `privkey.pem` untuk mode form).

## Jalankan lokal

```bash
npm ci
APP_PASSWORD='sandi-kuat' SESSION_SECRET='acak-panjang' \
  CF_TOKEN_FILE=/path/ke/token-cloudflare \
  DATA_DIR=./data PORT=3000 NODE_ENV=development \
  node server.js
```

Buka `http://localhost:3000`. Untuk uji lokal lewat HTTP, tambahkan `COOKIE_SECURE=0`. Tanpa itu cookie hanya lewat HTTPS.

Variabel:
- `APP_PASSWORD` wajib. Server berhenti bila kosong.
- `SESSION_SECRET` disarankan; bila kosong dibuat acak saat start (session semua users hilang saat restart).
- `CF_API_TOKEN` atau `CF_TOKEN_FILE` — token Cloudflare dengan izin `Zone:DNS:Edit` untuk zone yang bersangkutan. `CF_TOKEN_FILE` lebih aman.
- `DATA_DIR` — berisi akun ACME + status order. Harus persisten.
- `COOKIE_SECURE=0` hanya untuk uji HTTP lokal.
- `PORT` default `3000`.

## Deploy Coolify

- Build pack: **Dockerfile**, port `3000`.
- Domain: `https://ssl.rsumb.site` (CNAME sudah mengarah ke tunnel Cloudflare).
- Volume persisten: `/app/data` → `DATA_DIR=/app/data`.
- Env: `APP_PASSWORD`, `SESSION_SECRET`, `CF_TOKEN_FILE` (mount file token sebagai secret) atau `CF_API_TOKEN`.
- Jangan set `COOKIE_SECURE=0` di produksi.

## Uji staging

Centang "Staging" di form untuk memakai ACME staging Let's Encrypt. Sertifikat staging tidak dipercaya browser, tapi alur penerbitan diuji tanpa kena rate limit produksi.

## Catatan

- Maksimal 10 domain per sertifikat. Wildcard tidak boleh dicampur dengan domain biasa.
- Setiap order disimpan di `DATA_DIR`; ZIP sertifikat bisa diunduh ulang lewat halaman order selama file masih ada.
- Bersihkan record TXT `_acme-challenge` otomatis oleh plugin Cloudflare setelah validasi.
