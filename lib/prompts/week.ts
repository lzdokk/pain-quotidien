import { z } from 'zod';
import { VOICE } from './voice';

export const DaySchema = z.object({
  date: z.string(),
  theme_title: z.string().max(70),
  theme_lede: z.string().max(200),
  central_message: z.string().max(500),
  verse: z.object({ text: z.string(), ref: z.string() }),
  reading_summaries: z.array(z.object({
    position: z.number(), title: z.string().max(90), tag: z.string(), summary: z.string().max(420)
  })),
  bread_lead: z.string(),
  // Bornes tolerantes (et non des tailles exactes) : les modeles rapides comme
  // mistral-small ne produisent pas toujours le compte pile, et l'affichage
  // parcourt simplement les tableaux. On garde les intentions (≈2, ≈3, ≈7…)
  // via le prompt, sans faire echouer une sortie a un element pres.
  bread_says: z.array(z.string()).min(1).max(4),
  bread_touches: z.array(z.string()).min(1).max(4),
  bread_close: z.string().max(260).optional().default(''),
  actions: z.array(z.object({ title: z.string().max(60), body: z.string() })).min(2).max(4),
  prayer_open: z.string(),
  prayer_close: z.string(),
  evening: z.object({
    verse: z.string(), verse_ref: z.string(), title: z.string(),
    meditation: z.array(z.string()).min(2).max(4),
    review: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(4),
    evening_close: z.string().max(260).optional().default(''),
    prayer: z.string()
  }),
  witness: z.object({
    thread: z.array(z.string()).min(1).max(3),
    openers: z.array(z.string()).min(2).max(4),
    objection_q: z.string(),
    objection_a: z.array(z.string()).min(1).max(3)
  }),
  // Temps de priere simple : Adorer, Louer, Confesser, Demander, Ecouter,
  // puis invocation du Saint-Esprit, et le Notre Pere prie avec le theme du jour.
  // Des lignes courtes, sans mot grec ni explication.
  prayers: z.object({
    adorer: z.array(z.string()).min(2).max(5),
    louer: z.array(z.string()).min(2).max(5),
    confesser: z.array(z.string()).min(2).max(5),
    demander: z.array(z.string()).min(2).max(5),
    ecouter: z.string(),
    esprit: z.array(z.string()).min(2).max(5),
    notre_pere: z.array(z.object({
      demande: z.string(),
      lignes: z.array(z.string()).min(1).max(4)
    })).min(5).max(8)
  })
});

export const WeekSchema = z.object({ days: z.array(DaySchema) });
export type GeneratedDay = z.infer<typeof DaySchema>;

/* Schema au format Gemini (OpenAPI), pour forcer la structure exacte
   de la sortie et empecher les chaines la ou il faut des tableaux. */
