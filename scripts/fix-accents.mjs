/**
 * Remise des accents francais dans l'interface.
 *
 * Le projet avait ete ecrit sans accents. Ce script les remet, uniquement
 * dans les fichiers d'interface (app/ et components/), sur une liste de mots
 * choisis pour ne jamais entrer en collision avec du code.
 *
 *   node scripts/fix-accents.mjs          apercu, ne modifie rien
 *   node scripts/fix-accents.mjs --write  applique les corrections
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const WRITE = process.argv.includes('--write');
const ROOTS = ['app', 'components'];

/* Mots surs : ils n'apparaissent jamais comme identifiants de code. */
const WORDS = [
  ['retrouves', 'retrouvés'], ['affilee', 'affilée'], ['surlignes', 'surlignés'],
  ['Active', 'Activé'], ['Desactive', 'Désactivé'], ['serie', 'série'],
  ['deconnecter', 'déconnecter'], ['Deconnexion', 'Déconnexion'],
  ['cle', 'clé'], ['cles', 'clés'], ['mot-cle', 'mot-clé'],
  ['demande', 'demandé'], ['Redige', 'Rédige'], ['redigee', 'rédigée'],
  ['detaillees', 'détaillées'], ['generees', 'générées'],
  ['ete', 'été'], ['deroule', 'déroulé'], ['reussi', 'réussi'],
  ['echoue', 'échoué'], ['termine', 'terminé'], ['commence', 'commencé'],
  ['ajoutee', 'ajoutée'], ['supprimee', 'supprimée'], ['modifiee', 'modifiée'],
  ['publiee', 'publiée'], ['publiees', 'publiées'], ['validee', 'validée'],
  ['associee', 'associée'], ['liee', 'liée'], ['choisie', 'choisie'],
  ['interessant', 'intéressant'], ['different', 'différent'], ['differente', 'différente'],
  ['problemes', 'problèmes'], ['probleme', 'problème'], ['systeme', 'système'],
  ['modele', 'modèle'], ['modeles', 'modèles'], ['theme', 'thème'], ['themes', 'thèmes'],
  ['Temoigner', 'Témoigner'], ['temoignage', 'témoignage'], ['Temoignage', 'Témoignage'],
  ['Priere', 'Prière'], ['priere', 'prière'], ['prieres', 'prières'], ['Prieres', 'Prières'],
  ['Evangile', 'Évangile'], ['evangile', 'évangile'], ['Evangiles', 'Évangiles'],
  ['Genese', 'Genèse'], ['Esaie', 'Ésaïe'], ['Jesus', 'Jésus'], ['Ephesiens', 'Éphésiens'],
  ['Michee', 'Michée'], ['Jeremie', 'Jérémie'], ['Ezechiel', 'Ézéchiel'], ['Nehemie', 'Néhémie'],
  ['Levitique', 'Lévitique'], ['Deuteronome', 'Deutéronome'], ['Josue', 'Josué'],
  ['Ecclesiaste', 'Ecclésiaste'], ['Osee', 'Osée'], ['Timothee', 'Timothée'],
  ['deplier', 'déplier'], ['deplie', 'déplie'], ['replier', 'replier'],
  ['integral', 'intégral'], ['integrale', 'intégrale'], ['integralement', 'intégralement'],
  ['detaillee', 'détaillée'], ['detaille', 'détaillé'], ['redigee', 'rédigée'], ['redige', 'rédigé'],
  ['generation', 'génération'], ['generee', 'générée'], ['genere', 'généré'],
  ['hebdomadaire', 'hebdomadaire'], ['deja', 'déjà'], ['tres', 'très'],
  ['reponse', 'réponse'], ['reponses', 'réponses'], ['Reponse', 'Réponse'],
  ['separation', 'séparation'], 
  ['personnalisee', 'personnalisée'], ['memorisee', 'mémorisée'], ['memorise', 'mémorisé'],
  ['verifiee', 'vérifiée'], ['verifier', 'vérifier'],
  ['selectionnez', 'sélectionnez'],
  ['Decouvrir', 'Découvrir'], ['decouvrir', 'découvrir'], ['decouverte', 'découverte'],
  ['Parcourir', 'Parcourir'], ['passes', 'passés'], ['annotee', 'annotée'],
  ['surlignee', 'surlignée'], ['surligne', 'surligné'], ['enregistree', 'enregistrée'],
  ['enregistrees', 'enregistrées'], ['enregistrer', 'enregistrer'],
  ['theologique', 'théologique'], ['theologie', 'théologie'], ['exegese', 'exégèse'],
  ['hebreu', 'hébreu'], ['Hebreu', 'Hébreu'], ['hebraique', 'hébraïque'],
  ['Etude', 'Étude'], ['Etudes', 'Études'],
  ['etape', 'étape'], ['etapes', 'étapes'], ['Etape', 'Étape'], ['Etapes', 'Étapes'],
  ['Eglise', 'Église'], ['eglise', 'église'], ['Ecriture', 'Écriture'], ['Ecritures', 'Écritures'],
  ['Eternel', 'Éternel'], ['fidelite', 'fidélité'], ['verite', 'vérité'], ['realite', 'réalité'],
  ['liberte', 'liberté'], ['charite', 'charité'], ['humilite', 'humilité'],
  ['misericorde', 'miséricorde'], ['esperance', 'espérance'], ['perseverance', 'persévérance'],
  ['repentance', 'repentance'], ['grace', 'grâce'], ['Grace', 'Grâce'],
  ['peche', 'péché'], ['peches', 'péchés'], ['Peche', 'Péché'],
  ['priez', 'priez'], ['mediter', 'méditer'], ['meditation', 'méditation'],
  ['veillee', 'veillée'], ['journee', 'journée'], ['journees', 'journées'],
  ['annee', 'année'], ['annees', 'années'], ['matinee', 'matinée'], ['soiree', 'soirée'],
  
  /* Volontairement absents : reference, resume, complete, present, duree,
     numero, selection, creation, progression. Ces mots existent aussi comme
     identifiants ou cles de base de donnees dans le code, les accentuer
     casserait l'application. */
  ['Reference', 'Référence'], ['References', 'Références'],
  ['precise', 'précise'], ['precis', 'précis'], ['precision', 'précision'],
  ['completee', 'complétée'], ['completer', 'compléter'],
  ['derniere', 'dernière'], ['dernieres', 'dernières'], ['premiere', 'première'],
  ['premieres', 'premières'], ['entiere', 'entière'], ['maniere', 'manière'],
  ['lumiere', 'lumière'], ['priorite', 'priorité'], ['difficulte', 'difficulté'],
  ['necessaire', 'nécessaire'], ['necessite', 'nécessité'],
  ['problematique', 'problématique'], ['systematique', 'systématique'],
  ['apres', 'après'], ['Apres', 'Après'], ['acces', 'accès'], ['succes', 'succès'],
  ['progres', 'progrès'], ['pres', 'près'], ['aupres', 'auprès'], ['desormais', 'désormais'],
  ['a cote', 'à côté'], ['cote a cote', 'côte à côte'],
  ['ecrire', 'écrire'], ['ecrit', 'écrit'], ['ecrite', 'écrite'], ['ecrits', 'écrits'],
  ['ecoute', 'écoute'], ['ecouter', 'écouter'], ['ecran', 'écran'],
  ['elements', 'éléments'], ['element', 'élément'],
  ['reflexion', 'réflexion'], ['reflexions', 'réflexions'], ['reflechir', 'réfléchir'],
  ['prepare', 'préparé'], ['preparation', 'préparation'], ['preparer', 'préparer'],
  ['presentation', 'présentation'],
  ['interet', 'intérêt'], ['fenetre', 'fenêtre'], ['meme', 'même'], ['memes', 'mêmes'],
  ['etre', 'être'], ['Etre', 'Être'], ['etes', 'êtes'], ['tete', 'tête'],
  ['revenez', 'revenez'], ['revelation', 'révélation'], ['revele', 'révélé']
];

