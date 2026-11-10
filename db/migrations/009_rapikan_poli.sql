-- Fase H (lanjutan): rapikan poli hasil sinkronisasi pertama.
--
-- Sinkronisasi awal membuat poli baru dengan nama versi SIMRS ("POLI JANTUNG")
-- padahal situs sudah punya "POLIKLINIK JANTUNG". Endpoint kini mencocokkan nama
-- lebih dulu; migrasi ini membereskan baris yang sudah terlanjur dibuat.
--
-- Kode tanpa nama poli di SIMRS (P0001, P0003, P0020) digabung ke "POLI UMUM".

CREATE TEMP TABLE peta_poli (kode varchar(40) PRIMARY KEY, tujuan varchar(40) NOT NULL);
INSERT INTO peta_poli (kode, tujuan) VALUES
  ('PANAK', 'P05'),  -- POLI ANAK
  ('PBDAH', 'P01'),  -- POLI BEDAH
  ('PFSIO', 'P16'),  -- INSTALASI FISIOTERAPI
  ('PINTR', 'P03'),  -- POLI PENYAKIT DALAM
  ('PJTNG', 'P07'),  -- POLI JANTUNG
  ('PMATA', 'P02'),  -- POLI MATA
  ('POBGY', 'P06'),  -- POLI OBGYN
  ('PPARU', 'P10'),  -- POLI PARU
  ('PSYRF', 'P13'),  -- POLI SARAF
  ('PTHT',  'P04'),  -- POLI THT
  ('P0025', 'P16'),  -- REHABILITASI MEDIK
  ('P0001', 'P20'),  -- tanpa nama -> POLI UMUM
  ('P0003', 'P20'),
  ('P0020', 'P20');

INSERT INTO poli (id_poli, nama_poli, ket, images)
VALUES ('P20', 'POLI UMUM', '', '')
ON CONFLICT (id_poli) DO NOTHING;

UPDATE jadwal_dokter j SET id_poli = m.tujuan FROM peta_poli m WHERE j.id_poli = m.kode;
UPDATE dokter d        SET id_poli = m.tujuan FROM peta_poli m WHERE d.id_poli = m.kode;

DELETE FROM poli p USING peta_poli m WHERE p.id_poli = m.kode;

DROP TABLE peta_poli;
