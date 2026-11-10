/**
 * BIBLE D'ÉTUDE — DEUXIÈME VAGUE (objectif : plus de 3 000 fiches)
 *
 * Modèles consultés pour le PLAN (jamais pour le texte) : les grands index
 * thématiques du domaine public — Nave's Topical Bible (1896), Torrey's New
 * Topical Textbook (1897), Easton's Bible Dictionary (1897) — et l'organisation
 * des Bibles d'étude modernes (index thématique, personnages, lieux, réalités
 * de la vie biblique, institutions, symboles, mots hébreux). Seuls des mots
 * d'entrée sont repris ; chaque fiche est rédigée pour Pain de Vie.
 */

/** Nouveaux grands sujets, à la suite de « X. Autres thèmes de A à Z ». */
export const GRANDS_SUJETS_PLUS: Array<{ id: string; title: string; groups: Array<{ title: string; themes: string[] }> }> = [
  { id: 'vie', title: 'XI. La vie au temps de la Bible', groups: [
    { title: 'Maison et vie de famille', themes: ['Tente', 'Maison', 'Toit en terrasse', 'Porte de la ville', 'Lampe à huile', 'Four et foyer', 'Puits', 'Citerne', 'Meule', 'Pain quotidien', 'Huile', 'Vin', 'Lait et miel', 'Levain', 'Repas et banquets', 'Coutumes du mariage', 'Fiançailles', 'Dot', 'Héritage', 'Droit d’aînesse et bénédiction du père', 'Esclaves et serviteurs', 'Étrangers résidents', 'Deuil et lamentations', 'Ensevelissement', 'Tombeaux', 'Embaumement', 'Lavement des pieds (coutume)', 'Salutations', 'Parfums et onguents', 'Cheveux et barbe'] },
    { title: 'Métiers', themes: ['Bergers et troupeaux', 'Pêcheurs', 'Charpentier', 'Potier', 'Forgeron', 'Tisserand', 'Tanneur', 'Faiseurs de tentes', 'Collecteurs d’impôts', 'Marchands', 'Changeurs', 'Vignerons', 'Moissonneurs', 'Laboureurs', 'Médecins', 'Soldats', 'Centurion', 'Gardiens', 'Bâtisseurs', 'Orfèvres', 'Parfumeurs', 'Musiciens', 'Chantres', 'Portiers', 'Bergers de Bethléem', 'Nourrices', 'Sages-femmes', 'Esclaves affranchis'] },
    { title: 'Vêtements et objets', themes: ['Manteau', 'Tunique', 'Ceinture', 'Sandales', 'Voile', 'Sac et cendre', 'Bâton et houlette', 'Fronde', 'Épée', 'Lance', 'Arc et flèches', 'Casque', 'Cuirasse', 'Chars de guerre', 'Sceau', 'Anneau', 'Couronne', 'Sceptre', 'Trône', 'Rouleau', 'Écriture et livres', 'Tables de pierre', 'Balances et poids', 'Mesures bibliques', 'Monnaies bibliques', 'Outres', 'Jarres', 'Coupe', 'Panier', 'Filet', 'Bateau', 'Joug', 'Charrue', 'Faucille', 'Aire de battage', 'Pressoir', 'Miroir', 'Clé', 'Pierres de fondation', 'Murailles'] },
    { title: 'Musique', themes: ['Shofar (cor de bélier)', 'Trompettes d’argent', 'Harpe et lyre', 'Cymbales', 'Tambourin', 'Flûte', 'Chant et cantiques', 'Danse'] },
    { title: 'Animaux', themes: ['Lion', 'Agneau', 'Bélier', 'Bouc', 'Colombe', 'Corbeau', 'Serpent', 'Âne', 'Chameau', 'Cheval', 'Chien', 'Porc', 'Loup', 'Ours', 'Renard', 'Cerf et biche', 'Sauterelles', 'Abeilles', 'Fourmi', 'Poissons', 'Grand poisson de Jonas', 'Léviathan', 'Béhémoth', 'Passereaux', 'Scorpion', 'Grenouilles', 'Vipère', 'Taureau', 'Génisse', 'Chèvre', 'Brebis', 'Coq', 'Poule et poussins', 'Hibou et chouette', 'Autruche', 'Gazelle', 'Mouton égaré'] },
    { title: 'Plantes et fruits', themes: ['Olivier', 'Figuier', 'Vigne', 'Palmier', 'Graine de moutarde', 'Lis des champs', 'Épines et chardons', 'Blé', 'Orge', 'Ivraie', 'Hysope', 'Myrrhe', 'Encens', 'Nard', 'Aloès', 'Sycomore', 'Acacia', 'Chêne', 'Saule', 'Roseau', 'Herbe et fleur des champs', 'Grenade', 'Amandier', 'Manne', 'Raisin', 'Figues', 'Lentilles', 'Fleurs', 'Rose de Saron', 'Arbres'] },
    { title: 'Ciel, terre et éléments', themes: ['Soleil', 'Lune', 'Étoiles', 'Pluie', 'Rosée', 'Neige', 'Vent', 'Tonnerre et éclairs', 'Tempête', 'Tremblements de terre', 'Sécheresse', 'Montagnes', 'Vallées', 'Fleuves et rivières', 'Sources', 'Mer', 'Pierre', 'Sable', 'Poussière', 'Or', 'Argent (métal)', 'Bronze', 'Fer', 'Pierres précieuses', 'Perle', 'Ivoire', 'Feu', 'Eau', 'Nuages', 'Saisons', 'Jour et nuit', 'Désert (milieu)', 'Forêt', 'Jardin'] }
  ]},
  { id: 'culte', title: 'XII. Culte, fêtes et institutions d’Israël', groups: [
    { title: 'Tabernacle et Temple', themes: ['Tabernacle', 'Parvis', 'Lieu saint', 'Lieu très saint', 'Voile du Temple', 'Chandelier d’or (Ménora)', 'Table des pains de présentation', 'Autel des parfums', 'Autel des holocaustes', 'Cuve de bronze', 'Propitiatoire', 'Chérubins', 'Éphod', 'Pectoral du grand-prêtre', 'Ourim et Toummim', 'Vêtements des prêtres', 'Encensoir', 'Temple de Salomon', 'Second Temple', 'Temple d’Hérode', 'Synagogue', 'Tente de la rencontre', 'Nuée de la présence (Chekhina)'] },
    { title: 'Offrandes et sacrifices', themes: ['Holocauste', 'Offrande de céréales', 'Sacrifice de communion', 'Sacrifice pour le péché', 'Sacrifice de réparation', 'Libation', 'Prémices', 'Dîme', 'Bouc émissaire', 'Vache rousse', 'Agneau pascal', 'Sang de l’alliance', 'Purification', 'Pur et impur', 'Lois sur la lèpre', 'Vœux', 'Naziréat', 'Consécration', 'Parfum sacré', 'Huile d’onction', 'Pain sans levain', 'Offrande volontaire'] },
    { title: 'Fêtes et temps sacrés', themes: ['Fête des Pains sans levain', 'Fête des Semaines (Chavouot)', 'Fête des Trompettes', 'Fête de la Dédicace (Hanoukka)', 'Fête de Pourim', 'Nouvelle lune', 'Calendrier biblique', 'Les sept fêtes de l’Éternel', 'Pèlerinages à Jérusalem', 'Heures de prière'] },
    { title: 'Institutions et groupes', themes: ['Lévites', 'Prêtres', 'Rois d’Israël et de Juda', 'Juges d’Israël', 'Douze tribus d’Israël', 'Pharisiens', 'Sadducéens', 'Zélotes', 'Hérodiens', 'Samaritains', 'Publicains', 'Prosélytes', 'Craignant-Dieu', 'Diaspora', 'Exil', 'Retour d’exil', 'Villes de refuge', 'Lévirat', 'Rédempteur (goël)', 'Vengeur du sang', 'Conseil des anciens', 'Écoles de prophètes', 'Nazaréens', 'Docteurs de la Loi', 'Tradition des anciens', 'Hérode et sa dynastie', 'Empire romain', 'Gouverneurs romains', 'Citoyenneté romaine'] }
  ]},
  { id: 'peuples', title: 'XIII. Peuples, tribus et nations', groups: [
    { title: 'Israël et ses tribus', themes: ['Hébreux', 'Israélites', 'Judéens', 'Tribu de Ruben', 'Tribu de Siméon', 'Tribu de Lévi', 'Tribu de Juda', 'Tribu de Dan', 'Tribu de Nephthali', 'Tribu de Gad', 'Tribu d’Aser', 'Tribu d’Issacar', 'Tribu de Zabulon', 'Tribu d’Éphraïm', 'Tribu de Manassé', 'Tribu de Benjamin', 'Royaume du Nord (Israël)', 'Royaume du Sud (Juda)', 'Reste d’Israël'] },
    { title: 'Les nations', themes: ['Cananéens', 'Amoréens', 'Hittites', 'Héviens', 'Jébusiens', 'Philistins', 'Amalécites', 'Moabites', 'Ammonites', 'Édomites', 'Madianites', 'Égyptiens', 'Assyriens', 'Babyloniens (Chaldéens)', 'Mèdes et Perses', 'Grecs', 'Romains', 'Araméens', 'Phéniciens', 'Éthiopiens (Koush)', 'Kéniens', 'Gabaonites', 'Anakim (géants)', 'Néphilim', 'Ismaélites', 'Nations païennes'] }
  ]},
  { id: 'symboles', title: 'XIV. Images et symboles', groups: [
    { title: 'Images de Dieu et du Messie', themes: ['Lumière et ténèbres', 'Eau vive', 'Pierre angulaire', 'Jésus la porte', 'Jésus le chemin', 'Vigne et sarments', 'Lion de la tribu de Juda', 'Étoile du matin', 'Soleil de justice', 'Main de Dieu', 'Bras de l’Éternel', 'Doigt de Dieu', 'À l’ombre de ses ailes', 'Forteresse', 'Tour forte', 'Refuge', 'Époux', 'Potier et argile', 'Berger d’Israël', 'Rameau', 'Racine d’Isaï'] },
    { title: 'Images du croyant et de l’Église', themes: ['Sel de la terre', 'Lumière du monde (les disciples)', 'Épouse de l’Agneau', 'Corps de Christ', 'Temple du Saint-Esprit', 'Armure de Dieu', 'Épée de l’Esprit', 'Moisson', 'Semeur', 'Talents', 'Vierges sages et folles', 'Vêtement blanc', 'Couronne de vie', 'Livre de vie', 'Sceau de l’Esprit', 'Arrhes de l’Esprit', 'Lait et nourriture solide', 'Fondement', 'Course de la foi', 'Soldat de Christ', 'Citoyenneté céleste', 'Étrangers et voyageurs', 'Pierres vivantes', 'Sacerdoce royal', 'Branches greffées', 'Bon arbre et bons fruits', 'Lampe sur le pied', 'Maison sur le roc', 'Brebis et chèvres', 'Filet de pêche (image)'] },
    { title: 'Nombres et couleurs', themes: ['Nombres dans la Bible', 'Le nombre sept', 'Le nombre douze', 'Le nombre quarante', 'Le nombre trois', 'Le nombre dix', 'Mille ans', 'Couleurs dans la Bible', 'Pourpre et écarlate', 'Blanc'] }
  ]},
  { id: 'histoire', title: 'XV. Les grands événements de la Bible', groups: [
    { title: 'Des origines à Moïse', themes: ['Déluge', 'Tour de Babel', 'Appel d’Abraham', 'Sacrifice d’Isaac', 'Échelle de Jacob', 'Lutte de Jacob avec l’ange', 'Joseph vendu par ses frères', 'Esclavage en Égypte', 'Buisson ardent', 'Les dix plaies', 'Sortie d’Égypte', 'Passage de la mer Rouge', 'Manne et cailles', 'Don de la Loi au Sinaï', 'Veau d’or', 'Serpent de bronze', 'Quarante ans au désert', 'Mort de Moïse'] },
    { title: 'De la conquête à l’exil', themes: ['Entrée en Canaan', 'Chute de Jéricho', 'Partage du pays', 'Période des Juges', 'Israël demande un roi', 'Onction de David', 'David et Goliath', 'Alliance avec David', 'Construction du Temple', 'Division du royaume', 'Élie sur le mont Carmel', 'Chute de Samarie', 'Réforme de Josias', 'Chute de Jérusalem', 'Exil à Babylone', 'Retour des exilés', 'Reconstruction du Temple', 'Reconstruction des murailles', 'Entre les deux Testaments'] },
    { title: 'La vie de Jésus', themes: ['Annonciation', 'Nativité', 'Visite des mages', 'Fuite en Égypte', 'Jésus au Temple à douze ans', 'Baptême de Jésus', 'Tentation au désert', 'Appel des disciples', 'Noces de Cana', 'Transfiguration', 'Entrée à Jérusalem (Rameaux)', 'Purification du Temple', 'Dernier repas', 'Lavement des pieds', 'Agonie à Gethsémané', 'Arrestation de Jésus', 'Procès de Jésus', 'Reniement de Pierre', 'Crucifixion', 'Sept paroles de la croix', 'Mise au tombeau', 'Tombeau vide', 'Apparitions du Ressuscité', 'Grand ordre missionnaire'] },
    { title: 'L’Église naissante', themes: ['Effusion de l’Esprit à la Pentecôte', 'Église de Jérusalem', 'Martyre d’Étienne', 'Conversion de Paul', 'Évangile annoncé aux païens', 'Concile de Jérusalem', 'Voyages missionnaires de Paul', 'Naufrage de Paul', 'Paul à Rome', 'Persécutions de l’Église', 'Destruction du Temple (an 70)'] }
  ]},
  { id: 'vie-chretienne-plus', title: 'XVI. Questions de vie et de foi', groups: [
    { title: 'Au quotidien', themes: ['Ambition', 'Loisirs et divertissements', 'Soucis', 'Contentement', 'Dettes', 'Lever matinal', 'Commérages', 'Moqueries', 'Promesses tenues', 'Ponctualité et fidélité', 'Épargne', 'Prêt et emprunt', 'Cautionnement', 'Héritage spirituel', 'Retraite et vieillesse', 'Voisinage', 'Amitié', 'Solitude', 'Repos', 'Sommeil', 'Alimentation', 'Corps et santé', 'Vêtements et modestie', 'Écrans et regard', 'Réseaux et réputation', 'Décisions', 'Conseils', 'Projets', 'Échec', 'Réussite'] },
    { title: 'Épreuves', themes: ['Deuil', 'Maladie', 'Handicap', 'Stérilité', 'Chômage et manque', 'Injustice subie', 'Trahison', 'Rejet', 'Persécution', 'Dépression et abattement', 'Peur de la mort', 'Doute', 'Attente de Dieu', 'Silence de Dieu', 'Tentation', 'Addiction et dépendance', 'Culpabilité', 'Honte', 'Colère', 'Pardon difficile'] },
    { title: 'Famille et société', themes: ['Célibat', 'Couple', 'Parents', 'Enfants', 'Adolescence et jeunesse', 'Grands-parents', 'Belle-famille', 'Divorce', 'Remariage', 'Adoption (famille)', 'Autorités', 'Impôts', 'Travail et patron', 'Justice sociale', 'Pauvres et riches', 'Écologie et création', 'Guerre et paix', 'Racisme et nations', 'Liberté de conscience', 'Témoignage au travail'] }
  ]}
];

