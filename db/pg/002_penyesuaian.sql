-- Penyesuaian skema PostgreSQL untuk kolom yang di database MySQL lama
-- ditambahkan manual (di luar berkas migrasi), tetapi dipakai oleh aplikasi.
--
-- Ditemukan lewat pemeriksaan otomatis: membandingkan kolom yang dipakai
-- `lib/admin/resources.ts` dengan kolom yang benar-benar ada di skema.

ALTER TABLE penjamin ADD COLUMN IF NOT EXISTS logo varchar(200) NOT NULL DEFAULT '';
ALTER TABLE survei   ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'baru';
