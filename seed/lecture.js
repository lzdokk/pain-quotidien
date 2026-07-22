/* ============================================================================
   PARCOURS SUPPLÉMENTAIRES + EXPLICATIONS DE CHAPITRES ET DE VERSETS
   ============================================================================ */

/* Chaque parcours porte un `style` qui permet de les regrouper dans l'interface */
window.PARCOURS.forEach(function(p){
  p.style = (p.id==='integrale') ? 'integral' : 'progressif';
});

window.PARCOURS = window.PARCOURS.concat([
{
 id:'nt90', style:'integral', nom:'Nouveau Testament en 90 jours', sous:'Trois chapitres par jour', duree:90,
 pour:"Vous voulez couvrir tout le Nouveau Testament avant la fin du trimestre.",
 pourquoi:"Un rythme soutenu qui donne quelque chose que la lecture lente ne donne pas : la vue d'ensemble. On perçoit les récurrences, les insistances de chaque auteur, et la cohérence du témoignage apostolique. Environ quinze minutes par jour.",
 etapes:[
  {livre:40,nom:'Les quatre évangiles',ch:30,titre:'Matthieu, Marc, Luc, Jean',quoi:"Quatre portraits d'une même personne. Lire à la suite fait apparaître ce que chacun choisit de garder et de laisser.",cles:['Matthieu 5 à 7','Marc 8.27-38','Luc 15','Jean 17']},
  {livre:44,nom:'Actes',ch:10,titre:'L’expansion',quoi:"De Jérusalem à Rome en trente ans.",cles:['Actes 2','Actes 15','Actes 27']},
  {livre:45,nom:'Épîtres de Paul',ch:35,titre:'De Romains à Philémon',quoi:"Treize lettres, de la théologie la plus dense à la note personnelle la plus courte.",cles:['Romains 8','1 Corinthiens 13','Galates 2.20','Philippiens 2']},
  {livre:58,nom:'Hébreux et épîtres générales',ch:10,titre:'Le reste du témoignage',quoi:"Hébreux, Jacques, Pierre, Jean, Jude.",cles:['Hébreux 11','1 Pierre 2','1 Jean 4']},
  {livre:66,nom:'Apocalypse',ch:5,titre:'La fin de l’histoire',quoi:"Un livre de consolation écrit pour des persécutés, à lire comme tel.",cles:['Apocalypse 1','Apocalypse 21']}
 ]},
{
 id:'chrono', style:'integral', nom:'Chronologique en un an', sous:'La Bible dans l’ordre des événements', duree:365,
 pour:"Vous avez déjà lu la Bible et l’enchaînement historique vous échappe.",
 pourquoi:"L'ordre des livres n'est pas l'ordre des événements. Job se lit au temps des patriarches, les psaumes de David s'intercalent dans 1 et 2 Samuel, les prophètes se replacent dans les règnes qu'ils traversent. Tout devient beaucoup plus clair.",
 etapes:[
  {livre:1,nom:'Origines et patriarches',ch:60,titre:'Genèse, Job',quoi:"Job se situe probablement à l'époque d'Abraham, ce qui change complètement sa lecture.",cles:['Genèse 12','Job 1','Job 38']},
  {livre:2,nom:'Sortie d’Égypte et Loi',ch:70,titre:'Exode à Deutéronome',quoi:"La formation d'un peuple et le don de la Loi.",cles:['Exode 20','Lévitique 16','Deutéronome 6']},
  {livre:6,nom:'Conquête et royauté',ch:110,titre:'Josué à Rois, avec les Psaumes replacés',quoi:"Les psaumes de David lus au moment où il les a écrits.",cles:['1 Samuel 17','2 Samuel 11 et Psaume 51','1 Rois 18']},
  {livre:23,nom:'Prophètes dans leur règne',ch:80,titre:'Ésaïe, Jérémie, Ézéchiel, Daniel et les douze',quoi:"Chaque oracle remis dans le contexte politique qui l'a provoqué.",cles:['Ésaïe 6','Jérémie 29','Daniel 9']},
  {livre:40,nom:'Vie de Jésus en harmonie',ch:30,titre:'Les quatre évangiles fondus',quoi:"Les récits parallèles rassemblés en un seul déroulé.",cles:['Luc 2','Jean 11','Matthieu 27']},
  {livre:44,nom:'Église et lettres datées',ch:15,titre:'Actes avec les épîtres à leur place',quoi:"Les lettres de Paul insérées au moment du voyage où il les a écrites.",cles:['Actes 18 et 1 Thessaloniciens','Actes 20','Apocalypse 22']}
 ]},
{
 id:'libre', style:'libre', nom:'Lecture libre', sous:'Vous choisissez le livre, on suit votre progression', duree:0,
 pour:"Vous préférez décider vous-même, ou vous avez une étude en cours.",
 pourquoi:"Aucun ordre imposé. Ouvrez le lecteur, choisissez votre livre, et l'application enregistre où vous en êtes, vos surlignages et vos notes. Le rappel quotidien fonctionne de la même façon.",
 etapes:[
  {livre:43,nom:'Vous décidez',ch:0,titre:'Aucun ordre imposé',quoi:"Utilisez le sélecteur de livre du lecteur ci-dessous. Votre position est mémorisée.",cles:[]}
 ]}
]);

