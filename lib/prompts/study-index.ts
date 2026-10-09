import { z } from 'zod';
import { VOICE } from './voice';

/**
 * INDEX D'ETUDE — l'equivalent de l'annexe d'une Bible d'etude, ecrit par
 * nous : index thematique classe par grands sujets, et index des personnages
 * et des lieux. Chaque fiche renvoie a des passages precis, cliquables.
 */

/** Grands sujets (ordre d'affichage) et leurs themes. */
export const GRANDS_SUJETS: Array<{ id: string; title: string; groups: Array<{ title: string; themes: string[] }> }> = [
  { id: 'dieu', title: 'I. Dieu', groups: [
    { title: 'Sa nature', themes: ['Dieu', 'Amour de Dieu', 'Sainteté de Dieu', 'Fidélité de Dieu', 'Gloire de Dieu', 'Justice de Dieu', 'Colère de Dieu', 'Miséricorde', 'Grâce', 'Sagesse de Dieu', 'Toute-puissance', 'Souveraineté de Dieu', 'Trinité'] },
    { title: 'Ses noms et son œuvre', themes: ['Noms de Dieu', 'Création', 'Providence', 'Alliance', 'Bénédiction', 'Volonté de Dieu'] },
    { title: 'Il se fait connaître', themes: ['Parole de Dieu', 'Révélation', 'Miracles', 'Prophétie', 'Rêves et visions'] }
  ]},
  { id: 'jesus', title: 'II. Jésus le Messie', groups: [
    { title: 'Sa personne et ses titres', themes: ['Jésus-Christ', 'Messie', 'Fils de Dieu', "Fils de l'homme", 'Agneau de Dieu', 'Bon Berger', 'Fils de David', 'Seigneur'] },
    { title: 'Son œuvre', themes: ['Incarnation', 'Médiateur', 'Grand-prêtre', 'Roi', 'Serviteur', 'Paraboles', 'Royaume de Dieu'] },
    { title: 'Son histoire', themes: ['Naissance de Jésus', 'Baptême de Jésus', 'Tentation de Jésus', 'Croix', 'Sang de Jésus', 'Résurrection de Jésus', 'Ascension', 'Évangile'] }
  ]},
  { id: 'esprit', title: 'III. Le Saint-Esprit', groups: [
    { title: 'Sa personne et son œuvre', themes: ['Saint-Esprit', 'Baptême du Saint-Esprit', "Dons de l'Esprit", "Fruit de l'Esprit", 'Onction', 'Consolateur', 'Liberté', 'Puissance'] }
  ]},
  { id: 'creation', title: 'IV. La création', groups: [
    { title: 'Le monde visible et invisible', themes: ['Anges', 'Démons', 'Satan', 'Ciel', 'Terre', 'Lumière', 'Ténèbres', 'Eau', 'Arbre', 'Sabbat'] }
  ]},
  { id: 'humanite', title: "V. L'humanité", groups: [
    { title: "L'être humain", themes: ['Homme et femme', 'Cœur', 'Âme et esprit', 'Corps', 'Image de Dieu'] },
    { title: 'La vie de tous les jours', themes: ['Mariage', 'Famille', 'Enfants', 'Travail', 'Argent et richesse', 'Pauvreté', 'Amitié', 'Paroles et langue', 'Sexualité', 'Étranger'] },
    { title: 'Les épreuves', themes: ['Souffrance', 'Maladie et guérison', 'Mort', 'Deuil', 'Vieillesse', 'Peur', 'Inquiétude', 'Colère'] }
  ]},
  { id: 'peche', title: 'VI. Péché et rédemption', groups: [
    { title: 'Le péché', themes: ['Péché', 'Tentation', 'Orgueil', 'Convoitise', 'Idolâtrie', 'Mensonge', 'Jugement'] },
    { title: 'La rédemption', themes: ['Repentance', 'Pardon', 'Rédemption', 'Salut', 'Justification', 'Réconciliation', 'Expiation', 'Nouvelle naissance', 'Sacrifice'] }
  ]},
  { id: 'peuple', title: 'VII. Le peuple de Dieu', groups: [
    { title: 'Israël et les nations', themes: ['Israël', 'Juifs et nations', 'Loi (Torah)', 'Circoncision', 'Prêtre', 'Tabernacle', 'Temple'] },
    { title: 'Les fêtes', themes: ["Fêtes de l'Éternel", 'Pâque', 'Pentecôte', 'Fête des Cabanes', 'Jour du Grand Pardon'] },
    { title: "L'Église", themes: ['Église', 'Disciple', 'Baptême', 'Repas du Seigneur', 'Communion fraternelle', 'Unité', 'Anciens et bergers', 'Évangélisation', 'Témoignage', 'Dîmes et offrandes'] }
  ]},
  { id: 'croyant', title: 'VIII. Le croyant', groups: [
    { title: 'La foi', themes: ['Foi', 'Espérance', 'Assurance du salut', 'Confiance', 'Persévérance'] },
    { title: 'La vie avec Dieu', themes: ['Prière', 'Adoration', 'Louange', 'Jeûne', 'Méditation', 'Écouter Dieu', 'Crainte de Dieu', 'Reconnaissance'] },
    { title: 'Le caractère', themes: ['Amour du prochain', 'Humilité', 'Patience', 'Joie', 'Paix', 'Obéissance', 'Sanctification', 'Pureté', 'Générosité', 'Hospitalité', 'Pardonner aux autres', 'Service', 'Sagesse pratique'] },
    { title: 'Le combat', themes: ['Combat spirituel', 'Armure de Dieu', 'Consolation', 'Vocation'] }
  ]},
  { id: 'fin', title: 'IX. La fin des temps', groups: [
    { title: "L'espérance à venir", themes: ['Retour de Christ', 'Résurrection des morts', 'Jugement dernier', 'Vie éternelle', 'Nouvelle Jérusalem', 'Enfer', 'Antichrist', 'Récompenses'] }
  ]}
];

