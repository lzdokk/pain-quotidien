import Link from 'next/link';
import { contentDate } from '@/lib/date';
import { supabasePublic } from '@/lib/supabase/public';
import { polishDeep } from '@/lib/accents';
import { rich } from '@/lib/rich';
import ResumeReading from '@/components/ResumeReading';
import RefChip from '@/components/RefChip';
import DayNav from '@/components/DayNav';

/* Les phrases du Notre Père (Matthieu 6.9-13, Segond 1910), dans l'ordre. */
const NP: Record<string, string> = {
  pere: 'Notre Père qui es aux cieux !',
  nom: 'Que ton nom soit sanctifié ;',
  regne: 'Que ton règne vienne ;',
  volonte: 'Que ta volonté soit faite sur la terre comme au ciel.',
  pain: 'Donne-nous aujourd’hui notre pain quotidien ;',
  pardon: 'Pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés ;',
  mal: 'Ne nous induis pas en tentation, mais délivre-nous du malin.',
  gloire: 'Car c’est à toi qu’appartiennent, dans tous les siècles, le règne, la puissance et la gloire.',
  amen: 'Amen.'
};

/* Une proclamation : le verset (Segond 1910, domaine public) et ce que
   je proclame pour moi, à la première personne. Une par moment, qui
   change chaque jour. */
type Proc = { t: string; r: string; a: string };

type Moment = {
  id: string; cls: string; t: string; s: string; np?: string[];
  /** Lignes du jour : une ouverture, trois lignes du corps, une clôture,
      tirées chaque jour dans ces listes (la prière change tous les jours). */
  ouv: string[]; corps: string[]; clot: string[]; parole: Proc[]; fin?: string;
};