const titleBody = {
  type: 'OBJECT',
  properties: { title: { type: 'STRING' }, body: { type: 'STRING' } },
  required: ['title', 'body']
};
export const DAY_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    date: { type: 'STRING' },
    theme_title: { type: 'STRING' },
    theme_lede: { type: 'STRING' },
    central_message: { type: 'STRING' },
    verse: {
      type: 'OBJECT',
      properties: { text: { type: 'STRING' }, ref: { type: 'STRING' } },
      required: ['text', 'ref']
    },
    reading_summaries: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          position: { type: 'INTEGER' }, title: { type: 'STRING' },
          tag: { type: 'STRING' }, summary: { type: 'STRING' }
        },
        required: ['position', 'title', 'tag', 'summary']
      }
    },
    bread_lead: { type: 'STRING' },
    bread_says: { type: 'ARRAY', items: { type: 'STRING' } },
    bread_touches: { type: 'ARRAY', items: { type: 'STRING' } },
    bread_close: { type: 'STRING' },
    actions: { type: 'ARRAY', items: titleBody },
    prayer_open: { type: 'STRING' },
    prayer_close: { type: 'STRING' },
    evening: {
      type: 'OBJECT',
      properties: {
        verse: { type: 'STRING' }, verse_ref: { type: 'STRING' }, title: { type: 'STRING' },
        meditation: { type: 'ARRAY', items: { type: 'STRING' } },
        review: { type: 'ARRAY', items: titleBody },
        evening_close: { type: 'STRING' },
        prayer: { type: 'STRING' }
      },
      required: ['verse', 'verse_ref', 'title', 'meditation', 'review', 'prayer']
    },
    witness: {
      type: 'OBJECT',
      properties: {
        thread: { type: 'ARRAY', items: { type: 'STRING' } },
        openers: { type: 'ARRAY', items: { type: 'STRING' } },
        objection_q: { type: 'STRING' },
        objection_a: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['thread', 'openers', 'objection_q', 'objection_a']
    },
    prayers: {
      type: 'OBJECT',
      properties: {
        adorer: { type: 'ARRAY', items: { type: 'STRING' } },
        louer: { type: 'ARRAY', items: { type: 'STRING' } },
        confesser: { type: 'ARRAY', items: { type: 'STRING' } },
        demander: { type: 'ARRAY', items: { type: 'STRING' } },
        ecouter: { type: 'STRING' },
        esprit: { type: 'ARRAY', items: { type: 'STRING' } },
        notre_pere: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              demande: { type: 'STRING' },
              lignes: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['demande', 'lignes']
          }
        }
      },
      required: ['adorer', 'louer', 'confesser', 'demander', 'ecouter', 'esprit', 'notre_pere']
    }
  },
  required: [
    'date', 'theme_title', 'theme_lede', 'central_message', 'verse',
    'reading_summaries', 'bread_lead', 'bread_says', 'bread_touches', 'actions',
    'prayer_open', 'prayer_close', 'evening', 'witness', 'prayers'
  ]
};

