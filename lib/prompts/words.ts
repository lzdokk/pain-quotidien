import { z } from 'zod';
import { VOICE } from './voice';

/**
 * MOTS BIBLIQUES — enrichissement quotidien (hébreu, grec, araméen).
 * Le cron /api/cron/words en genere quelques-uns par jour, dans le meme esprit
 * que la base existante (Noms de Dieu, vocabulaire du croyant, grands concepts) :
 * le sens profond du mot d'origine, et son accomplissement en Christ.
 */
export const WORD_THEMES = [
  'Noms de Dieu',
  'Le Saint-Esprit',
  'Le salut et la grâce',
  'La personne de Christ',
  'Prière et louange',
  "La foi et l'alliance",
  "L'Église et la vie chrétienne",
  'Adoration',
  "La création et l'homme",
  'La sagesse et la Parole',
  'Le combat et la victoire',
  "L'espérance et les fins dernières"
] as const;

export const WordsBatchSchema = z.object({
  words: z.array(z.object({
    term: z.string(),        // écriture d'origine (hébreu/grec/araméen)
    translit: z.string(),    // translittération lisible
    lang: z.string(),        // "hébreu", "grec" ou "araméen"
    gloss: z.string().max(90),
    theme: z.string(),
    sense: z.string().max(750),
    christ: z.string().max(520),
    refs: z.array(z.string()).min(1).max(4)
  })).min(1).max(8)
});
export type WordsBatch = z.infer<typeof WordsBatchSchema>;

export const WORDS_SYSTEM = `Tu enrichis une base de mots bibliques importants
(hébreu, grec, araméen) pour un site protestant évangélique de méditation.

${VOICE}

CE QUE TU PRODUIS
Des mots ORIGINAUX authentiques de la Bible (pas des inventions), vraiment
signifiants : noms de Dieu, vocabulaire de la foi, grands concepts théologiques.
Pour chaque mot :
- term : l'écriture d'origine (caractères hébreux ou grecs corrects). Pour
  l'araméen, utilise l'écriture hébraïque.
- translit : une translittération simple et lisible (ex. "Hesed", "Agapè").
- lang : exactement "hébreu", "grec" ou "araméen".
- gloss : une traduction courte (quelques mots).
- theme : un seul, STRICTEMENT dans la liste fournie.
- sense : le sens profond, l'étymologie parlante, ce que le français ne rend
  pas — trois à cinq phrases, ancré et vivant, jamais scolaire.
- christ : comment ce mot trouve son sommet, son accomplissement en Christ
  (deux à trois phrases), avec une référence si possible.
- refs : une à quatre références bibliques (Segond, ex. "Jean 1.14").

Mélange les langues (hébreu ET grec, un peu d'araméen). Varie les thèmes.
Choisis des mots RICHES et connus qui méritent une fiche.

Reponds uniquement par un objet JSON conforme au schema, sans texte autour.`;

export function wordsUserPrompt(p: { n: number; avoid: string[] }) {
  const avoidList = p.avoid.slice(0, 400).join(', ');
  return `Propose ${p.n} nouveaux mots bibliques (hébreu/grec/araméen), variés
en langue et en thème.

Themes autorisés (un par mot, à l'identique) :
${WORD_THEMES.map(t => `- ${t}`).join('\n')}

NE PROPOSE AUCUN de ces mots déjà présents (par translittération) :
${avoidList}

Renvoie uniquement l'objet JSON conforme au schema.`;
}

/* Schema Gemini (OpenAPI). */
export const WORDS_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    words: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          term: { type: 'STRING' },
          translit: { type: 'STRING' },
          lang: { type: 'STRING' },
          gloss: { type: 'STRING' },
          theme: { type: 'STRING' },
          sense: { type: 'STRING' },
          christ: { type: 'STRING' },
          refs: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['term', 'translit', 'lang', 'gloss', 'theme', 'sense', 'christ', 'refs']
      }
    }
  },
  required: ['words']
};
