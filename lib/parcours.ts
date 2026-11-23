/**
 * PARCOURS D'ÉTUDE : quels livres méditer, et dans quel ordre.
 * Données statiques (aucune base, aucun crédit IA). Chaque étape est un texte
 * court (« Jean », « Matthieu 5-7 ») résolu vers un livre de lib/refs.ts.
 */
import { BOOKS } from './refs';

export type Groupe = 'fondations' | 'livres' | 'themes';
export type Parcours = { id: string; titre: string; pour: string; groupe: Groupe; etapes: string[]; qui?: string; mot?: string };

export const GROUPES: Array<{ id: Groupe; label: string }> = [
  { id: 'fondations', label: 'Fondations' },
  { id: 'livres', label: 'Par livres' },
  { id: 'themes', label: 'Thèmes d’actualité' }
];

const TOUS_LES_LIVRES = BOOKS.map(b => b[1]);

export const PARCOURS: Parcours[] = [
  { id: 'premiers-pas', groupe: 'fondations', titre: 'Premiers pas avec Jésus', pour: 'Pour commencer ou recommencer',
    etapes: ['Jean', '1 Jean', 'Marc', 'Actes', 'Éphésiens', 'Philippiens', 'Psaumes', 'Proverbes', 'Romains', 'Genèse'] },
  { id: 'fil-rouge', groupe: 'fondations', titre: 'Le fil rouge du salut', pour: 'Comprendre l’histoire d’ensemble',
    etapes: ['Genèse', 'Exode', 'Deutéronome', 'Josué', '1 Samuel', '2 Samuel', 'Ésaïe', 'Luc', 'Romains', 'Apocalypse'] },
  { id: 'bible-dans-lordre', groupe: 'fondations', titre: 'La Bible dans l’ordre', pour: 'Lecture continue, livre après livre',
    etapes: TOUS_LES_LIVRES },
  { id: 'connaitre-jesus', groupe: 'livres', titre: 'Connaître Jésus', pour: 'Sa vie, sa mission, sa gloire',
    etapes: ['Marc', 'Matthieu', 'Luc', 'Jean', 'Actes', 'Hébreux', 'Apocalypse'] },
  { id: 'paul', groupe: 'livres', titre: 'Paul, dans l’ordre d’écriture', pour: 'Suivre l’apôtre et sa doctrine',
    etapes: ['Galates', '1 Thessaloniciens', '2 Thessaloniciens', '1 Corinthiens', '2 Corinthiens', 'Romains', 'Colossiens', 'Philémon', 'Éphésiens', 'Philippiens', '1 Timothée', 'Tite', '2 Timothée'] },
  { id: 'priere-sagesse', groupe: 'livres', titre: 'Prière et sagesse', pour: 'Prier, souffrir, bien vivre',
    etapes: ['Psaumes', 'Proverbes', 'Job', 'Ecclésiaste', 'Lamentations', 'Cantique des cantiques', 'Jacques'] },
  { id: 'prophetes', groupe: 'livres', titre: 'Les prophètes', pour: 'La voix de Dieu à Israël',
    etapes: ['Ésaïe', 'Jérémie', 'Ézéchiel', 'Daniel', 'Osée', 'Joël', 'Amos', 'Jonas', 'Michée', 'Habacuc', 'Malachie'] },
  { id: 'loi-alliance', groupe: 'livres', titre: 'Loi et alliance', pour: 'L’Ancien Testament à la lumière du Christ',
    etapes: ['Genèse', 'Exode', 'Lévitique', 'Nombres', 'Deutéronome', 'Galates', 'Romains', 'Hébreux'] },
  { id: 'foi-quotidien', groupe: 'livres', titre: 'Foi vécue au quotidien', pour: 'Marcher avec Dieu concrètement',
    etapes: ['Matthieu 5-7', 'Jacques', '1 Pierre', 'Philippiens', 'Colossiens', 'Ruth', 'Néhémie', 'Esther'] },
  { id: 'esperance', groupe: 'livres', titre: 'Espérance et retour du Christ', pour: 'Tenir ferme dans l’attente',
    etapes: ['Daniel', 'Zacharie', 'Matthieu 24-25', '1 Thessaloniciens', '2 Thessaloniciens', '2 Pierre', 'Jude', 'Apocalypse'] },
  { id: 'couple', groupe: 'themes', titre: 'Couple et mariage', pour: 'Fonder, nourrir, réparer',
    etapes: ['Genèse 1-2', 'Proverbes 5 et 31', 'Cantique des cantiques', 'Ruth', '1 Corinthiens 7 et 13', 'Éphésiens 5', '1 Pierre 3', 'Malachie 2'] },
  { id: 'famille', groupe: 'themes', titre: 'Famille et enfants', pour: 'Transmettre la foi',
    etapes: ['Deutéronome 6', '1 Samuel 1-3', 'Psaumes 127-128', 'Proverbes 22', 'Luc 2', 'Éphésiens 6', 'Colossiens 3', '2 Timothée 1'] },
  { id: 'israel', groupe: 'themes', titre: 'Israël et l’Église', pour: 'Les promesses et le plan de Dieu',
    etapes: ['Genèse 12', 'Exode 19', 'Ésaïe 49', 'Jérémie 31', 'Ézéchiel 36-37', 'Romains 9-11', 'Éphésiens 2', 'Zacharie 12-14'] },
  { id: 'amour', groupe: 'themes', titre: 'L’amour', pour: 'Aimer comme Dieu aime',
    etapes: ['Jean 13-15', '1 Jean 3-4', '1 Corinthiens 13', 'Luc 10', 'Matthieu 5', 'Romains 12', 'Osée'] },
  { id: 'pardon', groupe: 'themes', titre: 'Pardon et réconciliation', pour: 'Recevoir et donner le pardon',
    etapes: ['Genèse 45', 'Psaumes 32', 'Psaumes 51', 'Luc 15', 'Matthieu 18', 'Éphésiens 4', 'Colossiens 3', 'Philémon'] },
  { id: 'combat', groupe: 'themes', titre: 'Combat spirituel et protection', pour: 'Tenir bon dans l’épreuve',
    etapes: ['Job 1-2', 'Luc 4', 'Psaumes 91', 'Éphésiens 6', 'Jacques 4', '1 Pierre 5', 'Apocalypse 12'] },
  { id: 'esprit', groupe: 'themes', titre: 'Le Saint-Esprit', pour: 'Sa personne, son œuvre',
    etapes: ['Jean 14-16', 'Actes 1-2', 'Romains 8', '1 Corinthiens 12-14', 'Galates 5', 'Éphésiens 5'] },
  { id: 'temoigner', groupe: 'themes', titre: 'Témoigner et évangéliser', pour: 'Parler de Jésus autour de soi',
    etapes: ['Jean 4', 'Actes 8-10', 'Actes 17', 'Romains 10', '1 Pierre 3', 'Jonas', 'Matthieu 28'] },
  { id: 'travail-argent', groupe: 'themes', titre: 'Travail, argent, intégrité', pour: 'Vivre sa foi au travail',
    etapes: ['Genèse 39', 'Proverbes', 'Ecclésiaste 5', 'Néhémie', 'Matthieu 6', 'Luc 16', 'Colossiens 3', '1 Timothée 6'] },
  { id: 'epreuve-confiance', groupe: 'themes', titre: 'Épreuve, peur, confiance', pour: 'Tenir quand tout vacille',
    etapes: ['Psaumes 23', 'Psaumes 27', 'Psaumes 46', 'Psaumes 121', 'Ésaïe 40-43', 'Habacuc', '2 Corinthiens 1 et 4', 'Philippiens 4', 'Matthieu 6:25-34'] }
];