/** Personnages (deuxième vague). */
export const PERSONNAGES_PLUS = [
  // Avant Abraham
  'Énosch', 'Kénan', 'Mahalaleel', 'Jéred', 'Lémec', 'Nimrod', 'Héber', 'Péleg', 'Nachor', 'Tubal-Caïn',
  // Patriarches et familles
  'Milca', 'Bethuel', 'Ketura', 'Éliézer de Damas', 'Abimélec (roi de Guérar)', 'Dina', 'Siméon (fils de Jacob)', 'Dan (fils de Jacob)', 'Nephthali (fils de Jacob)', 'Gad (fils de Jacob)',
  'Aser (fils de Jacob)', 'Issacar (fils de Jacob)', 'Zabulon (fils de Jacob)', 'Éphraïm (fils de Joseph)', 'Manassé (fils de Joseph)', 'Potiphar', 'Asnath', 'Bilha', 'Zilpa', 'Pérets',
  // Exode et désert
  'Amram et Jokébed', 'Hur', 'Betsaleel', 'Oholiab', 'Éléazar (fils d’Aaron)', 'Ithamar', 'Dathan et Abiram', 'Sihon et Og', 'Filles de Tselophchad', 'Hobab',
  // Conquête et juges
  'Adoni-Tsédek', 'Jaël', 'Sisera', 'Shamgar', 'Abimélec (fils de Gédéon)', 'Tola', 'Jaïr (juge)', 'Ibtsan', 'Élon', 'Abdon',
  'Manoach', 'Dalila', 'Mica (Juges)', 'Orpa', 'Élimélec', 'Elkana', 'Peninna', 'Hophni et Phinées', 'Ikabod', 'Kis',
  // Saül et David
  'Ahinoam', 'Isch-Boscheth', 'Doëg', 'Ahimélec (prêtre)', 'Abiathar', 'Tsadok', 'Gad (prophète)', 'Hiram (roi de Tyr)', 'Huschaï', 'Ahitophel',
  'Schimeï', 'Ittaï', 'Barzillaï', 'Tsiba', 'Amasa', 'Tamar (fille de David)', 'Benaja', 'Les héros de David', 'Abischag', 'Ritspa',
  // Rois d'Israël (Nord)
  'Nadab (roi d’Israël)', 'Baescha', 'Éla', 'Zimri', 'Omri', 'Achazia (roi d’Israël)', 'Joram (roi d’Israël)', 'Joachaz (roi d’Israël)', 'Joas (roi d’Israël)', 'Jéroboam II',
  'Zacharie (roi d’Israël)', 'Schallum', 'Menahem', 'Pekachia', 'Pékach', 'Osée (roi d’Israël)',
  // Rois de Juda
  'Abijam', 'Asa', 'Joram (roi de Juda)', 'Achazia (roi de Juda)', 'Athalie', 'Joas (roi de Juda)', 'Amatsia', 'Jotham', 'Achaz', 'Amon (roi de Juda)',
  'Joachaz (roi de Juda)', 'Jojakim', 'Jojakin',
  // Prophètes et serviteurs
  'Ahija (prophète)', 'Abdias (intendant d’Achab)', 'Michée fils de Jimla', 'Naboth', 'La Sunamite', 'La veuve de Sarepta', 'Jonadab fils de Récab', 'Jehojada', 'Hulda', 'Hilkija',
  'Schaphan', 'Ébed-Mélec', 'Guedalia', 'Ismaël fils de Nethania', 'Gomer', 'Urie (prophète)', 'Hanania (faux prophète)', 'Jahaziel', 'Azaria (prophète)', 'Oded',
  // Rois étrangers
  'Ben-Hadad', 'Hazaël', 'Sanchérib', 'Rabschaké', 'Tiglath-Piléser', 'Salmanasar', 'Nebuzaradan', 'Évil-Merodac', 'Assuérus', 'Vasthi',
  'Artaxerxès', 'Sanballat', 'Tobija', 'Guéschem', 'Darius le Mède', 'Aschpenaz', 'Hiram (artisan)', 'Pharaon Néco', 'Mésha (roi de Moab)', 'Églon',
  // Sagesse et psaumes
  'Éliphaz', 'Bildad', 'Tsophar', 'Élihu', 'Héman', 'Éthan', 'Agur', 'Lemuel', 'Fils de Koré', 'Iddo',
  // Retour d'exil
  'Josué (grand-prêtre)', 'Schéschbatsar', 'Éliaschib', 'Hanani', 'Esdras et les lévites', 'Hattusch', 'Les chantres du Temple', 'Les Nethiniens', 'Les Récabites', 'Les Kéniens',
  // Évangiles
  'Hérode le Grand', 'Hérode Antipas', 'Hérode Agrippa Ier', 'Hérodiade', 'Salomé (fille d’Hérodiade)', 'Salomé (disciple)', 'Jeanne femme de Chuza', 'Suzanne', 'Marie mère de Jacques', 'Marie de Clopas',
  'Cléopas', 'Joseph Barsabbas', 'Jacques fils d’Alphée', 'Thaddée', 'Nathanaël', 'Le jeune homme riche', 'Le centurion de Capernaüm', 'La femme cananéenne', 'La femme qui perdait du sang', 'La pécheresse pardonnée',
  'Le brigand repentant', 'Malchus', 'Le démoniaque de Gadara', 'Simon le pharisien', 'Simon le lépreux', 'Zébédée', 'Les mages', 'Les bergers', 'Anne (grand-prêtre)', 'L’aveugle-né',
  'Le paralytique de Béthesda', 'La veuve de Naïn', 'Les dix lépreux', 'La femme adultère', 'Le centurion au pied de la croix', 'Les femmes au tombeau', 'Les soixante-dix disciples', 'Les douze apôtres', 'Théophile', 'Lazare et le riche (parabole)',
  // Actes et lettres
  'Énée', 'Simon le corroyeur', 'Rhode', 'Élymas', 'Sergius Paulus', 'Le geôlier de Philippes', 'Jason', 'Denys l’Aréopagite', 'Damaris', 'Crispus',
  'Gallion', 'Sosthène', 'Démétrius l’orfèvre', 'Eutychus', 'Trophime', 'Tychique', 'Aristarque', 'Claude Lysias', 'Ananias de Damas', 'Ananias (grand-prêtre)',
  'Tertulle', 'Drusille', 'Bérénice', 'Julius le centurion', 'Publius', 'Épaphrodite', 'Évodie et Syntyche', 'Clément', 'Onésiphore', 'Hyménée et Alexandre',
  'Alexandre le forgeron', 'Éraste', 'Gaïus', 'Diotrèphe', 'Démétrius (3 Jean)', 'Archippe', 'Nymphas', 'Rufus', 'Andronicus et Junias', 'Tryphène et Tryphose',
  'Persis', 'Tertius', 'Carpus', 'Zénas', 'Artémas', 'Antipas (martyr de Pergame)', 'Jézabel de Thyatire', 'Les Nicolaïtes', 'Les sept diacres', 'Nicolas d’Antioche',
  'Prochore', 'Stéphanas', 'Chloé', 'Fortunatus et Achaïcus', 'Lucius de Cyrène', 'Siméon appelé Niger', 'Manahen', 'Jean-Marc et Barnabas', 'Hérode Agrippa II', 'Festus',
  // Anges
  'Michel (archange)', 'Gabriel (ange)', 'L’ange de l’Éternel', 'Séraphins', 'Les vingt-quatre anciens', 'Les quatre êtres vivants', 'Les deux témoins', 'La Bête et le faux prophète', 'Gog et Magog', 'Le dragon'
];

