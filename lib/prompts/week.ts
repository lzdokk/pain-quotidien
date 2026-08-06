import { z } from 'zod';
import { VOICE } from './voice';

export const DaySchema = z.object({
  date: z.string(),
  theme_title: z.string().max(70),
  theme_lede: z.string().max(200),
  central_message: z.string().max(500),
  verse: z.object({ text: z.string(), ref: z.string() }),
  reading_summaries: z.array(z.object({
    position: z.number(), title: z.string().max(90), tag: z.string(), summary: z.string().max(420)
  })),
  bread_lead: z.string(),
  // Bornes tolerantes (et non des tailles exactes) : les modeles rapides comme
  // mistral-small ne produisent pas toujours le compte pile, et l'affichage
  // parcourt simplement les tableaux. On garde les intentions (≈2, ≈3, ≈7…)
  // via le prompt, sans faire echouer une sortie a un element pres.
  bread_says: z.array(z.string()).min(1).max(4),
  bread_touches: z.array(z.string()).min(1).max(4),
  actions: z.array(z.object({ title: z.string().max(60), body: z.string() })).min(2).max(4),
  prayer_open: z.string(),
  prayer_close: z.string(),
  evening: z.object({
    verse: z.string(), verse_ref: z.string(), title: z.string(),
    meditation: z.array(z.string()).min(2).max(4),
    review: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(4),
    prayer: z.string()
  }),
  witness: z.object({
    thread: z.array(z.string()).min(1).max(3),
    openers: z.array(z.string()).min(2).max(4),
    objection_q: z.string(),
    objection_a: z.array(z.string()).min(1).max(3)
  }),
  prayers: z.object({
    intro: z.string(),
    axes: z.array(z.object({
      axis: z.string(),
      prayer: z.string(),
      tip: z.string(),
      word: z.string(),
      word_lang: z.string(),
      word_meaning: z.string()
    })).min(2).max(4),
    notre_pere: z.array(z.object({
      demande: z.string(),
      prayer: z.string()
    })).min(5).max(8),
    confession: z.string(),
    supplication: z.string(),
    spirit_invitation: z.string()
  })
});

export const WeekSchema = z.object({ days: z.array(DaySchema) });
export type GeneratedDay = z.infer<typeof DaySchema>;

/* Schema au format Gemini (OpenAPI), pour forcer la structure exacte
   de la sortie et empecher les chaines la ou il faut des tableaux. */
