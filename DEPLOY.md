# Deploy

Alur produksi situs ini:

```
git push ke branch main
        │
        ▼
GitHub webhook  ──►  Coolify (POST /webhooks/source/github/events/manual)
        │
        ▼
Coolify build image dari Dockerfile, lalu jalankan container
        │
        ▼
Traefik (port 80 di server)  ──►  https://rsumb.rsumb.site
```

## Komponen

- **Coolify** — mengelola build, container, env, dan domain.
- **PostgreSQL** (`rsumb-db`) — database, hanya bisa diakses dari jaringan internal Coolify.
- **Cloudflare Tunnel** — satu tunnel (`coolify-rsumb`), ingress:
  - `*.rsumb.site` → `http://localhost:80` (Traefik)
  - `9router.rsumb.site` → `http://localhost:20128` (proses host di luar Coolify)
- **Mount aset** — `/app/public/images/arsip` memakai folder host
  `~/website/rsumb/app/assets/images` (328 MB, dipakai bersama situs lama).

## Rahasia

Tidak ada kredensial di repo ini. Nilai berikut diisi sebagai environment
variable di Coolify, bukan di file:

`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
`SESSION_SECRET`, `SIMRS_API_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## Catatan build

- Tailwind/PostCSS/TypeScript adalah devDependencies. Dockerfile memakai
  `npm ci --include=dev` di tahap build, karena Coolify menyuntikkan
  `NODE_ENV=production` saat build dan `npm ci` biasa akan melewatkannya.
- `NODE_ENV=production` hanya di-set di tahap runtime Dockerfile, jangan
  ditambahkan sebagai env aplikasi di Coolify.