/** Lieux (deuxième vague). */
export const LIEUX_PLUS = [
  // Pays et régions
  'Mésopotamie', 'Paddan-Aram', 'Chaldée', 'Médie', 'Élam', 'Schinear', 'Pays d’Outs', 'Havila', 'Pays de Nod', 'Arabie',
  'Idumée', 'Pérée', 'Judée', 'Trachonite', 'Abilène', 'Galaad', 'Basan', 'Araba', 'Plaine côtière (Shéphéla)', 'Plaine de Saron',
  'Vallée de Jizreel', 'Néguev (désert)', 'Désert de Juda', 'Désert de Paran', 'Désert de Tsin', 'Désert de Schur', 'Koush', 'Ophir', 'Saba', 'Tarsis',
  // Montagnes
  'Mont Horeb', 'Mont Nébo', 'Pisga', 'Mont Hermon', 'Mont Thabor', 'Mont Garizim', 'Mont Ébal', 'Mont Guilboa', 'Mont Hor', 'Mont Séir',
  'Mont Moria', 'Mont des Béatitudes', 'Mont de la Transfiguration',
  // Eaux
  'Nil', 'Euphrate', 'Tigre', 'Torrent du Kidron', 'Jabbok', 'Arnon', 'Torrent de Kérith', 'Piscine de Siloé', 'Piscine de Béthesda', 'Grande Mer (Méditerranée)',
  'Eaux de Mara', 'Élim', 'Mériba', 'Fleuve Kébar', 'Puits de Jacob',
  // Villes de l'Ancien Testament
  'Aï', 'Guilgal', 'Guibéa', 'Mitspa', 'Rama', 'Gabaon', 'Ajalon', 'Lakis', 'Meguiddo', 'Jizreel (ville)',
  'Sunem', 'Endor', 'Kadès-Barnéa', 'Rephidim', 'Peniel', 'Mahanaïm', 'Hesbon', 'Rabba', 'Kir-Moab', 'Botsra',
  'Séla (Pétra)', 'Etsjon-Guéber', 'Carkemisch', 'Hamath', 'Arpad', 'Ribla', 'Tadmor', 'Tsoar', 'Guérar', 'Mamré',
  'Grotte de Macpéla', 'Dothan', 'Succoth', 'Pithom et Ramsès', 'On (Héliopolis)', 'Memphis', 'Thèbes (No-Amon)', 'Tachpanès', 'Dan (ville)', 'Hatsor',
  'Kédesch', 'Ramoth en Galaad', 'Jabès en Galaad', 'Tsiklag', 'Caverne d’Adullam', 'En-Guédi', 'Ziph', 'Kirjath-Jearim', 'Beth-Schémesch', 'Ékron',
  'Asdod', 'Gaza', 'Gath', 'Askalon', 'Tirtsa', 'Anathoth', 'Tékoa', 'Nob', 'Bethsaïda (Galilée)', 'Suse (citadelle)',
  'Ecbatane', 'Assur (ville)', 'Ur (ville)', 'Byblos (Guebal)', 'Elath', 'Théman', 'Arad', 'Débir', 'Hormah', 'Beth-Horon',
  // Jérusalem
  'Cité de David', 'Ophel', 'Vallée de Hinnom', 'Vallée de Josaphat', 'Porte des Brebis', 'Prétoire', 'Gabbatha', 'Champ du sang (Hakeldama)', 'Chambre haute', 'Portique de Salomon',
  'Parvis des païens', 'Tour Antonia', 'Jardin du tombeau', 'Bethphagé',
  // Villes du Nouveau Testament (Israël)
  'Naïn', 'Chorazin', 'Magdala', 'Gadara', 'Césarée de Philippe', 'Sychar', 'Énon', 'Béthanie au-delà du Jourdain', 'Éphraïm (ville)', 'Arimathée',
  'Lydda', 'Azot', 'Césarée maritime', 'Tibériade', 'Gennésareth', 'Sarepta',
  // Voyages de Paul
  'Antioche de Pisidie', 'Iconium', 'Lystre', 'Derbe', 'Perge', 'Attalie', 'Séleucie', 'Salamine', 'Paphos', 'Tarse',
  'Troas', 'Néapolis', 'Bérée', 'Cenchrées', 'Milet', 'Rhodes', 'Cos', 'Pergame', 'Thyatire', 'Sardes',
  'Smyrne', 'Philadelphie', 'Mysie', 'Bithynie', 'Cappadoce', 'Cilicie', 'Pamphylie', 'Lycaonie', 'Phrygie', 'Pont',
  'Asie (province)', 'Macédoine', 'Achaïe', 'Illyrie', 'Espagne', 'Italie', 'Pouzzoles', 'Syracuse', 'Rhégium', 'Forum d’Appius',
  'Aréopage', 'Clauda', 'Beaux-Ports', 'Mer Adriatique', 'Samothrace', 'Mitylène', 'Chio', 'Patara', 'Myra', 'Ptolémaïs'
];

