-- Fase G: ketersediaan tempat tidur (ditarik dari SIMRS / diisi manual)
-- Web hanya menyimpan ANGKA AGREGAT per unit. Tidak ada data pasien di sini.
-- Versi PostgreSQL (dari 005_kasur.sql MySQL), seed data API Eksternal v1
-- sumber: https://192.168.10.253:81/api/external/v1/bed-display
-- ditarik: 2026-11-10 10:06 WIB

CREATE TABLE IF NOT EXISTS kasur (
  id serial PRIMARY KEY,
  nama_unit varchar(120) NOT NULL UNIQUE,
  kelas varchar(40) NOT NULL DEFAULT '',
  total int NOT NULL DEFAULT 0,
  terisi int NOT NULL DEFAULT 0,
  keterangan varchar(255) NOT NULL DEFAULT '',
  urutan int NOT NULL DEFAULT 99,
  aktif smallint NOT NULL DEFAULT 1,
  diperbarui timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kasur_aktif ON kasur (aktif, urutan);

INSERT INTO kasur (nama_unit, kelas, total, terisi, keterangan, urutan) VALUES
('RUANG NICU-N', 'NICU & INCUBATOR', 12, 5, '', 1),('A-003 N', 'VIP', 1, 0, '', 2),('B-005 N', 'SATU', 2, 2, '', 3),('B-006 N', 'SATU', 2, 1, '', 4),('B-007 N', 'SATU', 2, 2, '', 5),('C-008 N', 'DUA', 3, 3, '', 6),('C-009 N', 'DUA', 3, 3, '', 7),('C-010 N', 'DUA', 3, 3, '', 8),('D-012 N', 'TIGA', 3, 3, '', 9),('D-013 N', 'TIGA', 3, 3, '', 10),('D-014 N', 'TIGA', 3, 3, '', 11),('D-015 N', 'TIGA', 3, 3, '', 12),('A-001 N', 'VIP', 1, 0, '', 13),('A-002 N', 'VIP', 1, 0, '', 14),('B-001 N', 'SATU', 2, 1, '', 15),('B-002 N', 'SATU', 2, 1, '', 16),('B-003 N', 'SATU', 2, 2, '', 17),('B-004 N', 'SATU', 2, 2, '', 18),('C-001 N', 'DUA', 3, 3, '', 19),('C-002 N', 'DUA', 3, 3, '', 20),('C-003 N', 'DUA', 3, 3, '', 21),('C-004 N', 'DUA', 3, 3, '', 22),('C-005 N', 'DUA', 3, 3, '', 23),('C-006 N', 'DUA', 3, 3, '', 24),('C-007 N', 'DUA', 3, 3, '', 25),('D-001 N', 'TIGA', 3, 3, '', 26),('D-002 N', 'TIGA', 3, 3, '', 27),('D-003 N', 'TIGA', 3, 3, '', 28),('D-004 N', 'TIGA', 3, 3, '', 29),('D-005 N', 'TIGA', 3, 3, '', 30),('D-006 N', 'TIGA', 3, 2, '', 31),('D-007 N', 'TIGA', 3, 3, '', 32),('D-008 N', 'TIGA', 3, 3, '', 33),('D-009 N', 'TIGA', 3, 3, '', 34),('D-010 N', 'TIGA', 3, 3, '', 35),('D-011 N', 'TIGA', 3, 3, '', 36),('RUANG HCU', 'HCU', 4, 3, '', 37),('B-301 N', 'SATU', 2, 1, '', 38),('B-302 N', 'SATU', 2, 2, '', 39),('B-303 N', 'SATU', 2, 2, '', 40),('C-301 N', 'DUA', 3, 3, '', 41),('C-302 N', 'DUA', 3, 3, '', 42),('C-303 N', 'DUA', 3, 3, '', 43),('D-301 N', 'TIGA', 3, 3, '', 44),('D-302 N', 'TIGA', 3, 2, '', 45),('D-303 N', 'TIGA', 3, 3, '', 46),('D-304 N', 'TIGA', 3, 3, '', 47),('D-305 N', 'TIGA', 3, 3, '', 48),('D-306 N', 'TIGA', 3, 3, '', 49),('RUANG BABY', 'Bayi', 22, 9, '', 50),('RUANG ICU -.N', 'ICU', 10, 9, '', 51),('A-402 N', 'VIP', 1, 0, '', 52),('B-401 N', 'DUA', 3, 3, '', 53),('B-402 N', 'SATU', 2, 1, '', 54),('B-403 N', 'SATU', 2, 2, '', 55),('B-404 N', 'SATU', 2, 0, '', 56),('B.I-401 N', 'RUANG ISOLASI', 2, 1, '', 57),('B.I-402 N', 'RUANG ISOLASI', 2, 1, '', 58),('C-401 N', 'DUA', 3, 2, '', 59),('C-402 N', 'DUA', 3, 3, '', 60),('C-403 N', 'DUA', 3, 3, '', 61),('C-404 N', 'DUA', 3, 3, '', 62),('C-405 N', 'DUA', 3, 3, '', 63),('C.I-401 N', 'RUANG ISOLASI', 3, 2, '', 64),('C.I-402 N', 'RUANG ISOLASI', 3, 2, '', 65),('C.I-403 N', 'RUANG ISOLASI', 3, 3, '', 66),('D-401 N', 'TIGA', 3, 3, '', 67),('D-402 N', 'TIGA', 3, 3, '', 68),('D-403 N', 'TIGA', 3, 3, '', 69),('D-404 N', 'TIGA', 3, 3, '', 70),('D-405 N', 'TIGA', 3, 3, '', 71),('D-406 N', 'TIGA', 3, 3, '', 72),('D.I-401 N', 'RUANG ISOLASI', 3, 3, '', 73),('D.I-402 N', 'RUANG ISOLASI', 3, 3, '', 74),('D.I-403 N', 'RUANG ISOLASI', 3, 2, '', 75),('ICU ISOLASI (D.I-404)', 'ICU ISOLASI', 3, 0, '', 76)
ON CONFLICT (nama_unit) DO UPDATE SET
  kelas = EXCLUDED.kelas, total = EXCLUDED.total, terisi = EXCLUDED.terisi,
  diperbarui = now();
