/* ============================================================================
   CURSUS THÉOLOGIQUE, structure d'institut biblique
   Niveau Base (36 cours) · Niveau Approfondissement (5 UV) · Grec ancien
   Codes et progression calqués sur le modèle ITB.
   E = exégèse · D = doctrine · P = pratique et thèmes · G = langue
   ============================================================================ */

window.CURSUS={
niveaux:[
{
 id:'base', nom:'Niveau Base', sous:'36 cours, environ 18 mois à raison de deux cours par mois',
 intro:"On ne commence pas par la doctrine, on commence par un texte court et très concret : Jacques. Puis les Actes, pour voir l'Église en mouvement. Les cours de doctrine s'intercalent au moment où le texte les rend nécessaires, jamais avant.",
 groupes:[
  {nom:'', cours:[
   {c:'UBE01',t:'Épître de Jacques',ty:'E',p:"La foi qui se voit dans la main, pas seulement dans la bouche",h:12},
   {c:'UBE02',t:'Actes des Apôtres',ty:'E',p:"Comment onze hommes effrayés ont traversé un empire",h:20},
   {c:'UBD01',t:'Six Doctrines',ty:'D',p:"Les six fondations que l'auteur d'Hébreux considère comme le b.a.-ba",h:16},
   {c:'UBE03',t:'Évangiles de Matthieu et de Marc',ty:'E',p:"Le roi annoncé et le serviteur pressé",h:24},
   {c:'UBE04',t:'Évangile de Luc',ty:'E',p:"L'enquête d'un médecin sur les marges de la société",h:20},
   {c:'UBE05',t:'Évangile de Jean',ty:'E',p:"Sept signes, sept « Je suis », une seule intention",h:20},
   {c:'UBE06',t:'Épîtres de Jean',ty:'E',p:"Comment savoir si l'on est vraiment passé de la mort à la vie",h:12},
   {c:'UBD02',t:'L’Inspiration de la Bible',ty:'D',p:"Le vitrail et la lumière : comment Dieu parle par des hommes",h:16},
   {c:'UBE07',t:'Synopse des Évangiles',ty:'E',p:"Quatre témoins, un seul événement, et pourquoi ils diffèrent",h:16},
   {c:'UBD03',t:'Herméneutique',ty:'D',p:"La carte et le territoire : lire sans faire dire",h:20},
   {c:'UBE08',t:'Épître aux Romains',ty:'E',p:"L'exposé le plus complet de l'Évangile jamais écrit",h:24},
   {c:'UBD04',t:'Hamartiologie élémentaire',ty:'D',p:"La boussole déréglée : ce qu'est vraiment le péché",h:16},
   {c:'UBE09',t:'1ère Épître aux Corinthiens',ty:'E',p:"Une église pleine de dons et pleine de problèmes",h:20},
   {c:'UBE10',t:'2ème Épître aux Corinthiens',ty:'E',p:"Le trésor dans des vases de terre",h:16},
   {c:'UBE11',t:'Épître aux Éphésiens',ty:'E',p:"Trois chapitres de qui vous êtes, trois de comment vivre",h:16},
   {c:'UBD05',t:'L’Appel de Dieu',ty:'D',p:"La différence entre une envie, un talent et un appel",h:12},
   {c:'UBE12',t:'Épître aux Colossiens',ty:'E',p:"La suprématie du Christ contre tous les compléments",h:12},
   {c:'UBE13',t:'Épîtres de Pierre',ty:'E',p:"Tenir quand on est minoritaire et mal vu",h:16},
   {c:'UBE14',t:'Épître aux Galates',ty:'E',p:"La lettre la plus en colère du Nouveau Testament, et pourquoi",h:16},
   {c:'UBE15',t:'Épître aux Hébreux',ty:'E',p:"Mieux que les anges, mieux que Moïse, mieux que le temple",h:20},
   {c:'UBE16',t:'Épître aux Philippiens',ty:'E',p:"La joie écrite depuis une prison",h:12},
   {c:'UBD07',t:'Les ministères (Ecclésiologie)',ty:'D',p:"Le corps et ses membres : qui fait quoi dans l'Église",h:20},
   {c:'UBE17',t:'1ère Épître aux Thessaloniciens',ty:'E',p:"Une jeune église et la question du retour du Christ",h:12},
   {c:'UBE18',t:'2ème Épître aux Thessaloniciens',ty:'E',p:"Quand l'attente déraille : corriger sans décourager",h:10},
   {c:'UBE19',t:'Épître à Tite',ty:'E',p:"Organiser une église dans un contexte difficile",h:10},
   {c:'UBE20',t:'Épîtres à Timothée',ty:'E',p:"Ce qu'un ancien transmet à un jeune responsable",h:16},
   {c:'UBD06',t:'Missiologie élémentaire',ty:'D',p:"Le mendiant qui montre à un autre où trouver du pain",h:16},
   {c:'UBE21',t:'L’Apocalypse',ty:'E',p:"Un livre de consolation écrit en images, pas un code à déchiffrer",h:24},
   {c:'UBD08',t:'La Personne divine du Saint-Esprit',ty:'D',p:"Ni une force ni une influence : quelqu'un",h:16},
   {c:'UBE24',t:'Le Prophète Daniel',ty:'E',p:"Rester fidèle au sommet d'un empire païen",h:16},
   {c:'UBE22',t:'Le Prophète Ézéchiel',ty:'E',p:"Les ossements desséchés et le cœur de chair",h:20},
   {c:'UBD09',t:'Les Actions du Saint-Esprit',ty:'D',p:"Régénérer, habiter, conduire, remplir : quatre verbes distincts",h:16},
   {c:'UBE23',t:'Le Prophète Ésaïe',ty:'E',p:"Le prophète le plus cité par le Nouveau Testament",h:24},
   {c:'UBE25',t:'Le Prophète Jérémie',ty:'E',p:"Prêcher quarante ans sans voir un seul fruit",h:20},
   {c:'UBD10',t:'Charismes et Manifestations de l’Esprit',ty:'D',p:"La caisse à outils : à quoi servent les dons, et à qui",h:20},
   {c:'UBE26',t:'Les « Petits » Prophètes',ty:'E',p:"Douze livres courts, aucun n'est mineur",h:24}
  ]}
 ]
},
{
 id:'appro', nom:'Niveau Approfondissement', sous:'5 unités de valeur, Bible, Doctrine, Pratique et thèmes',
 intro:"Chaque unité de valeur combine trois axes : l'étude d'un ou plusieurs livres, un cours de doctrine systématique, et un cours pratique ou historique. On ne valide une UV qu'en ayant les trois.",
 groupes:[
  {nom:'Unité de valeur 1', cours:[
   {c:'U1B01',t:'Introduction à l’Ancien Testament (1)',ty:'E',p:"Formation, structure et fil conducteur du Pentateuque et des historiques",h:24},
   {c:'U1B02',t:'Introduction au Nouveau Testament',ty:'E',p:"Contexte, auteurs, datation, transmission des 27 livres",h:24},
   {c:'U1B03',t:'Épîtres aux Corinthiens',ty:'E',p:"Étude approfondie des deux lettres et du dossier corinthien",h:28},
   {c:'U1D01',t:'Herméneutique',ty:'D',p:"Méthode complète : genres, contexte, théologie biblique, application",h:28},
   {c:'U1P01',t:'L’Église et la vie sociale',ty:'P',p:"Sel et lumière : la place du chrétien dans la cité",h:20}]},
  {nom:'Unité de valeur 2', cours:[
   {c:'U2B01',t:'Introduction à l’Ancien Testament (2)',ty:'E',p:"Poétiques et prophétiques : lire la poésie hébraïque et l'oracle",h:24},
   {c:'U2B02',t:'Épître aux Philippiens',ty:'E',p:"Exégèse verset par verset, avec l'hymne christologique du chapitre 2",h:20},
   {c:'U2B03',t:'Synoptiques (1) : Matthieu et Marc',ty:'E',p:"Structure, théologie propre à chaque évangéliste, problème synoptique",h:28},
   {c:'U2D01',t:'Vérités Fondamentales (1)',ty:'D',p:"Théologie systématique : Bibliologie, Théologie propre, Christologie",h:32},
   {c:'U2D02',t:'Ecclésiologie',ty:'D',p:"Nature, marques, gouvernement, ordonnances et mission de l'Église",h:24},
   {c:'U2P01',t:'Histoire de l’Église',ty:'P',p:"Des Pères à aujourd'hui : conciles, schismes, Réforme, réveils",h:28}]},
  {nom:'Unité de valeur 3', cours:[
   {c:'U3B01',t:'Synoptiques (2) : Luc',ty:'E',p:"L'œuvre de Luc en deux tomes, et son regard sur les exclus",h:24},
   {c:'U3B02',t:'Épître à Philémon',ty:'E',p:"Vingt-cinq versets qui font sauter l'esclavage de l'intérieur",h:10},
   {c:'U3D01',t:'Vérités Fondamentales (2)',ty:'D',p:"Pneumatologie, Anthropologie, Sotériologie, Eschatologie",h:32},
   {c:'U3D02',t:'Missiologie du Nouveau Testament',ty:'D',p:"Le modèle apostolique, contextualisation, implantation d'Églises",h:24},
   {c:'U3D03',t:'Bibliologie',ty:'D',p:"Révélation, inspiration, inerrance, canon, transmission, traduction",h:24},
   {c:'U3P02',t:'Institutions et œuvres officielles',ty:'P',p:"Fonctionnement, gouvernance et cadre associatif d'une union d'Églises",h:14}]},
  {nom:'Unité de valeur 4', cours:[
   {c:'U4B01',t:'Épître aux Colossiens',ty:'E',p:"Exégèse et polémique contre les philosophies syncrétistes",h:20},
   {c:'U4B02',t:'Actes des Apôtres',ty:'E',p:"Étude approfondie : les discours, la géographie, la théologie de Luc",h:28},
   {c:'U4B03',t:'Prophètes de l’Ancien Testament',ty:'E',p:"Le phénomène prophétique, critères d'authenticité, herméneutique",h:28},
   {c:'U4D01',t:'Sotériologie',ty:'D',p:"Élection, expiation, justification, sanctification, persévérance",h:28},
   {c:'U4P01',t:'Histoire d’Israël',ty:'P',p:"D'Abraham à Bar Kokhba : le cadre historique de toute la Bible",h:24},
   {c:'U4P03',t:'Évangélisation',ty:'P',p:"Théologie et pratique de l'annonce, apologétique de terrain",h:20}]},
  {nom:'Unité de valeur 5', cours:[
   {c:'U5B01',t:'Évangile de Jean',ty:'E',p:"Exégèse approfondie, structure des signes et discours d'adieu",h:28},
   {c:'U5B02',t:'Épîtres Pastorales',ty:'E',p:"1 et 2 Timothée, Tite : former, ordonner, garder le dépôt",h:24},
   {c:'U5B03',t:'Épître aux Éphésiens',ty:'E',p:"Le mystère de l'Église, exégèse et théologie",h:24},
   {c:'U5B04',t:'Épîtres Générales',ty:'E',p:"Jacques, Pierre, Jean, Jude : la catholicité du témoignage",h:24},
   {c:'U5B05',t:'Daniel',ty:'E',p:"Apocalyptique, prophétie et interprétations comparées",h:24},
   {c:'U5D01',t:'Pneumatologie',ty:'D',p:"Personne, œuvre et dons de l'Esprit, débats contemporains",h:28},
   {c:'U5P01',t:'Musicologie',ty:'P',p:"Théologie du chant, direction de louange, patrimoine et répertoire",h:20}]}
 ]
},
{
 id:'grec', nom:'Étude du Grec Ancien', sous:'3 modules, du koinè de base à la lecture suivie',
 intro:"Lire le Nouveau Testament dans sa langue change la manière de prêcher. Trois modules progressifs, sans prérequis.",
 groupes:[
  {nom:'', cours:[
   {c:'UGC01',t:'Initiation',ty:'G',p:"Alphabet, accentuation, présent, cas et déclinaisons : les fondations",h:40},
   {c:'UGC02',t:'Familiarisation',ty:'G',p:"Aoriste, parfait, participes, subjonctif : lire un verset sans outil",h:40},
   {c:'UGC03',t:'Perfectionnement',ty:'G',p:"Syntaxe avancée, critique textuelle, lecture suivie d'une épître",h:40}]}
 ]
}
]};

