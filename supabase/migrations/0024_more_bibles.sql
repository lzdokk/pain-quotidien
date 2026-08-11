-- Ajout de traductions bibliques LIBRES DE DROITS (domaine public), lues à la
-- volée depuis bolls.life (source='bolls', api_id = short_name bolls). Aucune
-- version sous copyright (NIV, ESV, Semeur, NBS…) n'est incluse.
insert into translations (code, name, language, public_domain, enabled, source, api_id) values
  -- Français
  ('FRDBY', 'Darby (1890)',                         'fr', true, true, 'bolls', 'FRDBY'),
  -- Anglais (domaine public / libre)
  ('KJV',   'King James Version (1769)',            'en', true, true, 'bolls', 'KJV'),
  ('ASV',   'American Standard Version (1901)',     'en', true, true, 'bolls', 'ASV'),
  ('WEB',   'World English Bible',                  'en', true, true, 'bolls', 'WEB'),
  ('YLT',   'Young''s Literal Translation (1898)',  'en', true, true, 'bolls', 'YLT'),
  ('GNV',   'Geneva Bible (1599)',                  'en', true, true, 'bolls', 'GNV'),
  ('DRB',   'Douay-Rheims Bible',                   'en', true, true, 'bolls', 'DRB'),
  ('BSB',   'Berean Standard Bible',                'en', true, true, 'bolls', 'BSB'),
  ('LSV',   'Literal Standard Version',             'en', true, true, 'bolls', 'LSV'),
  ('LXXE',  'Septuagint en anglais (1851)',         'en', true, true, 'bolls', 'LXXE'),
  -- Langues originales
  ('WLC',   'Hébreu — Westminster Leningrad Codex', 'he', true, true, 'bolls', 'WLC'),
  ('TR',    'Grec — Textus Receptus (1624)',        'el', true, true, 'bolls', 'TR'),
  ('LXX',   'Grec — Septante (LXX)',                'el', true, true, 'bolls', 'LXX'),
  ('TISCH', 'Grec — Tischendorf NT (1869)',         'el', true, true, 'bolls', 'TISCH'),
  ('VULG',  'Latin — Vulgate Clémentine',           'la', true, true, 'bolls', 'VULG'),
  -- Autres langues (domaine public)
  ('LUT',   'Allemand — Luther (1912)',             'de', true, true, 'bolls', 'LUT'),
  ('ELB',   'Allemand — Elberfelder (1871)',        'de', true, true, 'bolls', 'ELB'),
  ('SCH',   'Allemand — Schlachter (1951)',         'de', true, true, 'bolls', 'SCH'),
  ('SYNOD', 'Russe — Synodale',                     'ru', true, true, 'bolls', 'SYNOD'),
  ('BG',    'Polonais — Biblia Gdańska (1881)',     'pl', true, true, 'bolls', 'BG'),
  ('SVD',   'Arabe — Smith & Van Dyke',             'ar', true, true, 'bolls', 'SVD'),
  ('CUV',   'Chinois — Union (traditionnel)',       'zh', true, true, 'bolls', 'CUV')
on conflict (code) do nothing;
