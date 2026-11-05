-- Fase D: karier, lamaran, pesan kontak

CREATE TABLE IF NOT EXISTS `karier` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `posisi` varchar(150) NOT NULL,
  `unit` varchar(120) NOT NULL DEFAULT '',
  `jenis` varchar(40) NOT NULL DEFAULT 'Full time',
  `deskripsi` text NOT NULL,
  `kualifikasi` text NOT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `dibuat` date DEFAULT NULL,
  `ditutup` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_aktif` (`aktif`, `ditutup`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `lamaran` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `telepon` varchar(25) NOT NULL,
  `email` varchar(120) NOT NULL DEFAULT '',
  `posisi` varchar(150) NOT NULL,
  `pesan` text NOT NULL,
  `ip` varchar(45) NOT NULL DEFAULT '',
  `status` varchar(20) NOT NULL DEFAULT 'baru',
  `dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_kode` (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `pesan_kontak` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(150) NOT NULL,
  `email` varchar(120) NOT NULL DEFAULT '',
  `telepon` varchar(25) NOT NULL DEFAULT '',
  `topik` varchar(60) NOT NULL DEFAULT 'Umum',
  `pesan` text NOT NULL,
  `ip` varchar(45) NOT NULL DEFAULT '',
  `status` varchar(20) NOT NULL DEFAULT 'baru',
  `dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
