import Link from 'next/link';
import { supabasePublic } from '@/lib/supabase/public';
import { contentDate } from '@/lib/date';
import ResumeReading from '@/components/ResumeReading';
import { rich } from '@/lib/rich';
import { polishDeep } from '@/lib/accents';

export const revalidate = 300;
export const metadata = { title: 'Prière' };

type Demande = { demande: string; lines?: string[]; prayer?: string };

/* Les phrases du Notre Père (Matthieu 6.9-13). L'indice renvoie à la
   demande priée du jour (0 à 6), -1 = pas de phrase du jour. */
const NP: Record<string, [string, number]> = {
  pere: ['Notre Père qui es aux cieux,', -1],
  nom: ['Que ton nom soit sanctifié,', 0],
  regne: ['Que ton règne vienne,', 1],
  volonte: ['Que ta volonté soit faite sur la terre comme au ciel.', 2],
  pain: ['Donne-nous aujourd’hui notre pain quotidien,', 3],
  pardon: ['Pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés,', 4],
  mal: ['Ne nous induis pas en tentation, mais délivre-nous du malin.', 5],
  gloire: ['Car c’est à toi qu’appartiennent, dans tous les siècles, le règne, la puissance et la gloire.', 6],
  amen: ['Amen.', -1]
};

/* Louange par défaut, si les prières du jour ne sont pas encore prêtes. */
const LOUANGE = [
  'Merci, Père, pour tout ce que tu as fait pour moi hier.',
  'Merci pour ta présence aujourd’hui, pour le souffle, la paix et ta Parole.',
  'Merci pour ce que tu feras demain : tes promesses ne passent pas.',
  'Merci pour Yéchoua (Jésus), mon Sauveur, et pour le Saint-Esprit qui m’accompagne.'
];

/* Les cinq moments (texte tiré du livre de Mickaël). */
const MOMENTS = [
  {
    id: 'adorer', cls: 'ph-adoration', t: 'Adorer', s: 'Dire à Dieu qui il est, avant de lui parler de toi.',
    np: ['pere', 'nom'],
    txt: ['Jésus commence ainsi : « Notre Père… que ton nom soit sanctifié. » Ce n’est pas le flatter, c’est remettre les choses à leur place.'],
    ex: '« Tu es le Dieu vivant. Tu es le rocher sur qui je peux toujours compter. »'
  },
  {
    id: 'louer', cls: 'ph-louange', t: 'Louer', s: 'Le remercier pour ce qu’il a fait.',
    np: [],
    txt: ['Les grandes choses comme les petites : la santé, un toit, un visage aimé, un nouveau matin, la grâce de pouvoir respirer, de voir le soleil se lever.'],
    ex: '« Merci pour cette journée. Merci de m’avoir donné de te connaître. »'
  },
  {
    id: 'confesser', cls: 'ph-confesser', t: 'Confesser', s: 'Reconnaître ce qui n’a pas été juste, et recevoir son pardon.',
    np: ['pardon'],
    txt: ['On dépose ses fautes et, dans le même geste, ses rancunes contre les autres. Non pas pour se flageller, mais pour repartir léger.'],
    ex: '« Pardonne-moi ma colère d’hier. Merci, Jésus, de me relever. »'
  },
  {
    id: 'demander', cls: 'ph-intercession', t: 'Demander', s: 'Confier tes besoins, et porter les autres.',
    np: ['pain', 'mal'],
    txt: [
      'Dieu s’intéresse vraiment à ton pain quotidien, à ton loyer, à ton travail, à la santé des tiens. Mais confie-lui aussi tes besoins spirituels, car l’homme ne vit pas seulement de pain : la force pour la journée, la patience qui manque, la paix quand tout s’agite.',
      'Et porte les autres : ceux que tu aimes, ceux qui souffrent, et même, Jésus y insiste, tes ennemis. Dieu pourvoit ; il nourrit le corps et il nourrit l’âme.'
    ],
    ex: '« Donne-moi la force pour aujourd’hui. Garde-moi du mal. Viens secourir ceux qui traversent l’épreuve. »'
  },
  {
    id: 'ecouter', cls: 'ph-ecouter', t: 'Écouter', s: 'Lâcher le contrôle, et rester en silence devant lui.',
    np: ['regne', 'volonte'],
    txt: ['C’est la moitié oubliée de la prière : on parle beaucoup, on se tait rarement. Dis simplement, comme le jeune Samuel :'],
    ex: '« Parle, Seigneur, ton serviteur écoute. »',
    after: 'Puis plus rien. Juste le silence.'
  }
];

/* Découpe un texte en lignes courtes (une phrase par ligne). */
const toLines = (t?: string | null): string[] =>
  (t ?? '')
    .split(/\n+|(?<=[.!?…])\s+(?=[A-ZÀÂÉÈÊÎÔÛÇ«])/)
    .map(s => s.trim()).filter(Boolean);

function Lignes({ l }: { l: string[] }) {
  if (!l.length) return null;
  return (
    <div className="pl-lines">
      {l.map((x, i) => <p key={i} dangerouslySetInnerHTML={{ __html: rich(x) }} />)}
    </div>
  );
}

