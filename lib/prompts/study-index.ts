import { z } from 'zod';
import { VOICE } from './voice';

/**
 * INDEX D'ETUDE — l'equivalent de l'annexe d'une Bible d'etude, ecrit par
 * nous : index thematique classe par grands sujets, et index des personnages
 * et des lieux. Chaque fiche renvoie a des passages precis, cliquables.
 */

/** Grands sujets (ordre d'affichage) et leurs themes. */
export const GRANDS_SUJETS: Array<{ id: string; title: string; groups: Array<{ title: string; themes: string[] }> }> = [
  { id: 'dieu', title: 'I. Dieu', groups: [
    { title: 'Sa nature', themes: ['Dieu', 'Amour de Dieu', 'Sainteté de Dieu', 'Fidélité de Dieu', 'Gloire de Dieu', 'Justice de Dieu', 'Colère de Dieu', 'Miséricorde', 'Grâce', 'Sagesse de Dieu', 'Toute-puissance', 'Souveraineté de Dieu', 'Trinité'] },
    { title: 'Ses noms et son œuvre', themes: ['Noms de Dieu', 'Création', 'Providence', 'Alliance', 'Bénédiction', 'Volonté de Dieu'] },
    { title: 'Ses titres', themes: ['Éternel (YHWH)', 'Père', 'Rocher', 'Visage de Dieu', 'Unité de Dieu'] },
    { title: 'Il se fait connaître', themes: ['Parole de Dieu', 'Inspiration des Écritures', 'Révélation', 'Vérité', 'Miracles', 'Signes', 'Prophétie', 'Rêves et visions'] }
  ]},
  { id: 'jesus', title: 'II. Jésus le Messie', groups: [
    { title: 'Sa personne et ses titres', themes: ['Jésus-Christ', 'Messie', 'Fils de Dieu', "Fils de l'homme", 'Agneau de Dieu', 'Bon Berger', 'Fils de David', 'Seigneur'] },
    { title: 'Son œuvre', themes: ['Incarnation', 'Sauveur', 'Médiateur', 'Grand-prêtre', 'Prophète', 'Roi', 'Juge', 'Serviteur', 'Lumière du monde', 'Pain de vie', 'Paraboles', 'Miracles de Jésus', 'Enseignement de Jésus', 'Sermon sur la montagne', 'Royaume de Dieu'] },
    { title: 'Son histoire', themes: ['Naissance de Jésus', 'Famille de Jésus', 'Baptême de Jésus', 'Tentation de Jésus', 'Transfiguration', 'Souffrances de Jésus', 'Croix', 'Mort de Jésus', 'Sang de Jésus', 'Résurrection de Jésus', 'Ascension', 'Évangile'] }
  ]},
  { id: 'esprit', title: 'III. Le Saint-Esprit', groups: [
    { title: 'Sa personne et son œuvre', themes: ['Saint-Esprit', 'Baptême du Saint-Esprit', "Dons de l'Esprit", "Fruit de l'Esprit", 'Onction', 'Consolateur', "Sceau de l'Esprit", 'Régénération', 'Liberté', 'Puissance'] }
  ]},
  { id: 'creation', title: 'IV. La création', groups: [
    { title: 'Le monde invisible', themes: ['Anges', 'Démons', 'Satan', 'Magie et sorcellerie'] },
    { title: 'Le monde visible', themes: ['Ciel', 'Terre', 'Mer', 'Montagne', 'Fleuve', 'Lune et étoiles', 'Lumière', 'Ténèbres', 'Eau', 'Feu', 'Vent', 'Pluie', 'Tremblement de terre'] },
    { title: 'Plantes et animaux', themes: ['Arbre', 'Vigne', 'Figuier', 'Olivier', 'Moisson', 'Pain', 'Vin', 'Sel', 'Animaux', 'Oiseaux', 'Poissons', 'Cheval', 'Lion', 'Serpent'] },
    { title: 'Le temps', themes: ['Temps', 'Jour et nuit', 'Sabbat', 'Nombres bibliques'] }
  ]},
  { id: 'humanite', title: "V. L'humanité", groups: [
    { title: "L'être humain", themes: ['Homme et femme', 'Image de Dieu', 'Cœur', 'Âme et esprit', 'Corps', 'Bouche', 'Yeux', 'Oreille', 'Mains', 'Pieds', 'Visage', 'Sang'] },
    { title: 'La société', themes: ['Nations', 'Autorités et gouvernants', 'Commerce', 'Esclavage', 'Guerre', 'Tradition', 'Musique et chants', 'Danse', 'Nourriture', 'Vêtements'] },
    { title: 'Éthique', themes: ['Adultère', 'Alcool', 'Ambition', 'Vie à naître', 'Célibat', 'Dette', 'Divorce', 'Douceur', 'Ennemi', 'Jalousie', 'Honte', 'Homosexualité', 'Intégrité', 'Meurtre', 'Vol', 'Paresse', 'Vœux et serments'] },
    { title: 'La vie de tous les jours', themes: ['Mariage', 'Famille', 'Enfants', 'Travail', 'Argent et richesse', 'Pauvreté', 'Amitié', 'Paroles et langue', 'Sexualité', 'Étranger'] },
    { title: 'Les épreuves', themes: ['Souffrance', 'Maladie et guérison', 'Mort', 'Deuil', 'Vieillesse', 'Peur', 'Inquiétude', 'Colère'] }
  ]},
  { id: 'peche', title: 'VI. Péché et rédemption', groups: [
    { title: 'Le péché', themes: ['Péché', 'Tentation', 'Orgueil', 'Convoitise', 'Hypocrisie', 'Idolâtrie', 'Mensonge', 'Châtiment', 'Jugement'] },
    { title: 'La rédemption', themes: ['Repentance', 'Pardon', 'Rédemption', 'Salut', 'Élection', 'Adoption', 'Justification', 'Réconciliation', 'Expiation', 'Nouvelle naissance', 'Vie nouvelle', 'Sacrifice'] }
  ]},
  { id: 'peuple', title: 'VII. Le peuple de Dieu', groups: [
    { title: 'Israël et les nations', themes: ['Israël', 'Juifs et nations', 'Exil', 'Exode', 'Terre promise', 'Loi (Torah)', 'Circoncision'] },
    { title: "Les institutions de l'Ancien Testament", themes: ['Prêtre', 'Lévites', 'Grand Conseil (Sanhédrin)', 'Spécialistes de la Loi', 'Synagogue', 'Tabernacle', 'Tente de la Rencontre', "Coffre de l'alliance", 'Autel', 'Encens', 'Temple', 'Sacrifices'] },
    { title: 'Les peuples', themes: ['Amalécites', 'Amoréens', 'Assyriens', 'Babyloniens', 'Cananéens', 'Édomites', 'Égyptiens', 'Grecs', 'Hittites', 'Moabites', 'Philistins', 'Perses', 'Romains', 'Pharisiens', 'Sadducéens', 'Samaritains', 'Immigrés'] },
    { title: 'Les fêtes', themes: ["Fêtes de l'Éternel", 'Pâque', 'Pentecôte', 'Fête des Cabanes', 'Jour du Grand Pardon'] },
    { title: "L'Église", themes: ['Église', 'Corps de Christ', 'Disciple', 'Baptême', 'Repas du Seigneur', 'Communion fraternelle', 'Unité', 'Anciens et bergers', 'Diacres', 'Prédication', 'Dons et ministères', 'Discipline dans l’Église', 'Évangélisation', 'Témoignage', 'Persécution', 'Dîmes et offrandes'] }
  ]},
  { id: 'croyant', title: 'VIII. Le croyant', groups: [
    { title: 'La foi', themes: ['Foi', 'Espérance', 'Assurance du salut', 'Confiance', 'Persévérance', 'Connaissance de Dieu', 'Croissance spirituelle'] },
    { title: 'La vie avec Dieu', themes: ['Prière', 'Intercession', 'Adoration', 'Louange', 'Jeûne', 'Méditation', 'Écouter Dieu', 'Confession des péchés', 'Commandements', 'Crainte de Dieu', 'Reconnaissance'] },
    { title: 'Le caractère', themes: ['Amour du prochain', 'Humilité', 'Patience', 'Joie', 'Paix', 'Obéissance', 'Courage', 'Fidélité', 'Maîtrise de soi', 'Discipline', 'Sanctification', 'Pureté', 'Générosité', 'Hospitalité', 'Pardonner aux autres', 'Encouragement', 'Service', 'Sagesse pratique'] },
    { title: 'Le combat', themes: ['Combat spirituel', 'Armure de Dieu', 'Consolation', 'Vocation'] },
    { title: 'Les menaces', themes: ['Doute', 'Découragement', 'Faux enseignements', 'Se détourner de Dieu', 'Oublier Dieu', 'Esprit du monde'] }
  ]},
  { id: 'fin', title: 'IX. La fin des temps', groups: [
    { title: "L'espérance à venir", themes: ['Signes de la fin', 'Retour de Christ', 'Résurrection des morts', 'Jugement dernier', 'Règne de mille ans', 'Séjour des morts', 'Vie éternelle', 'Nouvelle Jérusalem', 'Enfer', 'Antichrist', 'Récompenses'] }
  ]},
  { id: 'az', title: 'X. Autres thèmes de A à Z', groups: [
    { title: 'De A à Z', themes: ['Abondance', 'Accès à Dieu', 'Achat et vente', 'Action de grâces', 'Affliction', 'Âge', 'Agriculture', 'Aide de Dieu', "Droit d'aînesse", 'Ambassadeurs de Christ', 'Amen', 'Ami de Dieu', 'Ancien des jours', 'Ancêtres', 'Angoisse', 'Animaux purs et impurs', 'Année sabbatique', 'Année du jubilé', 'Apostasie', 'Apôtres', 'Appel de Dieu', 'Arc-en-ciel', 'Arche de Noé', 'Armée', 'Arrogance', 'Attente', 'Autorité', 'Avarice', 'Aveuglement spirituel', 'Avenir', 'Bannière', 'Bergers', 'Bienveillance', 'Bénédictions et malédictions', 'Blasphème', 'Bonheur', 'Bonté', 'Bouc émissaire', 'Brebis', 'Buisson ardent', 'Calomnie', 'Captivité', 'Sac et cendre', 'Chair', 'Chandelier', 'Chant nouveau', 'Chef', 'Chemin', 'Chérubins', 'Chute', 'Cieux nouveaux et terre nouvelle', 'Cité de Dieu', 'Clés du Royaume', 'Colombe', 'Commencement', 'Communion avec Dieu', 'Compassion', 'Condamnation', 'Conduite de Dieu', 'Connaissance', 'Conscience', 'Conseil', 'Consécration', 'Contentement', 'Conversion', 'Coupe', 'Couronne', 'Création nouvelle', 'Cri vers Dieu', "Croissance de l'Église", 'Cruauté', 'Culte', 'Dix Commandements', 'Délivrance', 'Dépendance de Dieu', 'Désir', 'Désobéissance', 'Devoir', 'Dieu caché', 'Dignité', 'Diligence', 'Division', 'Doctrine', 'Domination', 'Don', 'Douleur', 'Droiture', 'Eau vive', 'Éducation', 'Égalité', 'Égoïsme', 'Élus', 'Émotions', 'Endurcissement', 'Enfants de Dieu', 'Enseignement', 'Épée', 'Épouse de Christ', 'Épreuve', 'Équité', 'Erreur', 'Éternité', 'Étoile', 'Étude de la Bible', 'Exemple', 'Exhortation', 'Faiblesse', 'Faim et soif', 'Famine', 'Faux prophètes', 'Faveur', 'Femmes', 'Fermeté', 'Fidélité conjugale', 'Flatterie', 'Folie', 'Force', 'Fraternité', 'Frères et sœurs', 'Fuite', 'Générations', 'Gloire future', 'Gouvernement de Dieu', 'Grandeur', 'Gourmandise', 'Demeure de Dieu', 'Haine', 'Héritage', 'Honneur', 'Honnêteté', 'Huile', 'Humanité de Jésus', 'Hymnes', 'Ignorance', 'Illumination', 'Immortalité', 'Impureté', 'Incrédulité', 'Infidélité', 'Injustice', 'Instruction', 'Intelligence', 'Invitation de Dieu', 'Jalousie de Dieu', 'Joug', "Jour de l'Éternel", 'Jugement des croyants', "Juges d'Israël", 'Justice sociale', 'Parler en langues', 'Larmes', 'Lèpre', 'Lettre et esprit', 'Livre de vie', 'Loi et grâce', 'Longue vie', 'Main de Dieu', 'Maison', 'Maître', 'Malédiction', 'Malheur', 'Manne', 'Marcher avec Dieu', 'Martyrs', 'Maturité', 'Méchanceté', 'Médisance', 'Mémoire', 'Mépris', 'Mesure', 'Mission', 'Modestie', 'Monde', 'Moquerie', 'Mort spirituelle', 'Murmures', 'Mystère', 'Naissance', 'Nature humaine', 'Négligence', 'Nom', 'Nouveauté', 'Nuée', 'Obstination', 'Œuvres', 'Offrandes', 'Ombre', 'Opprimés', 'Ordre', 'Orphelins et veuves', 'Ouvriers', 'Paix avec Dieu', 'Parenté', 'Parents', 'Parfum', 'Partage', 'Patrie céleste', 'Pèlerins et étrangers', 'Pensées', 'Perfection', 'Perdition', 'Perte', 'Peuple de Dieu', 'Piété', 'Pierre angulaire', 'Plaisir', "Plaies d'Égypte", 'Plénitude', 'Porte', 'Possession démoniaque', 'Pouvoir', 'Préceptes', 'Prédestination', 'Prémices', 'Présence de Dieu', 'Prière exaucée', 'Prisonniers', 'Prochain', 'Profanation', 'Promesses de Dieu', 'Prospérité', 'Protection de Dieu', 'Prudence', 'Puissances célestes', 'Querelles', 'Quête de Dieu', 'Rançon', 'Rébellion', 'Recherche de Dieu', 'Refuge', 'Rejet', 'Relèvement', 'Remords', 'Renoncement', 'Repos', 'Réputation', 'Responsabilité', 'Reste fidèle', 'Restauration', 'Retour à Dieu', 'Réveil', 'Rire', 'Rosée', 'Royauté en Israël', 'Sacerdoce universel', 'Saints', 'Salaire', 'Sanctuaire', 'Santé', 'Scandale', 'Séduction', 'Semence', 'Séparation', 'Sépulture', 'Silence', 'Simplicité', 'Soif de Dieu', 'Soin de Dieu', 'Solitude', 'Sommeil', 'Soumission', 'Souvenir', 'Succès', 'Supplication', 'Talents', 'Témoins', 'Tendresse de Dieu', 'Terreur', 'Transformation', 'Trésor', "Tribus d'Israël", 'Tribulation', 'Tristesse', 'Tromperie', 'Trompette', 'Trône de Dieu', 'Union avec Christ', 'Prêt à intérêt', 'Vanité', 'Vengeance', 'Veille', 'Victoire', 'Vie', 'Vierge', 'Ville', 'Violence', 'Voie', 'Voile', 'Volonté humaine', 'Voyage', 'Zèle'] },
    { title: 'De A à Z (suite)', themes: ['Abaissement', 'Abandon à Dieu', 'Abîme', 'Abomination', 'Absence de Dieu', 'Accusation', 'Accueil', 'Adversité', 'Affaires', 'Aigle', 'Allégresse', 'Alpha et Oméga', 'Amertume', "Ancre de l'âme", 'Apparence', 'Arbre de vie', 'Armes', 'Artisans', 'Astrologie', 'Attachement', 'Audace', 'Aumône', 'Aurore', 'Avertissement', 'Balance', 'Banquet', 'Bâtir', 'Beauté', 'Besoins', 'Bétail', 'Bien et mal', 'Biens matériels', 'Bœuf', 'Boire et manger', 'Bonnes œuvres', 'Bouclier', 'Germe (Rameau)', 'Brebis perdue', 'Brisement', 'Calme', 'Cèdre', 'Ceinture', 'Célébration', 'Certitude', 'Chaînes', 'Chair et esprit', 'Champ', 'Changement', 'Chasteté', 'Chef de famille', 'Cheveux', 'Choix', 'Cieux ouverts', 'Circonstances', 'Citoyenneté', 'Clémence', 'Cœur brisé', 'Colonne de nuée et de feu', 'Compagnie', 'Complot', 'Comportement', 'Compréhension', 'Concorde', 'Confusion', 'Connaissance de soi', 'Constance', 'Contemplation', 'Contrition', 'Correction', 'Corruption', 'Course de la foi', 'Coutumes', 'Crainte des hommes', 'Créativité', 'Crise', 'Croissance', 'Danger', 'Débauche', 'Décision', 'Dédicace', 'Défaite', 'Défense de la foi', 'Demeurer en Christ', 'Dépouillement', 'Désespoir', 'Désolation', 'Destruction', 'Détresse', 'Dévouement', 'Diaspora', 'Jour du Seigneur', 'Discernement', 'Dispersion', 'Dissensions', 'Divinité de Jésus', 'Dragon', 'Droit', 'Échec', 'Édification', 'Effort', 'Égarement', 'Élévation', 'Éloquence', 'Embûches', 'Empires', 'Emprisonnement', 'Endurance', 'Engagement', 'Enseignants', 'Entraide', 'Envoi en mission', 'Épargne', 'Éphod', 'Épines et ronces', 'Esclavage du péché', 'Estime de soi', 'Exaltation', 'Excuses', 'Expérience', 'Potier et argile', 'Famille de Dieu', 'Fardeau', 'Fatigue', 'Faute', 'Faux dieux', 'Femme vertueuse', 'Fertilité', 'Festin', 'Fierté', 'Filiation', 'Fleurs', 'Foi et œuvres', 'Fondation', 'Forêt', 'Fragilité', 'Franchise', 'Fraude', 'Fruit', 'But de la vie', 'Garde', 'Gardien', 'Généalogies', 'Géants', 'Gestion des biens', 'Guide', 'Guerre sainte', 'Habitudes', 'Hâte', 'Hérésie', 'Heure', 'Histoire', 'Holocauste', 'Homme intérieur', 'Humiliation', 'Hysope', 'Imitation de Christ', 'Impatience', 'Impiété', 'Imposition des mains', 'Impôts', 'Indifférence', 'Influence', 'Iniquité', 'Innocence', 'Insensé', 'Insultes', 'Intentions', 'Interprétation', 'Intimité avec Dieu', 'Invisible', 'Isolement', 'Jardin', 'Jeunesse', 'Labour et semailles', 'Lâcheté', 'Lait et miel', 'Lampe', 'Lassitude', 'Lavement des pieds', 'Leadership', 'Lèvres', 'Libération', 'Lieu saint', 'Lieu très saint', 'Limites', 'Lion de Juda', 'Loisirs', 'Loup', 'Loyauté', 'Lutte', 'Maisonnée', 'Majesté', 'Mal', 'Malice', 'Manteau', 'Marchands', 'Mari et femme', "Noces de l'Agneau", 'Métiers', 'Ministère de la réconciliation', 'Misère', 'Mort à soi-même', 'Motivation', 'Multitude', 'Murailles', 'Myrrhe', 'Nation sainte', 'Nature', 'Nazaréen', 'Nécessité', 'Noblesse', 'Noces', 'Nourriture spirituelle', 'Cœur nouveau', 'Nouvelle alliance', 'Objectifs', 'Observance', 'Occasion', 'Parfum agréable', 'Offense', 'Opposition', 'Oracle', 'Orage', 'Ordination', 'Origines', 'Ossements desséchés', 'Outrage', 'Artisans de paix', 'Parole donnée', 'Partialité', 'Passé', 'Patriarches', 'Pauvres en esprit', "Péché contre l'Esprit", 'Pèlerinage', 'Perle de grand prix', 'Persuasion', 'Petitesse', 'Philosophie', 'Pierres', 'Pièges', 'Pitié', 'Lamentation', 'Planter', 'Politique', 'Porte étroite', 'Possessions', 'Poussière', 'Préparation', 'Présomption', 'Preuves', 'Prévoyance', 'Princes', 'Prix', 'Procès', 'Prodiges', 'Profession de foi', 'Progrès', 'Propriété', 'Prosélytes', 'Prostitution', 'Provision de Dieu', 'Psaumes', 'Pureté rituelle', 'Purification', 'Qualités', 'Questions', 'Quotidien', 'Racines', 'Raison', 'Rassemblement', 'Recommencement', 'Réflexion', 'Réforme', 'Regret', 'Reines', 'Relations', 'Religion', 'Remède', 'Renommée', 'Repas', 'Réponse de Dieu', 'Repos de Dieu', 'Reproche', 'Résistance', 'Respect', 'Retraite', 'Richesse spirituelle', 'Rigueur', 'Rivalité', 'Ruse', 'Ruine', 'Sacrifice de louange', 'Sagesse humaine', 'Saisons', "Sang de l'alliance", 'Satisfaction', 'Sauvetage', 'Savoir', 'Science', 'Secours', 'Secret', 'Sécurité', 'Semaine', 'Sens de la vie', 'Sentinelle', "Serpent d'airain", 'Sévérité', 'Sincérité', 'Sobriété', 'Soldat', 'Soleil', 'Solidarité', 'Tirer au sort', 'Soucis', 'Souffle de vie', 'Source', 'Spiritualité', 'Statues', 'Stérilité', 'Succession', 'Superstition', 'Supplice', 'Table', 'Tâche', 'Témérité', 'Tempête', 'Désirs de la chair', 'Testament', 'Tête', 'Manifestations de Dieu (théophanies)', 'Timidité', 'Tombeau', 'Tonnerre', 'Torrent', 'Tour', 'Trahison', 'Tranquillité', 'Traversée', 'Tribunal', 'Tribut', 'Triomphe', 'Troupeau', 'Univers', 'Urgence', 'Vaillance', 'Vainqueur', 'Valeur', 'Vallée', 'Vase', "Veau d'or", 'Vertu', 'Vices', 'Vide', 'Vieil homme et homme nouveau', 'Vigilance', 'Visitation de Dieu', 'Voix de Dieu', 'Vue', 'Vulnérabilité'] }
  ]}
];