/* Cours entièrement rédigés dans ce prototype */
window.LECONS={
'UBE01':{
 titre:"Épître de Jacques",
 objectifs:["Situer Jacques dans le judéo-christianisme du premier siècle","Dégager la structure réelle d'un texte qui paraît décousu","Articuler correctement Jacques 2 et Éphésiens 2","Identifier cinq applications directes dans la vie de l'assemblée"],
 parabole:"Un homme achète un abonnement de salle de sport. Il a la carte, il connaît les machines, il parle de musculation avec compétence. Au bout d'un an, personne ne voit de différence, parce qu'il n'est jamais entré. Sa carte n'est pas fausse. Elle n'a simplement jamais servi à rien.",
 corps:[
  {h:"Situation du livre",p:["Jacques est très probablement le demi-frère de Jésus, celui qui ne croyait pas de son vivant (Jean 7.5) et qui devient après la résurrection le responsable de l'église de Jérusalem (Actes 15). Ce détail biographique n'est pas anecdotique : personne n'a plus de raisons de connaître le contraste entre parler de Jésus et le suivre.",
   "La lettre s'adresse « aux douze tribus qui sont dans la dispersion », donc à des chrétiens d'origine juive éparpillés par la persécution. Elle est probablement le plus ancien écrit du Nouveau Testament, vers 45 à 48, avant même le concile de Jérusalem.",
   "Le genre littéraire explique l'impression de désordre : c'est de la <em>parénèse</em>, une suite d'exhortations dans la tradition sapientielle juive, proche des Proverbes. On y compte plus de cinquante impératifs en cent huit versets. Ce n'est pas un traité, c'est une prédication mise par écrit."]},
  {h:"Structure",p:["Sous l'apparent décousu, un thème unique tient tout : <strong>la foi authentique se vérifie</strong>. Cinq domaines de vérification se succèdent, et chacun revient plusieurs fois, comme des motifs musicaux.",
   "1. L'épreuve (1.2-18) : ce qui révèle. 2. La Parole (1.19-27) : entendre ou pratiquer. 3. Le favoritisme (2.1-13) : la foi face aux différences sociales. 4. Les œuvres (2.14-26) : le cœur du débat. 5. La langue (3.1-12), la sagesse (3.13-18), l'argent et la patience (4 et 5).",
   "Astuce de lecture : chaque fois que Jacques emploie « mes frères », il ouvre une nouvelle unité. Repérer ces quinze occurrences donne le plan du livre sans commentaire."]},
  {h:"Le point difficile : Jacques 2 et la justification",p:["« L'homme est justifié par les œuvres, et non par la foi seulement » (2.24). Luther a appelé cette lettre une « épître de paille ». Le conflit avec Paul est-il réel ?",
   "Non, et pour une raison de vocabulaire. Les deux hommes emploient les mêmes mots dans des sens différents. Pour Paul, <em>justifier</em> signifie déclarer juste devant Dieu ; pour Jacques, démontrer qu'on est juste devant les hommes. Pour Paul, la <em>foi</em> est la confiance qui s'attache à Christ ; pour Jacques, c'est une adhésion intellectuelle, celle que les démons possèdent aussi (2.19). Pour Paul, les <em>œuvres</em> sont les efforts de la Loi accomplis pour être sauvé ; pour Jacques, ce sont les fruits qui suivent le salut.",
   "Ils citent d'ailleurs le même exemple, Abraham, mais à deux moments différents : Paul en Genèse 15, quand Abraham croit, Jacques en Genèse 22, quand cette foi se prouve trente ans plus tard. Formule de synthèse : <strong>la foi seule sauve, mais la foi qui sauve n'est jamais seule.</strong>"]},
  {h:"Application",p:["Jacques est le livre le plus immédiatement praticable du Nouveau Testament, et le plus inconfortable. Trois tests concrets qu'il propose : la manière dont votre assemblée accueille quelqu'un de mal habillé (2.2-4), ce que vous faites de vos vingt dernières paroles (3.2-10), et si vous priez pour les malades ou seulement pour les projets (5.14-16).",
   "Un dernier point souvent négligé : Jacques 4.17 définit le péché non par ce qu'on fait de mal, mais par le bien qu'on savait faire et qu'on n'a pas fait. Cela déplace considérablement l'examen de conscience."]}],
 verset:"« Mettez en pratique la parole, et ne vous bornez pas à l’écouter, en vous trompant vous-mêmes par de faux raisonnements. »",
 vref:"Jacques 1.22 · Segond",
 lectures:["Jacques 1 à 5, deux fois, dont une d’une traite","Genèse 15 et 22","Romains 4 et Éphésiens 2.8-10"],
 travail:"Rédiger deux pages sur l’articulation entre Jacques 2.24 et Éphésiens 2.8-9, en définissant précisément les trois termes foi, œuvres et justification chez chaque auteur."},

'UBD01':{
 titre:"Six Doctrines",
 objectifs:["Identifier les six fondements listés en Hébreux 6.1-2","Distinguer ce qui est fondement et ce qui est construction","Savoir exposer chacun des six points en cinq minutes","Repérer les déséquilibres doctrinaux courants"],
 parabole:"Un maçon montre à un apprenti les fondations d'une maison presque achevée. L'apprenti trouve cela sans intérêt : c'est enterré, ce n'est pas beau, on ne le verra jamais. Le maçon lui répond que c'est exactement le but. Une fondation ne se remarque que le jour où elle manque, et ce jour-là il est trop tard.",
 corps:[
  {h:"Le texte de base",p:["Hébreux 6.1-2 énumère ce que l'auteur appelle « les premiers principes de la parole de Christ », littéralement le commencement de la doctrine. Il en donne six, groupés deux par deux : la repentance et la foi, les baptêmes et l'imposition des mains, la résurrection des morts et le jugement éternel.",
   "Détail décisif du contexte : l'auteur ne dit pas de s'y attarder, il dit de « tendre à ce qui est parfait », c'est-à-dire de dépasser ce stade. Ces six points ne sont pas le programme d'une vie chrétienne, ils en sont la condition d'entrée. Une église qui les réenseigne indéfiniment est une église qui n'a jamais quitté le chantier des fondations."]},
  {h:"1 et 2 : la repentance et la foi",p:["La <em>repentance</em> (metanoia) n'est pas le remords, qui regarde en arrière et paralyse ; c'est un changement de direction. Paul distingue nettement les deux en 2 Corinthiens 7.10 : la tristesse selon Dieu produit la repentance, la tristesse du monde produit la mort.",
   "La <em>foi en Dieu</em> (pistis) est le mouvement complémentaire : on se détourne de quelque chose pour se tourner vers quelqu'un. Les deux sont indissociables, c'est le même demi-tour vu de dos et de face. Une repentance sans foi produit du légalisme, une foi sans repentance produit une religion de confort."]},
  {h:"3 et 4 : les baptêmes et l’imposition des mains",p:["Le pluriel « baptêmes » surprend et il est intentionnel. Le Nouveau Testament en connaît plusieurs : celui de Jean, de repentance ; celui d'eau, au nom de Jésus-Christ ; celui du Saint-Esprit ; et le baptême en un seul corps de 1 Corinthiens 12.13. Les traditions divergent sur leur articulation, et il faut savoir présenter honnêtement les positions.",
   "L'<em>imposition des mains</em> apparaît pour la bénédiction, la guérison, la réception de l'Esprit et la reconnaissance d'un ministère. Elle ne confère rien magiquement : elle exprime publiquement une association et une transmission. 1 Timothée 5.22 met d'ailleurs en garde contre la précipitation en la matière."]},
  {h:"5 et 6 : la résurrection et le jugement",p:["La <em>résurrection des morts</em> concerne le corps, non l'âme seule. C'est le point de rupture avec le platonisme, et c'est ce qui rendait Paul risible à Athènes (Actes 17.32). L'espérance chrétienne n'est pas de s'échapper du corps mais d'en recevoir un nouveau (1 Corinthiens 15.42-44).",
   "Le <em>jugement éternel</em> clôt la liste, et il est étonnant de le trouver dans les fondations. La raison est simple : sans horizon de jugement, ni la repentance ni la foi n'ont d'urgence. Il faut cependant l'enseigner tel que le Nouveau Testament le présente, avec gravité et sans complaisance dans la menace."]}],
 verset:"« C’est pourquoi, laissant les éléments de la parole de Christ, tendons à ce qui est parfait, sans poser de nouveau le fondement... »",
 vref:"Hébreux 6.1 · Segond",
 lectures:["Hébreux 5.11 à 6.12","Actes 2.36-42 et 19.1-7","1 Corinthiens 15.12-58"],
 travail:"Préparer un exposé de cinq minutes sur chacun des six points, à destination d’une personne qui vient de croire, sans employer un seul mot de vocabulaire religieux non expliqué."},

'UBD03':{
 titre:"Herméneutique",
 objectifs:["Distinguer exégèse, herméneutique et homilétique","Appliquer la règle du contexte à trois niveaux","Identifier le genre littéraire et ses règles propres","Passer du sens d'origine à l'application sans le trahir"],
 parabole:"Un randonneur trouve une carte au fond d'un refuge. Elle est exacte, détaillée, magnifique. Il l'utilise pendant deux heures avant de comprendre qu'elle représente une autre vallée. Le problème n'était pas la carte, ni sa bonne volonté. Il n'avait pas vérifié de quoi elle parlait avant de s'en servir.",
 corps:[
  {h:"Trois mots à ne pas confondre",p:["L'<em>exégèse</em> demande : que disait ce texte à ses premiers destinataires ? L'<em>herméneutique</em> demande : selon quelles règles passe-t-on de ce sens-là à aujourd'hui ? L'<em>homilétique</em> demande : comment le communiquer ? Sauter la première étape est l'erreur la plus fréquente, et la plus coûteuse.",
   "Le principe directeur est celui de la Réforme : l'Écriture s'interprète par l'Écriture, et son sens est en principe accessible à tout croyant sérieux, ce qu'on appelle la clarté ou perspicuité. Cela n'exclut pas le travail, cela exclut le monopole."]},
  {h:"La règle du contexte, à trois niveaux",p:["<strong>Contexte immédiat</strong> : les versets qui précèdent et qui suivent. Philippiens 4.13, « je puis tout par celui qui me fortifie », ne parle pas de réussite mais de savoir vivre dans l'abondance comme dans la privation, ce que dit le verset 12.",
   "<strong>Contexte du livre</strong> : le propos d'ensemble et le destinataire. Jérémie 29.11 est adressé à des déportés à qui Dieu vient d'annoncer soixante-dix ans d'exil. Ce n'est pas une promesse de confort rapide.",
   "<strong>Contexte canonique</strong> : la place dans l'histoire du salut. Une prescription du Lévitique ne s'applique pas telle quelle après la croix, et Hébreux explique précisément pourquoi."]},
  {h:"Le genre littéraire",p:["Chaque genre a ses règles. Le <em>récit</em> décrit ce qui s'est passé, il ne prescrit pas nécessairement : Jacob a eu quatre femmes, ce n'est pas un modèle. La <em>poésie</em> use d'hyperboles et de parallélismes, et prendre un psaume au pied de la lettre produit des contresens.",
   "La <em>prophétie</em> a souvent un accomplissement immédiat et un accomplissement ultérieur. La <em>parabole</em> vise un point principal, et vouloir allégoriser chaque détail est la faute classique. L'<em>apocalyptique</em> parle par images codées à des lecteurs persécutés : l'Apocalypse est un livre de consolation, pas un calendrier.",
   "L'<em>épître</em> est une lettre de circonstance, ce qui oblige à reconstituer la situation à laquelle elle répond avant d'en tirer une règle universelle."]},
  {h:"Du sens à l’application",p:["La méthode la plus sûre tient en trois questions. Que disait le texte à eux ? Quel principe intemporel s'en dégage ? À quoi cela correspond-il chez nous ?",
   "Le passage direct de la première à la troisième question, en sautant le principe, est la source de la plupart des abus de la Bible. Inversement, un principe formulé de façon si générale qu'il ne coûte rien est le signe qu'on a désamorcé le texte.",
   "Deux garde-fous pratiques : ne jamais fonder une doctrine sur un seul verset, et se méfier d'une interprétation que personne n'avait vue depuis deux mille ans."]}],
 verset:"« Efforce-toi de te présenter devant Dieu comme un homme éprouvé, un ouvrier qui n’a point à rougir, qui dispense droitement la parole de la vérité. »",
 vref:"2 Timothée 2.15 · Segond",
 lectures:["2 Timothée 2.14-19","Néhémie 8.1-8","Actes 8.26-35 et 17.10-12"],
 travail:"Prendre trois versets couramment cités hors contexte (Philippiens 4.13, Jérémie 29.11, Matthieu 18.20) et rédiger pour chacun l’exégèse, le principe, puis l’application légitime."}
};
