-- Setelan koneksi SIMRS disimpan di database supaya bisa diubah dari dashboard
-- admin tanpa deploy ulang. Satu baris saja (id = 1).
CREATE TABLE IF NOT EXISTS pengaturan_simrs (
  id         smallint PRIMARY KEY DEFAULT 1,
  api_url    varchar(255) NOT NULL DEFAULT '',
  api_key    varchar(255) NOT NULL DEFAULT '',
  diperbarui timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pengaturan_simrs_satu_baris CHECK (id = 1)
);

INSERT INTO pengaturan_simrs (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