/* Ne jamais toucher a ces lignes : imports, chemins, classes CSS, cles JSON. */
const SKIP = /^\s*(import|export\s+(const|default)?\s*\{|from\s|\/\/|require\()/;

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.tsx', '.ts'].includes(extname(p))) out.push(p);
  }
  return out;
}

let totalFiles = 0, totalFixes = 0;

for (const root of ROOTS) {
  let files;
  try { files = walk(root); } catch { continue; }

  for (const file of files) {
    const original = readFileSync(file, 'utf8');
    const lines = original.split('\n');
    let fixes = 0;

    const next = lines.map(line => {
      if (SKIP.test(line)) return line;
      let out = line;
      for (const [from, to] of WORDS) {
        if (from === to) continue;
        // Mot entier uniquement, et jamais colle a un point (r.resume, obj.meme)
        const re = new RegExp(`(?<![\\w.'\`])${from}(?![\\w'\`])`, 'g');
        const replaced = out.replace(re, () => { fixes++; return to; });
        out = replaced;
      }
      return out;
    }).join('\n');

    if (fixes > 0) {
      totalFiles++; totalFixes += fixes;
      console.log(`${fixes.toString().padStart(4)}  ${file}`);
      if (WRITE) writeFileSync(file, next, 'utf8');
    }
  }
}

console.log(`\n${totalFixes} accents dans ${totalFiles} fichiers.`);
console.log(WRITE
  ? 'Corrections appliquees. Verifie avec : git diff'
  : 'Apercu seulement. Pour appliquer : node scripts/fix-accents.mjs --write');
