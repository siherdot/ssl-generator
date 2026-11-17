# ssl-rsumb

Generator sertifikat SSL gratis (Let's Encrypt / ACME v2) untuk domain `*.rsumb.site`, di-host di `ssl.rsumb.site`.

Dua cara CSR:
- **Form isi**: isi domain, negara, organisasi; aplikasi membuat private key + CSR. `privkey.pem` ikut dikirim.
- **CSR jadi**: tempel CSR yang sudah dibuat. CN boleh di SAN mana pun (urutan tidak penting). Private key tidak ada di server, jadi `privkey.pem` tidak disediakan.

Validasi (satu-satunya):
- **HTTP-01 — file**: aplikasi menampilkan token + isi file yang harus diletakkan di `http://<domain>/.well-known/acme-challenge/<token>`. Token juga disajikan aplikasi di path tersebut; pakai ini hanya bila domain yang diverifikasi diarahkan ke aplikasi ini. Tidak ada DNS-01, tidak butuh token Cloudflare.

Output ZIP: `cert.pem`, `chain.pem`, `fullchain.pem`, `request.csr`, `PETUNJUK.txt` (+ `privkey.pem` untuk mode form).

## Jalankan lokal

```bash
npm ci
APP_PASSWORD='sandi-kuat' SESSION_SECRET='acak-panjang' \
  DATA_DIR=./data PORT=3000 NODE_ENV=development \
  node server.js
```

Buka `http://localhost:3000`. Untuk uji lokal lewat HTTP, tambahkan `COOKIE_SECURE=0`. Tanpa itu cookie hanya lewat HTTPS.

Variabel:
- `APP_PASSWORD` wajib. Server berhenti bila kosong.
- `SESSION_SECRET` disarankan; bila kosong dibuat acak saat start (session semua users hilang saat restart).
- `DATA_DIR` — berisi akun ACME + status order. Harus persisten.
- `COOKIE_SECURE=0` hanya untuk uji HTTP lokal.
- `BATAS_ORDER_PER_JAM` default `50`; set `0` untuk tanpa batas. Semua user di balik tunnel terlihat dari satu IP, jadi batas per-IP tidak bisa dipakai sebagai pembatas per orang.
- `PORT` default `3000`.

## Deploy Coolify

- Build pack: **Dockerfile**, port `3000`.
- Domain: `https://ssl.rsumb.site` (CNAME sudah mengarah ke tunnel Cloudflare).
- Volume persisten: `/app/data` → `DATA_DIR=/app/data`.
- Env: `APP_PASSWORD`, `SESSION_SECRET`. Tidak ada variabel Cloudflare.
- Jangan set `COOKIE_SECURE=0` di produksi.

## Uji staging

Centang "Staging" di form untuk memakai ACME staging Let's Encrypt. Sertifikat staging tidak dipercaya browser, tapi alur penerbitan diuji tanpa kena rate limit produksi.

## Verifikasi, download, PFX, bundle server

Setelah order `selesai`, panel **Hasil** menyediakan:

- **Verifikasi pemasangan** — menghubungi `https://<domain>:443`, membandingkan sidik jari SHA-256 sertifikat yang terpasang dengan yang diterbitkan, lalu menampilkan penerbit, masa berlaku, dan header `Server`. Format server disarankan otomatis dari header tersebut.
- **Unduh bundle terurut** — ZIP sesuai format pilihan: `nginx/` (`fullchain.pem` + `privkey.pem` + konfigurasi), `apache/` (`cert.pem` + `chain.pem` + `privkey.pem`), `iis/` (`certifikat.pfx` + petunjuk impor), atau `umum/` (semua PEM + `PETUNJUK.txt`).
- **Unduh .pfx** — PKCS#12 berisi private key + leaf + intermediate, kata sandi bebas diisi di form. Mode CSR tidak punya private key, jadi tombol ini dinonaktifkan.
- Download per berkas dan ZIP mentah tetap tersedia seperti sebelumnya.

Endpoint terkait (semuanya butuh sesi login): `POST /api/order/:id/verify`, `GET /api/order/:id/bundle?format=nginx`, `POST /api/order/:id/pfx` dengan body `{"kataSandi":"..."}`.

## Catatan

- Maksimal 10 domain per sertifikat. Wildcard tidak boleh dicampur dengan domain biasa.
- Setiap order disimpan di `DATA_DIR` (`order-<id>.json`, izin `0600`); ZIP dan turunannya bisa diunduh ulang setelah server restart selama belum lewat 2 jam.
- Setiap order juga dipakai untuk verifikasi, PFX, dan bundle; mode CSR tidak punya private key sehingga tidak bisa PFX.
- Tidak ada record TXT yang dibuat aplikasi; validasi memakai file HTTP-01 di webserver domain.
