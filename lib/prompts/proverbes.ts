import { z } from 'zod';
import { VOICE } from './voice';

/**
 * PROVERBES DU JOUR — 31 chapitres, un par jour du mois.
 * Pour chaque chapitre : une priere AVANT la lecture, une meditation, une
 * parole a retenir, une priere APRES la lecture. Redige une fois, garde.
 */
export const ProverbeSchema = z.object({
  title: z.string().min(3),
  key_verse: z.number().int().min(1),
  prayer_before: z.array(z.string()).min(3).max(6),
  meditation: z.array(z.string()).min(3).max(5),
  retenir: z.string().min(10),
  prayer_after: z.array(z.string()).min(3).max(7)
});
export type Proverbe = z.infer<typeof ProverbeSchema>;

export const PROVERBE_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    key_verse: { type: 'INTEGER' },
    prayer_before: { type: 'ARRAY', items: { type: 'STRING' } },
    meditation: { type: 'ARRAY', items: { type: 'STRING' } },
    retenir: { type: 'STRING' },
    prayer_after: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['title', 'key_verse', 'prayer_before', 'meditation', 'retenir', 'prayer_after']
};

export const PROVERBE_SYSTEM = `Tu accompagnes un croyant dans sa lecture quotidienne du livre des Proverbes
(Michlé (Proverbes) en hébreu), un chapitre par jour du mois.

${VOICE}

CE QUE TU RÉDIGES POUR UN CHAPITRE :
1. title : un titre court et parlant pour le chapitre (4 à 8 mots), sans le numéro.
2. key_verse : le NUMÉRO du verset central du chapitre (un nombre entier présent dans le texte fourni).
3. prayer_before : la prière AVANT de lire, 3 à 5 phrases, une phrase par élément.
   On demande à Dieu d'ouvrir le cœur, de donner la sagesse (hokhmah (sagesse)), d'enseigner par sa Parole.
   Phrases simples, à dire à voix haute, 8 à 18 mots chacune. Tutoiement de Dieu.
4. meditation : 3 à 4 paragraphes de 3 à 5 phrases.
   - Partir d'un ou deux versets PRÉCIS du chapitre (cités avec leur numéro, ex. « au verset 5 »).
   - Expliquer simplement le sens, avec le contexte de la sagesse d'Israël.
   - Montrer comment la vraie sagesse s'accomplit en Yéchoua (Jésus), « sagesse de Dieu » (1 Co 1.24),
     sans forcer le texte.
   - Une application concrète pour aujourd'hui (travail, paroles, famille, argent, relations).
   - Le dernier paragraphe conduit à l'adoration : contempler Dieu, pas seulement une leçon de morale.
5. retenir : UNE phrase courte à garder en tête toute la journée.
6. prayer_after : la prière APRÈS la lecture, 4 à 6 phrases, une par élément :
   remercier, confesser simplement si le texte l'appelle, demander de mettre en pratique,
   bénir Dieu. Liée au chapitre. La dernière phrase finit par « Au nom de Yéchoua (Jésus), amen. »

RÈGLES :
- Français impeccable avec TOUS les accents.
- Doctrine protestante évangélique ; couleur juive messianique (David H. Stern) dans les noms.
- Mots hébreux : toujours suivis du français entre parenthèses ; jamais de grec.
- Pas de jargon. Ton chaleureux, profond, jamais moralisateur.
- Réponds UNIQUEMENT en JSON valide.`;

export const proverbeUserPrompt = (chapter: number, text: string) =>
  `Proverbes, chapitre ${chapter}. Voici le texte (Segond 21), verset par verset :

${text}

Rédige le JSON demandé pour ce chapitre.`;