/** Un petit mot et « Pour qui », comme pour les parcours au quotidien. */
const MOTS: Record<string, { qui: string; mot: string }> = {
  'premiers-pas': {
    qui: "Vous découvrez Jésus, ou vous voulez repartir sur des bases solides.",
    mot: "On commence par Jean, l’Évangile écrit « afin que vous croyiez ». Puis 1 Jean pour l’assurance du salut, Marc pour voir Jésus à l’œuvre, et les Actes pour la naissance de l’Église. Les lettres, les Psaumes et les Proverbes nourrissent ensuite la vie de tous les jours. Pas besoin de tout comprendre : lisez, priez, et laissez-le vous parler."
  },
  'fil-rouge': {
    qui: "Vous connaissez des passages, mais vous voulez voir comment tout s’enchaîne.",
    mot: "De la Genèse à l’Apocalypse, un seul fil traverse la Bible : Dieu qui vient sauver son peuple. Création, chute, promesse à Abraham, sortie d’Égypte, royaume de David, prophètes, puis Jésus qui accomplit tout. En dix livres, on voit le dessin d’ensemble, et chaque histoire trouve sa place."
  },
  'bible-dans-lordre': {
    qui: "Vous voulez lire toute la Bible, au moins une fois, sans rien sauter.",
    mot: "Les 66 livres, de la Genèse à l’Apocalypse, dans l’ordre de nos Bibles. Certains passages sont arides : c’est normal, tenez bon. Un chapitre par jour suffit, et l’on découvre en chemin des trésors qu’on n’aurait jamais cherchés. C’est un marathon, pas un sprint."
  },
  'connaitre-jesus': {
    qui: "Vous voulez mieux connaître la personne de Jésus, pas seulement des idées sur lui.",
    mot: "Les quatre Évangiles le montrent sous quatre angles : le serviteur en action (Marc), le roi promis (Matthieu), le sauveur des perdus (Luc), le Fils éternel (Jean). Les Actes le montrent vivant par son Esprit, Hébreux en grand prêtre, l’Apocalypse dans sa gloire. Lisez lentement : c’est une rencontre."
  },
  'paul': {
    qui: "Vous voulez comprendre la doctrine chrétienne là où elle a été écrite.",
    mot: "Les lettres de Paul dans l’ordre où il les a écrites, de Galates aux dernières lettres à Timothée. On suit un homme réel : ses voyages, ses combats, ses larmes, sa prison. La grâce, la foi, l’Église, la vie dans l’Esprit : tout prend du relief quand on sait d’où il écrit et à qui."
  },
  'priere-sagesse': {
    qui: "Vous traversez une saison où vous avez besoin de prier vrai et de vivre sagement.",
    mot: "Les Psaumes apprennent à tout dire à Dieu, même la colère et la peine. Les Proverbes éclairent les choix de chaque jour. Job et l’Ecclésiaste osent les grandes questions, les Lamentations pleurent, le Cantique célèbre l’amour, et Jacques ramène la foi dans le concret."
  },
  'prophetes': {
    qui: "Vous voulez entendre la voix de Dieu qui appelle, avertit et console.",
    mot: "Les prophètes ne prédisent pas seulement l’avenir : ils rappellent un peuple infidèle à l’alliance. On y trouve le jugement, mais aussi les plus belles promesses : le Messie, la nouvelle alliance, le cœur nouveau. Lisez-les en gardant Jésus en vue, car beaucoup de leurs paroles parlent de lui."
  },
  'loi-alliance': {
    qui: "Vous vous demandez ce que l’Ancien Testament et la Loi ont à voir avec vous aujourd’hui.",
    mot: "Les cinq livres de Moïse posent les fondations : la création, l’alliance, la Loi, le sacrifice, la présence de Dieu au milieu de son peuple. Galates, Romains et Hébreux montrent ensuite comment tout cela s’accomplit en Christ. On ne lit plus le Lévitique de la même façon après Hébreux."
  },
  'foi-quotidien': {
    qui: "Vous voulez que votre foi se voie au travail, en famille, dans les petites choses.",
    mot: "Le Sermon sur la montagne pour le cœur de Jésus, Jacques pour une foi qui agit, 1 Pierre pour tenir quand c’est dur, Philippiens pour la joie. Puis des récits de vies ordinaires et fidèles : Ruth, Néhémie, Esther. La sainteté se vit aussi un mardi matin."
  },
  'esperance': {
    qui: "Vous voulez comprendre ce que la Bible dit du retour de Jésus, sans peur ni spéculation.",
    mot: "Daniel et Zacharie annoncent le règne de Dieu, Jésus en parle lui-même (Matthieu 24-25), Paul encourage les Thessaloniciens, Pierre et Jude avertissent, et l’Apocalypse lève le voile sur la fin. Le but n’est pas de deviner des dates, mais de vivre éveillé, avec espérance."
  },
  'couple': {
    qui: "Vous êtes en couple, fiancé ou marié, et vous voulez bâtir sur Dieu.",
    mot: "Le mariage commence dans la Genèse, avant la chute : c’est une idée de Dieu. On lit la fidélité (Proverbes), la tendresse (Cantique), l’engagement (Ruth), l’amour qui supporte tout (1 Corinthiens 13), puis l’appel d’Éphésiens 5 : s’aimer comme Christ aime l’Église. À lire à deux, si possible."
  },
  'famille': {
    qui: "Vous êtes parent, grand-parent, ou vous voulez transmettre la foi à la génération suivante.",
    mot: "« Tu les inculqueras à tes enfants » (Deutéronome 6) : la foi se transmet à la maison, dans la vie de tous les jours. Anne qui prie pour Samuel, Jésus enfant au temple, les conseils de Paul aux parents et aux enfants, la foi de Timothée reçue de sa mère et de sa grand-mère. Un parcours d’encouragement plus que de culpabilité."
  },
  'israel': {
    qui: "Vous voulez comprendre la place d’Israël dans le plan de Dieu et le lien avec l’Église.",
    mot: "Dieu choisit Abraham et fait alliance avec Israël, puis promet une nouvelle alliance et un cœur nouveau. Paul, en Romains 9-11, montre que Dieu n’a pas rejeté son peuple et que les nations sont greffées sur l’olivier. Éphésiens 2 parle d’un seul peuple en Christ. Un sujet qui demande humilité et amour."
  },
  'amour': {
    qui: "Vous voulez apprendre à aimer comme Dieu aime, pas seulement en parler.",
    mot: "« Dieu est amour » (1 Jean 4). On le voit dans Jésus qui lave les pieds de ses disciples, dans le Samaritain qui s’arrête, dans 1 Corinthiens 13 qui décrit l’amour qui dure. Osée termine le parcours : l’amour fidèle de Dieu pour un peuple qui ne le méritait pas. C’est de là que tout part."
  },
  'pardon': {
    qui: "Vous portez une blessure, une rancune, ou un poids que vous n’arrivez pas à déposer.",
    mot: "Joseph pardonne à ses frères, David confesse son péché (Psaumes 32 et 51), le père court vers le fils prodigue. Jésus appelle à pardonner « soixante-dix fois sept fois », et Paul à pardonner comme Christ nous a pardonné. Le pardon n’efface pas le mal : il libère celui qui pardonne."
  },
  'combat': {
    qui: "Vous traversez une épreuve et vous sentez que le combat est aussi spirituel.",
    mot: "Job montre que l’adversaire existe, mais qu’il ne fait rien sans la permission de Dieu. Jésus résiste au diable avec la Parole (Luc 4), le Psaume 91 promet la protection, Éphésiens 6 donne l’armure. « Résistez au diable, et il fuira loin de vous » (Jacques 4) : la victoire est déjà acquise à la croix."
  },
  'esprit': {
    qui: "Vous voulez connaître le Saint-Esprit comme une personne, et vivre de sa présence.",
    mot: "Jésus promet un autre Consolateur (Jean 14-16), l’Esprit vient à la Pentecôte (Actes 2), il nous rend enfants de Dieu (Romains 8), donne des dons pour l’Église (1 Corinthiens 12-14) et produit son fruit en nous (Galates 5). Lisez en priant : « Viens, Saint-Esprit »."
  },
  'temoigner': {
    qui: "Vous voulez parler de Jésus autour de vous, simplement et sans forcer.",
    mot: "Jésus parle à une femme au puits, Philippe à un voyageur sur la route, Paul aux philosophes d’Athènes. Romains 10 rappelle que la foi vient de ce qu’on entend, et 1 Pierre 3 invite à rendre compte de l’espérance avec douceur. Même Jonas, le prophète qui fuyait, a été utilisé. Dieu peut vous utiliser aussi."
  },
  'travail-argent': {
    qui: "Vous voulez vivre votre foi au travail et avoir un rapport sain avec l’argent.",
    mot: "Joseph reste intègre chez Potiphar, les Proverbes louent le travail bien fait, l’Ecclésiaste avertit contre l’amour de l’argent, Néhémie bâtit et dirige avec droiture. Jésus appelle à chercher d’abord le royaume, et Paul à travailler « comme pour le Seigneur ». Le travail devient un lieu de culte."
  },
  'epreuve-confiance': {
    qui: "Vous traversez la peur, le deuil, la maladie ou l’incertitude, et vous avez besoin de tenir.",
    mot: "Des textes à lire lentement, peut-être à voix haute : « L’Éternel est mon berger », « Dieu est pour nous un refuge », « Ne crains rien, car je suis avec toi ». Habacuc apprend à se réjouir quand tout manque, Paul trouve la force dans la faiblesse, Jésus dit de ne pas s’inquiéter du lendemain. Vous n’êtes pas seul."
  },
};
for (const p of PARCOURS) Object.assign(p, MOTS[p.id] ?? {});

