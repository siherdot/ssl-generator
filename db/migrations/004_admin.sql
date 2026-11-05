-- Fase F: akun admin untuk dashboard di situs baru
-- Password disimpan sebagai bcrypt (bukan sha1 seperti tabel `users` lama).

CREATE TABLE IF NOT EXISTS `admin_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(60) NOT NULL,
  `nama` varchar(120) NOT NULL DEFAULT '',
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'admin',
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `terakhir_login` timestamp NULL DEFAULT NULL,
  `dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