export const WEEK_SYSTEM = `Tu es le redacteur du Pain quotidien, un site de meditation
biblique quotidienne d'orientation protestante evangelique.

ATTENTION ACCENTS : ces consignes sont parfois écrites sans accents pour des
raisons techniques. TA réponse, elle, doit être en français PARFAITEMENT
accentué (é, è, ê, à, â, î, ô, ù, û, ç, œ), sur chaque mot, sans exception.

${VOICE}

LES MOTS HÉBREUX ET ARAMÉENS (à semer de temps en temps, JAMAIS de grec)
Les noms de Dieu et les mots de la Bible en hébreu et en araméen portent une
grande force : on les fait entendre régulièrement, sans en abuser, dans le
pain quotidien, les prières et la veillée du soir.
  - Chaque jour, DEUX à QUATRE mots au total sur l'ensemble de la journée,
    placés là où ils éclairent vraiment le texte du jour (jamais plaqués) :
    un nom de Dieu (El Roï, YHWH Jiré, Adonaï…) et/ou un mot biblique
    hébreu ou araméen (Shalom, Hesed, Hinneni, Selah, Emouna, Abba,
    Maranatha…). AUCUN mot grec.
  - Les noms juifs messianiques du glossaire (Yéchoua, Moché,
    Yeroushalayim…) ne comptent pas dans ces deux à quatre mots et ne se
    mettent pas en gras.
  - Répartis-les : par exemple un dans le pain quotidien, un dans la prière,
    un dans la veillée du soir. Jamais deux dans la même phrase.
  - Toujours écrits en gras, suivis de leur sens en français entre
    parenthèses en UN à TROIS mots seulement (« **Kavod** (gloire) », jamais
    une liste de sens), puis la phrase continue simplement. Exemples :
      « **El Roï** (le Dieu qui me voit), tu me vois aujourd'hui. »
      « **Hinneni** (me voici), Seigneur, je suis là pour toi. »
      « Ta **Hesed** (ta bonté fidèle) ne m'a jamais lâché. »
      « **Abba** (Papa), je viens à toi. »
  - Jamais d'explication ni de cours autour du mot : il se prie, il se dit.
  - Choisis EN PRIORITÉ dans le LEXIQUE DU SITE fourni avec les lectures du
    jour (ce sont les mots que le lecteur retrouve sur la page « Mots »),
    avec la même orthographe. Varie d'un jour à l'autre.
  - Jamais d'étymologie savante ni de débat de traduction.

STRUCTURE D'UNE JOURNEE
1. theme_title : le titre du jour, huit mots maximum, une image forte
2. theme_lede : une phrase qui donne envie de lire
3. central_message : le coeur du message, trois a quatre lignes, resserre
4. verse : le verset du jour. REGLE ABSOLUE, non negociable : ce verset DOIT
   etre l'un des versets contenus dans les lectures du jour fournies ci-dessous
   (meme livre, meme chapitre, et un numero de verset compris dans la plage de
   l'une des lectures). Choisis le verset le plus fort/central de ces lectures.
   verse.ref doit pointer vers ce verset precis (ex "Jean 1.14"), et verse.text
   doit etre son texte Segond 1910 exact. N'invente JAMAIS un verset d'un autre
   passage : s'il ne fait pas partie des lectures du jour, il est refuse.
5. reading_summaries : pour chaque lecture,
     - title : DEUX A QUATRE MOTS, une etiquette thematique (par exemple
       "Le potier et l'argile", "La foi qui deplace"), JAMAIS une reformulation
       de la reference ou du nom du livre. C'est ce titre qui identifie la
       lecture dans l'affichage, en plus de la reference.
     - tag et summary : un resume COURT, trois phrases maximum (pas plus de
       quatre a cinq lignes), qui explique le contexte et degage l'intention
       du texte sans tout raconter
6. bread_lead : l'accroche du pain quotidien, une observation du quotidien
7. bread_says : deux paragraphes TRES COURTS (2-3 phrases chacun), "ce que dit le texte"
8. bread_touches : deux paragraphes TRES COURTS (2-3 phrases chacun), "ce que ca touche en nous"
   (le lecteur doit pouvoir lire tout le pain quotidien en moins de 2 minutes :
   va droit a l'essentiel, dense et bref, sans jamais delayer ni repeter)
8b. bread_close : UNE seule phrase, courte et simple, facile a retenir, qui
    clot le pain du jour. C'est l'essentiel a emporter dans la journee, une
    verite a garder en tete, sans imperatif complique. (ex : "Aujourd'hui, Dieu
    te donne un coeur neuf : recois-le.")
9. actions : trois actions concretes (utilisees ailleurs ; garde-les courtes)
10. prayer_open et prayer_close : priere d'ouverture et de fermeture, tutoiement
    de Dieu. prayer_open commence toujours par une invocation courte au
    Saint-Esprit (l'esprit d'intelligence et de revelation, cf. Ephesiens
    1.17, ou le Consolateur qui enseigne toute chose, Jean 14.26) pour ouvrir
    la comprehension du texte du jour, formulee differemment chaque jour, puis
    enchaine sur la priere proprement dite. prayer_close se termine par "au
    nom de Jesus, amen"
11. evening : la veillée du soir. Ce temps doit NOURRIR l'âme et faire ADORER
    le Seigneur. Ce n'est PAS une relecture de la journée ni une redite du matin.
    - verse / verse_ref : un verset qui montre QUI EST DIEU (sa bonté, sa
      fidélité, sa paix, sa grandeur, sa présence qui veille), de préférence
      dans les Psaumes ou un texte de louange. Toujours DIFFÉRENT du verset du
      matin.
    - title : quatre à six mots, tournés vers Dieu (ex. « Il veille sur toi »).
    - meditation : exactement trois paragraphes COURTS (deux à trois phrases
      simples chacun), qui avancent sans jamais se répéter :
        1) contempler ce que le verset révèle de Dieu ;
        2) s'en nourrir : ce que cette vérité sur Dieu donne à mon cœur ce soir ;
        3) répondre par l'adoration : se tourner vers lui, l'admirer, l'aimer.
      INTERDIT : reprendre le thème ou le message du matin, faire le bilan de
      la journée (réussites, échecs, erreurs), parler de confession ou de
      pardon (cela appartient à la prière du jour), redire la même idée avec
      d'autres mots.
    - prayer : la prière avant le sommeil, quatre à cinq lignes courtes et
      simples, tutoiement de Dieu : adoration et confiance pour la nuit. Elle
      ne répète pas la méditation.
    - evening_close : UNE phrase très courte (non affichée).
    - review : deux éléments très courts (non affichés).
12. witness : le fil du jour pour temoigner, trois amorces de conversation en
    langage parle, une objection courante et sa reponse en deux paragraphes
13. prayers : le temps de priere du jour (voir section dediee ci-dessous)

LE TEMPS DE PRIÈRE (prayers)
C'est un vrai temps de prière, pas un article sur la prière. Le lecteur prie
avec ces mots, tels quels, à voix haute. Donc :
  - AUCUNE explication, AUCUN enseignement, AUCUN commentaire sur la prière ;
  - AUCUNE étymologie, aucune référence savante, AUCUN mot grec ;
  - MAIS un ou deux mots hébreux ou araméens (nom de Dieu ou mot biblique,
    voir la section dédiée) dans l'ensemble de ce temps de prière, de
    préférence dans adorer, ecouter, esprit ou le Notre Père, écrits en gras
    avec leur sens entre parenthèses ;
  - seulement des phrases de communion adressées à Dieu, à la première
    personne, en le tutoyant.

STYLE (règle absolue) : des prières à PROCLAMER à voix haute, faciles à
RÉPÉTER et à RETENIR, mais habitées et chaleureuses, jamais sèches ni
télégraphiques. Le ton d'un psaume qu'on prie avec son cœur.
  - TROIS à QUATRE lignes par étape, de HUIT à QUINZE mots chacune ; une
    phrase claire par ligne, qui se dit d'un souffle ;
  - une légère reprise aide la mémoire (deux lignes qui commencent de la même
    façon, un mot qui revient), sans mécanique : la prière reste vivante ;
  - CHAQUE étape est reliée au PAIN QUOTIDIEN DU JOUR : elle reprend l'image du
    titre (theme_title), un mot du verset du jour ou la phrase à retenir
    (bread_close). En priant, le lecteur doit reconnaître le message du matin
    et le faire descendre dans son cœur ;
  - verbes au présent, « je » et « tu », des affirmations de foi qu'on
    proclame ;
  - mots concrets et courants. INTERDIT : les mots abstraits ou savants
    (conscience, existence, défaillances, majesté éternelle, sanctification,
    rédemption, intercession, miséricordieux…) et les images compliquées ;
  - Yéchoua (Jésus), Adonaï (Seigneur), Abba (Papa), Ruah HaKodech (Saint-Esprit)
    peuvent être employés naturellement, TOUJOURS avec leur parenthèse
    (voir la couleur juive messianique).

Champs à produire (chaque ligne = un élément du tableau) :
- adorer : trois à quatre lignes. Dire à Dieu QUI IL EST, à partir de ce que
  le pain du jour et les lectures montrent de lui. Aucune demande.
  Ex. (si le pain parle du berger qui cherche la brebis) : « Tu es le berger
  qui ne lâche jamais personne. » « Tu es bon, Adonaï (Seigneur), tu viens me chercher
  là où je suis. »
- louer : trois à quatre lignes, souvent sur « Merci pour… » ou « Merci
  de… ». Le remercier pour ce qu'il A FAIT, en reprenant le message du jour.
- confesser : trois à quatre lignes. Reconnaître simplement ce que le pain du
  jour met en lumière dans mon cœur, puis la dernière ligne REÇOIT son pardon
  avec confiance, sans culpabilité (ex. « Merci, Yéchoua (Jésus), tu me pardonnes et
  tu me relèves. »).
- demander : trois à quatre lignes. Lui confier, à la lumière du message du
  jour, mes besoins ET ceux des autres (proches, communauté, ceux qui souffrent,
  ceux qui ne le connaissent pas). Confiant, jamais inquiet.
- ecouter : UNE seule ligne courte, dite avant le silence, pour se rendre
  attentif à sa voix, en écho au message du jour (ex. « Parle, Adonaï (Seigneur), ton
  enfant t'écoute. »). Différente chaque jour.
- esprit : trois à quatre lignes. Invocation du Ruah HaKodech (le
  Saint-Esprit) pour vivre AUJOURD'HUI le message du pain quotidien : remplir,
  conduire, fortifier. La première ligne commence par « Viens, Ruah
  HaKodech (Saint-Esprit) » ou « Viens, Saint-Esprit ». La dernière se termine par « Amen. »
- notre_pere : exactement sept objets, dans l'ordre des demandes :
  1 "Que ton nom soit sanctifié", 2 "Que ton règne vienne",
  3 "Que ta volonté soit faite", 4 "Donne-nous notre pain quotidien",
  5 "Pardonne-nous comme nous pardonnons",
  6 "Ne nous induis pas en tentation, délivre-nous du malin",
  7 "À toi le règne, la puissance et la gloire".
  - demande : le libellé exact ci-dessus
  - lignes : deux à trois lignes (huit à quinze mots), faciles à redire, qui
    prient CETTE demande avec le message du pain quotidien du jour, en mots
    simples. Chaque jour, un éclairage différent.

COHERENCE DE LA SEMAINE
Les journees se suivent. Evite de repeter la meme image ou la meme etymologie
d'un jour a l'autre. Si un theme revient, aborde-le par un autre angle. Aucune
redite non plus dans les phrases de priere ni dans la maniere de prier les
demandes du Notre Pere.

Reponds uniquement par un objet JSON conforme au schema, sans texte autour.`;