/** Mots hébreux et araméens (toujours avec le français entre parenthèses). */
export const MOTS = [
  // Noms et titres de Dieu
  'Élohim (Dieu)', 'El Chaddaï (Dieu tout-puissant)', 'El Elyon (Dieu Très-Haut)', 'El Olam (Dieu d’éternité)', 'El Roï (Dieu qui me voit)', 'Adonaï (Seigneur)', 'YHWH (l’Éternel)', 'YHWH Yiré (l’Éternel pourvoira)', 'YHWH Rapha (l’Éternel qui guérit)', 'YHWH Nissi (l’Éternel ma bannière)',
  'YHWH Chalom (l’Éternel est paix)', 'YHWH Tsidkenou (l’Éternel notre justice)', 'YHWH Chamma (l’Éternel est là)', 'YHWH Tsevaot (l’Éternel des armées)', 'YHWH Mekaddichkem (l’Éternel qui sanctifie)', 'YHWH Roï (l’Éternel mon berger)', 'El Guibor (Dieu puissant)', 'Abba (Papa, Père)', 'Immanouel (Dieu avec nous)', 'Machia’h (Messie, oint)',
  'Ehyé acher ehyé (Je suis celui qui suis)', 'Kadoch Israël (le Saint d’Israël)', 'Tsour (Rocher)', 'Atik Yomin (l’Ancien des jours)', 'HaChem (le Nom)',
  // Caractère de Dieu
  'Hessed (bonté fidèle)', 'Émet (vérité, fidélité)', 'Émouna (foi, fidélité)', 'Chalom (paix, plénitude)', 'Tsédaka (justice)', 'Michpat (droit, jugement)', 'Kadoch (saint)', 'Kavod (gloire, poids)', 'Ra’hamim (compassion)', '’Hen (grâce, faveur)',
  'Ratson (bon plaisir)', 'Kin’a (jalousie, zèle)', 'Af (colère)', 'Erekh appayim (lent à la colère)', 'Tov (bon)', 'Ahava (amour)', 'Néémân (fidèle)', 'Guevoura (puissance)', 'Tiféret (splendeur)', 'Hod (majesté)',
  // L'être humain
  'Adam (être humain)', 'Ich et Icha (homme et femme)', 'Ézer kénegdo (aide semblable)', 'Tsélem (image)', 'Demout (ressemblance)', 'Néfech (âme, vie)', 'Rouah (souffle, esprit)', 'Lev (cœur)', 'Bassar (chair)', 'Nechama (souffle de vie)',
  'Dam (sang)', 'Afar (poussière)', 'Kerev (intérieur, entrailles)', 'Kilyot (reins, pensées intimes)', 'Yetser (penchant)',
  // Création et origines
  'Bara (créer)', 'Tohou va-bohou (informe et vide)', 'Rakia (étendue)', 'Béréchit (au commencement)', 'Toledot (générations, histoire)', 'Gan Éden (jardin d’Éden)', '’Ets ha’hayim (arbre de vie)', 'Na’hach (serpent)', 'Mabboul (déluge)', 'Tévah (arche)',
  // Péché et salut
  '’Hata (manquer la cible, pécher)', 'Avon (faute, iniquité)', 'Pécha (révolte)', 'Techouva (retour, repentance)', 'Chouv (revenir)', 'Kipour (couverture, expiation)', 'Kaporet (propitiatoire)', 'Goël (rédempteur)', 'Pada (racheter)', 'Yechoua (salut)',
  'Hochia na (sauve, de grâce : Hosanna)', 'Sala’h (pardonner)', 'Nassa (porter, enlever)', 'Tsaddik (juste)', 'Racha (méchant)', 'Tam (intègre)', 'Tamim (sans défaut)', 'Yachar (droit)', 'Avoda (service, culte)', 'Néder (vœu)',
  // Alliance et Loi
  'Berit (alliance)', 'Berit ‘hadacha (alliance nouvelle)', 'Torah (enseignement, loi)', 'Mitsva (commandement)', '’Houkkim (prescriptions)', 'Edout (témoignage)', 'Davar (parole, chose)', 'Chema (écoute)', 'Chamar (garder)', 'Zakhar (se souvenir)',
  'Yada (connaître intimement)', 'Hagah (méditer, murmurer)', 'Halakha (marche, conduite)', 'Derekh (chemin)', 'Netiv (sentier)',
  // Culte
  'Korban (offrande, ce qui approche)', 'Ola (holocauste)', '’Hattat (sacrifice pour le péché)', 'Acham (réparation)', 'Chelamim (sacrifice de communion)', 'Min’ha (offrande)', 'Mizbéa’h (autel)', 'Michkan (demeure, tabernacle)', 'Ohel moèd (tente de la rencontre)', 'Chekhina (présence qui demeure)',
  'Kerouvim (chérubins)', 'Serafim (séraphins, brûlants)', 'Kohen (prêtre)', 'Kohen gadol (grand-prêtre)', 'Lévi (attaché)', 'Tahor et tamé (pur et impur)', 'Kodech (sainteté, chose sainte)', '’Hol (profane)', '’Hérem (voué à Dieu, interdit)', 'To’éva (abomination)',
  'Tsaraat (lèpre)', 'Mikvé (bain de purification)', 'Chofar (cor de bélier)', 'Ménora (chandelier)', 'Lé’hem hapanim (pain de la présence)', 'Ketoret (encens)', 'Chémen hamich’ha (huile d’onction)', 'Mach’ha (oindre)', 'Nazir (consacré)', 'Bikkourim (prémices)',
  // Fêtes et temps
  'Chabbat (repos, cessation)', 'Pessa’h (passage, Pâque)', 'Matsa (pain sans levain)', '’Hamets (levain)', 'Chavouot (semaines)', 'Soukkot (cabanes)', 'Roch Hachana (tête de l’année)', 'Yom Kippour (jour des expiations)', 'Hanoukka (dédicace)', 'Pourim (sorts)',
  'Roch ‘Hodech (nouvelle lune)', 'Yovel (jubilé)', 'Chemitta (année de relâche)', 'Moèd (rendez-vous, fête)', 'Olam (éternité, siècle)', 'Olam haba (le monde à venir)', 'Yom YHWH (jour de l’Éternel)', 'Ét (temps, moment)', 'A’harit hayamim (la fin des jours)', 'Kets (fin)',
  // Prière et louange
  'Halelou-Yah (louez l’Éternel)', 'Amen (c’est sûr, ainsi soit-il)', 'Sélah (pause)', 'Barouch (béni)', 'Berakha (bénédiction)', 'Toda (action de grâces)', 'Tehilla (louange)', 'Tefilla (prière)', 'Mizmor (psaume chanté)', 'Chir (cantique)',
  'Tehillim (les Psaumes, louanges)', 'Hinéni (me voici)', 'Hochia (sauve)', 'Chiva (crier au secours)', 'Zamar (chanter, jouer)', 'Hichta’havé (se prosterner)', 'Yadah (célébrer, mains levées)', 'Chaba’h (exalter)', 'Ranan (crier de joie)', 'Kavah (attendre avec espérance)',
  // Vie avec Dieu
  'Batah (se confier)', '’Hassa (se réfugier)', 'Tikva (espérance)', 'Yirat YHWH (crainte de l’Éternel)', '’Hokhma (sagesse)', 'Bina (intelligence)', 'Daat (connaissance)', 'Mussar (instruction, discipline)', 'Machal (proverbe, parabole)', 'Ana (humilier, éprouver)',
  'Anav (humble)', 'Ani (pauvre, affligé)', 'Almana (veuve)', 'Yatom (orphelin)', 'Guer (étranger résident)', '’Hassid (fidèle, pieux)', 'Simha (joie)', 'Ahavat ‘hessed (aimer la bonté)', 'Tsedaka (aumône, justice)', 'Hitalekh (marcher avec Dieu)',
  // Peuple et institutions
  'Israël (qui lutte avec Dieu)', 'Ivri (Hébreu, celui d’au-delà)', 'Am (peuple)', 'Goyim (nations)', 'Kahal (assemblée)', 'Éda (communauté)', 'Navi (prophète)', '’Hozé (voyant)', 'Mélekh (roi)', 'Choftim (juges)',
  'Zakén (ancien)', 'Naguid (chef)', 'Sar (prince)', 'Évèd (serviteur)', 'Évèd YHWH (Serviteur de l’Éternel)', 'Tsiyon (Sion)', 'Yerouchalayim (Jérusalem)', 'Erets (terre, pays)', 'Galout (exil)', 'Chear (reste)',
  // Au-delà
  'Chéol (séjour des morts)', 'Malakh (messager, ange)', 'Satan (adversaire)', 'Chamayim (cieux)', 'Té’hiyat hametim (résurrection des morts)', 'Gué Hinnom (vallée de Hinnom)', 'Avaddon (destruction)', 'Rouah HaKodech (Esprit saint)', 'Chofet (juge)', 'Malkhout (royaume)',
  // Araméen des Évangiles
  'Maranatha (Seigneur, viens)', 'Talitha koumi (jeune fille, lève-toi)', 'Ephphatha (ouvre-toi)', 'Éli, Éli, lama sabachthani (mon Dieu, pourquoi m’as-tu abandonné)', 'Mammon (richesse)', 'Raca (tête vide)', 'Golgotha (crâne)', 'Gabbatha (lieu élevé)', 'Rabbouni (mon maître)', 'Céphas (rocher)',
  'Kedocha (sainteté)', 'Tsimtsoum (retrait)', 'Tikkoun (réparation)', 'Ha-Kadoch Barouch Hou (le Saint, béni soit-il)', 'Echet ‘hayil (femme vaillante)', 'Kéter (couronne)', 'Hadar (beauté, majesté)', 'Yéchou’a (salut, délivrance)', 'Guéoula (rédemption)', 'Nétsa’h (victoire, toujours)',
  'Ahavat olam (amour éternel)', 'Lev ‘hadach (cœur nouveau)', 'Rouah ‘hadacha (esprit nouveau)', 'Lev even (cœur de pierre)', 'Lev bassar (cœur de chair)', 'Kéren (corne, force)', 'Magen (bouclier)', 'Metsoudah (forteresse)', 'Migdal (tour)', 'Ma’hsé (refuge)',
  'Ro’é (berger)', 'Tson (brebis, troupeau)', 'Ayil (bélier)', 'Seh (agneau)', 'Yona (colombe)', 'Arié (lion)', 'Chémech (soleil)', 'Or (lumière)', '’Hochekh (ténèbres)', 'Mayim ‘hayim (eaux vives)',
  'Mayan (source)', 'Nahar (fleuve)', 'Yam (mer)', 'Midbar (désert, lieu de la parole)', 'Har (montagne)', 'Guéfen (vigne)', 'Té’ena (figuier)', 'Zayit (olivier)', 'Tamar (palmier)', 'Chaked (amandier, veilleur)',
  'Lé’hem (pain)', 'Yayin (vin)', 'Chémen (huile)', 'Mélah (sel)', 'Devach (miel)', '’Halav (lait)', 'Dagan (blé)', 'Kotsir (moisson)', 'Zéra (semence, descendance)', 'Peri (fruit)',
  'Boanergès (fils du tonnerre)', 'Bar (fils)', 'Rabbi (maître)', 'Talmid (disciple)', 'Chalia’h (envoyé, apôtre)', 'Kehila (assemblée, Église)', 'Besora (bonne nouvelle)', 'Tsadikim (les justes)', 'Méchouga (fou)', 'Hosanna (sauve maintenant)'
];

