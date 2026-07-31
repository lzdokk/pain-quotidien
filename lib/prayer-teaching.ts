/**
 * ENSEIGNEMENT SUR LA PRIÈRE
 *
 * Contenu stable, affiché sur l'onglet Prière au-dessus des prières du jour.
 * La trame théologique (les trois axes, le Notre Père comme matrice, la
 * distinction chronos / kairos) suit la synthèse des enseignements du site
 * theonoptie.org, reformulée ici. La source est citée sur la page.
 */

export type Bloc = { titre: string; corps: string[]; verset?: string; ref?: string };

/** Pourquoi prier. */
export const POURQUOI: Bloc[] = [
  {
    titre: 'La prière est la respiration de la vie spirituelle',
    corps: [
      "La prière est à l'esprit ce que le mouvement est au corps et le souffle à la poitrine : elle est la manifestation de la vie. Un corps qui ne bouge plus est mort, une poitrine sans souffle est inanimée, un esprit sans prière est un esprit détaché des conditions mêmes de son existence.",
      "Prier n'est donc pas une activité parmi d'autres, à caser entre deux obligations. C'est respirer."
    ]
  },
  {
    titre: "La puissance cachée derrière l'armure",
    corps: [
      "Dans Éphésiens 6, la prière n'est pas nommée comme une pièce de l'armure. Ni ceinture, ni cuirasse, ni bouclier. Elle est autre chose : la force qui rend l'armure opérante. Il ne suffit pas de connaître l'ennemi ni de porter le bon équipement, il faut la force de s'en servir.",
      "Le mot traduit par persévérance, proskartérèsis, dit un attachement fort et constant. Il dérive de kratos, la force souveraine. Prier, c'est rester attaché à Dieu avant, pendant et après le combat."
    ],
    verset: "Faites en tout temps par l'Esprit toutes sortes de prières et de supplications. Veillez à cela avec une entière persévérance, et priez pour tous les saints.",
    ref: 'Éphésiens 6.18'
  },
  {
    titre: "La prière n'est pas la préparation de l'œuvre, elle est l'œuvre",
    corps: [
      "Nous croyons volontiers que la prière nous rend aptes à de plus grandes choses. C'est l'inverse : elle est déjà la plus grande chose. Pour l'homme naturel, prier n'est pas rentable, cela ressemble à du temps perdu. Mais la clé n'est pas entre nos mains, elle est entre celles de Dieu, et la réponse s'appelle la prière.",
      "Trois convictions la portent. Elle est confiante : elle est le canal par lequel les réalités du Royaume deviennent effectives dans notre expérience. Elle est soumission : elle ne change pas la volonté de Dieu, elle l'invoque et s'y remet. Elle est l'œuvre de l'Esprit en nous : le cri Abba, Père n'est pas d'abord notre initiative, il est le signe de la rédemption à l'œuvre, fondée sur l'agonie du Rédempteur et non sur la nôtre."
    ],
    verset: "Parce que vous êtes fils, Dieu a envoyé dans nos cœurs l'Esprit de son Fils, lequel crie : Abba ! Père !",
    ref: 'Galates 4.6'
  }
];

/** Comment prier. */
export const COMMENT: Bloc[] = [
  {
    titre: 'Ni récitation, ni performance, ni formule',
    corps: [
      "Quand Jésus dit voici comment vous devez prier, le verbe grec proseuchomai est à une voix qui associe deux acteurs : il y a une action conjointe de l'Esprit et de ma volonté. Ce n'est donc pas une récitation, ce n'est pas un effort arraché à nos propres forces, et ce n'est surtout pas une formule magique.",
      "C'est un engagement de ma volonté, assisté par l'Esprit. À moi de faire le premier pas, jamais seul, et toujours en accord avec la Parole."
    ]
  },
  {
    titre: 'Dans le secret, sans vaines paroles',
    corps: [
      "Jésus fixe les dispositions justes avant de donner le modèle. Le secret d'abord : ne pas pratiquer sa justice devant les hommes pour en être vu. L'intimité ensuite : entrer dans sa chambre, fermer la porte, prier son Père qui est là dans le lieu secret. La sobriété enfin : ne pas multiplier les paroles, car le Père sait de quoi nous avons besoin avant que nous le lui demandions.",
      "Prier n'est pas informer Dieu. C'est se tenir devant lui."
    ],
    verset: 'Quand tu pries, entre dans ta chambre, ferme ta porte, et prie ton Père qui est là dans le lieu secret.',
    ref: 'Matthieu 6.6'
  },
  {
    titre: 'En tout temps : chronos et kairos',
    corps: [
      "Le grec, comme l'hébreu, distingue deux mots pour le temps là où le français n'en a qu'un. Chronos, c'est la durée qui s'écoule, le tapis roulant des jours. Kairos, c'est l'instant précis, la parenthèse offerte par Dieu à l'intérieur de cette durée.",
      "Prier en tout temps, c'est donc les deux à la fois : accueillir chaque kairos comme un présent de Dieu, seul cas où présent et cadeau se recouvrent, et vivre dans une disposition continuelle. Des rendez-vous mis à part, et un climat qui ne s'interrompt pas."
    ]
  }
];