const MOMENTS: Moment[] = [
  {
    id: 'inviter', cls: 'ph-seuil', t: 'Inviter l’Esprit', s: 'Me tourner vers lui avant de parler',
    ouv: [
      'Saint-Esprit, viens. Sois là.',
      'Esprit Saint, je t’ouvre la porte de mon cœur.',
      'Viens, Esprit de Dieu, souffle de vie.',
      'Saint-Esprit, je t’accueille en ce moment.',
      'Père céleste, je viens à toi avec confiance et humilité : envoie ton Esprit.',
      'Abba, Père, je te cherche en esprit et en vérité.'
    ],
    corps: [
      'Je me tourne vers toi, et je laisse derrière moi le bruit de ma journée.',
      'Remplis ce moment de ta présence.',
      'Ouvre mes yeux, mon cœur et mon intelligence.',
      'Calme mes pensées agitées, et rends-moi attentif à toi.',
      'J’élève mon cœur vers toi, Dieu vivant, source de mon espérance.',
      'Me voici devant ton trône de grâce, tel que je suis.',
      'Viens raviver en moi la flamme du premier amour.',
      'Éloigne de moi la distraction et la précipitation.',
      'Dieu fidèle, je viens à toi avec foi.',
      'Souffle sur ce qui est sec en moi, et rends-le vivant.',
      'Fais de ce temps une vraie rencontre, pas un monologue.',
      'Je te reconnais comme mon guide pour ce jour.'
    ],
    clot: [
      'Quand je ne sais pas quoi dire, prie en moi.',
      'Apprends-moi à prier, comme Jésus l’a appris à ses disciples.',
      'Conduis ma prière, du premier mot jusqu’au silence.',
      'Prie en moi, Esprit Saint, mieux que je ne saurais le faire.'
    ],
    parole: [
      { t: 'L’Esprit nous aide dans notre faiblesse, car nous ne savons pas ce qu’il nous convient de demander dans nos prières.', r: 'Rm 8.26', a: 'Je ne prie pas seul : ton Esprit prie en moi.' },
      { t: '… à combien plus forte raison le Père céleste donnera-t-il le Saint-Esprit à ceux qui le lui demandent.', r: 'Lc 11.13', a: 'Je te le demande, Père, et je le reçois.' },
      { t: 'Le consolateur, l’Esprit-Saint, que le Père enverra en mon nom, vous enseignera toutes choses, et vous rappellera tout ce que je vous ai dit.', r: 'Jn 14.26', a: 'Esprit Saint, enseigne-moi, et rappelle-moi les paroles de Jésus.' },
      { t: 'Quand le consolateur sera venu, l’Esprit de vérité, il vous conduira dans toute la vérité.', r: 'Jn 16.13', a: 'Conduis-moi dans toute la vérité.' },
      { t: 'Ouvre mes yeux, pour que je contemple les merveilles de ta loi !', r: 'Ps 119.18', a: 'Ouvre mes yeux : je veux te voir dans ta Parole.' },
      { t: 'Si nous vivons par l’Esprit, marchons aussi selon l’Esprit.', r: 'Ga 5.25', a: 'Je vis par l’Esprit : aujourd’hui, je veux marcher selon l’Esprit.' },
      { t: 'Vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins.', r: 'Ac 1.8', a: 'Je reçois ta puissance, pour être ton témoin aujourd’hui.' }
    ]
  },
  {
    id: 'adorer', cls: 'ph-adoration', t: 'Adorer', s: 'Dire à Dieu qui il est',
    np: ['pere', 'nom'],
    ouv: [
      'Père, tu es le Dieu vivant, saint et fidèle.',
      'Tu es saint, saint, saint, digne de toute louange.',
      'Seigneur, ta majesté dépasse tout ce que je peux imaginer.',
      'Tu es le Dieu éternel, incomparable dans ta grandeur.',
      'Abba, Père, ton nom est saint.'
    ],
    corps: [
      'Tu es le rocher sur qui je peux toujours compter.',
      'Tu étais là avant toutes choses, et tu règnes pour toujours.',
      'Ta bonté ne change jamais.',
      'Tu règnes avec justice et vérité.',
      'Ta sagesse éclaire mes ténèbres.',
      'Tu es fidèle du matin jusqu’au soir.',
      'Tu es le Dieu d’amour, lent à la colère et riche en grâce.',
      'Tu es l’Alpha et l’Oméga, le commencement et la fin.',
      'Rien n’est impossible pour toi.',
      'Tu es le Créateur du ciel et de la terre, et tu connais mon nom.',
      'Ton amour renouvelle toutes choses.',
      'Tu es mon refuge et ma force, un secours toujours présent.'
    ],
    clot: [
      'Ton nom est au-dessus de tout nom.',
      'Je t’adore, non pour ce que tu donnes, mais pour ce que tu es.',
      'Gloire à toi, qui fais toutes choses nouvelles.',
      'Que ton nom soit honoré dans ma vie aujourd’hui.'
    ],
    parole: [
      { t: 'Tu es digne, notre Seigneur et notre Dieu, de recevoir la gloire et l’honneur et la puissance ; car tu as créé toutes choses.', r: 'Ap 4.11', a: 'Tu es digne, et je te donne la première place.' },
      { t: 'Éternel, mon rocher, ma forteresse, mon libérateur ! Mon Dieu, mon rocher, où je trouve un abri !', r: 'Ps 18.3', a: 'Tu es mon rocher et ma forteresse : en toi, je suis à l’abri.' },
      { t: 'Saint, saint, saint est l’Éternel des armées ! toute la terre est pleine de sa gloire !', r: 'Es 6.3', a: 'Avec les anges, je le proclame : tu es saint.' },
      { t: 'Venez, prosternons-nous et humilions-nous, fléchissons le genou devant l’Éternel, notre créateur !', r: 'Ps 95.6', a: 'Je fléchis le genou devant toi, mon Créateur.' },
      { t: 'Dieu est Esprit, et il faut que ceux qui l’adorent l’adorent en esprit et en vérité.', r: 'Jn 4.24', a: 'Je veux t’adorer en esprit et en vérité.' },
      { t: 'L’Éternel est grand et très digne de louange, et sa grandeur est insondable.', r: 'Ps 145.3', a: 'Ta grandeur me dépasse, et je m’y abandonne.' },
      { t: 'L’Éternel, l’Éternel, Dieu miséricordieux et compatissant, lent à la colère, riche en bonté et en fidélité.', r: 'Ex 34.6', a: 'Tu es riche en bonté et en fidélité envers moi.' }
    ]
  },
  {
    id: 'louer', cls: 'ph-louange', t: 'Louer', s: 'Le remercier pour ce qu’il a fait',
    np: ['regne', 'volonte'],
    ouv: [
      'Merci pour cette journée, et pour ce nouveau matin.',
      'Merci, Père, pour ton amour sans condition.',
      'Merci pour ta présence fidèle à mes côtés.',
      'Je te loue, Seigneur, de tout mon cœur.',
      'Merci pour chaque souffle, chaque sourire, chaque paix.'
    ],
    corps: [
      'Merci pour la santé, pour un toit, pour les visages que j’aime.',
      'Merci pour la grâce de respirer, de voir le soleil se lever.',
      'Merci pour les bénédictions reçues et les leçons apprises.',
      'Merci pour les portes que tu ouvres, et pour celles que tu fermes par amour.',
      'Merci pour ta Parole qui éclaire ma route.',
      'Merci pour ceux qui partagent ma vie et ma foi.',
      'Je te loue pour les miracles visibles et invisibles.',
      'Merci pour le pain de ce jour, et la paix dans mon foyer.',
      'Merci pour ta main tendue, même dans l’épreuve.',
      'Merci pour ce que tu as fait hier, et pour ce que tu feras demain.',
      'Merci pour tes promesses qui ne passent pas.',
      'Merci de m’avoir cherché quand je ne te cherchais pas.'
    ],
    clot: [
      'Merci de m’avoir donné de te connaître.',
      'Merci pour Yéchoua (Jésus), mon Sauveur, et pour ta fidélité qui ne s’arrête jamais.',
      'Que ma vie entière devienne une louange.',
      'Merci, car tu es bon, et ta bonté dure à toujours.'
    ],
    parole: [
      { t: 'Les bontés de l’Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin. Oh ! que ta fidélité est grande !', r: 'Lm 3.22-23', a: 'Ce matin encore, ta bonté est nouvelle pour moi.' },
      { t: 'Mon âme, bénis l’Éternel, et n’oublie aucun de ses bienfaits !', r: 'Ps 103.2', a: 'Je n’oublie aucun de tes bienfaits.' },
      { t: 'C’est ici la journée que l’Éternel a faite : qu’elle soit pour nous un sujet d’allégresse et de joie !', r: 'Ps 118.24', a: 'Cette journée vient de toi : je choisis de m’en réjouir.' },
      { t: 'Louez l’Éternel, car il est bon, car sa miséricorde dure à toujours !', r: 'Ps 136.1', a: 'Tu es bon, et ta miséricorde dure pour moi à toujours.' },
      { t: 'Rendez grâces en toutes choses, car c’est à votre égard la volonté de Dieu en Jésus-Christ.', r: '1 Th 5.18', a: 'Je te rends grâces en toutes choses, même dans ce que je ne comprends pas.' },
      { t: 'Toute grâce excellente et tout don parfait descendent d’en haut, du Père des lumières.', r: 'Jc 1.17', a: 'Tout ce que j’ai de bon vient de toi.' },
      { t: 'Je bénirai l’Éternel en tout temps ; sa louange sera toujours dans ma bouche.', r: 'Ps 34.2', a: 'Ta louange sera toujours dans ma bouche.' }
    ]
  },
  {
    id: 'demander', cls: 'ph-intercession', t: 'Demander', s: 'Pour moi, et pour les autres',
    np: ['pain'],
    ouv: [
      'Père, je te confie mon pain de ce jour : mon travail, mon foyer, la santé des miens.',
      'Seigneur, je viens à toi avec mes besoins, petits et grands.',
      'Père, tu sais ce dont j’ai besoin avant même que je le demande.',
      'Je te présente ma journée, avec tout ce qu’elle porte.'
    ],
    corps: [
      'Donne-moi la force pour aujourd’hui, et la patience qui me manque.',
      'Donne-moi la paix quand tout s’agite.',
      'Nourris aussi mon âme de ta Parole.',
      'Console ceux qui pleurent aujourd’hui.',
      'Soutiens les malades, les personnes seules et les persécutés.',
      'Fortifie ceux qui doutent, et relève ceux qui tombent.',
      'Viens dans les cœurs brisés et les familles divisées.',
      'Éclaire ceux qui dirigent, pour qu’ils agissent avec justice.',
      'Touche les cœurs éloignés, et appelle-les à toi.',
      'Répands ta paix là où règnent la guerre et la tension.',
      'Bénis les Églises et ceux qui annoncent ta Parole.',
      'Sois proche des orphelins, des veuves et des étrangers.',
      'Protège mon corps, mon esprit et mon foyer.',
      'Je te présente ceux que j’aime, et même ceux qui me font du tort.'
    ],
    clot: [
      'Viens secourir ceux qui traversent l’épreuve.',
      'Réponds aux prières secrètes de tes enfants.',
      'Je dépose tout cela entre tes mains sûres.',
      'Je te fais confiance : tu pourvois.'
    ],
    parole: [
      { t: 'Mon Dieu pourvoira à tous vos besoins selon sa richesse, avec gloire, en Jésus-Christ.', r: 'Ph 4.19', a: 'Tu pourvois à tous mes besoins : je te fais confiance.' },
      { t: 'L’homme ne vivra pas de pain seulement, mais de toute parole qui sort de la bouche de Dieu.', r: 'Mt 4.4', a: 'Nourris mon corps, et nourris mon âme de ta Parole.' },
      { t: 'Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.', r: 'Ph 4.6', a: 'Je ne m’inquiète de rien : je te confie tout, avec reconnaissance.' },
      { t: 'Demandez, et l’on vous donnera ; cherchez, et vous trouverez ; frappez, et l’on vous ouvrira.', r: 'Mt 7.7', a: 'Je demande, je cherche, je frappe : tu m’ouvriras.' },
      { t: 'L’Éternel est mon berger : je ne manquerai de rien.', r: 'Ps 23.1', a: 'Tu es mon berger : je ne manquerai de rien.' },
      { t: 'Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.', r: '1 P 5.7', a: 'Je décharge sur toi tous mes soucis, car tu prends soin de moi.' },
      { t: 'Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus.', r: 'Mt 6.33', a: 'Je cherche d’abord ton royaume ; le reste, je te le confie.' }
    ]
  },
  {
    id: 'confesser', cls: 'ph-confesser', t: 'Confesser', s: 'Déposer mes fautes, recevoir son pardon',
    np: ['pardon', 'mal'],
    ouv: [
      'Seigneur, je viens à toi tel que je suis.',
      'Père, je reconnais mes erreurs et je me repens.',
      'Aie pitié de moi, Seigneur, selon ta bonté.',
      'Je dépose devant toi ce qui pèse sur ma conscience.'
    ],
    corps: [
      'Pardonne-moi ce qui n’a pas été juste : mes paroles, mes pensées, mes silences.',
      'Pardonne-moi d’avoir été distrait de ta présence.',
      'J’ai manqué d’amour : purifie mon cœur.',
      'Pardonne-moi les occasions manquées d’aimer.',
      'Pardonne mes jugements hâtifs et mes paroles blessantes.',
      'Je regrette mes attitudes égoïstes.',
      'Lave-moi de mes fautes, et restaure ma communion avec toi.',
      'Et moi aussi, je pardonne à ceux qui m’ont blessé : je dépose ma rancune devant toi.',
      'Renouvelle en moi un esprit bien disposé.',
      'Pardonne-moi mes colères et mes impatiences.',
      'Garde-moi de la tentation, délivre-moi du malin.',
      'Préserve-moi des pièges de l’ennemi.'
    ],
    clot: [
      'Merci, Jésus, de me relever et de me rendre léger.',
      'Relève-moi, et je marcherai de nouveau avec toi.',
      'Merci pour ton pardon, plus grand que ma faute.',
      'Je reçois ta grâce, et je repars en paix.'
    ],
    parole: [
      { t: 'Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.', r: '1 Jn 1.9', a: 'Je confesse mes fautes, et je reçois ton pardon.' },
      { t: 'Autant l’orient est éloigné de l’occident, autant il éloigne de nous nos transgressions.', r: 'Ps 103.12', a: 'Mes fautes sont loin de moi : tu les as éloignées.' },
      { t: 'Ô Dieu ! crée en moi un cœur pur, renouvelle en moi un esprit bien disposé.', r: 'Ps 51.12', a: 'Crée en moi un cœur pur.' },
      { t: 'Il n’y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ.', r: 'Rm 8.1', a: 'En Jésus, je ne suis plus condamné.' },
      { t: 'Dieu, qui est fidèle, ne permettra pas que vous soyez tentés au delà de vos forces ; mais avec la tentation il préparera aussi le moyen d’en sortir.', r: '1 Co 10.13', a: 'Tu es fidèle : dans la tentation, tu me donnes une issue.' },
      { t: 'Si vos péchés sont comme le cramoisi, ils deviendront blancs comme la neige.', r: 'Es 1.18', a: 'Tu me rends blanc comme la neige.' },
      { t: 'Le Seigneur est fidèle, il vous affermira et vous préservera du malin.', r: '2 Th 3.3', a: 'Tu m’affermis, et tu me gardes du malin.' }
    ]
  },
  {
    id: 'ecouter', cls: 'ph-ecouter', t: 'Écouter', s: 'Lâcher prise, et me taire devant lui',
    ouv: [
      'Seigneur, je lâche le contrôle.',
      'Je te remets mes pensées, mes projets et mon repos.',
      'Mon cœur t’appartient, Seigneur : fais-en ta demeure.',
      'Me voici, Seigneur, sans rien à prouver.'
    ],
    corps: [
      'Je te remets mes projets, mes peurs et mes attentes.',
      'Que ta volonté soit faite, et non la mienne.',
      'Que mes paroles et mes gestes te glorifient aujourd’hui.',
      'Je veux marcher dans ta volonté, chaque jour.',
      'Prends mes mains, mes pieds, ma vie pour ton service.',
      'Sois ma priorité en toute chose.',
      'Je te consacre ma famille, mon foyer et mes relations.',
      'Je veux vivre pour toi et par toi.',
      'Que mes rêves soient guidés par ton Esprit.',
      'Je fais taire en moi tout ce qui n’est pas toi.'
    ],
    clot: [
      'Je me tais devant toi. Parle, Seigneur, ton serviteur écoute.',
      'Parle, Seigneur, ton serviteur écoute.',
      'J’attends ta voix, dans le silence.'
    ],
    parole: [
      { t: 'Arrêtez, et sachez que je suis Dieu.', r: 'Ps 46.11', a: 'Je m’arrête, et je sais que tu es Dieu.' },
      { t: 'Mes brebis entendent ma voix ; je les connais, et elles me suivent.', r: 'Jn 10.27', a: 'Je suis ta brebis : j’entends ta voix, et je te suis.' },
      { t: 'C’est dans la tranquillité et le repos que sera votre salut, c’est dans le calme et la confiance que sera votre force.', r: 'Es 30.15', a: 'Dans le calme et la confiance, je trouve ma force.' },
      { t: 'Oui, c’est en Dieu que mon âme se confie ; de lui vient mon salut.', r: 'Ps 62.2', a: 'Mon âme se confie en toi seul.' },
      { t: 'Père, si tu voulais éloigner de moi cette coupe ! Toutefois, que ma volonté ne se fasse pas, mais la tienne.', r: 'Lc 22.42', a: 'Comme Jésus, je te dis : que ta volonté se fasse, et non la mienne.' },
      { t: 'Garde le silence devant l’Éternel, et espère en lui.', r: 'Ps 37.7', a: 'Je garde le silence devant toi, et j’espère en toi.' }
    ],
    fin: 'Puis le silence.'
  }
];

