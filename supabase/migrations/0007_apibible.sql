-- Support des traductions sous licence hebergees sur API.Bible.
-- source = 'local' (table verses) ou 'apibible' (recuperees via l'API).
-- api_id = identifiant de la bible chez API.Bible.

alter table translations add column if not exists source text default 'local';
alter table translations add column if not exists api_id text;

-- Exemple, a executer UNE FOIS que tu as ta cle et l'accord pour la traduction.
-- Remplace <BIBLE_ID> par l'identifiant fourni par API.Bible pour la Segond 21 :
--
-- insert into translations (code, name, notice, enabled, source, api_id, public_domain)
-- values ('S21', 'Segond 21', 'Segond 21 (c) Societe Biblique de Geneve, avec autorisation',
--         true, 'apibible', '<BIBLE_ID>', false)
-- on conflict (code) do update set
--   name = excluded.name, notice = excluded.notice, enabled = excluded.enabled,
--   source = excluded.source, api_id = excluded.api_id;