/** Renvois (« Affection : voir Amour du prochain »), comme dans une Bible d'étude. */
export const RENVOIS: Record<string, string> = {
  'Affection': 'Amour du prochain', 'Charité': 'Amour du prochain', 'Abstinence': 'Alcool', 'Ivresse': 'Alcool',
  'Diable': 'Satan', 'Pénitence': 'Repentance', 'Pasteur': 'Anciens et bergers', 'Sainte-Cène': 'Repas du Seigneur',
  'Cène': 'Repas du Seigneur', 'Pacte': 'Alliance', 'Torah': 'Loi (Torah)', 'Shabbat': 'Sabbat', 'Chabbat': 'Sabbat',
  "Pessa'h": 'Pâque', 'Chavouot': 'Pentecôte', 'Soukkot': 'Fête des Cabanes', 'Yom Kippour': 'Jour du Grand Pardon',
  'Yéchoua': 'Jésus-Christ', 'Christ': 'Jésus-Christ', 'Ruah HaKodech': 'Saint-Esprit', 'Esprit Saint': 'Saint-Esprit',
  'Avortement': 'Vie à naître', 'Guérison': 'Maladie et guérison', 'Richesse': 'Argent et richesse', 'Paradis': 'Ciel',
  'Géhenne': 'Enfer', 'Shéol': 'Séjour des morts', 'Hadès': 'Séjour des morts', 'Anges déchus': 'Démons',
  'Sorcellerie': 'Magie et sorcellerie', 'Occultisme': 'Magie et sorcellerie', 'Remerciement': 'Reconnaissance',
  'Pauvres': 'Pauvreté', 'Veuves': 'Orphelins et veuves', 'Sanhédrin': 'Grand Conseil (Sanhédrin)',
  'Arche de l’alliance': "Coffre de l'alliance", "Arche de l'alliance": "Coffre de l'alliance", 'Scribes': 'Spécialistes de la Loi',
  'Pardon de Dieu': 'Pardon', 'Péché originel': 'Chute', 'Ressuscité': 'Résurrection de Jésus', 'Cieux': 'Ciel',
  'Achat': 'Achat et vente', 'Commandement': 'Commandements', 'Messianique': 'Messie', 'Machia’h': 'Messie',
  'Sainte-Trinité': 'Trinité', 'Esprit': 'Saint-Esprit', 'Âme': 'Âme et esprit', 'Ange': 'Anges', 'Démon': 'Démons'
};

