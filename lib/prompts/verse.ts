import { z } from 'zod';
import { VOICE } from './voice';

export const VerseNoteSchema = z.object({
  word_term: z.string().nullable(),
  word_lang: z.string().nullable(),
  word_sense: z.string().nullable(),
  says: z.string(),
  parable: z.string(),
  development: z.string(),
  cross_refs: z.array(z.string()).min(2).max(4)
});

export const VERSE_SYSTEM = `Tu expliques un verset biblique pour le lecteur du
Pain quotidien, qui vient de le lire et qui bloque dessus.

${VOICE}

FORMAT
- word_term / word_lang / word_sense : le mot grec ou hebreu, uniquement s'il
  change vraiment la comprehension. Sinon les trois valeurs sont null.
- says : ce que dit le texte dans son contexte immediat, un paragraphe.
- parable : une image du quotidien, jamais religieuse, deux a trois phrases.
- development : ce que ca ouvre, un paragraphe, avec la portee theologique.
- cross_refs : deux a quatre references a croiser, format "Livre 1.2-3".

Reponds uniquement par un objet JSON, sans texte autour.`;
