-- ============================================================================
-- Seed data — dijalankan setelah semua migration (development/staging)
-- ============================================================================

-- Template global HPP Jasa default (range min-max per komponen)
insert into public.hpp_template_komponen (nama, nilai_min, nilai_max, urutan, is_default) values
  ('UPAH PRODUKSI',        35000, 50000, 1, true),
  ('OVERHEAD/PROFIT DEERA', 15000, 30000, 2, true),
  ('STAFF',                 5000, 15000, 3, true);

-- Katalog bahan baku umum (boleh ditambah Deera kapan saja lewat UI)
insert into public.katalog_bahan_baku (nama, tipe, satuan) values
  ('RESLETING',     'unit',  'PCS'),
  ('KANCING',       'unit',  'PCS'),
  ('HANGTAG',       'unit',  'PCS'),
  ('BENANG JAHIT',  'usage', 'ROL'),
  ('LABEL MEREK',   'unit',  'PCS');