export const parcoursById = (id: string) => PARCOURS.find(p => p.id === id);

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const NOMS = BOOKS.map(([, nom], i) => ({ id: i + 1, n: norm(nom), nom }))
  .concat([{ id: 19, n: 'psaume', nom: 'Psaumes' }, { id: 22, n: 'cantique', nom: 'Cantique des cantiques' }])
  .sort((a, b) => b.n.length - a.n.length);

export type Etape = { label: string; book: number; chapter: number | null; href: string };

/** « Matthieu 5-7 » -> { book: 40, chapter: 5, href: '/lire?ref=Matthieu 5' } */
export function resoudreEtape(label: string): Etape | null {
  const n = norm(label);
  const hit = NOMS.find(b => n === b.n || n.startsWith(b.n + ' '));
  if (!hit) return null;
  const rest = n.slice(hit.n.length);
  const m = rest.match(/\d+/);
  const chapter = m ? +m[0] : null;
  const nom = BOOKS[hit.id - 1][1];
  return { label, book: hit.id, chapter, href: `/lire?ref=${encodeURIComponent(`${nom} ${chapter ?? 1}`)}` };
}

/**
 * Chapitres couverts par une étape : « Matthieu 5-7 » -> [5,6,7], « 2 Corinthiens 1 et 4 » -> [1,4],
 * « Jean » -> tous les chapitres. Liste vide si l'étape est une sélection (« Psaumes choisis »).
 */
