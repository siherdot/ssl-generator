-- "INSTALASI FISIOTERAPI" (SIMRS) vs "UNIT REHABILITASI MEDIK (FISIOTERAPI)" (situs):
-- pencocokan nama sempat membuang isi tanda kurung sehingga tidak cocok dan lahir
-- poli kembar. Satukan ke P16; endpoint sudah diperbaiki.
UPDATE jadwal_dokter SET id_poli = 'P16' WHERE id_poli = 'PFSIO';
UPDATE dokter        SET id_poli = 'P16' WHERE id_poli = 'PFSIO';
DELETE FROM poli WHERE id_poli = 'PFSIO';