/* Numéro du jour : la proclamation change chaque jour, et pas la même
   « place » dans chaque liste pour varier les combinaisons. */
const dayNumber = (iso: string) => Math.floor(Date.parse(`${iso}T12:00:00Z`) / 86400000);

/* Tirage déterministe : le même jour donne la même prière pour tout le monde,
   le lendemain une autre combinaison. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(list: T[], n: number, r: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

/* Découpe un texte en lignes (une phrase par ligne). */
const toLines = (t?: string | null): string[] =>
  (t ?? '').split(/\n+|(?<=[.!?…])\s+(?=[A-ZÀÂÉÈÊÎÔÛÇ«])/).map(x => x.trim()).filter(Boolean);

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const dateFr = (iso: string) => {
  const [y, m, dd] = iso.split('-').map(Number);
  const w = new Date(Date.UTC(y, m - 1, dd)).getUTCDay();
  return `${JOURS[w]} ${dd} ${MOIS[m - 1]}`;
};

/**
 * La prière du jour choisi : chaque moment prie avec le THÈME de ce jour
 * (lignes écrites avec le pain quotidien du jour), et la Parole proclamée
 * change chaque jour. Sans pain publié ce jour-là : prières de secours.
 */
export default async function PriereView({ date }: { date?: string }) {
  const sb = await supabasePublic();
  const today = contentDate();
  const cols = 'date, theme_title, prayer_axes, spirit_invitation';
  let day: any = null;
  if (date) {
    ({ data: day } = await sb.from('daily_bread').select(cols).eq('date', date).eq('published', true).maybeSingle());
  } else {
    ({ data: day } = await sb.from('daily_bread').select(cols).eq('date', today).eq('published', true).maybeSingle());
    if (!day) {
      ({ data: day } = await sb.from('daily_bread').select(cols).eq('published', true).lte('date', today)
        .order('date', { ascending: false }).limit(1).maybeSingle());
    }
  }
  if (day) day = polishDeep(day);
  const shown: string = day?.date ?? date ?? today;
  const d = dayNumber(shown);

  const { data: recent } = await sb.from('daily_bread')
    .select('date').eq('published', true).lte('date', today)
    .order('date', { ascending: false }).limit(62);
  const recentDays = (recent ?? []).map((r: any) => r.date).reverse();

  // Lignes du jour, par moment (écrites avec le thème du jour).
  const axes = (day?.prayer_axes ?? []) as Array<{ axis: string; lines?: string[] }>;
  const ax = (re: RegExp) => (axes.find(a => re.test(a.axis ?? ''))?.lines ?? []).map(x => x.trim()).filter(Boolean);
  const DUJOUR: Record<string, string[]> = {
    inviter: toLines(day?.spirit_invitation).map(l => l.replace(/\s*Amen\.?$/i, '').trim()).filter(Boolean),
    adorer: ax(/^ador/i), louer: ax(/^lou/i), demander: ax(/^dem/i), confesser: ax(/^conf/i), ecouter: ax(/^[ée]cout/i)
  };

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Prière · {dateFr(shown)}</div>
        <h1>Prière</h1>
        <p className="lede">Six moments, inspirés du Notre Père{day?.theme_title ? <>, avec le thème du jour&nbsp;: <b>{day.theme_title}</b></> : '.'}</p>
      </header>

      {recentDays.length > 0 && <DayNav days={recentDays} current={shown} base="/priere" />}

      <ResumeReading />

      {MOMENTS.map((m, i) => {
        // La Parole proclamée avance d'un cran chaque jour.
        const p = m.parole[(d + i * 3) % m.parole.length];
        let avant: string[], apres: string[];
        const jour = DUJOUR[m.id] ?? [];
        if (m.id === 'ecouter' && jour.length) {
          // Écouter : la ligne du jour, juste avant le silence.
          avant = [m.ouv[(d + i) % m.ouv.length], m.corps[(d * 3 + i) % m.corps.length]];
          apres = [jour[0]];
        } else if (jour.length >= 2) {
          // Prière écrite avec le thème du jour ; la Parole avant la dernière ligne.
          avant = jour.slice(0, -1); apres = jour.slice(-1);
        } else {
          // Secours (pas de pain publié ce jour-là) : prières tirées du jour.
          const r = rng(d * 1009 + i * 7919);
          const corps = pick(m.corps, 3, r);
          avant = [m.ouv[(d + i) % m.ouv.length], corps[0], corps[1]];
          apres = [corps[2], m.clot[(d + i * 2) % m.clot.length]];
        }
        return (
          <section key={m.id} className={`card np-phase ${m.cls}`} id={m.id}>
            <div className="ph-head"><span className="ph-num">{i + 1}</span><div><h2>{m.t}</h2><p>{m.s}</p></div></div>
            {m.np?.map(k => <div className="npf" key={k}><h3>{NP[k]}</h3></div>)}
            <div className="npf">
              <div className="mo-pri">
                {avant.map((l, j) => <p key={`a${j}`} dangerouslySetInnerHTML={{ __html: rich(l) }} />)}
                <div className="mo-proc">
                  <p className="mo-verset">Ta Parole dit&nbsp;: «&nbsp;{p.t}&nbsp;» <RefChip r={p.r} /></p>
                  <p className="mo-ancre">{p.a}</p>
                </div>
                {apres.map((l, j) => <p key={`b${j}`} dangerouslySetInnerHTML={{ __html: rich(l) }} />)}
              </div>
            </div>
            {m.fin && <div className="npf"><p className="mo-silence">{m.fin}</p></div>}
          </section>
        );
      })}

      <section className="card np-phase ph-adoration np-end">
        <div className="ph-head"><span className="ph-num">✦</span><div><h2>Finir en adorant</h2></div></div>
        <div className="npf"><h3>{NP.gloire}</h3></div>
        <div className="npf"><h3>{NP.amen}</h3></div>
      </section>

      <Link href={date ? `/jour/${shown}` : '/pain'} className="to-pain">
        <span className="tp-k">Le pain quotidien</span>
        <span className="tp-t">Lire la méditation de ce jour ›</span>
      </Link>
    </main>
  );
}
