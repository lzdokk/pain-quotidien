/**
 * ENSEIGNEMENT SUR LA PRIERE
 *
 * Contenu stable, affiche sur l'onglet Priere au-dessus des prieres du jour.
 * La trame theologique (les trois axes, le Notre Pere comme matrice, la
 * distinction chronos / kairos) suit la synthese des enseignements du site
 * theonoptie.org, reformulee ici. La source est citee sur la page.
 */

export type Bloc = { titre: string; corps: string[]; verset?: string; ref?: string };

/** Pourquoi prier. */
export const POURQUOI: Bloc[] = [
  {
    titre: 'La priere est la respiration de la vie spirituelle',
    corps: [
      "La priere est a l'esprit ce que le mouvement est au corps et le souffle a la poitrine : elle est la manifestation de la vie. Un corps qui ne bouge plus est mort, une poitrine sans souffle est inanimee, un esprit sans priere est un esprit detache des conditions memes de son existence.",
      "Prier n'est donc pas une activite parmi d'autres, a caser entre deux obligations. C'est respirer."
    ]
  },
  {
    titre: "La puissance cachee derriere l'armure",
    corps: [
      "Dans Ephesiens 6, la priere n'est pas nommee comme une piece de l'armure. Ni ceinture, ni cuirasse, ni bouclier. Elle est autre chose : la force qui rend l'armure operante. Il ne suffit pas de connaitre l'ennemi ni de porter le bon equipement, il faut la force de s'en servir.",
      "Le mot traduit par perseverance, proskarteresis, dit un attachement fort et constant. Il derive de kratos, la force souveraine. Prier, c'est rester attache a Dieu avant, pendant et apres le combat."
    ],
    verset: "Faites en tout temps par l'Esprit toutes sortes de prieres et de supplications. Veillez a cela avec une entiere perseverance, et priez pour tous les saints.",
    ref: 'Ephesiens 6.18'
  },
  {
    titre: "La priere n'est pas la preparation de l'oeuvre, elle est l'oeuvre",
    corps: [
      "Nous croyons volontiers que la priere nous rend aptes a de plus grandes choses. C'est l'inverse : elle est deja la plus grande chose. Pour l'homme naturel, prier n'est pas rentable, cela ressemble a du temps perdu. Mais la cle n'est pas entre nos mains, elle est entre celles de Dieu, et la reponse s'appelle la priere.",
      "Trois convictions la portent. Elle est confiante : elle est le canal par lequel les realites du Royaume deviennent effectives dans notre experience. Elle est soumission : elle ne change pas la volonte de Dieu, elle l'invoque et s'y remet. Elle est l'oeuvre de l'Esprit en nous : le cri Abba, Pere n'est pas d'abord notre initiative, il est le signe de la redemption a l'oeuvre, fondee sur l'agonie du Redempteur et non sur la notre."
    ],
    verset: "Parce que vous etes fils, Dieu a envoye dans nos coeurs l'Esprit de son Fils, lequel crie : Abba ! Pere !",
    ref: 'Galates 4.6'
  }
];

/** Comment prier. */
export const COMMENT: Bloc[] = [
  {
    titre: 'Ni recitation, ni performance, ni formule',
    corps: [
      "Quand Jesus dit voici comment vous devez prier, le verbe grec proseuchomai est a une voix qui associe deux acteurs : il y a une action conjointe de l'Esprit et de ma volonte. Ce n'est donc pas une recitation, ce n'est pas un effort arrache a nos propres forces, et ce n'est surtout pas une formule magique.",
      "C'est un engagement de ma volonte, assiste par l'Esprit. A moi de faire le premier pas, jamais seul, et toujours en accord avec la Parole."
    ]
  },
  {
    titre: 'Dans le secret, sans vaines paroles',
    corps: [
      "Jesus fixe les dispositions justes avant de donner le modele. Le secret d'abord : ne pas pratiquer sa justice devant les hommes pour en etre vu. L'intimite ensuite : entrer dans sa chambre, fermer la porte, prier son Pere qui est la dans le lieu secret. La sobriete enfin : ne pas multiplier les paroles, car le Pere sait de quoi nous avons besoin avant que nous le lui demandions.",
      "Prier n'est pas informer Dieu. C'est se tenir devant lui."
    ],
    verset: 'Quand tu pries, entre dans ta chambre, ferme ta porte, et prie ton Pere qui est la dans le lieu secret.',
    ref: 'Matthieu 6.6'
  },
  {
    titre: 'En tout temps : chronos et kairos',
    corps: [
      "Le grec, comme l'hebreu, distingue deux mots pour le temps la ou le francais n'en a qu'un. Chronos, c'est la duree qui s'ecoule, le tapis roulant des jours. Kairos, c'est l'instant precis, la parenthese offerte par Dieu a l'interieur de cette duree.",
      "Prier en tout temps, c'est donc les deux a la fois : accueillir chaque kairos comme un present de Dieu, seul cas ou present et cadeau se recouvrent, et vivre dans une disposition continuelle. Des rendez-vous mis a part, et un climat qui ne s'interrompt pas."
    ]
  }
];

