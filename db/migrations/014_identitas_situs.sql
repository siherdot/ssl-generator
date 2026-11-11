-- Identitas situs yang bisa diubah dari dashboard: logo & ikon tab.
ALTER TABLE company ADD COLUMN IF NOT EXISTS favicon_hospital varchar(255) NOT NULL DEFAULT '';

-- Logo lama menunjuk berkas unggahan yang sudah tidak ada (404); arahkan ke logo yang dipakai navbar.
UPDATE company
   SET logo_hospital = '/images/logo-rsub.png'
 WHERE company_id = 'company-1'
   AND (logo_hospital = '' OR logo_hospital LIKE 'company-%');

UPDATE company
   SET favicon_hospital = '/images/arsip/logo2.png'
 WHERE company_id = 'company-1'
   AND favicon_hospital = '';