/** Les trois axes, cœur de la structure. */
export const AXES = [
  {
    nom: 'Adoration',
    grec: 'timaó',
    grec_sens: 'estimer, tenir en honneur',
    objet: "pour ce qu'Il EST",
    texte: "Adorer, c'est proclamer la valeur de Dieu pour ce qu'il est en lui-même, sa nature, son essence. On ne demande rien quant à la nature de Dieu : on la contemple et on l'honore.",
    verset: "Ce peuple m'honore des lèvres, mais son cœur est éloigné de moi.",
    ref: 'Matthieu 15.8'
  },
  {
    nom: 'Louange',
    grec: 'humneó',
    grec_sens: 'célébrer les œuvres',
    objet: "pour ce qu'Il FAIT",
    texte: "Louer, c'est remercier Dieu pour ses actions, hier, aujourd'hui et demain. Quand Paul et Silas louent Dieu en prison, le verbe est à l'imparfait : une louange qui dure, qui tient dans la nuit.",
    verset: 'Vers le milieu de la nuit, Paul et Silas priaient et chantaient les louanges de Dieu.',
    ref: 'Actes 16.25'
  },
  {
    nom: 'Intercession',
    grec: 'entugchanó',
    grec_sens: "supplier en faveur d'autrui",
    objet: "pour ce qu'Il PEUT FAIRE pour les autres",
    texte: "Intercéder, c'est supplier pour quelqu'un d'autre, et jamais seul : on se joint à une double intercession, celle de l'Esprit qui intercède par des soupirs inexprimables, et celle de Christ à la droite de Dieu. L'intercession demande une action, elle porte donc sur ce que Dieu peut faire, jamais sur ce qu'il est.",
    verset: "L'Esprit lui-même intercède par des soupirs inexprimables.",
    ref: 'Romains 8.26'
  }
];

export const AXES_NOTE = [
  "Ces trois axes ne sont pas de simples pièces qui s'emboîteraient pour former un tout. Ils s'ajoutent l'un à l'autre en partageant une surface commune. Adoration et louange se recouvrent en partie : on s'émerveille de ce que Dieu est en voyant ce qu'il a fait. Louange et intercession aussi : on s'appuie sur ce que Dieu a déjà fait pour lui demander d'aller plus loin. Mais adoration et intercession n'ont aucune surface commune, puisqu'on ne demande rien quant à la nature de Dieu.",
  "D'où le mouvement de la prière. Quand je pose ma situation devant Dieu, la louange et l'adoration l'inondent de réalité spirituelle et lui rendent sa vraie grandeur. Alors seulement je peux intercéder. L'adoration et la louange sont les deux axes qui conduisent à la victoire."
];

/** Le Notre Père, prière-modèle. */
export const NOTRE_PERE_INTRO = [
  "Jésus ne dit pas voici quoi réciter, mais voici comment prier. Le mot grec houto signifie de quelle manière. Le Notre Père est une matrice, un patron, pas une formule à débiter.",
  "Il s'enracine dans la prière juive quotidienne : le qaddich, centré sur la sanctification du Nom, et la tephilah, la prière vertébrale dite trois fois par jour, matin, midi et soir, dont les dix-huit bénédictions recouvrent l'ensemble du Notre Père. Jésus en reprend la trame et l'accomplit.",
  "Il commence par Notre : ni individualisme, ni égocentrisme, la prière est d'emblée communautaire. Et il ose ce que l'Ancienne Alliance n'osait pas : Dieu y est appelé Abba, papa, et non plus seulement abinou, notre Père. Par l'œuvre du Fils nous ne sommes plus serviteurs mais enfants."
];

export const NOTRE_PERE_DEMANDES = [
  ['Que ton nom soit sanctifié', 'La gloire et la sanctification du Nom divin'],
  ['Que ton règne vienne', 'La venue du Règne de Dieu'],
  ['Que ta volonté soit faite', 'La soumission à la volonté du Père, sur la terre comme au ciel'],
  ['Donne-nous notre pain quotidien', 'La dépendance confiante pour le besoin du jour'],
  ['Pardonne-nous comme nous pardonnons', 'Le pardon reçu, lié au pardon accordé'],
  ['Ne nous induis pas, délivre-nous du malin', "La préservation et la délivrance dans l'épreuve"],
  ['À toi le règne, la puissance, la gloire', 'La doxologie : tout revient à Dieu'],
  ['Amen', "L'adhésion de la foi à ce qui vient d'être dit"]
];

/** Les autres registres de la prière. */
export const THEMES: Bloc[] = [
  {
    titre: 'La supplication',
    corps: [
      "Faire connaître ses besoins à Dieu n'est pas de l'inquiétude déguisée. C'est une remise confiante, toujours accompagnée d'actions de grâces."
    ],
    verset: 'Ne vous inquiétez de rien, mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.',
    ref: 'Philippiens 4.6'
  },
  {
    titre: 'La confession',
    corps: [
      "Où, à qui, pourquoi, comment. Le modèle en est la prière pénitentielle du Psaume 51, qui ne s'arrête pas au constat de la faute mais demande une création nouvelle."
    ],
    verset: 'Ô Dieu, crée en moi un cœur pur, et renouvelle en moi un esprit bien disposé.',
    ref: 'Psaume 51.12'
  },
  {
    titre: "L'intercession avec larmes",
    corps: [
      "Intercéder peut aussi vouloir dire pleurer devant Dieu pour les autres. Jésus pleura : la compassion qui se fait prière."
    ]
  },
  {
    titre: 'La prière de victoire et le jeûne',
    corps: [
      "Certains combats appellent une prière plus résolue, où le corps lui-même entre dans la dépendance à Dieu."
    ]
  },
  {
    titre: 'Prier pour tous les saints',
    corps: [
      "Même la plus personnelle des prières ne s'enferme jamais sur soi. Éphésiens 6.18 l'élargit à toute l'Église : priez pour tous les saints."
    ]
  }
];

export const SOURCE_NOTE =
  "Trame théologique de cette page : synthèse des enseignements du site theonoptie.org, principalement l'étude L'armure du chrétien, la prière (Éphésiens 6.18) et la série sur le Notre Père (Matthieu 6). Textes bibliques cités d'après la Bible Segond 1910, domaine public.";