/* ─────────────── EXPLICATIONS ─────────────── */
/* Clé chapitre : "livre-chapitre" · Clé verset : "livre-chapitre-verset" */

window.EXPLIC_CH = {
'43-1':{
 titre:"Jean 1, le prologue",
 quand:"Écrit vers 85 à 95, probablement à Éphèse. Le dernier des quatre évangiles.",
 quoi:"Jean ne commence ni par une généalogie ni par une naissance, mais par l'origine du monde. Les dix-huit premiers versets forment un prologue qui ressemble à un hymne : ils annoncent d'emblée qui est Jésus, au lieu de laisser le lecteur le deviner.",
 struct:["Versets 1 à 5, la Parole avant le temps","Versets 6 à 8, le témoin Jean-Baptiste","Versets 9 à 13, l'accueil et le refus","Versets 14 à 18, la Parole devenue chair","Versets 19 à 51, quatre premiers jours et les premiers disciples"],
 cle:"Tout le prologue tient dans un contraste : celui qui a tout fait n'est pas reconnu par ce qu'il a fait. Et pourtant la porte reste ouverte à quiconque le reçoit.",
 pourquoi:"C'est le meilleur point d'entrée dans la Bible pour quelqu'un qui n'a jamais lu. Jean explique les coutumes juives à mesure, signe qu'il écrivait pour des lecteurs extérieurs, et il annonce son intention en 20.31 : que vous croyiez."
},
'44-1':{
 titre:"Actes 1, entre l’ascension et la Pentecôte",
 quand:"Écrit par Luc vers 62 à 80, second tome adressé au même Théophile que son évangile.",
 quoi:"Le chapitre fait la jointure entre ce que Jésus a commencé et ce que l'Esprit va continuer. Il tient en trois scènes : les dernières consignes, l'ascension, puis dix jours d'attente et le remplacement de Judas.",
 struct:["Versets 1 à 5, le rappel et la promesse","Versets 6 à 8, la question mal posée et la réponse","Versets 9 à 11, l'ascension","Versets 12 à 14, la prière dans la chambre haute","Versets 15 à 26, le choix de Matthias"],
 cle:"Le verset 8 donne le plan de tout le livre : Jérusalem, la Judée, la Samarie, jusqu'aux extrémités de la terre. Les vingt-huit chapitres suivent exactement cet ordre.",
 pourquoi:"Après Jean, les Actes répondent à la seule question qui vaille : et ensuite, qu'est-ce que ça a donné ? C'est le meilleur test de crédibilité disponible, parce qu'on y voit ce que les témoins sont devenus."
}
};

