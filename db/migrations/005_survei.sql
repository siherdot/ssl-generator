-- 005: survei kepuasan pasien (menggantikan form pesan kontak)
CREATE TABLE IF NOT EXISTS survei (
  id             INT(11)      NOT NULL AUTO_INCREMENT,
  nama           VARCHAR(120) NOT NULL DEFAULT '',
  unit           VARCHAR(120) NOT NULL DEFAULT '',
  r_pendaftaran  TINYINT(1)   NOT NULL DEFAULT 0,
  r_dokter       TINYINT(1)   NOT NULL DEFAULT 0,
  r_perawat      TINYINT(1)   NOT NULL DEFAULT 0,
  r_fasilitas    TINYINT(1)   NOT NULL DEFAULT 0,
  r_kebersihan   TINYINT(1)   NOT NULL DEFAULT 0,
  nilai          DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  komentar       TEXT         NULL,
  saran          TEXT         NULL,
  ip             VARCHAR(60)  NOT NULL DEFAULT '',
  dibuat         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_dibuat (dibuat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