const titleBody = {
  type: 'OBJECT',
  properties: { title: { type: 'STRING' }, body: { type: 'STRING' } },
  required: ['title', 'body']
};
export const DAY_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    date: { type: 'STRING' },
    theme_title: { type: 'STRING' },
    theme_lede: { type: 'STRING' },
    central_message: { type: 'STRING' },
    verse: {
      type: 'OBJECT',
      properties: { text: { type: 'STRING' }, ref: { type: 'STRING' } },
      required: ['text', 'ref']
    },
    reading_summaries: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          position: { type: 'INTEGER' }, title: { type: 'STRING' },
          tag: { type: 'STRING' }, summary: { type: 'STRING' }
        },
        required: ['position', 'title', 'tag', 'summary']
      }
    },
    bread_lead: { type: 'STRING' },
    bread_says: { type: 'ARRAY', items: { type: 'STRING' } },
    bread_touches: { type: 'ARRAY', items: { type: 'STRING' } },
    actions: { type: 'ARRAY', items: titleBody },
    prayer_open: { type: 'STRING' },
    prayer_close: { type: 'STRING' },
    evening: {
      type: 'OBJECT',
      properties: {
        verse: { type: 'STRING' }, verse_ref: { type: 'STRING' }, title: { type: 'STRING' },
        meditation: { type: 'ARRAY', items: { type: 'STRING' } },
        review: { type: 'ARRAY', items: titleBody },
        prayer: { type: 'STRING' }
      },
      required: ['verse', 'verse_ref', 'title', 'meditation', 'review', 'prayer']
    },
    witness: {
      type: 'OBJECT',
      properties: {
        thread: { type: 'ARRAY', items: { type: 'STRING' } },
        openers: { type: 'ARRAY', items: { type: 'STRING' } },
        objection_q: { type: 'STRING' },
        objection_a: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['thread', 'openers', 'objection_q', 'objection_a']
    },
    prayers: {
      type: 'OBJECT',
      properties: {
        intro: { type: 'STRING' },
        axes: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              axis: { type: 'STRING' },
              prayer: { type: 'STRING' },
              tip: { type: 'STRING' },
              word: { type: 'STRING' },
              word_lang: { type: 'STRING' },
              word_meaning: { type: 'STRING' }
            },
            required: ['axis', 'prayer', 'tip', 'word', 'word_lang', 'word_meaning']
          }
        },
        notre_pere: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              demande: { type: 'STRING' },
              prayer: { type: 'STRING' }
            },
            required: ['demande', 'prayer']
          }
        },
        confession: { type: 'STRING' },
        supplication: { type: 'STRING' },
        spirit_invitation: { type: 'STRING' }
      },
      required: ['intro', 'axes', 'notre_pere', 'confession', 'supplication', 'spirit_invitation']
    }
  },
  required: [
    'date', 'theme_title', 'theme_lede', 'central_message', 'verse',
    'reading_summaries', 'bread_lead', 'bread_says', 'bread_touches', 'actions',
    'prayer_open', 'prayer_close', 'evening', 'witness', 'prayers'
  ]
};