export const PERSONNAGES = [
  'Adam', 'Ève', 'Caïn et Abel', 'Noé', 'Abraham', 'Sarah', 'Isaac', 'Rébecca', 'Jacob', 'Joseph (fils de Jacob)',
  'Moïse', 'Aaron', 'Miryam', 'Josué', 'Caleb', 'Rahab', 'Déborah', 'Gédéon', 'Samson', 'Ruth',
  'Anne (mère de Samuel)', 'Samuel', 'Saül', 'David', 'Jonathan', 'Bath-Shéba', 'Absalom', 'Nathan', 'Salomon', 'Élie',
  'Élisée', 'Achab et Jézabel', 'Ézéchias', 'Josias', 'Ésaïe', 'Jérémie', 'Ézéchiel', 'Daniel', 'Jonas', 'Esther',
  'Esdras', 'Néhémie', 'Job', 'Melchisédek', 'Nabuchodonosor', 'Cyrus', 'Marie (mère de Jésus)', 'Joseph (époux de Marie)', 'Jean-Baptiste', 'Pierre',
  'Jean (apôtre)', 'Jacques (frère de Jean)', 'André', 'Matthieu', 'Thomas', 'Judas Iscariot', 'Marie de Magdala', 'Marthe et Marie', 'Lazare', 'Nicodème',
  'Zachée', 'Paul', 'Barnabas', 'Timothée', 'Étienne', 'Philippe', 'Priscille et Aquilas', 'Luc', 'Lydie', 'Corneille',
  'Pilate', 'Hérode', "Pharaon (de l'Exode)", 'Jacques (frère de Jésus)',
  // Ancien Testament
  'Seth', 'Hénoc', 'Mathusalem', 'Sem, Cham et Japhet', 'Térah', 'Lot', 'Agar', 'Ismaël', 'Ésaü', 'Laban',
  'Léa', 'Rachel', 'Ruben', 'Juda', 'Lévi', 'Benjamin', 'Tamar', 'Jéthro', 'Séphora', 'Pinhas',
  'Nadab et Abihou', 'Koré', 'Balaam', 'Balak', 'Akan', 'Othniel', 'Ehoud', 'Baraq', 'Jephté', 'Naomi',
  'Boaz', 'Éli', 'Goliath', 'Mikal', 'Abigaïl', 'Joab', 'Abner', 'Urie', 'Amnon', 'Adonija',
  'Mephibosheth', 'Roboam', 'Jéroboam', 'Reine de Saba', 'Naaman', 'Guéhazi', 'Jéhu', 'Josaphat', 'Ozias', 'Manassé (roi de Juda)',
  'Sédécias', 'Osée', 'Joël', 'Amos', 'Abdias', 'Michée', 'Nahum', 'Habacuc', 'Sophonie', 'Aggée',
  'Zacharie (prophète)', 'Malachie', 'Mardochée', 'Haman', 'Zorobabel', 'Baruc', 'Shadrak, Méshak et Abed-Nego', 'Darius', 'Belshatsar', 'Asaph',
  // Nouveau Testament
  'Élisabeth', 'Zacharie (père de Jean-Baptiste)', 'Siméon', 'Anne (prophétesse)', 'Jaïrus', 'Bartimée', 'Caïphe', 'Barabbas', "Joseph d'Arimathée", 'Simon de Cyrène',
  'La Samaritaine', 'Matthias', 'Ananias et Saphira', 'Silas', 'Tite', 'Philémon et Onésime', 'Apollos', 'Tabitha', 'Agabus', 'Félix et Festus',
  'Agrippa', 'Démas', 'Épaphras', 'Marc', 'Jude', 'Barthélemy', 'Simon le zélote', 'Gamaliel', 'Simon le magicien', 'Loïs et Eunice', 'Phœbé'
];