/** Troisième ensemble : étudier en détail (une fiche par parabole, miracle, prière…). */
export const GRANDS_SUJETS_DETAIL: Array<{ id: string; title: string; groups: Array<{ title: string; themes: string[] }> }> = [
  { id: 'detail', title: 'XVII. Pour étudier en détail', groups: [
    { title: 'Les paraboles de Jésus', themes: ['Parabole du semeur', 'Parabole de l’ivraie', 'Parabole du grain de moutarde', 'Parabole du levain', 'Parabole du trésor caché', 'Parabole de la perle', 'Parabole du filet', 'Parabole de la brebis perdue', 'Parabole de la drachme perdue', 'Parabole du fils prodigue', 'Parabole du bon Samaritain', 'Parabole du riche insensé', 'Parabole des talents', 'Parabole des mines', 'Parabole des dix vierges', 'Parabole des ouvriers de la onzième heure', 'Parabole des deux fils', 'Parabole des vignerons meurtriers', 'Parabole des noces', 'Parabole du serviteur impitoyable', 'Parabole de l’économe infidèle', 'Parabole du riche et de Lazare', 'Parabole du juge inique', 'Parabole du pharisien et du publicain', 'Parabole des deux débiteurs', 'Parabole de l’ami importun', 'Parabole du figuier stérile', 'Parabole du grand souper', 'Parabole de la semence qui pousse seule', 'Parabole des deux maisons', 'Parabole du serviteur fidèle', 'Parabole de la lampe', 'Parabole du vin nouveau et des vieilles outres', 'Parabole de la tour et du roi en guerre', 'Parabole du bon berger'] },
    { title: 'Les miracles de Jésus', themes: ['L’eau changée en vin', 'Guérison du fils de l’officier', 'Pêche miraculeuse', 'Guérison de la belle-mère de Pierre', 'Guérison d’un lépreux', 'Guérison du paralytique descendu par le toit', 'Guérison de l’homme à la main sèche', 'Guérison du serviteur du centurion', 'Résurrection du fils de la veuve de Naïn', 'Tempête apaisée', 'Délivrance du démoniaque de Gadara', 'Résurrection de la fille de Jaïrus', 'Guérison de la femme qui perdait du sang', 'Guérison de deux aveugles', 'Multiplication des pains pour cinq mille', 'Jésus marche sur l’eau', 'Guérison de la fille de la Cananéenne', 'Guérison du sourd-muet', 'Multiplication des pains pour quatre mille', 'Guérison de l’aveugle de Bethsaïda', 'Délivrance de l’enfant épileptique', 'Guérison de l’aveugle-né', 'Guérison du paralytique de Béthesda', 'Résurrection de Lazare', 'Guérison de la femme courbée', 'Guérison de l’hydropique', 'Guérison des dix lépreux', 'Guérison de Bartimée', 'Figuier desséché', 'Oreille de Malchus guérie', 'Seconde pêche miraculeuse', 'Pièce dans la bouche du poisson'] },
    { title: 'Les prières de la Bible', themes: ['Prière d’Abraham pour Sodome', 'Prière de Jacob à Peniel', 'Prière de Moïse pour le peuple', 'Prière d’Anne', 'Prière de David après Nathan', 'Prière de Salomon à la dédicace', 'Prière d’Élie au Carmel', 'Prière de Jabets', 'Prière d’Ézéchias', 'Prière de Néhémie', 'Prière d’Esdras', 'Prière de Daniel', 'Prière de Jonas', 'Prière d’Habacuc', 'Notre Père', 'Prière sacerdotale de Jésus', 'Prière de Jésus à Gethsémané', 'Prière de l’Église persécutée', 'Prières de Paul pour les Églises', 'Prière de foi pour les malades'] },
    { title: 'Les prophéties messianiques', themes: ['Postérité de la femme', 'Sceptre de Juda', 'Prophète comme Moïse', 'Étoile de Jacob', 'Fils de David pour toujours', 'Vierge enfantera', 'Enfant nous est né', 'Rameau d’Isaï', 'Serviteur souffrant', 'Né à Bethléem', 'Roi monté sur un âne', 'Trente pièces d’argent', 'Transpercé', 'Psaume 22 et la croix', 'Prêtre selon Melchisédek', 'Pierre rejetée devenue angulaire', 'Précurseur dans le désert', 'Alliance nouvelle annoncée', 'Effusion de l’Esprit annoncée', 'Fils de l’homme sur les nuées'] },
    { title: 'Les grands chapitres', themes: ['Genèse 1 : la création', 'Genèse 3 : la chute', 'Genèse 12 : l’appel', 'Exode 12 : la Pâque', 'Exode 20 : les dix paroles', 'Deutéronome 6 : Écoute Israël', 'Psaume 1 : les deux chemins', 'Psaume 23 : le berger', 'Psaume 51 : le pardon', 'Psaume 91 : la protection', 'Psaume 119 : la Parole', 'Psaume 139 : connu de Dieu', 'Proverbes 31 : la femme vaillante', 'Ésaïe 40 : consolez mon peuple', 'Ésaïe 53 : le serviteur', 'Jérémie 31 : l’alliance nouvelle', 'Ézéchiel 37 : les ossements', 'Matthieu 5-7 : le sermon sur la montagne', 'Luc 15 : les trois paraboles perdues', 'Jean 3 : naître de nouveau', 'Jean 15 : la vigne', 'Jean 17 : la prière de Jésus', 'Actes 2 : la Pentecôte', 'Romains 8 : la vie par l’Esprit', 'Romains 12 : le culte raisonnable', '1 Corinthiens 13 : l’amour', '1 Corinthiens 15 : la résurrection', 'Éphésiens 6 : l’armure', 'Philippiens 2 : l’abaissement du Christ', 'Hébreux 11 : les héros de la foi', 'Jacques 1 : l’épreuve', 'Apocalypse 21-22 : toutes choses nouvelles'] },
    { title: 'Titres et paroles de Jésus', themes: ['Je suis le pain de vie', 'Je suis la lumière du monde', 'Je suis la porte', 'Je suis le bon berger', 'Je suis la résurrection et la vie', 'Je suis le chemin, la vérité et la vie', 'Je suis le vrai cep', 'Avant qu’Abraham fût, je suis', 'Alpha et Oméga (titre du Christ)', 'Parole faite chair', 'Dernier Adam', 'Premier-né de toute la création', 'Image du Dieu invisible', 'Prince de la paix', 'Conseiller merveilleux', 'Roi des rois', 'Grand berger des brebis', 'Pierre vivante', 'Avocat auprès du Père', 'Auteur et consommateur de la foi', 'Rabbi et Maître', 'Fils du Très-Haut', 'Saint de Dieu', 'Libérateur'] },
    { title: 'Listes à méditer', themes: ['Premier commandement', 'Deuxième commandement', 'Troisième commandement', 'Quatrième commandement', 'Cinquième commandement', 'Sixième commandement', 'Septième commandement', 'Huitième commandement', 'Neuvième commandement', 'Dixième commandement', 'Heureux les pauvres en esprit', 'Heureux les affligés', 'Heureux les doux', 'Heureux ceux qui ont faim de justice', 'Heureux les miséricordieux', 'Heureux les cœurs purs', 'Heureux ceux qui procurent la paix', 'Heureux les persécutés', 'Amour (fruit de l’Esprit)', 'Joie (fruit de l’Esprit)', 'Paix (fruit de l’Esprit)', 'Patience (fruit de l’Esprit)', 'Bonté (fruit de l’Esprit)', 'Bienveillance (fruit de l’Esprit)', 'Fidélité (fruit de l’Esprit)', 'Douceur (fruit de l’Esprit)', 'Maîtrise de soi (fruit de l’Esprit)', 'Don de prophétie', 'Don d’enseignement', 'Don de service', 'Don d’exhortation', 'Don de libéralité', 'Don de présider', 'Don de miséricorde', 'Parole de sagesse', 'Parole de connaissance', 'Don de foi', 'Dons de guérison', 'Discernement des esprits', 'Diversité des langues', 'Interprétation des langues', 'Apôtres, prophètes, évangélistes, bergers, docteurs'] },
    { title: 'Cantiques et discours', themes: ['Cantique de Moïse', 'Cantique de Myriam', 'Cantique de Déborah', 'Cantique d’Anne', 'Cantique de David', 'Magnificat (cantique de Marie)', 'Benedictus (cantique de Zacharie)', 'Cantique de Siméon', 'Cantique de l’Agneau', 'Discours d’adieu de Moïse', 'Discours de Josué à Sichem', 'Discours de Pierre à la Pentecôte', 'Discours d’Étienne', 'Discours de Paul à Athènes', 'Discours de Paul à Milet', 'Discours sur la fin des temps'] }
  ]},
  { id: 'doctrines', title: 'XIX. Doctrines en détail', groups: [
    { title: 'Dieu, Christ et l’Esprit', themes: ['Attributs de Dieu', 'Omniprésence de Dieu', 'Omniscience de Dieu', 'Immutabilité de Dieu', 'Éternité de Dieu', 'Révélation générale', 'Révélation spéciale', 'Canon des Écritures', 'Autorité des Écritures', 'Illumination par l’Esprit', 'Divinité du Christ', 'Humanité du Christ', 'Deux natures du Christ', 'Abaissement du Christ', 'Session à la droite du Père', 'Intercession du Christ', 'Personnalité du Saint-Esprit', 'Divinité du Saint-Esprit', 'Baptême dans l’Esprit', 'Plénitude de l’Esprit'] },
    { title: 'Le salut', themes: ['Élection et appel', 'Expiation à notre place', 'Imputation de la justice', 'Union avec Christ', 'Adoption comme enfants', 'Régénération', 'Persévérance des croyants', 'Assurance du salut', 'Grâce seule', 'Foi seule', 'Christ seul', 'Écriture seule', 'À Dieu seul la gloire', 'Dépravation de l’homme', 'Grâce commune', 'Sacerdoce de tous les croyants', 'Liberté chrétienne', 'Légalisme', 'Croissance en sainteté'] },
    { title: 'L’Église et la fin', themes: ['Baptême des croyants', 'Gouvernement de l’Église', 'Discipline dans l’Église', 'Mission de l’Église', 'Israël et l’Église', 'Royaume déjà et pas encore', 'Enlèvement de l’Église', 'Grande tribulation', 'Millénium', 'Tribunal de Christ', 'Récompenses', 'Corps glorieux', 'État intermédiaire', 'Nouvelle création', 'Signes des temps', 'Antichrist et homme de péché'] }
  ]},
  { id: 'traditions', title: 'XX. Comparer les traditions chrétiennes', groups: [
    { title: 'Protestants, catholiques, orthodoxes', themes: ['Réforme protestante', 'Protestants évangéliques', 'Catholicisme romain', 'Orthodoxie', 'Écriture et Tradition', 'Pierre et la papauté', 'Marie dans la Bible et les traditions', 'Intercession des saints', 'Purgatoire à la lumière de la Bible', 'Sacrements et ordonnances', 'Cène et transsubstantiation', 'Baptême des enfants', 'Icônes et images', 'Livres deutérocanoniques', 'Célibat des prêtres', 'Confession des péchés (pratiques)', 'Indulgences et mérites', 'Justification : le grand débat', 'Liturgie et culte', 'Unité des chrétiens', 'Saints dans le Nouveau Testament', 'Reliques et pèlerinages', 'Credo des apôtres', 'Conciles de l’Église ancienne', 'Pères de l’Église'] }
  ]},
  { id: 'combat', title: 'XXI. Spiritualité et discernement', groups: [
    { title: 'Discerner', themes: ['Divination', 'Médiums et nécromancie', 'Nouvel Âge', 'Réincarnation', 'Magnétisme et énergies', 'Méditation orientale', 'Ésotérisme', 'Spiritisme', 'Fétiches et amulettes', 'Malédictions et bénédictions', 'Délivrance', 'Autorité du croyant', 'Faux prophètes', 'Faux christs', 'Sectes et hérésies', 'Gnose', 'Syncrétisme', 'Superstition', 'Anges gardiens', 'Puissances et dominations', 'Libération des captifs', 'Jeûne et prière', 'Victoire de la croix sur les puissances', 'Protection de Dieu', 'Sang de l’Agneau'] }
  ]},
  { id: 'racines', title: 'XXII. Racines juives de la foi', groups: [
    { title: 'Traditions d’Israël et accomplissement en Yéchoua', themes: ['Séder de la Pâque', 'Coupes du séder', 'Afikoman', 'Mezouza', 'Tsitsit (franges)', 'Tefillin (phylactères)', 'Lumières du chabbat', 'Kiddouch', 'Havdala', 'Bar-mitsva', 'Houppa (dais nuptial)', 'Ketouba (contrat de mariage)', 'Rouleau de la Torah', 'Lecture de la Torah à la synagogue', 'Chema Israël (prière)', 'Amida (prière des bénédictions)', 'Juifs messianiques', 'Olivier franc et sauvage', 'Alya (retour en Israël)', 'Fêtes d’Israël accomplies en Yéchoua', 'Calendrier hébreu', 'Langue hébraïque', 'Noms hébreux et leur sens', 'Rabbins et disciples', 'Tradition orale'] }
  ]},
  { id: 'visions', title: 'XXIII. Visions, alliances et prophéties', groups: [
    { title: 'Les alliances', themes: ['Alliance avec Noé', 'Alliance avec Abraham', 'Alliance du Sinaï', 'Alliance avec Phinées', 'Alliance de sel', 'Alliance avec David (promesse)'] },
    { title: 'Songes et visions', themes: ['Songes de Joseph', 'Songes du Pharaon', 'Songe de Salomon à Gabaon', 'Songes de Joseph époux de Marie', 'Songe de la femme de Pilate', 'Vision d’Ésaïe au Temple', 'Char de gloire d’Ézéchiel', 'Temple de la vision d’Ézéchiel', 'Fleuve qui sort du Temple', 'Visions de Zacharie', 'Vision de Pierre à Jaffa', 'Vision de Paul en Macédoine'] },
    { title: 'Daniel', themes: ['Statue du rêve de Nabuchodonosor', 'Fournaise ardente', 'Écriture sur la muraille', 'Fosse aux lions', 'Quatre bêtes de Daniel', 'Soixante-dix semaines'] },
    { title: 'L’Apocalypse', themes: ['Lettre à l’Église d’Éphèse', 'Lettre à l’Église de Smyrne', 'Lettre à l’Église de Pergame', 'Lettre à l’Église de Thyatire', 'Lettre à l’Église de Sardes', 'Lettre à l’Église de Philadelphie', 'Lettre à l’Église de Laodicée', 'Trône de Dieu (Apocalypse 4)', 'Livre scellé et l’Agneau', 'Sept sceaux', 'Sept trompettes', 'Sept coupes', 'Femme et dragon', 'Marque de la bête', 'Babylone la grande', 'Noces de l’Agneau', 'Règne de mille ans', 'Grand trône blanc', 'Fleuve de vie', 'Arbre de vie (Apocalypse 22)'] },
    { title: 'Grands moments de prière et de réveil', themes: ['Réveil sous Josias', 'Réveil sous Ézéchias', 'Réveil sous Néhémie et Esdras', 'Repentance de Ninive', 'Réveil de la Pentecôte', 'Réveil à Samarie', 'Réveil à Éphèse', 'Prière des exilés', 'Jeûne d’Esther', 'Jeûne de Ninive', 'Prière d’intercession de Moïse au Sinaï', 'Prière de Daniel trois fois par jour', 'Veille de prière de l’Église pour Pierre', 'Louange de Paul et Silas en prison', 'Prière avant de choisir les Douze'] },
    { title: 'Femmes de la Bible', themes: ['Femmes de foi de l’Ancien Testament', 'Femmes disciples de Jésus', 'Femmes dans l’Église naissante', 'Mères de la Bible', 'Veuves de la Bible', 'Reines de la Bible', 'Prophétesses', 'Femmes stériles visitées par Dieu', 'Femmes dans la généalogie de Jésus', 'Servantes de Dieu'] }
  ]},
  { id: 'livres', title: 'XVIII. Les 66 livres', groups: [
    { title: 'Ancienne Alliance', themes: ['Livre de la Genèse', 'Livre de l’Exode', 'Livre du Lévitique', 'Livre des Nombres', 'Livre du Deutéronome', 'Livre de Josué', 'Livre des Juges', 'Livre de Ruth', 'Livres de Samuel', 'Livres des Rois', 'Livres des Chroniques', 'Livre d’Esdras', 'Livre de Néhémie', 'Livre d’Esther', 'Livre de Job', 'Livre des Psaumes', 'Livre des Proverbes', 'Livre de l’Ecclésiaste', 'Cantique des cantiques (livre)', 'Livre d’Ésaïe', 'Livre de Jérémie', 'Livre des Lamentations', 'Livre d’Ézéchiel', 'Livre de Daniel', 'Livre d’Osée', 'Livre de Joël', 'Livre d’Amos', 'Livre d’Abdias', 'Livre de Jonas', 'Livre de Michée', 'Livre de Nahum', 'Livre d’Habacuc', 'Livre de Sophonie', 'Livre d’Aggée', 'Livre de Zacharie', 'Livre de Malachie'] },
    { title: 'Nouvelle Alliance', themes: ['Évangile selon Matthieu', 'Évangile selon Marc', 'Évangile selon Luc', 'Évangile selon Jean', 'Livre des Actes', 'Lettre aux Romains', 'Lettres aux Corinthiens', 'Lettre aux Galates', 'Lettre aux Éphésiens', 'Lettre aux Philippiens', 'Lettre aux Colossiens', 'Lettres aux Thessaloniciens', 'Lettres à Timothée', 'Lettre à Tite', 'Lettre à Philémon', 'Lettre aux Hébreux', 'Lettre de Jacques', 'Lettres de Pierre', 'Lettres de Jean', 'Lettre de Jude', 'Livre de l’Apocalypse'] }
  ]}
];