export default async function Priere_() {
  const sb = await supabasePublic();
  const today = contentDate();
  const cols = 'date, theme_title, prayer_notre_pere, prayer_axes';
  let { data: day } = await sb.from('daily_bread')
    .select(cols).eq('date', today).eq('published', true).maybeSingle();
  if (!day) {
    // Repli sur la dernière prière publiée plutôt qu'une page vide.
    const { data: last } = await sb.from('daily_bread')
      .select(cols).eq('published', true).lte('date', today)
      .order('date', { ascending: false }).limit(1).maybeSingle();
    day = last ?? null;
  }
  // Les journées déjà écrites sans accents sont réparées à l'affichage.
  if (day) day = polishDeep(day);

  const np = ((day?.prayer_notre_pere ?? []) as Demande[])
    .map(d => d.lines ?? toLines(d.prayer));
  // Louange du jour (étape « Louer » des prières du jour), sinon des phrases simples.
  const axes = (day?.prayer_axes ?? []) as Array<{ axis: string; lines?: string[]; prayer?: string }>;
  const louerJour = (() => {
    const a = axes.find(x => /^lou/i.test(x.axis ?? ''));
    return a ? (a.lines ?? toLines(a.prayer)) : [];
  })();
  const louange = louerJour.length ? louerJour : LOUANGE;

  // Une phrase du Notre Père et la prière du jour qui l'accompagne.
  const Phrase = ({ k }: { k: string }) => {
    const [phrase, i] = NP[k];
    return (
      <div className="npf">
        <h3>{phrase}</h3>
        {i >= 0 && np[i]?.length ? <Lignes l={np[i]} /> : null}
      </div>
    );
  };

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Prière</div>
        <h1>Prière</h1>
        <p className="lede">Un chemin tout simple, en cinq moments, inspiré du Notre Père.</p>
      </header>

      <ResumeReading />

      {/* Introduction et sommaire des cinq moments */}
      <div className="card pad pr-guide">
        <span className="kicker">Les cinq moments de la prière</span>
        <p className="pr-intro">Quand ses amis lui ont demandé : « Seigneur, apprends-nous à prier », Jésus ne leur a pas fait un cours de théologie. Il leur a laissé une prière très courte, le Notre Père. Ce n’est pas une formule à marmonner sans y penser : c’est une charpente.</p>
        <ul className="pr-legend">
          <li><a href="#seuil"><span className="ph-dot ph-seuil" /><b>Le seuil</b> inviter sa présence</a></li>
          {MOMENTS.map((m, i) => (
            <li key={m.id}><a href={`#${m.id}`}><span className={`ph-dot ${m.cls}`} /><b>{i + 1}. {m.t}</b> {m.s.charAt(0).toLowerCase() + m.s.slice(1).replace(/\.$/, '')}</a></li>
          ))}
        </ul>
        <p className="fine">Tu n’as pas besoin de grands mots : une ou deux phrases pour chaque moment suffisent au début.</p>
      </div>

      {/* Le seuil : appeler l'Esprit Saint */}
      <section className="card np-phase ph-seuil" id="seuil">
        <div className="ph-head"><span className="ph-num">✦</span><div><h2>Le seuil</h2><p>On ne parle pas vraiment à quelqu’un sans d’abord se tourner vers lui.</p></div></div>
        <div className="npf">
          <p className="mo-txt">Avant de prier, prends quelques secondes pour inviter sa présence, pour appeler l’Esprit Saint, qui « vient en aide dans notre faiblesse » et prie avec nous quand nous ne savons pas quoi dire.</p>
          <blockquote className="mo-ex">« Viens, Saint-Esprit. Sois là. Remplis ce moment, et apprends-moi à prier. »</blockquote>
          <p className="mo-txt">Alors seulement, la prière cesse d’être un monologue. Elle devient une rencontre.</p>
        </div>
      </section>

      {MOMENTS.map((m, i) => (
        <section key={m.id} className={`card np-phase ${m.cls}`} id={m.id}>
          <div className="ph-head"><span className="ph-num">{i + 1}</span><div><h2>{m.t}</h2><p>{m.s}</p></div></div>
          <div className="npf">
            {m.txt.map((t, j) => <p key={j} className="mo-txt">{t}</p>)}
            <blockquote className="mo-ex">{m.ex}</blockquote>
            {m.after && <p className="mo-txt mo-silence">{m.after}</p>}
          </div>
          {m.np.length > 0 && <div className="mo-np-k">Avec le Notre Père</div>}
          {m.np.map(k => <Phrase key={k} k={k} />)}
          {m.id === 'louer' && (
            <div className="npf"><span className="mo-np-k inl">Prière du jour</span><Lignes l={louange} /></div>
          )}
        </section>
      ))}

      <section className="card np-phase ph-adoration np-end">
        <div className="ph-head"><span className="ph-num">✦</span><div><h2>Finir en adorant</h2></div></div>
        <Phrase k="gloire" /><Phrase k="amen" />
      </section>

      <div className="card pad pr-close">
        <p>Certains jours, tu ne vivras qu’un seul de ces moments, et c’est très bien. L’important n’est pas la forme, c’est la <b>sincérité</b> et la <b>régularité</b> : un tout petit peu chaque jour vaut mieux que beaucoup de temps en temps.</p>
      </div>

      <Link href="/pain" className="to-pain">
        <span className="tp-k">Le pain quotidien</span>
        <span className="tp-t">Lire la méditation du jour ›</span>
      </Link>
    </main>
  );
}