export const LIEUX = [
  'Éden', 'Our des Chaldéens', 'Canaan', 'Égypte', 'Mer Rouge', 'Sinaï', 'Désert', 'Jourdain', 'Jéricho', 'Hébron',
  'Jérusalem', 'Sion', 'Bethléem', 'Nazareth', 'Galilée', 'Capernaüm', 'Samarie', 'Béthanie', 'Gethsémané', 'Golgotha',
  'Mont des Oliviers', 'Mont Carmel', 'Babylone', 'Ninive', 'Damas', 'Antioche', 'Éphèse', 'Corinthe', 'Rome', 'Patmos',
  'Ararat', 'Babel', 'Harân', 'Béthel', 'Sodome et Gomorrhe', 'Beer-Shéba', 'Gosen', 'Morija', 'Néguev', 'Mer Morte',
  'Moab', 'Édom', 'Silo', 'Sichem', 'Philistie', 'Tyr et Sidon', 'Liban', 'Assyrie', 'Perse', 'Suse',
  'Lac de Galilée', 'Cana', 'Emmaüs', 'Césarée', 'Jaffa', 'Décapole', 'Bethsaïda', 'Philippes', 'Thessalonique', 'Athènes',
  'Galatie', 'Colosses', 'Crète', 'Malte', 'Chypre', 'Laodicée', "Les sept Églises d'Asie", 'Harmaguédon'
];

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export type PlannedEntry = {
  slug: string; kind: 'theme' | 'personne' | 'lieu'; title: string;
  category: string; subcategory: string | null;
};