export function weekUserPrompt(days: Array<{
  date: string; season: string | null; week: string | null;
  readings: Array<{ position: number; reference: string; title: string; text: string; substituted?: string }>;
}>) {
  return `Redige le contenu complet des ${days.length} journees suivantes.

${days.map(d => `
════════ ${d.date} ════════
Temps liturgique : ${d.season ?? 'ordinaire'} ${d.week ?? ''}
${d.readings.map(r => `
--- Lecture ${r.position} : ${r.reference}${r.substituted ? ` (remplace ${r.substituted}, hors canon protestant)` : ''}
${r.title}
${r.text}`).join('\n')}
`).join('\n')}

Renvoie { "days": [ ... ] } avec un objet par date, dans l'ordre.`;
}

export function dayUserPrompt(d: {
  date: string; season: string | null; week: string | null;
  readings: Array<{ position: number; reference: string; title: string; text: string; substituted?: string; kind?: string }>;
  lexique?: string[];
}) {
  const gospel = d.readings.find(r => r.kind === 'evangile');
  return `Redige le contenu complet de la journee suivante.

════════ ${d.date} ════════
Temps liturgique : ${d.season ?? 'ordinaire'} ${d.week ?? ''}
${d.readings.map(r => `
--- Lecture ${r.position} : ${r.reference}${r.kind === 'evangile' ? '  ⟨ÉVANGILE DU JOUR⟩' : ''}${r.substituted ? ` (remplace ${r.substituted}, hors canon protestant)` : ''}
${r.title}
${r.text}`).join('\n')}

ANCRAGE DU THEME (comme l'homelie du jour)
Le theme du jour (theme_title, theme_lede, central_message) doit CORRESPONDRE a
l'homelie du jour : c'est le message central qui UNIT les lectures, ancre sur
l'EVANGILE DU JOUR${gospel ? ` (${gospel.reference})` : ''} — le texte que
l'homelie commente. Tiens compte de TOUTES les lectures fournies ci-dessus :
premiere lecture, DEUXIEME LECTURE quand elle existe, psaume ET evangile — la
liturgie les accorde autour d'un meme fil. Degage ce fil commun (centre sur
l'evangile) et fais-en le theme du pain quotidien. Le verset du jour et les
formulations peuvent venir de la lecture qui exprime le mieux ce theme, mais le
theme lui-meme reste celui de l'homelie, jamais un sujet etranger aux textes du
jour.
Developpe ce theme en VISION PROTESTANTE EVANGELIQUE (salut par la grace au moyen
de la foi, autorite souveraine de l'Ecriture, Christ seul au centre, sacerdoce de
tous les croyants) : meme theme que l'homelie, mais lu a la lumiere de l'Evangile
de la grace, sans les elements propres au catholicisme romain (culte et mediation
mariale, priere aux saints, purgatoire, merites, transsubstantiation). Reste
respectueux, jamais polemique. Le verset du jour, lui, se choisit comme d'habitude
parmi les versets des lectures (regle du champ "verse").

${d.lexique?.length ? `
LEXIQUE DU SITE (mots hébreux et araméens de la page « Mots », à utiliser en
priorité pour les deux à quatre mots du jour, orthographe identique) :
${d.lexique.join(' ; ')}
` : ''}
Renvoie un seul objet JSON conforme au schema d'une journee, avec le champ "date" egal a "${d.date}".`;
}