window.EXPLIC_V = {
'43-1-1':{
 mot:{terme:"Logos",langue:"grec",sens:"Parole, raison, principe organisateur"},
 quoi:"Jean choisit un mot que ses deux publics comprennent, mais pas de la même façon. Pour un Grec formé à la philosophie, le <em>logos</em> est le principe rationnel qui ordonne l'univers. Pour un Juif, « la parole de l'Éternel » est ce par quoi Dieu crée et agit dans la Genèse.",
 parabole:"Un traducteur cherche le mot qui parlera aux deux moitiés de la salle. Il en trouve un que chacune comprend dans sa langue, et qui les mène toutes les deux au même endroit.",
 dev:"La construction grecque de la fin du verset est précise et elle a été très discutée : <em>theos en ho logos</em>, sans article devant theos. Cela n'affaiblit pas l'affirmation, cela évite de dire que la Parole serait le Père. La Parole est pleinement Dieu, sans se confondre avec le Père. C'est déjà, en une ligne, la grammaire de la Trinité.",
 versets:["Genèse 1.3","Psaume 33.6","Colossiens 1.16-17"]
},
'43-1-14':{
 mot:{terme:"eskènôsen",langue:"grec",sens:"il a dressé sa tente, il a campé"},
 quoi:"Le verbe traduit par « il a habité parmi nous » signifie littéralement dresser sa tente. Pour un lecteur juif, l'allusion est immédiate : c'est le mot de la tente de la rencontre, la <em>shekinah</em>, la présence de Dieu qui campait au milieu du peuple dans le désert.",
 parabole:"Un roi visite un camp de réfugiés. Il pourrait s'installer à l'hôtel et venir en visite chaque matin. Il fait monter une tente identique aux autres, au milieu des autres, et il y dort.",
 dev:"Deux mots suivent, et ils ne se séparent jamais dans la Bible : <em>grâce et vérité</em>, qui traduisent l'expression hébraïque hesed we'emet, la bonté fidèle et la fiabilité. C'est la définition que Dieu donne de lui-même à Moïse en Exode 34.6. Jean dit donc que ce que Moïse avait entendu, on l'a maintenant vu marcher.",
 versets:["Exode 33.7-11","Exode 34.6","Apocalypse 21.3"]
},
'43-1-12':{
 mot:{terme:"exousia",langue:"grec",sens:"droit, autorité légitime"},
 quoi:"« Le pouvoir de devenir enfants de Dieu » ne dit pas une capacité mais un droit. Le mot est juridique : il s'agit d'un statut accordé, pas d'un potentiel à développer.",
 parabole:"Un enfant adopté ne devient pas fils en faisant ses preuves. Il l'est le jour de la signature. Ce qu'il fait ensuite découle du statut, il ne le fabrique pas.",
 dev:"Le verset suivant écarte les trois façons dont on croit d'ordinaire appartenir à Dieu : ni du sang, donc pas par l'hérédité familiale ; ni de la volonté de la chair, donc pas par le désir humain ; ni de la volonté de l'homme, donc pas par une décision institutionnelle. Il reste une seule origine, Dieu lui-même.",
 versets:["Romains 8.15-16","Galates 4.4-7","1 Jean 3.1"]
},
'44-1-8':{
 mot:{terme:"martyres",langue:"grec",sens:"témoins, d'où vient le mot martyr"},
 quoi:"Jésus ne dit pas « vous serez mes avocats » ni « mes porte-parole », mais mes témoins. Un témoin ne plaide pas et n'argumente pas : il rapporte ce qu'il a vu.",
 parabole:"À la barre, on ne demande pas au témoin d'être convaincant, ni d'avoir un avis. On lui demande ce qu'il a vu, et c'est précisément parce qu'il ne fait que cela qu'on le croit.",
 dev:"Le verset donne aussi la table des matières du livre : Jérusalem (chapitres 1 à 7), la Judée et la Samarie (8 à 12), jusqu'aux extrémités de la terre (13 à 28). Et il place la puissance avant la mission, dans cet ordre, ce qui explique les dix jours d'attente qui suivent.",
 versets:["Luc 24.48-49","Actes 2.32","Actes 4.20"]
},
'44-1-14':{
 mot:{terme:"homothumadon",langue:"grec",sens:"d'un même élan, d'un seul cœur"},
 quoi:"Le mot revient dix fois dans les Actes et presque nulle part ailleurs. Il désignait à l'origine l'accord musical, plusieurs instruments produisant une seule harmonie. Il ne signifie pas que tout le monde pense pareil, mais que tout le monde tend au même but.",
 parabole:"Un orchestre n'est pas un ensemble de gens qui jouent la même note. C'est un ensemble de gens qui jouent des notes différentes vers le même accord.",
 dev:"Le détail social est remarquable pour l'époque : le texte mentionne les femmes, puis Marie, puis les frères de Jésus, ceux-là mêmes qui ne croyaient pas en lui de son vivant selon Jean 7.5. La résurrection a manifestement réglé la question dans sa propre famille.",
 versets:["Jean 7.5","Actes 2.46","Actes 4.24"]
}
};