/** Toutes les entrees prevues, dans l'ordre de generation. */
export function allEntries(): PlannedEntry[] {
  const out: PlannedEntry[] = [];
  for (const g of GRANDS_SUJETS) for (const sub of g.groups) for (const t of sub.themes)
    out.push({ slug: slugify(t), kind: 'theme', title: t, category: g.title, subcategory: sub.title });
  for (const p of PERSONNAGES) out.push({ slug: slugify(p), kind: 'personne', title: p, category: 'Personnages', subcategory: null });
  for (const l of LIEUX) out.push({ slug: slugify(l), kind: 'lieu', title: l, category: 'Lieux', subcategory: null });
  const seen = new Set<string>();
  return out.filter(e => (seen.has(e.slug) ? false : (seen.add(e.slug), true)));
}

export const ABREVIATIONS = `Gn Ex Lv Nb Dt Jos Jg Rt 1 S 2 S 1 R 2 R 1 Ch 2 Ch Esd Ne Est Jb Ps Pr Ec Ct Es Jr Lm Ez Dn Os Jl Am Ab Jon Mi Na Ha So Ag Za Ml
  Mt Mc Lc Jn Ac Rm 1 Co 2 Co Ga Ep Ph Col 1 Th 2 Th 1 Tm 2 Tm Tt Phm He Jc 1 P 2 P 1 Jn 2 Jn 3 Jn Jude Ap`;

