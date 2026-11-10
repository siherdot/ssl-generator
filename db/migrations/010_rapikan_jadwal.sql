-- Fase H (lanjutan): bereskan sisa data lama yang bikin tampilan kacau.
--
--  1. P15 (POLIKLINIK RADIOLOGI versi lama) dipakai dokter/jadwal padahal barisnya
--     sudah tidak ada -> satukan ke P08.
--  2. Jadwal milik dokter yang sudah dihapus dibuang (tidak pernah tampil, hanya yatim).
--  3. Jadwal yang menunjuk poli tak dikenal dipindah ke poli dokternya.
--  4. Jadwal "POLI UMUM" dipegang dokter yang sebenarnya punya poli khusus
--     (mis. dokter Obgyn dengan kode poli tanpa nama) -> ikut poli dokter.
--  5. Poli utama dokter yang masih "POLI UMUM" diambil dari jadwal bernama.

-- 1. radiologi lama
UPDATE dokter        SET id_poli = 'P08' WHERE id_poli = 'P15';
UPDATE jadwal_dokter SET id_poli = 'P08' WHERE id_poli = 'P15';

-- 2. jadwal yatim
DELETE FROM jadwal_dokter j
 WHERE NOT EXISTS (SELECT 1 FROM dokter d WHERE d.id_dokter = j.id_dokter);

-- 3. poli tak dikenal -> poli dokter
UPDATE jadwal_dokter j
   SET id_poli = d.id_poli
  FROM dokter d
 WHERE j.id_dokter = d.id_dokter
   AND j.id_poli NOT IN (SELECT id_poli FROM poli)
   AND d.id_poli IN (SELECT id_poli FROM poli);

-- 4. poli utama dokter "POLI UMUM" diambil dari jadwal bernama
UPDATE dokter d
   SET id_poli = x.id_poli
  FROM (
        SELECT DISTINCT ON (j.id_dokter) j.id_dokter, j.id_poli
          FROM jadwal_dokter j
         WHERE j.kode_simrs IS NOT NULL
           AND j.id_poli <> 'P20'
           AND j.id_poli IN (SELECT id_poli FROM poli)
         ORDER BY j.id_dokter, j.id_poli
       ) x
 WHERE d.id_dokter = x.id_dokter
   AND d.id_poli = 'P20';

-- 5. jadwal "POLI UMUM" milik dokter yang punya poli khusus
UPDATE jadwal_dokter j
   SET id_poli = d.id_poli
  FROM dokter d
 WHERE j.id_dokter = d.id_dokter
   AND j.id_poli = 'P20'
   AND d.id_poli <> 'P20';
