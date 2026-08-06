/**
 * Titres évocateurs des cours, à l'affichage seulement (le titre stocké en
 * base — nom du livre — reste intact pour la génération et la recherche).
 * Clé = code stocké (UBE01…). Le livre reste indiqué dans le titre.
 * Modifiable librement ici.
 */
export const COURSE_TITLES: Record<string, string> = {
  // ── Niveau Base ──────────────────────────────────────────────────
  UBE01: 'Jacques — La foi en action',
  UBE02: 'Actes — L’Église en marche',
  UBD01: 'Six doctrines — Les fondations de la foi',
  UBE03: 'Matthieu & Marc — Le Roi et le Serviteur',
  UBE04: 'Luc — L’Évangile des oubliés',
  UBE05: 'Jean — Les signes de la gloire',
  UBE06: 'Épîtres de Jean — Savoir qu’on est né de Dieu',
  UBD02: 'L’inspiration — Comment Dieu parle',
  UBE07: 'Synopse — Quatre regards, un seul Christ',
  UBD03: 'Herméneutique — Lire sans faire dire',
  UBE08: 'Romains — L’Évangile expliqué',
  UBD04: 'Le péché — La boussole déréglée',
  UBE09: '1 Corinthiens — L’Église et ses tensions',
  UBE10: '2 Corinthiens — Le trésor dans l’argile',
  UBE11: 'Éphésiens — Qui vous êtes en Christ',
  UBD05: 'L’appel — Envie, talent ou vocation ?',
  UBE12: 'Colossiens — La suprématie du Christ',
  UBE13: 'Épîtres de Pierre — Tenir dans l’épreuve',
  UBE14: 'Galates — La liberté de la grâce',
  UBE15: 'Hébreux — Christ, meilleur en tout',
  UBE16: 'Philippiens — La joie en prison',
  UBD07: 'Les ministères — Le corps et ses membres',
  UBE17: '1 Thessaloniciens — L’espérance du retour',
  UBE18: '2 Thessaloniciens — Attendre sans dériver',
  UBE19: 'Tite — Ordonner l’Église',
  UBE20: 'Timothée — Transmettre la foi',
  UBD06: 'La mission — Montrer où est le pain',
  UBE21: 'Apocalypse — La consolation en images',
  UBD08: 'Le Saint-Esprit — Une personne, pas une force',
  UBE24: 'Daniel — Fidèle en terre païenne',
  UBE22: 'Ézéchiel — Du cœur de pierre au cœur de chair',
  UBD09: 'L’œuvre de l’Esprit — Quatre verbes',
  UBE23: 'Ésaïe — Le prophète de l’Évangile',
  UBE25: 'Jérémie — Fidèle sans voir de fruit',
  UBD10: 'Les dons de l’Esprit — La caisse à outils',
  UBE26: 'Les douze prophètes — Petits mais essentiels',

  // ── Niveau Approfondissement ─────────────────────────────────────
  U1B01: 'Ancien Testament (1) — Loi & histoire',
  U1B02: 'Nouveau Testament — Origine des 27 livres',
  U1B03: 'Corinthiens — Le dossier complet',
  U1D01: 'Herméneutique — La méthode complète',
  U1P01: 'L’Église & la cité — Sel et lumière',
  U2B01: 'Ancien Testament (2) — Poésie & prophètes',
  U2B02: 'Philippiens — L’hymne au Christ',
  U2B03: 'Synoptiques (1) — Matthieu & Marc',
  U2D01: 'Vérités fondamentales (1) — Dieu & le Christ',
  U2D02: 'Ecclésiologie — La nature de l’Église',
  U2P01: 'Histoire de l’Église — Des Pères aux réveils',
  U3B01: 'Synoptiques (2) — L’œuvre de Luc',
  U3B02: 'Philémon — La grâce brise les chaînes',
  U3D01: 'Vérités fondamentales (2) — Esprit & fin des temps',
  U3D02: 'Missiologie du NT — Le modèle apostolique',
  U3D03: 'Bibliologie — De la révélation au canon',
  U3P02: 'Institutions — Gouverner une union d’Églises',
  U4B01: 'Colossiens — Contre les faux compléments',
  U4B02: 'Actes — La théologie de Luc',
  U4B03: 'Les prophètes — Le phénomène prophétique',
  U4D01: 'Sotériologie — Le salut, de A à Z',
  U4P01: 'Histoire d’Israël — Le cadre de la Bible',
  U4P03: 'Évangélisation — Annoncer avec à-propos',
  U5B01: 'Jean — Signes & discours d’adieu',
  U5B02: 'Épîtres pastorales — Garder le dépôt',
  U5B03: 'Éphésiens — Le mystère de l’Église',
  U5B04: 'Épîtres générales — Le témoignage commun',
  U5B05: 'Daniel — Apocalyptique & prophétie',
  U5D01: 'Pneumatologie — La personne et l’œuvre de l’Esprit',
  U5P01: 'Musicologie — Théologie du chant',

  // ── Étude du Grec Ancien ─────────────────────────────────────────
  UGC01: 'Grec (1) — Initiation',
  UGC02: 'Grec (2) — Familiarisation',
  UGC03: 'Grec (3) — Perfectionnement'
};

export const courseTitle = (code: string, fallback: string) =>
  COURSE_TITLES[code] ?? fallback;