export const IndexEntrySchema = z.object({
  definition: z.string().max(1200),
  sections: z.array(z.object({
    title: z.string().max(140),
    items: z.array(z.object({
      label: z.string().max(200),
      refs: z.array(z.string()).min(1).max(8)
    })).min(1).max(16)
  })).min(2).max(12),
  see_also: z.array(z.string()).max(8).optional().default([])
});
export type IndexEntry = z.infer<typeof IndexEntrySchema>;

export const INDEX_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    definition: { type: 'STRING' },
    sections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          items: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: { label: { type: 'STRING' }, refs: { type: 'ARRAY', items: { type: 'STRING' } } },
              required: ['label', 'refs']
            }
          }
        },
        required: ['title', 'items']
      }
    },
    see_also: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['definition', 'sections', 'see_also']
};

export const INDEX_SYSTEM = `Tu rédiges l'INDEX D'ÉTUDE d'une Bible d'étude en ligne, d'orientation
protestante évangélique : une fiche par thème, personnage ou lieu, qui permet
au lecteur de tout retrouver dans la Bible et de cliquer pour lire.

${VOICE}

FORME D'UNE FICHE (dans l'esprit de l'annexe d'une Bible d'étude, mais
entièrement rédigée par toi) :
- definition : deux à quatre phrases claires. Pour un personnage : qui il est,
  son époque, son rôle dans l'histoire du salut. Pour un lieu : où il se trouve
  et ce qui s'y passe. Pour un thème : ce que la Bible entend par ce mot.
- RICHESSE : une fiche aussi complète qu'une vraie Bible d'étude. Pour un grand
  sujet (Alliance, Prière, Foi, Salut, Abraham, David, Jérusalem…) : 5 à 10
  sections, 4 à 12 items chacune, 40 à 90 références au total. Pour un sujet
  plus modeste : 3 à 5 sections, 15 à 35 références. Des sous-parties
  numérotées sont possibles dans le titre de section (« B. 2) Alliance avec
  Abraham »).
- sections : au plan logique. Le titre commence par une
  lettre : « A. Dans l'Ancien Testament », « B. Ce que Jésus enseigne »,
  « C. Pour notre vie ». Pour un personnage : « A. Famille », « B. Appel »,
  « C. Événements marquants », « D. Ce que le Nouveau Testament en dit ».
- chaque section contient des items : un libellé court (quelques mots, sans
  majuscule initiale, ex. « déclaré juste par sa foi ») et une à cinq
  références qui le prouvent.
- see_also : jusqu'à six autres entrées de l'index à consulter (titres simples).

RÉFÉRENCES (RÈGLE ABSOLUE) :
- Format abrégé uniquement, chapitre POINT verset : « Gn 12.1-3 », « Jn 3.16 »,
  « 1 Co 13.4-7 », « Ps 23 » (chapitre entier), « Mt 5.3-12 ».
- Abréviations autorisées, exactement celles-ci :
  ${ABREVIATIONS}
- Canon protestant de 66 livres, numérotation des Bibles françaises (Segond).
- Ne cite QUE des passages dont tu es CERTAIN qu'ils parlent bien de l'item.
  Mieux vaut moins de références que des références approximatives.
- Ancien ET Nouveau Testament quand c'est pertinent, en montrant
  l'accomplissement en Yéchoua (Jésus).

Réponds uniquement par un objet JSON conforme au schéma, sans texte autour.`;

export function indexUserPrompt(e: PlannedEntry) {
  const k = e.kind === 'personne' ? 'PERSONNAGE' : e.kind === 'lieu' ? 'LIEU' : 'THÈME';
  return `Rédige la fiche d'index pour ce ${k} : « ${e.title} »
(classement : ${e.category}${e.subcategory ? ` › ${e.subcategory}` : ''}).
Renvoie { "definition": "...", "sections": [ { "title": "A. ...", "items": [ { "label": "...", "refs": ["Gn 1.1"] } ] } ], "see_also": [] }.`;
}
