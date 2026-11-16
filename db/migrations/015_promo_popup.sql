-- Promo sebagai popup di beranda (sekali per sesi pengunjung).
-- Kolom `popup` menentukan promo mana yang boleh muncul sebagai dialog;
-- promo lain tetap tampil sebagai kartu di seksi Promo biasa.
ALTER TABLE promo ADD COLUMN IF NOT EXISTS popup smallint DEFAULT 0;

-- Contoh: jadikan promo Medical check up sebagai popup.
-- UPDATE promo SET popup = 1 WHERE judul = 'Medical check up';
