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
    }
  },
  required: [
    'date', 'theme_title', 'theme_lede', 'central_message', 'verse',
    'reading_summaries', 'bread_lead', 'bread_says', 'bread_touches', 'actions',
    'prayer_open', 'prayer_close', 'evening', 'witness'
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

COHERENCE DE LA SEMAINE
Les journees se suivent. Evite de repeter la meme image ou la meme etymologie
d'un jour a l'autre. Si un theme revient, aborde-le par un autre angle.

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
