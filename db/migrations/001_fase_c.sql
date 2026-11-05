-- Fase C: tabel baru untuk situs baru
-- Dijalankan sekali di database u802055767_rsub.
-- Panel admin lama tidak mengenal tabel ini; isi dikelola lewat SQL / perkakas DB
-- sampai modul adminnya dibuat.

-- ---------------------------------------------------------------
-- Penjamin / asuransi rekanan
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `penjamin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(120) NOT NULL,
  `kategori` varchar(60) NOT NULL DEFAULT 'Asuransi',
  `urutan` int(11) NOT NULL DEFAULT 0,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_nama` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------
-- Promo / penawaran
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `promo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `judul` varchar(180) NOT NULL,
  `deskripsi` text NOT NULL,
  `gambar` varchar(200) NOT NULL DEFAULT '',
  `link` varchar(200) NOT NULL DEFAULT '',
  `mulai` date DEFAULT NULL,
  `selesai` date DEFAULT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_aktif` (`aktif`, `selesai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------
-- Testimoni pasien
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `testimoni` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(120) NOT NULL,
  `isi` text NOT NULL,
  `foto` varchar(200) NOT NULL DEFAULT '',
  `rating` tinyint(1) NOT NULL DEFAULT 5,
  `tanggal` date DEFAULT NULL,
  `tampil` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_tampil` (`tampil`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------
-- Pendaftaran online
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pendaftaran` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) NOT NULL,
  `nama_pasien` varchar(150) NOT NULL,
  `telepon` varchar(25) NOT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `id_poli` varchar(100) NOT NULL DEFAULT '',
  `id_dokter` varchar(100) NOT NULL DEFAULT '',
  `tanggal_kunjungan` date NOT NULL,
  `penjamin` varchar(120) NOT NULL DEFAULT '',
  `no_penjamin` varchar(60) NOT NULL DEFAULT '',
  `keluhan` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'baru',
  `dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip` varchar(45) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_kode` (`kode`),
  KEY `idx_kunjungan` (`tanggal_kunjungan`, `id_poli`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
