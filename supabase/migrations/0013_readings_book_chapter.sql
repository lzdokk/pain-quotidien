-- Ajoute les colonnes book/chapter a readings pour permettre les actions
-- verset (surligner, noter, expliquer) directement dans les lectures du jour,
-- sans passer par le lecteur autonome.
alter table readings add column if not exists book int;
alter table readings add column if not exists chapter int;
