import { z } from 'zod';
import { VOICE } from './voice';

export const DaySchema = z.object({
  date: z.string(),
  theme_title: z.string().max(70),
  theme_lede: z.string().max(200),
  central_message: z.string().max(500),
  verse: z.object({ text: z.string(), ref: z.string() }),
  reading_summaries: z.array(z.object({
    position: z.number(), title: z.string().max(90), tag: z.string(), summary: z.string().max(700)
  })),
  bread_lead: z.string(),
  bread_says: z.array(z.string()).length(2),
  bread_touches: z.array(z.string()).length(2),
  actions: z.array(z.object({ title: z.string().max(60), body: z.string() })).length(3),
  prayer_open: z.string(),
  prayer_close: z.string(),
  evening: z.object({
    verse: z.string(), verse_ref: z.string(), title: z.string(),
    meditation: z.array(z.string()).length(3),
    review: z.array(z.object({ title: z.string(), body: z.string() })).length(3),
    prayer: z.string()
  }),
  witness: z.object({
    thread: z.array(z.string()).length(2),
    openers: z.array(z.string()).length(3),
    objection_q: z.string(),
    objection_a: z.array(z.string()).length(2)
  }),
  prayers: z.object({
    intro: z.string(),
    moments: z.array(z.object({
      theme: z.string(),
      prayer: z.string(),
      tip: z.string(),
      word: z.string(),
      word_lang: z.string(),
      word_meaning: z.string()
    })).length(5),
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
        moments: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              theme: { type: 'STRING' },
              prayer: { type: 'STRING' },
              tip: { type: 'STRING' },
              word: { type: 'STRING' },
              word_lang: { type: 'STRING' },
              word_meaning: { type: 'STRING' }
            },
            required: ['theme', 'prayer', 'tip', 'word', 'word_lang', 'word_meaning']
          }
        },
        spirit_invitation: { type: 'STRING' }
      },
      required: ['intro', 'moments', 'spirit_invitation']
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
4. verse : le verset du jour, choisi dans les lectures, texte Segond 1910 exact
5. reading_summaries : un resume par lecture, quatre a six phrases, qui explique
   le contexte et degage l'intention du texte
6. bread_lead : l'accroche du pain quotidien, une observation du quotidien
7. bread_says : deux paragraphes, "ce que dit le texte"
8. bread_touches : deux paragraphes, "ce que ca touche en nous"
9. actions : trois actions concretes
10. prayer_open et prayer_close : priere d'ouverture et de fermeture, tutoiement
    de Dieu, "au nom de Jesus, amen" en cloture
11. evening : la veillee du soir, un autre verset, une meditation en trois
    paragraphes, trois questions de relecture, une priere avant le sommeil
12. witness : le fil du jour pour temoigner, trois amorces de conversation en
    langage parle, une objection courante et sa reponse en deux paragraphes
13. prayers : le temps de priere du jour (voir section dediee ci-dessous)

LE TEMPS DE PRIERE (prayers)
C'est un vrai temps de priere structure, pas un article sur la priere. Le
lecteur doit pouvoir prier avec ces mots, entrer en communion avec Dieu, et
rester ouvert a l'Esprit Saint. Structure protestante evangelique classique,
cinq moments fixes, toujours dans cet ordre : Adoration, Pardon, Remerciement,
Protection, Communion.

- intro : quatre a six lignes pour poser le corps et le coeur avant de prier
  (silence, respiration, se rendre disponible), qui annoncent le lien avec
  le theme du jour sans le devoiler entierement.
- moments : exactement cinq objets, un par theme fixe ci-dessus, dans l'ordre :
  1. Adoration : contempler qui Dieu est, a partir du texte du jour
  2. Pardon : confession sincere, sans culpabilisation, en lien avec ce que
     les lectures revelent du coeur humain
  3. Remerciement : gratitude concrete, ancree dans la vie reelle du lecteur
  4. Protection : intercession, remise entre les mains de Dieu de ce qui
     inquiete, protection pour soi et pour ceux qu'on aime
  5. Communion : silence, ecoute, ouverture a la presence et a la conduite
     de l'Esprit Saint
  Pour chaque moment :
    - theme : le nom exact du moment (Adoration, Pardon, Remerciement,
      Protection ou Communion)
    - prayer : la priere elle-meme, ecrite a la premiere personne, tutoiement
      de Dieu, huit a douze lignes, du souffle et du rythme, jamais recitee
      de facon mecanique, ancree dans le texte et le theme du jour precis
    - tip : deux ou trois lignes tres concretes pour relier ce moment de
      priere a la lecture du jour (un mot, une scene, un verset a reprendre)
    - word : un mot hebreu ou arameen authentique, choisi pour sa force
      spirituelle et sa pertinence avec le moment (transliteration simple,
      par exemple Kadosh, Chesed, Todah, Machseh, Shalom, Ruach, Abba,
      Maranatha, Selah)
    - word_lang : "hebreu" ou "arameen"
    - word_meaning : trois a quatre lignes qui expliquent le mot, ce qu'il
      revele de la grandeur ou de la proximite de Dieu, et comment le
      ressentir en le priant, pas juste une definition de dictionnaire
  Exception explicite a la regle VOICE de "une etymologie au maximum par
  jour" : elle ne s'applique pas a cette section. Ici, cinq mots differents,
  un par moment, jamais deux fois le meme mot dans la semaine.
- spirit_invitation : la cloture du temps de priere, six a dix lignes, une
  invitation directe et sobre a etre rempli et conduit par le Saint-Esprit
  (on peut s'appuyer sur Ephesiens 5.18, Romains 8, Galates 5, Actes 1.8 selon
  ce qui convient), qui se termine par un "amen" habite, pas expedie.

COHERENCE DE LA SEMAINE
Les journees se suivent. Evite de repeter la meme image ou la meme etymologie
d'un jour a l'autre. Si un theme revient, aborde-le par un autre angle. Cela
s'applique aussi aux mots hebreu et arameen des prieres : aucune repetition
d'un mot sur la semaine.

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
