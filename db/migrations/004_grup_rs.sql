-- 004: daftar rumah sakit grup Bidadari (halaman "Rumah Sakit Kami")
-- Foto bisa diunggah lewat dashboard admin (/admin/grup-rs).

CREATE TABLE IF NOT EXISTS grup_rs (
  id     INT(11)      NOT NULL AUTO_INCREMENT,
  nama   VARCHAR(120) NOT NULL,
  kota   VARCHAR(120) NOT NULL DEFAULT '',
  url    VARCHAR(200) NOT NULL DEFAULT '',
  foto   VARCHAR(200) NOT NULL DEFAULT '',
  urutan INT(11)      NOT NULL DEFAULT 99,
  aktif  TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_urutan (urutan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO grup_rs (nama, kota, url, urutan)
SELECT * FROM (
  SELECT 'RSU Bidadari Batubara'    AS nama, 'Batubara, Sumatera Utara' AS kota, 'https://rsubatubara.bidadari.co.id' AS url, 1 AS urutan
  UNION ALL SELECT 'RSU Bidadari Binjai',    'Binjai, Sumatera Utara',   '/', 2
  UNION ALL SELECT 'RSU Mahkota Bidadari',   'Sumatera Utara',           'https://rsumahkota.bidadari.co.id', 3
  UNION ALL SELECT 'RSU Putri Bidadari',     'Sumatera Utara',           '', 4
  UNION ALL SELECT 'RSU Putri Bidadari Aceh','Aceh',                     '', 5
) AS baru
WHERE NOT EXISTS (SELECT 1 FROM grup_rs);
