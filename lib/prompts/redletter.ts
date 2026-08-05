import { z } from 'zod';

/**
 * PAROLES DE JÉSUS (« red-letter »)
 * Pour un chapitre d'Évangile donné, on demande au modèle la liste des versets
 * qui contiennent des paroles DIRECTES de Jésus (discours direct, ce qu'il dit
 * lui-même). On surligne ensuite ces versets dans le lecteur.
 */
export const RedLetterSchema = z.object({
  verses: z.array(z.number().int().positive())
});
export type RedLetter = z.infer<typeof RedLetterSchema>;

export const REDLETTER_SYSTEM = `Tu identifies, dans un chapitre d'Évangile, les
versets qui contiennent des PAROLES DIRECTES de Jésus-Christ (ce que Jésus dit
lui-même, au discours direct — la tradition « lettres rouges »).

RÈGLES STRICTES
- Ne retiens QUE les versets où Jésus PARLE (ses propres mots, cités).
- Inclut un verset même si la parole de Jésus n'en occupe qu'une partie.
- N'inclus PAS la narration, ni les paroles d'autres personnes (disciples,
  foule, pharisiens, anges), ni les citations que d'autres font de Jésus.
- Dans les passages où Jésus enseigne longuement (sermons, paraboles qu'il
  raconte, discours), tous les versets de son discours comptent.
- Sois précis : en cas de doute, n'inclus pas.

Reponds uniquement par un objet JSON { "verses": [numeros] }, sans texte autour.
Si Jésus ne parle pas du tout dans ce chapitre, renvoie { "verses": [] }.`;

export function redLetterUserPrompt(p: {
  bookName: string; chapter: number; verses: { verse: number; text: string }[];
}) {
  return `Livre : ${p.bookName}
Chapitre : ${p.chapter}
Texte (Louis Segond 1910) :
${p.verses.map(v => `${v.verse}. ${v.text}`).join('\n')}

Renvoie la liste des numéros de versets qui contiennent des paroles directes
de Jésus, sous la forme { "verses": [...] }.`;
}

export const REDLETTER_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    verses: { type: 'ARRAY', items: { type: 'INTEGER' } }
  },
  required: ['verses']
};