export const PERSONNAGES = [
  'Adam', 'Ève', 'Caïn et Abel', 'Noé', 'Abraham', 'Sarah', 'Isaac', 'Rébecca', 'Jacob', 'Joseph (fils de Jacob)',
  'Moïse', 'Aaron', 'Miryam', 'Josué', 'Caleb', 'Rahab', 'Déborah', 'Gédéon', 'Samson', 'Ruth',
  'Anne (mère de Samuel)', 'Samuel', 'Saül', 'David', 'Jonathan', 'Bath-Shéba', 'Absalom', 'Nathan', 'Salomon', 'Élie',
  'Élisée', 'Achab et Jézabel', 'Ézéchias', 'Josias', 'Ésaïe', 'Jérémie', 'Ézéchiel', 'Daniel', 'Jonas', 'Esther',
  'Esdras', 'Néhémie', 'Job', 'Melchisédek', 'Nabuchodonosor', 'Cyrus', 'Marie (mère de Jésus)', 'Joseph (époux de Marie)', 'Jean-Baptiste', 'Pierre',
  'Jean (apôtre)', 'Jacques (frère de Jean)', 'André', 'Matthieu', 'Thomas', 'Judas Iscariot', 'Marie de Magdala', 'Marthe et Marie', 'Lazare', 'Nicodème',
  'Zachée', 'Paul', 'Barnabas', 'Timothée', 'Étienne', 'Philippe', 'Priscille et Aquilas', 'Luc', 'Lydie', 'Corneille',
  'Pilate', 'Hérode', "Pharaon (de l'Exode)", 'Jacques (frère de Jésus)'
];

export const LIEUX = [
  'Éden', 'Our des Chaldéens', 'Canaan', 'Égypte', 'Mer Rouge', 'Sinaï', 'Désert', 'Jourdain', 'Jéricho', 'Hébron',
  'Jérusalem', 'Sion', 'Bethléem', 'Nazareth', 'Galilée', 'Capernaüm', 'Samarie', 'Béthanie', 'Gethsémané', 'Golgotha',
  'Mont des Oliviers', 'Mont Carmel', 'Babylone', 'Ninive', 'Damas', 'Antioche', 'Éphèse', 'Corinthe', 'Rome', 'Patmos'
];

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export type PlannedEntry = {
  slug: string; kind: 'theme' | 'personne' | 'lieu'; title: string;
  category: string; subcategory: string | null;
};

/** Toutes les entrees prevues, dans l'ordre de generation. */
export function allEntries(): PlannedEntry[] {
  const out: PlannedEntry[] = [];
  for (const g of GRANDS_SUJETS) for (const sub of g.groups) for (const t of sub.themes)
    out.push({ slug: slugify(t), kind: 'theme', title: t, category: g.title, subcategory: sub.title });
  for (const p of PERSONNAGES) out.push({ slug: slugify(p), kind: 'personne', title: p, category: 'Personnages', subcategory: null });
  for (const l of LIEUX) out.push({ slug: slugify(l), kind: 'lieu', title: l, category: 'Lieux', subcategory: null });
  const seen = new Set<string>();
  return out.filter(e => (seen.has(e.slug) ? false : (seen.add(e.slug), true)));
}

