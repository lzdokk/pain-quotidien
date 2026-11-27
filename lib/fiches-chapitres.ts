/**
 * FICHES CHAPITRES : ajoutées peu à peu, au rythme de l'étude de Mickaël.
 * Clé = « livre-chapitre » (45-1 = Romains 1). Sans fiche, la page affiche
 * quand même les questions de méditation et le carnet.
 */
export type FicheChapitre = {
  resume: string;
  blocs: Array<[string, string]>;       // [versets, idée]
  /** Réponses aux 6 questions de Mickaël, dans l'ordre de MEDITER_QUESTIONS (lib/reading-guide.ts). */
  questions: string[];
  /** Où est Jésus ? Comment Dieu me parle ? */
  jesus: string[];
  /** Suggestions pour les 6 étapes de MEDITER_ETAPES : choisir, paraphraser, personnaliser, confesser, m'examiner, pratiquer. */
  etapes: string[];
  parler: { phrase: string; question: string };
};

export const FICHES_CHAPITRES: Record<string, FicheChapitre> = {
  '45-1': {
    resume: 'Paul se présente, salue les Romains, dit son désir de les voir, pose le thème de la lettre (l’Évangile est puissance de Dieu pour sauver) et commence à montrer que l’humanité entière s’égare quand elle refuse de reconnaître Dieu.',
    blocs: [['1-15', 'Paul se présente, salue les Romains et exprime son désir de venir les voir'], ['16-17', 'Le thème de toute la lettre : l’Évangile est la puissance de Dieu pour sauver quiconque croit ; le juste vivra par la foi'], ['18-32', 'L’humanité qui ne reconnaît pas Dieu s’égare dans les idoles, et Dieu la laisse suivre son chemin']],
    questions: [
      'Paul, serviteur de Jésus-Christ, apôtre mis à part pour l’Évangile de Dieu (v. 1).',
      'Aux croyants de Rome, juifs et non-Juifs, « bien-aimés de Dieu, appelés à être saints » (v. 7) ; et à travers eux, à tout lecteur, moi compris.',
      'Vers 56-58, depuis Corinthe, Paul écrit à une Église qu’il n’a jamais visitée, au cœur de l’empire. Il salue, remercie Dieu pour leur foi et dit son désir de les voir (1-15) ; il pose le thème de la lettre : l’Évangile est puissance de Dieu pour sauver (16-17) ; puis il montre que l’humanité entière s’égare quand elle refuse de reconnaître Dieu (18-32).',
      'Honnêtement : j’aurais sans doute applaudi la fin du chapitre en pensant à « ces gens-là », sans me reconnaître. Et j’aurais pu avoir honte de croire à un message qui paraît folie à Rome.',
      'Ne pas avoir honte de l’Évangile (16), reconnaître Dieu et le remercier au lieu de servir ce qu’il a créé (20-25), et ne pas me croire à l’abri : Paul poursuit au chapitre 2.',
      'Oui : on remplace Dieu par l’argent, l’image, le succès, et on appelle cela la liberté (23-25). Le diagnostic de Paul décrit autant nos sociétés que Rome.'
    ],
    jesus: ['Où est Jésus ? Fils de David et Fils de Dieu, établi dans la puissance par sa résurrection (3-4) : c’est de lui que parle l’Évangile.', 'Comment Dieu me parle : il se fait connaître par la création (20), il sauve par l’Évangile (16), il est juste dans son jugement (18).', 'Renvois : Habacuc 2:4 · Psaume 19:2-5'],
    etapes: [
      'Romains 1:16 (ou 1:16-17, le thème de toute la lettre).',
      'L’Évangile n’est pas une idée ni un conseil de vie : c’est la force même de Dieu qui sauve quiconque lui fait confiance. Je n’en rougis pas.',
      'Je n’ai pas honte de l’Évangile : c’est la puissance de Dieu qui me sauve, moi, parce que je lui fais confiance.',
      'À haute voix : « Je n’ai pas honte de l’Évangile de Jésus-Christ. » Puis remercier Dieu pour ce qu’il a créé et que je tiens pour acquis (20).',
      'De quoi ai-je honte, parfois, dans ma foi, et devant qui ? Qu’est-ce que je mets à la place de Dieu (argent, image, succès) ?',
      'Aujourd’hui : remercier Dieu pour une chose créée que je tiens pour acquise, et parler de ma foi sans m’excuser à une personne.'
    ],
    parler: { phrase: 'L’Évangile n’est pas un conseil de vie : c’est la puissance de Dieu qui sauve ceux qui lui font confiance.', question: 'Qu’est-ce que tu penses que Dieu attend de nous pour être en règle avec lui ?' }
  }
};

export const ficheChapitre = (book: number, ch: number) => FICHES_CHAPITRES[`${book}-${ch}`];
