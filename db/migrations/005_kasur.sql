-- Fase G: ketersediaan tempat tidur (ditarik dari SIMRS / diisi manual)
-- Web hanya menyimpan ANGKA AGREGAT per unit. Tidak ada data pasien di sini.

CREATE TABLE IF NOT EXISTS `kasur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_unit` varchar(120) NOT NULL,
  `kelas` varchar(40) NOT NULL DEFAULT '',
  `total` int(11) NOT NULL DEFAULT 0,
  `terisi` int(11) NOT NULL DEFAULT 0,
  `keterangan` varchar(255) NOT NULL DEFAULT '',
  `urutan` int(11) NOT NULL DEFAULT 99,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `diperbarui` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_unit` (`nama_unit`),
  KEY `idx_aktif` (`aktif`, `urutan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Catatan sumber data:
--   diisi manual lewat /admin/konten/ketersediaan-kamar, atau
--   dikirim SIMRS ke POST /api/simrs/kasur (butuh header Authorization: Bearer <SIMRS_API_TOKEN>).
-- Belum ada baris awal: halaman akan menampilkan "data belum tersedia" sampai
-- angka pertama masuk, supaya situs tidak menampilkan jumlah kamar yang dikarang.
