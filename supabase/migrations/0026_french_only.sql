-- ════════════════════════════════════════════════════════════════════
--  0026 — Ne garder que les Bibles FRANÇAISES (pour la comparaison)
-- ════════════════════════════════════════════════════════════════════
-- L'utilisateur veut comparer un maximum de versions françaises, et retirer
-- toutes les autres langues (anglais, allemand, grec, hébreu, latin…).
--
-- On DÉSACTIVE (enabled=false) au lieu de supprimer : rien n'est perdu, et il
-- suffira d'un update pour réactiver une langue plus tard si besoin.

-- 1) Couper les traductions non françaises (elles restent en base, juste
--    masquées). coalesce : une ligne dont la langue n'est pas renseignée est
--    traitée comme française et donc CONSERVÉE (on ne risque pas de couper une
--    Bible FR par mégarde).
update translations set enabled = false where coalesce(language, 'fr') <> 'fr';

-- 2) Garder actives TOUTES les Bibles françaises déjà présentes, y compris
--    celles sous droits que tu utilises déjà (Semeur, Parole de Vie, Nouvelle
--    Bible Segond…). On ne touche pas à ce qui est en français.
update translations set enabled = true where coalesce(language, 'fr') = 'fr';

-- 3) Ajouter la Bible Martin (1744), française, domaine public, lue à la volée
--    depuis getbible.net (source='getbible', api_id = identifiant getbible).
insert into translations (code, name, language, public_domain, enabled, source, api_id) values
  ('FRMART', 'Martin (1744)', 'fr', true, true, 'getbible', 'martin')
on conflict (code) do update
  set name = excluded.name, language = 'fr', public_domain = true,
      enabled = true, source = 'getbible', api_id = 'martin';

-- Récapitulatif attendu des Bibles françaises actives :
--   FRLSG  · Segond 1910           (local)
--   FRDBY  · Darby (1890)          (bolls)
--   FRMART · Martin (1744)         (getbible)
-- Les versions françaises sous droits (Semeur, NBS, Parole de Vie…) ne sont
-- pas incluses : elles ne sont pas dans le domaine public.
