/**
 * COMMENT LIRE LA BIBLE CHAQUE JOUR
 * Contenu partage entre la page /etude/comment-lire et la bulle du lecteur.
 */

export const METHODE: Array<{ t: string; d: string; ref?: string }> = [
  { t: 'Un rendez-vous fixe', d: 'La même heure, le même endroit. Un petit moment chaque jour vaut mieux qu’une longue lecture de temps en temps.' },
  { t: 'Prier d’abord', d: 'Demander au Ruah HaKodech (Saint-Esprit) d’ouvrir ton cœur : « Ouvre mes yeux, pour que je contemple les merveilles de ta loi. »', ref: 'Ps 119.18' },
  { t: 'Lire avec soin', d: 'Un passage court, lu lentement, deux fois si besoin. Pas la quantité : la rencontre.' },
  { t: 'Réfléchir', d: 'Laisser le texte parler. Répondre à au moins une des questions ci-dessous.' },
  { t: 'Garder un verset', d: 'Choisir le verset ou les mots qui te touchent le plus.' },
  { t: 'L’écrire et le dire', d: 'Le noter dans ton carnet (touche le verset dans le lecteur), et le partager autour de toi.' },
  { t: 'Le porter dans la journée', d: 'Y repenser au travail, en voiture, avant de dormir.' },
  { t: 'Prier ce verset', d: 'Transformer ce que tu as lu en prière : adorer, remercier, confesser, demander.' },
  { t: 'Obéir', d: 'Une seule action concrète pour aujourd’hui : faire ce que Dieu t’a montré.', ref: 'Jc 1.22' }
];

export const QUESTIONS: string[] = [
  'De quoi, ou de qui, parle ce passage ? Qui parle, et à qui ?',
  'Que m’apprend-il sur Dieu : le Père, Yéchoua (Jésus), le Ruah HaKodech (Saint-Esprit) ?',
  'Y a-t-il un exemple à suivre, ou à ne pas suivre ?',
  'Y a-t-il un commandement à vivre ?',
  'Y a-t-il une promesse à recevoir ?',
  'Y a-t-il un avertissement à entendre ?',
  'Quelle vérité Dieu me révèle-t-il aujourd’hui ?',
  'D’autres passages m’aident-ils à comprendre ? (l’Index d’étude est là pour ça)'
];

export const POUR_PRIER: Array<{ t: string; q: string }> = [
  { t: 'Le verset du jour', q: 'Quel verset me frappe le plus ?' },
  { t: 'Confesser', q: 'Y a-t-il quelque chose dont Dieu m’invite à me repentir ?' },
  { t: 'Croire et obéir', q: 'Quelle vérité croire, quel pas faire aujourd’hui ?' },
  { t: 'Remercier', q: 'Pour quoi puis-je le remercier et le louer ?' },
  { t: 'Demander', q: 'Que puis-je lui demander, pour moi et pour les autres ?' }
];

/** Version courte (bulle du lecteur) : 4 temps. */
export const QUATRE_TEMPS: Array<[string, string, string]> = [
  ['Lire', 'Que dit le texte ? Un passage court, lentement.', '5 min'],
  ['Méditer', 'Que me dit Dieu à travers ce texte ? Garde un verset.', '5 min'],
  ['Prier', 'Que vais-je lui répondre ? Transforme le verset en prière.', '3 min'],
  ['Pratiquer', 'Que vais-je faire aujourd’hui ? Une seule action concrète.', '2 min']
];
