import { z } from 'zod';
import { VOICE } from './voice';

/** Fiche d'aide d'un chapitre : même forme que lib/fiches-chapitres.ts (Romains 1). */
export const ChapitreSchema = z.object({
  title: z.string(),
  dating: z.string(),
  resume: z.string(),
  blocs: z.array(z.object({ v: z.string(), idee: z.string() })).min(2).max(7),
  questions: z.array(z.string()).length(6),
  jesus: z.array(z.string()).min(2).max(3),
  etapes: z.array(z.string()).length(6),
  parler: z.object({ phrase: z.string(), question: z.string() })
});
export type ChapitreIA = z.infer<typeof ChapitreSchema>;

export const CHAPITRE_SYSTEM = `Tu rédiges la fiche d'aide d'UN chapitre de la Bible pour
le lecteur de Pain de Vie, qui va le méditer avec la méthode suivante :
d'abord six questions, puis six étapes. La fiche l'aide sans penser à sa place.

${VOICE}

FORMAT (objet JSON, rien autour)
- title : un titre court et parlant pour le chapitre (5 à 9 mots).
- dating : en une ligne, quand et où se situe le chapitre (époque, lieu, auteur
  selon la tradition évangélique ; signale un débat sans trancher).
- resume : le chapitre en bref, 2 à 4 phrases.
- blocs : le découpage, 2 à 7 blocs dans l'ordre, chacun { v: "1-15", idee: une
  phrase }. Les numéros de versets doivent couvrir tout le chapitre, sans trou.
- questions : six réponses courtes (1 à 3 phrases), DANS CET ORDRE :
  1. Qui parle ?
  2. À qui s'adresse ce passage ?
  3. Que se passe-t-il ? Quel est le contexte ?
  4. Comment aurais-je réagi dans la même situation ? (à la 1re personne, honnête)
  5. Comment devrais-je réagir ? (concret, avec les versets entre parenthèses)
  6. Ce passage est-il d'actualité ? (un lien précis avec notre époque)
- jesus : 2 ou 3 phrases : « Où est Jésus ? … » (comment le chapitre annonce, montre
  ou prépare le Messie, sans forcer le texte) ; « Comment Dieu me parle : … » ;
  et si utile « Renvois : Livre 1:2 · Livre 3:4 ».
- etapes : six suggestions, DANS CET ORDRE :
  1. Choisir : la référence du verset le plus parlant (ex. "Romains 1:16"), et
     pourquoi en quelques mots.
  2. Paraphraser : ce verset redit avec des mots simples d'aujourd'hui.
  3. Personnaliser : le même verset à la 1re personne (« je », « moi »).
  4. Confesser : une phrase courte à proclamer à haute voix.
  5. M'examiner : deux questions d'introspection.
  6. Pratiquer : une action concrète pour aujourd'hui.
- parler : { phrase: une phrase pour en parler autour de moi, question: une
  question ouverte à poser à quelqu'un }.

Références au format "Livre 1:2" ou entre parenthèses "(v. 16)". Reste fidèle au
texte fourni : n'invente ni versets ni faits.`;