/** Les trois axes, coeur de la structure. */
export const AXES = [
  {
    nom: 'Adoration',
    grec: 'timaó',
    grec_sens: 'estimer, tenir en honneur',
    objet: "pour ce qu'Il EST",
    texte: "Adorer, c'est proclamer la valeur de Dieu pour ce qu'il est en lui-meme, sa nature, son essence. On ne demande rien quant a la nature de Dieu : on la contemple et on l'honore.",
    verset: "Ce peuple m'honore des levres, mais son coeur est eloigne de moi.",
    ref: 'Matthieu 15.8'
  },
  {
    nom: 'Louange',
    grec: 'humneó',
    grec_sens: 'celebrer les oeuvres',
    objet: "pour ce qu'Il FAIT",
    texte: "Louer, c'est remercier Dieu pour ses actions, hier, aujourd'hui et demain. Quand Paul et Silas louent Dieu en prison, le verbe est a l'imparfait : une louange qui dure, qui tient dans la nuit.",
    verset: 'Vers le milieu de la nuit, Paul et Silas priaient et chantaient les louanges de Dieu.',
    ref: 'Actes 16.25'
  },
  {
    nom: 'Intercession',
    grec: 'entugchanó',
    grec_sens: 'supplier en faveur d\'autrui',
    objet: "pour ce qu'Il PEUT FAIRE pour les autres",
    texte: "Interceder, c'est supplier pour quelqu'un d'autre, et jamais seul : on se joint a une double intercession, celle de l'Esprit qui intercede par des soupirs inexprimables, et celle de Christ a la droite de Dieu. L'intercession demande une action, elle porte donc sur ce que Dieu peut faire, jamais sur ce qu'il est.",
    verset: "L'Esprit lui-meme intercede par des soupirs inexprimables.",
    ref: 'Romains 8.26'
  }
];

export const AXES_NOTE = [
  "Ces trois axes ne sont pas de simples pieces qui s'emboiteraient pour former un tout. Ils s'ajoutent l'un a l'autre en partageant une surface commune. Adoration et louange se recouvrent en partie : on s'emerveille de ce que Dieu est en voyant ce qu'il a fait. Louange et intercession aussi : on s'appuie sur ce que Dieu a deja fait pour lui demander d'aller plus loin. Mais adoration et intercession n'ont aucune surface commune, puisqu'on ne demande rien quant a la nature de Dieu.",
  "D'ou le mouvement de la priere. Quand je pose ma situation devant Dieu, la louange et l'adoration l'inondent de realite spirituelle et lui rendent sa vraie grandeur. Alors seulement je peux interceder. L'adoration et la louange sont les deux axes qui conduisent a la victoire."
];

/** Le Notre Pere, prière-modele. */
export const NOTRE_PERE_INTRO = [
  "Jesus ne dit pas voici quoi reciter, mais voici comment prier. Le mot grec houto signifie de quelle maniere. Le Notre Pere est une matrice, un patron, pas une formule a debiter.",
  "Il s'enracine dans la priere juive quotidienne : le qaddich, centre sur la sanctification du Nom, et la tephilah, la priere vertebrale dite trois fois par jour, matin, midi et soir, dont les dix-huit benedictions recouvrent l'ensemble du Notre Pere. Jesus en reprend la trame et l'accomplit.",
  "Il commence par Notre : ni individualisme, ni egocentrisme, la priere est d'emblee communautaire. Et il ose ce que l'Ancienne Alliance n'osait pas : Dieu y est appele Abba, papa, et non plus seulement abinou, notre Pere. Par l'oeuvre du Fils nous ne sommes plus serviteurs mais enfants."
];

export const NOTRE_PERE_DEMANDES = [
  ['Que ton nom soit sanctifie', 'La gloire et la sanctification du Nom'],
  ['Que ton regne vienne', 'La venue du Regne de Dieu'],
  ['Que ta volonte soit faite', 'La soumission au Pere, sur la terre comme au ciel'],
  ['Donne-nous notre pain quotidien', 'La dependance confiante pour le besoin du jour'],
  ['Pardonne-nous comme nous pardonnons', 'Le pardon recu, lie au pardon accorde'],
  ['Ne nous induis pas, delivre-nous du malin', "La preservation et la delivrance dans l'epreuve"],
  ['A toi le regne, la puissance, la gloire', 'La doxologie : tout revient a Dieu'],
  ['Amen', "L'adhesion de la foi a ce qui vient d'etre dit"]
];

/** Les autres registres de la priere. */
export const THEMES: Bloc[] = [
  {
    titre: 'La supplication',
    corps: [
      "Faire connaitre ses besoins a Dieu n'est pas de l'inquietude deguisee. C'est une remise confiante, toujours accompagnee d'actions de graces."
    ],
    verset: 'Ne vous inquietez de rien, mais en toute chose faites connaitre vos besoins a Dieu par des prieres et des supplications, avec des actions de graces.',
    ref: 'Philippiens 4.6'
  },
  {
    titre: 'La confession',
    corps: [
      "Ou, a qui, pourquoi, comment. Le modele en est la priere penitentielle du Psaume 51, qui ne s'arrete pas au constat de la faute mais demande une creation nouvelle."
    ],
    verset: 'O Dieu, cree en moi un coeur pur, et renouvelle en moi un esprit bien dispose.',
    ref: 'Psaume 51.12'
  },
  {
    titre: "L'intercession avec larmes",
    corps: [
      "Interceder peut aussi vouloir dire pleurer devant Dieu pour les autres. Jesus pleura : la compassion qui se fait priere."
    ]
  },
  {
    titre: 'La priere de victoire et le jeune',
    corps: [
      "Certains combats appellent une priere plus resolue, ou le corps lui-meme entre dans la dependance a Dieu."
    ]
  },
  {
    titre: 'Prier pour tous les saints',
    corps: [
      "Meme la plus personnelle des prieres ne s'enferme jamais sur soi. Ephesiens 6.18 l'elargit a toute l'Eglise : priez pour tous les saints."
    ]
  }
];

export const SOURCE_NOTE =
  "Trame theologique de cette page : synthese des enseignements du site theonoptie.org, principalement l'etude L'armure du chretien, la priere (Ephesiens 6.18) et la serie sur le Notre Pere (Matthieu 6). Textes bibliques cites d'apres la Bible Segond 1910, domaine public.";
