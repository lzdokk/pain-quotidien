import { z } from 'zod';
import { VOICE } from './voice';

/**
 * VERSETS IMPORTANTS, COUVERTURE SYSTEMATIQUE (~10% de la Bible)
 *
 * Le cron parcourt la Bible chapitre par chapitre. Pour chaque chapitre, le
 * modele retient les versets reellement marquants (les plus connus, les plus
 * cites, les plus utilises dans la vie chretienne), soit environ un sur dix,
 * et produit pour chacun une fiche courte : theme, titre, eclairage. Le tout
 * alimente la table famous_verses, qui nourrit la page /versets et l'etoile
 * du lecteur. Repartis sur toute la Bible, ces choix convergent vers ~10%.
 */

// Liste fermee de themes, pour que les filtres de /versets restent lisibles.
export const FAMOUS_THEMES = [
  "L'amour de Dieu",
  'La création',
  'La confiance',
  "L'identité de Christ",
  'La force et le courage',
  'La sagesse et la conduite',
  'Le salut et la grâce',
  "L'espérance et l'éternité",
  'La prière',
  'La foi',
  'La justice et la miséricorde',
  "La paix et l'inquiétude",
  "La louange et l'adoration",
  "L'Église et la communion",
  'La Parole de Dieu',
  'Le combat spirituel',
  'La repentance et le pardon',
  "La souffrance et l'épreuve"
] as const;

export const FamousBatchSchema = z.object({
  selections: z.array(z.object({
    verse_start: z.number().int().positive(),
    verse_end: z.number().int().positive(),
    theme: z.string(),
    title: z.string().max(70),
    blurb: z.string().max(320)
  }))
});
export type FamousBatch = z.infer<typeof FamousBatchSchema>;

export const FAMOUS_SYSTEM = `Tu selectionnes, chapitre par chapitre, les
versets bibliques les plus importants pour un site protestant evangelique de
meditation quotidienne. Ces versets recevront une etoile dans le lecteur et
une fiche sur la page "Versets a connaitre".

${VOICE}

CE QUE TU CHERCHES
Les versets vraiment marquants : les plus connus, les plus cites en predication
et en louange, ceux qu'un croyant apprend par coeur, ceux qui portent une
verite centrale (l'Evangile, la grace, la foi, l'esperance, l'amour de Dieu,
la sagesse pratique). PAS les versets de transition, de genealogie, de detail
narratif ou de simple liaison.

COMBIEN
Environ un verset sur dix dans le chapitre, et seulement s'ils meritent
vraiment l'etoile. Un chapitre dense (un psaume aime, un sommet de Paul, un
discours de Jesus) peut en donner plusieurs ; un chapitre de listes, de
recensement ou de recit secondaire peut n'en donner qu'un, ou aucun. Ne force
jamais un choix pour "remplir" : mieux vaut zero qu'un verset sans relief.

POUR CHAQUE VERSET RETENU
- verse_start / verse_end : le verset, ou un tres court passage (2 a 4 versets
  maximum) quand le sens ne tient pas en un seul (ex. une beatitude, un binome).
  Le plus souvent verse_start = verse_end.
- theme : un seul, choisi STRICTEMENT dans la liste fournie, le plus juste.
- title : un titre court et parlant (quatre a six mots), jamais la reference.
- blurb : deux ou trois phrases : ce que le verset dit, pourquoi il compte,
  ce qu'il ouvre. Ancre, chaleureux, jamais scolaire ni pieux-cliche.

Reponds uniquement par un objet JSON conforme au schema, sans texte autour.
Si aucun verset du chapitre ne merite l'etoile, renvoie { "selections": [] }.`;

export function famousUserPrompt(p: {
  bookName: string; chapter: number;
  verses: { verse: number; text: string }[];
}) {
  return `Livre : ${p.bookName}
Chapitre : ${p.chapter}
Themes autorises (choisis-en un par verset, a l'identique) :
${FAMOUS_THEMES.map(t => `- ${t}`).join('\n')}

Texte du chapitre (Louis Segond 1910) :
${p.verses.map(v => `${v.verse}. ${v.text}`).join('\n')}

Retiens les versets les plus importants de ce chapitre (~10%, uniquement les
plus marquants) et renvoie uniquement l'objet JSON conforme au schema.`;
}

/* Schema Gemini (OpenAPI), pour forcer la structure exacte de la sortie. */
export const FAMOUS_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    selections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          verse_start: { type: 'INTEGER' },
          verse_end: { type: 'INTEGER' },
          theme: { type: 'STRING' },
          title: { type: 'STRING' },
          blurb: { type: 'STRING' }
        },
        required: ['verse_start', 'verse_end', 'theme', 'title', 'blurb']
      }
    }
  },
  required: ['selections']
};