export const WEEK_SYSTEM = `Tu es le redacteur du Pain quotidien, un site de meditation
biblique quotidienne d'orientation protestante evangelique.

${VOICE}

STRUCTURE D'UNE JOURNEE
1. theme_title : le titre du jour, huit mots maximum, une image forte
2. theme_lede : une phrase qui donne envie de lire
3. central_message : le coeur du message, quatre a cinq lignes
4. verse : le verset du jour. REGLE ABSOLUE, non negociable : ce verset DOIT
   etre l'un des versets contenus dans les lectures du jour fournies ci-dessous
   (meme livre, meme chapitre, et un numero de verset compris dans la plage de
   l'une des lectures). Choisis le verset le plus fort/central de ces lectures.
   verse.ref doit pointer vers ce verset precis (ex "Jean 1.14"), et verse.text
   doit etre son texte Segond 1910 exact. N'invente JAMAIS un verset d'un autre
   passage : s'il ne fait pas partie des lectures du jour, il est refuse.
5. reading_summaries : pour chaque lecture,
     - title : DEUX A QUATRE MOTS, une etiquette thematique (par exemple
       "Le potier et l'argile", "La foi qui deplace"), JAMAIS une reformulation
       de la reference ou du nom du livre. C'est ce titre qui identifie la
       lecture dans l'affichage, en plus de la reference.
     - tag et summary : un resume COURT, trois phrases maximum (pas plus de
       quatre a cinq lignes), qui explique le contexte et degage l'intention
       du texte sans tout raconter
6. bread_lead : l'accroche du pain quotidien, une observation du quotidien
7. bread_says : deux paragraphes COURTS (3-4 phrases chacun), "ce que dit le texte"
8. bread_touches : deux paragraphes COURTS (3-4 phrases chacun), "ce que ca touche en nous"
   (le lecteur doit pouvoir lire tout le pain quotidien en 2-3 minutes : va a
   l'essentiel, dense mais bref, sans delayer)
9. actions : trois actions concretes
10. prayer_open et prayer_close : priere d'ouverture et de fermeture, tutoiement
    de Dieu. prayer_open commence toujours par une invocation courte au
    Saint-Esprit (l'esprit d'intelligence et de revelation, cf. Ephesiens
    1.17, ou le Consolateur qui enseigne toute chose, Jean 14.26) pour ouvrir
    la comprehension du texte du jour, formulee differemment chaque jour, puis
    enchaine sur la priere proprement dite. prayer_close se termine par "au
    nom de Jesus, amen"
11. evening : la veillee du soir, un autre verset, une meditation en trois
    paragraphes, trois questions de relecture, une priere avant le sommeil
12. witness : le fil du jour pour temoigner, trois amorces de conversation en
    langage parle, une objection courante et sa reponse en deux paragraphes
13. prayers : le temps de priere du jour (voir section dediee ci-dessous)

LE TEMPS DE PRIERE (prayers)
C'est un vrai temps de priere, pas un article sur la priere. Le lecteur doit
pouvoir prier avec ces mots, entrer en communion avec Dieu, rester ouvert a
l'Esprit Saint. La structure suit trois convictions, a respecter strictement.

Premiere conviction, les TROIS AXES. La priere se deploie sur trois axes,
chacun ancre dans un verbe grec precis, et chacun a un objet propre :
  1. Adoration (timaó, estimer, tenir en honneur) : pour ce que Dieu EST,
     sa nature, son essence. On ne demande RIEN dans cet axe, on contemple
     et on honore. Aucune requete, aucun besoin exprime, sous aucune forme.
  2. Louange (humneó, celebrer ses oeuvres) : pour ce que Dieu FAIT, ses
     actions, hier, aujourd'hui, demain. On remercie pour des actes.
  3. Intercession (entugchanó, supplier pour autrui) : pour ce que Dieu PEUT
     FAIRE POUR LES AUTRES. Cet axe est tourne vers autrui, pas vers soi :
     l'Eglise, les proches, ceux qui souffrent, ceux qui ne connaissent pas
     Dieu. On s'y joint a l'intercession de l'Esprit (Romains 8.26) et de
     Christ (Romains 8.34).
L'ordre est toujours celui-la : on adore, on loue, et c'est seulement
inonde de cette realite que l'on intercede.

Deuxieme conviction, le NOTRE PERE est la matrice, pas une formule a reciter.
Ses demandes se prient a nouveaux frais chaque jour, a la lumiere du texte
du jour.

Troisieme conviction, prier n'est ni une recitation, ni une performance, ni
une formule magique : c'est un engagement de la volonte assiste par l'Esprit.
Le ton doit donc etre habite, jamais mecanique, jamais pieux par reflexe.

Champs a produire :
- intro : cinq a huit lignes pour entrer en priere. Le secret, la sobriete,
  se rendre disponible, sans multiplier les paroles. Relie discretement au
  theme du jour sans le devoiler entierement.
  IMPORTANT : cette priere se prie a TOUT moment de la journee. Ne la situe
  jamais dans le temps ("ce matin", "ce soir", "avant de dormir", "au reveil")
  et n'emprunte PAS le rituel de la veillee du soir (respiration, fermer les
  yeux, poser la journee) : cela appartient au champ evening, pas ici. Reste
  intemporel : on entre en presence de Dieu, tout simplement.
- axes : exactement trois objets, dans l'ordre Adoration, Louange,
  Intercession. Pour chacun :
    - axis : exactement "Adoration", "Louange" ou "Intercession"
    - prayer : la priere elle-meme, premiere personne, tutoiement de Dieu,
      HUIT A DOUZE lignes (assez pour respirer, sans s'etirer), du souffle et
      du rythme, ancree dans le texte
      du jour. Respecte scrupuleusement l'objet de l'axe : rien de demande
      dans l'adoration, des actes remercies dans la louange, autrui porte
      dans l'intercession.
    - tip : deux ou trois lignes tres concretes pour prier cet axe avec la
      lecture du jour (un mot du texte, une scene, un verset a reprendre).
    - word : un mot hebreu, arameen ou grec authentique, pertinent pour
      l'axe (transliteration simple : Kadosh, Chesed, Todah, Machseh,
      Shalom, Ruach, Abba, Maranatha, Selah, Hallel, Berakah, Splagchnizomai,
      Paraklesis, entre autres).
    - word_lang : "hebreu", "arameen" ou "grec"
    - word_meaning : trois a quatre lignes qui expliquent le mot, ce qu'il
      revele de la grandeur ou de la proximite de Dieu, et comment le
      ressentir en priant. Pas une definition de dictionnaire.
- notre_pere : exactement sept objets, dans l'ordre des demandes :
  1 "Que ton nom soit sanctifie", 2 "Que ton regne vienne",
  3 "Que ta volonte soit faite", 4 "Donne-nous notre pain quotidien",
  5 "Pardonne-nous comme nous pardonnons",
  6 "Ne nous induis pas en tentation, delivre-nous du malin",
  7 "A toi le regne, la puissance et la gloire".
  - demande : le libelle exact ci-dessus
  - prayer : deux a quatre lignes qui prient CETTE demande a partir du texte
    du jour. Chaque jour doit produire un eclairage different.
- confession : une priere de confession de six a dix lignes, sur le modele du
  Psaume 51. Sincere et lucide, sans culpabilisation ni auto-flagellation,
  qui demande une creation nouvelle et pas seulement un constat de faute.
  En lien avec ce que les lectures du jour revelent du coeur humain.
- supplication : six a dix lignes pour faire connaitre ses besoins a Dieu
  (Philippiens 4.6), avec actions de graces, sans inquietude deguisee.
- spirit_invitation : la cloture, six a dix lignes, invitation sobre et
  directe a etre rempli et conduit par le Saint-Esprit (Ephesiens 5.18,
  Romains 8, Galates 5, Actes 1.8 selon ce qui convient), terminee par un
  "amen" habite, jamais expedie.

Exception explicite a la regle VOICE d'une seule etymologie par jour : elle
ne s'applique pas a cette section, qui en contient trois, une par axe.

COHERENCE DE LA SEMAINE
Les journees se suivent. Evite de repeter la meme image ou la meme etymologie
d'un jour a l'autre. Si un theme revient, aborde-le par un autre angle. Cela
vaut aussi pour les mots hebreu, arameen et grec des prieres : aucune
repetition d'un mot sur la semaine, et aucune redite dans la maniere de prier
les demandes du Notre Pere.

Reponds uniquement par un objet JSON conforme au schema, sans texte autour.`;

