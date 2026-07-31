import { z } from 'zod';
import { VOICE } from './voice';

/**
 * PARABOLES : une entree a la fois dans un theme theologique, racontee
 * comme une histoire avant d'etre expliquee. Le but affiche est de rendre
 * accessible une matiere aussi dense que celle de theonoptie.org sans que
 * le lecteur s'y perde : un point par episode, un theme a la fois, un
 * historique range pour s'y retrouver.
 *
 * L'ordre ci-dessous fixe le parcours densemble, du depart (qui est Dieu)
 * a la fin (l'esperance a venir). Chaque theme peut recevoir plusieurs
 * episodes au fil du temps ; la generation avance toujours sur le theme
 * qui a le moins d'episodes, pour que le parcours progresse par vagues
 * plutot que de s'enfermer des mois durant sur un seul sujet.
 */
export const THEMES = [
  'Qui est Dieu',
  "L'Écriture",
  "La création et l'homme",
  'Le péché et la rupture',
  "L'alliance",
  'La personne de Christ',
  "L'œuvre de la croix",
  'La résurrection',
  'Le salut par la foi',
  'Le Saint-Esprit',
  "L'Église",
  'La prière',
  "L'éthique chrétienne",
  'Les fins dernières'
] as const;

export const ParableSchema = z.object({
  title: z.string().max(120),
  hook: z.string().max(240),
  story: z.array(z.string()).min(3).max(7),
  unpacking: z.array(z.object({
    h: z.string(),
    p: z.array(z.string()).min(1).max(5)
  })).min(2).max(4),
  key_verse: z.string(),
  key_verse_ref: z.string(),
  questions: z.array(z.string()).min(2).max(4),
  refs: z.array(z.string()).min(2).max(6)
});
export type GeneratedParable = z.infer<typeof ParableSchema>;

export const PARABLE_SYSTEM = `Tu rediges un episode de "Paraboles", une serie
qui enseigne la theologie par le recit, pour un site protestant evangelique
de meditation biblique quotidienne.

${VOICE}

LE PROBLEME QUE CETTE SERIE RESOUT
Les sources theologiques serieuses (le site editorial de reference etant
theonoptie.org) contiennent une masse d'enseignements denses : etymologies,
distinctions fines, references croisees. Prises brutes, elles perdent le
lecteur qui n'a pas de formation. Le role de "Paraboles" est de reprendre
UN point theologique a la fois, de le faire sentir par une histoire avant
de l'expliquer, et de s'arreter la. Un episode, une idee. Jamais un cours
complet, jamais une liste de sous-points.

GABARIT, toujours identique
1. title : titre de l'episode, huit mots maximum, jamais le nom du theme tel
   quel (un episode sur "Qui est Dieu" ne s'appelle pas "Qui est Dieu")
2. hook : une phrase qui plante une situation concrete, contemporaine,
   reconnaissable (un embouteillage, une salle d'attente, un texto jamais
   envoye), qui va porter l'histoire
3. story : la parabole elle-meme, quatre a six paragraphes courts. Un recit,
   pas une allegorie balourde : des personnages, une tension, un
   denouement. Le lecteur doit pouvoir la lire sans savoir encore de quelle
   verite theologique elle parle.
4. unpacking : deux ou trois sections qui devoilent le lien entre l'histoire
   et LE point theologique du jour (pas plus d'un point par episode).
   Chaque section a un titre court et deux a quatre paragraphes qui
   ramenent au texte biblique, avec au besoin un mot hebreu ou grec
   eclairant (un seul, sauf si le theme l'exige vraiment).
5. key_verse et key_verse_ref : le verset qui ancre l'episode, Segond 1910
6. questions : exactement trois questions de reflexion, jamais fermees par
   oui ou non, qui aident le lecteur a se situer personnellement face a ce
   point (pas des questions de comprehension de texte, des questions qui
   font grandir)
7. refs : trois a cinq references bibliques pour aller plus loin sur ce
   theme precis, avec une courte indication de ce qu'elles apportent

Quand le point touche a un debat entre traditions chretiennes (catholique,
orthodoxe, protestante), presente honnetement en quoi consiste le debat
avant de donner la lecture protestante evangelique, sans caricaturer les
autres positions.

Reponds uniquement par un objet JSON conforme au schema, sans texte autour.`;

export function parableUserPrompt(p: {
  theme: string; episode: number; previousTitles: string[];
}) {
  return `Redige l'episode numero ${p.episode} du theme "${p.theme}".

${p.previousTitles.length
  ? `Episodes deja publies sur ce theme (ne reprends ni la meme histoire, ni le meme angle) :\n${p.previousTitles.map(t => `- ${t}`).join('\n')}`
  : "C'est le premier episode de ce theme : pose une entree en matiere simple et marquante."}

Choisis, a l'interieur de ce theme, UN aspect precis et circonscrit a
enseigner par cet episode. Renvoie uniquement l'objet JSON conforme au
schema.`;
}

/* Schema Gemini (OpenAPI), pour forcer la structure exacte de la sortie. */
const titleBody = {
  type: 'OBJECT',
  properties: { h: { type: 'STRING' }, p: { type: 'ARRAY', items: { type: 'STRING' } } },
  required: ['h', 'p']
};
export const PARABLE_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    hook: { type: 'STRING' },
    story: { type: 'ARRAY', items: { type: 'STRING' } },
    unpacking: { type: 'ARRAY', items: titleBody },
    key_verse: { type: 'STRING' },
    key_verse_ref: { type: 'STRING' },
    questions: { type: 'ARRAY', items: { type: 'STRING' } },
    refs: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['title', 'hook', 'story', 'unpacking', 'key_verse', 'key_verse_ref', 'questions', 'refs']
};
