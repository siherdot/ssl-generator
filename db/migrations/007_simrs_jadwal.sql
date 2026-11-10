-- Fase H: kode sumber SIMRS untuk sinkronisasi API Eksternal v1
--
-- Kolom kode_simrs menyimpan kode dari SIMRS (kodepos / kodokter / kunci jadwal)
-- supaya sinkronisasi bisa upsert tanpa menimpa baris yang diisi manual.
-- Baris dengan kode_simrs NULL = konten manual, tidak disentuh sinkronisasi.

ALTER TABLE poli ADD COLUMN IF NOT EXISTS kode_simrs varchar(40);
ALTER TABLE dokter ADD COLUMN IF NOT EXISTS kode_simrs varchar(40);
ALTER TABLE jadwal_dokter ADD COLUMN IF NOT EXISTS kode_simrs varchar(160);

CREATE UNIQUE INDEX IF NOT EXISTS poli_kode_simrs ON poli (kode_simrs) WHERE kode_simrs IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS dokter_kode_simrs ON dokter (kode_simrs) WHERE kode_simrs IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS jadwal_kode_simrs ON jadwal_dokter (kode_simrs) WHERE kode_simrs IS NOT NULL;

-- Dokter yang sudah tampil di situs dan juga terdaftar di SIMRS: tautkan agar
-- foto & profil yang sudah diunggah tetap dipakai (jangan dibuat baris baru).
UPDATE dokter SET kode_simrs = 'DR00000017' WHERE id_dokter = 'DR01' AND kode_simrs IS NULL; -- Azwarto
UPDATE dokter SET kode_simrs = 'DR00121'    WHERE id_dokter = 'DR31' AND kode_simrs IS NULL; -- Hasanul Arifin
UPDATE dokter SET kode_simrs = 'DR00000027' WHERE id_dokter = 'DR26' AND kode_simrs IS NULL; -- Sukamto