export function chapitresEtape(label: string): { book: number; chapters: number[] } | null {
  const n = norm(label);
  const hit = NOMS.find(b => n === b.n || n.startsWith(b.n + ' '));
  if (!hit) return null;
  const total = BOOKS[hit.id - 1][2];
  const rest = n.slice(hit.n.length).replace(/[:.]\d+(?:\s*[-–]\s*\d+)?/g, '');
  if (/choisi/.test(rest)) return { book: hit.id, chapters: [] };
  const out = new Set<number>();
  for (const m of rest.matchAll(/(\d+)(?:\s*(?:-|–|a)\s*(\d+))?/g)) {
    const a = +m[1], b = m[2] ? +m[2] : a;
    for (let c = a; c <= Math.min(b, total); c++) if (c >= 1) out.add(c);
  }
  const chapters = out.size ? [...out].sort((x, y) => x - y) : Array.from({ length: total }, (_, i) => i + 1);
  return { book: hit.id, chapters };
}

/** Chapitre à lire un jour donné d'une étape de plan quotidien (répartition régulière). */
export function chapitreDuJour(step: { book: number; label: string; chapters: number; key_passages?: string[] }, jour: number): { book: number; chapter: number } {
  let info = chapitresEtape(step.label);
  let liste = info?.chapters ?? [];
  if (!info || liste.length === 0) {
    const kp = (step.key_passages ?? []).map(k => resoudreEtape(k.split(',')[0])).filter((e): e is Etape => !!e);
    if (kp.length) {
      const e = kp[Math.min(kp.length - 1, Math.floor((jour - 1) * kp.length / Math.max(1, step.chapters)))];
      return { book: e.book, chapter: e.chapter ?? 1 };
    }
    return { book: step.book, chapter: 1 };
  }
  const idx = Math.min(liste.length - 1, Math.floor((jour - 1) * liste.length / Math.max(1, step.chapters)));
  return { book: info.book, chapter: liste[idx] };
}

/** Section du plan d'un livre où se trouve un chapitre (« 5-8 : la vie nouvelle… »). */
export function sectionDuChapitre(pl: string[], c: number): string | null {
  let found: string | null = null;
  for (const it of pl) {
    let a: number, b: number, m: RegExpMatchArray | null;
    if ((m = it.match(/^(\d+):\d+\s*-\s*(\d+):\d+/))) { a = +m[1]; b = +m[2]; }
    else if ((m = it.match(/^(\d+):\d+\s*-\s*\d+/))) { a = b = +m[1]; }
    else if ((m = it.match(/^(\d+)\s*-\s*(\d+)/))) { a = +m[1]; b = +m[2]; }
    else if ((m = it.match(/^(\d+)/))) { a = b = +m[1]; }
    else continue;
    if (c >= a && c <= b) found = it;
  }
  return found;
}
