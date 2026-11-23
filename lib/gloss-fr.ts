/**
 * Petit lexique ANGLAIS → FRANÇAIS pour les gloses STEPBible les plus
 * fréquentes (articles, pronoms, prépositions, mots courants). Sert de repli
 * tant que la traduction mot à mot EN CONTEXTE (IA) n'est pas encore faite :
 * mieux vaut un mot juste et simple, ou rien (translittération), qu'un faux
 * sens tiré d'une définition (ex. « monsieur » pour kyrios).
 */
const M: Record<string, string> = {
  // articles, liaisons
  'the': 'le', 'a': 'un', 'an': 'un', 'and': 'et', 'but': 'mais', 'or': 'ou', 'nor': 'ni', 'not': 'ne… pas', 'no': 'non',
  'if': 'si', 'for': 'car', 'because': 'parce que', 'so that': 'afin que', 'in order that': 'afin que',
  'this': 'ce', 'these': 'ces', 'those': 'ceux-là', 'that one': 'celui-là', 'who': 'qui', 'which': 'qui', 'what': 'quoi',
  'whom': 'que', 'whoever': 'quiconque', 'all': 'tout', 'every': 'chaque', 'each': 'chacun', 'many': 'beaucoup',
  'much': 'beaucoup', 'some': 'quelques', 'one': 'un', 'two': 'deux', 'three': 'trois', 'other': 'autre', 'others': 'autres',
  'another': 'un autre', 'same': 'même', 'as': 'comme', 'like': 'comme', 'so': 'ainsi', 'thus': 'ainsi', 'then': 'alors',
  'now': 'maintenant', 'also': 'aussi', 'even': 'même', 'again': 'de nouveau', 'indeed': 'en effet', 'behold': 'voici',
  'amen': 'amen', 'truly': 'vraiment', 'therefore': 'donc', 'yet': 'pourtant', 'when': 'quand', 'where': 'où',
  'why': 'pourquoi', 'how': 'comment', 'here': 'ici', 'there': 'là', 'today': "aujourd'hui", 'always': 'toujours',
  'never': 'jamais', 'only': 'seulement', 'very': 'très', 'more': 'plus', 'greater': 'plus grand',
  // prépositions
  'in': 'dans', 'into': 'dans', 'on': 'sur', 'upon': 'sur', 'at': 'à', 'to': 'à', 'toward': 'vers', 'towards': 'vers',
  'from': 'de', 'of': 'de', 'out of': 'hors de', 'by': 'par', 'through': 'par', 'with': 'avec', 'without': 'sans',
  'before': 'devant', 'after': 'après', 'against': 'contre', 'about': 'au sujet de', 'concerning': 'au sujet de',
  'among': 'parmi', 'under': 'sous', 'over': 'sur', 'above': 'au-dessus', 'until': "jusqu'à", 'up to': "jusqu'à",
  'to the': 'au', 'of the': 'du', 'in the': 'dans le', 'on the': 'sur le', 'from the': 'du', 'by the': 'par le',
  // pronoms
  'i': 'je', 'me': 'moi', 'my': 'mon', 'mine': 'à moi', 'we': 'nous', 'us': 'nous', 'our': 'notre',
  'you': 'tu / vous', 'your': 'ton / votre', 'yours': 'à toi', 'he': 'il', 'him': 'lui', 'his': 'son', 'she': 'elle',
  'her': 'elle', 'it': 'il', 'its': 'son', 'they': 'ils', 'them': 'eux', 'their': 'leur', 'himself': 'lui-même',
  'themselves': 'eux-mêmes', 'yourselves': 'vous-mêmes', 'myself': 'moi-même',
  'of me': 'de moi', 'to me': 'à moi', 'of you': 'de toi', 'to you': 'à toi', 'of him': 'de lui', 'to him': 'à lui',
  'of them': "d'eux", 'to them': 'à eux', 'of us': 'de nous', 'to us': 'à nous', 'of her': "d'elle",
  // noms
  'god': 'Dieu', 'lord': 'Seigneur', 'jesus': 'Jésus', 'christ': 'Christ', 'messiah': 'Messie', 'spirit': 'Esprit',
  'father': 'Père', 'son': 'Fils', 'man': 'homme', 'men': 'hommes', 'woman': 'femme', 'women': 'femmes',
  'people': 'peuple', 'day': 'jour', 'days': 'jours', 'night': 'nuit', 'heaven': 'ciel', 'heavens': 'cieux',
  'earth': 'terre', 'world': 'monde', 'kingdom': 'royaume', 'name': 'nom', 'word': 'parole', 'words': 'paroles',
  'love': 'amour', 'faith': 'foi', 'grace': 'grâce', 'life': 'vie', 'death': 'mort', 'sin': 'péché', 'sins': 'péchés',
  'law': 'loi', 'glory': 'gloire', 'power': 'puissance', 'powers': 'miracles', 'miracles': 'miracles', 'hand': 'main',
  'hands': 'mains', 'heart': 'cœur', 'hearts': 'cœurs', 'soul': 'âme', 'truth': 'vérité', 'light': 'lumière',
  'darkness': 'ténèbres', 'house': 'maison', 'way': 'chemin', 'time': 'temps', 'water': 'eau', 'bread': 'pain',
  'brother': 'frère', 'brothers': 'frères', 'disciple': 'disciple', 'disciples': 'disciples', 'demon': 'démon',
  'demons': 'démons', 'work': 'œuvre', 'works': 'œuvres', 'child': 'enfant', 'children': 'enfants', 'king': 'roi',
  'prophet': 'prophète', 'prophets': 'prophètes', 'angel': 'ange', 'angels': 'anges', 'temple': 'temple',
  'city': 'ville', 'mountain': 'montagne', 'sea': 'mer', 'fire': 'feu', 'blood': 'sang', 'body': 'corps',
  'flesh': 'chair', 'eye': 'œil', 'eyes': 'yeux', 'gospel': 'Évangile', 'church': 'Église', 'peace': 'paix',
  'joy': 'joie', 'hope': 'espérance', 'righteousness': 'justice', 'mercy': 'miséricorde', 'tree': 'arbre',
  'fruit': 'fruit', 'fruits': 'fruits', 'rock': 'roc', 'sand': 'sable', 'rain': 'pluie', 'wind': 'vent',
  'gate': 'porte', 'door': 'porte', 'servant': 'serviteur', 'master': 'maître', 'crowd': 'foule', 'crowds': 'foules',
  // verbes fréquents
  'is': 'est', 'was': 'était', 'are': 'sont', 'were': 'étaient', 'be': 'être', 'will be': 'sera', 'am': 'suis',
  'have': 'avoir', 'has': 'a', 'had': 'avait', 'said': 'dit', 'says': 'dit', 'say': 'dire', 'saying': 'disant',
  'will say': 'diront', 'came': 'vint', 'come': 'venir', 'coming': 'venant', 'went': 'alla', 'go': 'aller',
  'see': 'voir', 'saw': 'vit', 'know': 'connaître', 'knew': 'connut', 'hear': 'entendre', 'heard': 'entendit',
  'give': 'donner', 'gave': 'donna', 'make': 'faire', 'made': 'fit', 'do': 'faire', 'did': 'fit', 'does': 'fait',
  'believe': 'croire', 'believed': 'crut', 'answered': 'répondit', 'answering': 'répondant', 'spoke': 'parla',
  'we prophesied': 'nous avons prophétisé', 'we cast out': 'nous avons chassé', 'we did': 'nous avons fait',
  'enter': 'entrer', 'will enter': 'entrera', 'depart': 'retirez-vous', 'bear': 'porter', 'bears': 'porte',
  'built': 'bâtit', 'fell': 'tomba', 'fall': 'tomber', 'ask': 'demander', 'seek': 'chercher', 'knock': 'frapper'
};

export function glossFr(g?: string | null): string | null {
  if (!g) return null;
  const k = g.toLowerCase().replace(/[\[\]()<>{}*"“”]/g, '').replace(/\s+/g, ' ').trim();
  if (!k) return null;
  if (M[k]) return M[k];
  // « [the] word » / « the word » : on retente sans l'article anglais.
  const noArt = k.replace(/^(the|a|an) /, '');
  return M[noArt] ?? null;
}
