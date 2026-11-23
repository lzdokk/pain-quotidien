/**
 * FICHES CHAPITRES : ajoutées peu à peu, au rythme de l'étude de Mickaël.
 * Clé = « livre-chapitre » (45-1 = Romains 1). Sans fiche, la page affiche
 * quand même les questions de méditation et le carnet.
 */
export type FicheChapitre = {
  resume: string;
  blocs: Array<[string, string]>;       // [versets, idée]
  observation: string[];
  interpretation: string[];
  scene: string[];
  mediter: { verset: string; question: string; action: string };
  parler: { phrase: string; question: string };
};

export const FICHES_CHAPITRES: Record<string, FicheChapitre> = {
  '45-1': {
    resume: 'Paul se présente, salue les Romains, dit son désir de les voir, pose le thème de la lettre (l’Évangile est puissance de Dieu pour sauver) et commence à montrer que l’humanité entière s’égare quand elle refuse de reconnaître Dieu.',
    blocs: [['1-15', 'Paul se présente, salue les Romains et exprime son désir de venir les voir'], ['16-17', 'Le thème de toute la lettre : l’Évangile est la puissance de Dieu pour sauver quiconque croit ; le juste vivra par la foi'], ['18-32', 'L’humanité qui ne reconnaît pas Dieu s’égare dans les idoles, et Dieu la laisse suivre son chemin']],
    observation: ['Qui parle ? Paul, serviteur et apôtre, mis à part pour l’Évangile', 'À qui ? Aux bien-aimés de Dieu à Rome, appelés à être saints (v. 7)', 'Que se passe-t-il ? Salutations, action de grâce, désir de visite, thèse de la lettre, début du diagnostic de l’humanité', 'Mots répétés : Évangile, foi, Dieu ; « Dieu les a livrés » revient trois fois (24, 26, 28)'],
    interpretation: ['Sur Dieu : il est connaissable par la création (20), puissant pour sauver, juste', 'Où est Jésus ? Fils de David et Fils de Dieu, établi dans la puissance par sa résurrection (3-4)', 'Le problème de l’humanité n’est pas le manque d’information mais le refus de reconnaître Dieu', 'Renvois : Habacuc 2:4 · Psaume 19:2-5'],
    scene: ['Comment aurais-je réagi à Rome, face à une lettre qui dit que « tous » sont concernés ?', 'Comment devrais-je réagir : ne pas avoir honte de l’Évangile (16), reconnaître Dieu, le remercier', 'D’actualité ? Oui : on remplace Dieu par l’argent, l’image, le succès. Mais Paul poursuivra au chapitre 2 : personne n’a d’excuse, pas même celui qui juge.'],
    mediter: { verset: 'Romains 1:16', question: 'De quoi ai-je honte, parfois, dans ma foi ?', action: 'Remercier Dieu aujourd’hui pour une chose créée que je tiens pour acquise' },
    parler: { phrase: 'L’Évangile n’est pas un conseil de vie : c’est la puissance de Dieu qui sauve ceux qui lui font confiance.', question: 'Qu’est-ce que tu penses que Dieu attend de nous pour être en règle avec lui ?' }
  }
};

export const ficheChapitre = (book: number, ch: number) => FICHES_CHAPITRES[`${book}-${ch}`];
