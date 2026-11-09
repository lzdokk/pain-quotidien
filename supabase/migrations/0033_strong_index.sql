-- ════════════════════════════════════════════════════════════════════
--  0033 — Strong : retrouver vite un mot partout dans la Bible
-- ════════════════════════════════════════════════════════════════════
-- La fiche Strong affiche « ce mot dans la Bible · N fois » et la liste des
-- passages : cet index rend la recherche instantanée (au lieu de parcourir
-- tous les mots de la Bible à chaque fois).
create index if not exists verse_words_strong_idx on verse_words (strong, book, chapter, verse);
