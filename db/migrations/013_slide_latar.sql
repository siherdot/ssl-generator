-- Slide latar beranda (hero). Tabel warisan slide_images dipakai ulang:
-- kolom aktif menentukan foto yang tampil, id acuan untuk generator dashboard.
ALTER TABLE slide_images ADD COLUMN IF NOT EXISTS aktif smallint NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'slide_images_pkey') THEN
    ALTER TABLE slide_images ADD CONSTRAINT slide_images_pkey PRIMARY KEY (id_slide);
  END IF;
END $$;

-- strip 1181x118 terlalu kecil untuk jadi latar layar penuh -> sembunyikan
UPDATE slide_images SET aktif = 0 WHERE images = 'slide-230721-d1c6f5e459.jpg';

-- foto slide lama yang belum terdaftar, ikut diputar sebagai latar
INSERT INTO slide_images (id_slide, images, aktif) VALUES
  ('SL07', 'slide-221223-a0c229e5fc.jpg', 1),
  ('SL08', 'slide-230906-58cce6c04e.jpg', 1),
  ('SL09', 'slide-231127-910d555f2d.jpg', 1),
  ('SL10', 'slide-241123-e4d209e864.jpg', 1),
  ('SL11', 'slide-241213-d3635fbbe5.jpg', 1)
ON CONFLICT (id_slide) DO NOTHING;