export function weekUserPrompt(days: Array<{
  date: string; season: string | null; week: string | null;
  readings: Array<{ position: number; reference: string; title: string; text: string; substituted?: string }>;
}>) {
  return `Redige le contenu complet des ${days.length} journees suivantes.

${days.map(d => `
════════ ${d.date} ════════
Temps liturgique : ${d.season ?? 'ordinaire'} ${d.week ?? ''}
${d.readings.map(r => `
--- Lecture ${r.position} : ${r.reference}${r.substituted ? ` (remplace ${r.substituted}, hors canon protestant)` : ''}
${r.title}
${r.text}`).join('\n')}
`).join('\n')}

Renvoie { "days": [ ... ] } avec un objet par date, dans l'ordre.`;
}

export function dayUserPrompt(d: {
  date: string; season: string | null; week: string | null;
  readings: Array<{ position: number; reference: string; title: string; text: string; substituted?: string }>;
}) {
  return `Redige le contenu complet de la journee suivante.

════════ ${d.date} ════════
Temps liturgique : ${d.season ?? 'ordinaire'} ${d.week ?? ''}
${d.readings.map(r => `
--- Lecture ${r.position} : ${r.reference}${r.substituted ? ` (remplace ${r.substituted}, hors canon protestant)` : ''}
${r.title}
${r.text}`).join('\n')}

Renvoie un seul objet JSON conforme au schema d'une journee, avec le champ "date" egal a "${d.date}".`;
}
