-- Fase H (lanjutan): primary key untuk tabel konten warisan MySQL.
--
-- Tabel poli/dokter/jadwal_dokter dibuat tanpa primary key saat migrasi dari
-- MySQL, sehingga `INSERT ... ON CONFLICT (id_...)` ditolak PostgreSQL
-- (42P10: no unique or exclusion constraint matching the ON CONFLICT).
-- Ketiganya sudah dicek bebas duplikat & NULL sebelum indeks ini dibuat.

ALTER TABLE poli ADD CONSTRAINT poli_pkey PRIMARY KEY (id_poli);
ALTER TABLE dokter ADD CONSTRAINT dokter_pkey PRIMARY KEY (id_dokter);
ALTER TABLE jadwal_dokter ADD CONSTRAINT jadwal_dokter_pkey PRIMARY KEY (id_jadwal);