/** Personnages et lieux (troisième ensemble). */
export const PERSONNAGES_DETAIL = [
  'Abel', 'Caïn', 'Achab', 'Jézabel', 'Marthe', 'Marie de Béthanie', 'Sem', 'Cham', 'Japhet', 'Shadrak',
  'Hanoch fils de Caïn', 'Ada et Tsilla', 'Jabal et Jubal', 'Arpacschad', 'Joktan', 'Mamré l’Amoréen', 'Hémor et Sichem', 'Tamar (belle-fille de Juda)', 'Schua', 'Er et Onan',
  'Zérach', 'Hetsron', 'Ram', 'Amminadab', 'Nachschon', 'Salmon', 'Obed', 'Isaï', 'Éliab', 'Abinadab',
  'Schamma', 'Tseruja', 'Abischaï', 'Asaël', 'Joab et ses frères', 'Hanoun', 'Nahasch', 'Toï (roi de Hamath)', 'Hadadézer', 'Méphiboscheth fils de Saül',
  'Ziba', 'Machir', 'Shobi', 'Jonadab (neveu de David)', 'Absalom et Tamar', 'Rehoboam et ses conseillers', 'Ahijam', 'Asa et Maaca', 'Jéhu fils de Hanani', 'Jézabel et Naboth',
  'Elischa et les fils des prophètes', 'Naaman et la petite servante', 'La veuve et l’huile', 'Joas et Jehojada', 'Hilkija et le livre de la Loi', 'Baruc le scribe', 'Seraja', 'Les fils de Récab', 'Hananeel', 'Pashhur',
  'Jaazania', 'Pelatia', 'Daniel et ses compagnons', 'Le roi Darius et la fosse aux lions', 'Mardochée et Esther', 'Zéresch', 'Hégaï', 'Bigthan et Théresch', 'Esdras le scribe', 'Néhémie l’échanson',
  'Marie de Rome', 'Ampliatus', 'Urbain', 'Stachys', 'Apellès', 'Hérodion', 'Narcisse', 'Asyncrite', 'Phlégon', 'Hermès',
  'Patrobas', 'Hermas', 'Philologue et Julie', 'Nérée', 'Olympas', 'Lucius', 'Sosipater', 'Quartus', 'Éraste le trésorier', 'Gaïus de Corinthe',
  'Aquilas', 'Priscille', 'Lois', 'Eunice', 'Silvain', 'Crescens', 'Pudens', 'Linus', 'Claudia', 'Onésime',
  'Philippe l’évangéliste', 'Les filles de Philippe', 'L’eunuque éthiopien', 'Candace', 'Simon de Samarie', 'Bar-Jésus', 'Dorcas', 'Corneille et sa maison', 'Lydie et sa maison', 'Les Béréens'
];
export const LIEUX_DETAIL = [
  'Béthel et Aï', 'Gomorrhe', 'Sodome', 'Tyr', 'Sidon', 'Jéricho (Nouveau Testament)', 'Vallée d’Éla', 'Vallée d’Acor', 'Vallée de Rephaïm', 'Vallée de la décision',
  'Puits de Lachaï-roï', 'Beer-Lachaï-Roï', 'Rehoboth', 'Ések et Sitna', 'Mispa de Galaad', 'Gilead (baume)', 'Terre promise', 'Pays de Canaan (frontières)', 'Montagne de Sion', 'Nouvelle Jérusalem',
  'Ciel nouveau et terre nouvelle', 'Paradis (jardin)', 'Sein d’Abraham', 'Abîme sans fond', 'Étang de feu', 'Montagne de Dieu', 'Désert de Sinaï', 'Mer de Kinnéreth', 'Golan', 'Hauts lieux'
];