export const ABREVIATIONS = `Gn Ex Lv Nb Dt Jos Jg Rt 1 S 2 S 1 R 2 R 1 Ch 2 Ch Esd Ne Est Jb Ps Pr Ec Ct Es Jr Lm Ez Dn Os Jl Am Ab Jon Mi Na Ha So Ag Za Ml
  Mt Mc Lc Jn Ac Rm 1 Co 2 Co Ga Ep Ph Col 1 Th 2 Th 1 Tm 2 Tm Tt Phm He Jc 1 P 2 P 1 Jn 2 Jn 3 Jn Jude Ap`;

export const IndexEntrySchema = z.object({
  definition: z.string().max(900),
  sections: z.array(z.object({
    title: z.string().max(120),
    items: z.array(z.object({
      label: z.string().max(180),
      refs: z.array(z.string()).min(1).max(6)
    })).min(1).max(10)
  })).min(2).max(8),
  see_also: z.array(z.string()).max(8).optional().default([])
});
export type IndexEntry = z.infer<typeof IndexEntrySchema>;

export const INDEX_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    definition: { type: 'STRING' },
    sections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          items: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: { label: { type: 'STRING' }, refs: { type: 'ARRAY', items: { type: 'STRING' } } },
              required: ['label', 'refs']
            }
          }
        },
        required: ['title', 'items']
      }
    },
    see_also: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['definition', 'sections', 'see_also']
};

export const INDEX_SYSTEM = `Tu rédiges l'INDEX D'ÉTUDE d'une Bible d'étude en ligne, d'orientation
protestante évangélique : une fiche par thème, personnage ou lieu, qui permet
au lecteur de tout retrouver dans la Bible et de cliquer pour lire.

${VOICE}

FORME D'UNE FICHE (dans l'esprit de l'annexe d'une Bible d'étude, mais
entièrement rédigée par toi) :
- definition : deux à quatre phrases claires. Pour un personnage : qui il est,
  son époque, son rôle dans l'histoire du salut. Pour un lieu : où il se trouve
  et ce qui s'y passe. Pour un thème : ce que la Bible entend par ce mot.
- sections : deux à sept sections au plan logique. Le titre commence par une
  lettre : « A. Dans l'Ancien Testament », « B. Ce que Jésus enseigne »,
  « C. Pour notre vie ». Pour un personnage : « A. Famille », « B. Appel »,
  « C. Événements marquants », « D. Ce que le Nouveau Testament en dit ».
- chaque section contient des items : un libellé court (quelques mots, sans
  majuscule initiale, ex. « déclaré juste par sa foi ») et une à cinq
  références qui le prouvent.
- see_also : jusqu'à six autres entrées de l'index à consulter (titres simples).

RÉFÉRENCES (RÈGLE ABSOLUE) :
- Format abrégé uniquement, chapitre POINT verset : « Gn 12.1-3 », « Jn 3.16 »,
  « 1 Co 13.4-7 », « Ps 23 » (chapitre entier), « Mt 5.3-12 ».
- Abréviations autorisées, exactement celles-ci :
  ${ABREVIATIONS}
- Canon protestant de 66 livres, numérotation des Bibles françaises (Segond).
- Ne cite QUE des passages dont tu es CERTAIN qu'ils parlent bien de l'item.
  Mieux vaut moins de références que des références approximatives.
- Ancien ET Nouveau Testament quand c'est pertinent, en montrant
  l'accomplissement en Yéchoua (Jésus).

Réponds uniquement par un objet JSON conforme au schéma, sans texte autour.`;

export function indexUserPrompt(e: PlannedEntry) {
  const k = e.kind === 'personne' ? 'PERSONNAGE' : e.kind === 'lieu' ? 'LIEU' : 'THÈME';
  return `Rédige la fiche d'index pour ce ${k} : « ${e.title} »
(classement : ${e.category}${e.subcategory ? ` › ${e.subcategory}` : ''}).
Renvoie { "definition": "...", "sections": [ { "title": "A. ...", "items": [ { "label": "...", "refs": ["Gn 1.1"] } ] } ], "see_also": [] }.`;
}
