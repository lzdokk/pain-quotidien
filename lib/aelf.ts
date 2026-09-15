/** Calendrier de lectures AELF, zone France. */

const DEUTERO = ['Sg', 'Si', 'Tb', 'Jdt', '1 M', '2 M', 'Ba'];

/** Passages de remplacement quand la lecture tombe hors du canon protestant. */
const SUBSTITUTIONS: Record<string, string> = {
  'Sg 12':  'Esaie 55.6-9',
  'Sg 2':   'Psaume 22.7-9',
  'Sg 7':   'Proverbes 8.22-31',
  'Si 3':   'Proverbes 23.22-25',
  'Si 27':  'Proverbes 16.27-33',
  'Tb 8':   'Genese 2.18-24',
  'Ba 5':   'Esaie 40.3-5',
  '2 M 7':  'Daniel 3.16-28'
};

export type AelfReading = {
  kind: string; reference: string; title: string; intro: string; body: string;
  deuterocanonical: boolean; substitute?: string;
};

const strip = (html: string) =>
  html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
      .replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim();

export async function fetchAelf(date: string) {
  const url = `https://api.aelf.org/v1/messes/${date}/france`;
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { next: { revalidate: 0 } });
    if (r.ok) return r.json();
    await new Promise(res => setTimeout(res, 800 * (i + 1)));
  }
  throw new Error(`AELF injoignable pour ${date}`);
}

/**
 * Isole la VRAIE reference biblique quand AELF la prefixe du nom d'une sequence
 * ou d'un cantique, ex. "Stabat Mater. Jn 19, 25-27" -> "Jn 19, 25-27". Sans ce
 * nettoyage, le nom du livre est mal detecte et la lecture (souvent l'evangile
 * d'une fete) est silencieusement perdue. On coupe uniquement sur ". " (point
 * SUIVI d'un espace) : cela ne casse pas "1 Co 12, 12-14.27-31a".
 */
function cleanScriptureRef(raw: string): string {
  const s = raw.replace(/ /g, ' ').trim();
  const parts = s.split(/\.\s+/).map(p => p.trim()).filter(Boolean);
  if (parts.length <= 1) return s;
  const isScripture = (p: string) =>
    /^(\d\s*)?\p{L}[\p{L}.]*\s+\d+\s*[,(:]/u.test(p)
    || /^\d+\s*(\(\d+\))?\s*[,:]/.test(p);
  return parts.find(isScripture) ?? parts[parts.length - 1];
}

export function parseReadings(payload: any): AelfReading[] {
  const lectures = payload?.messes?.[0]?.lectures ?? [];
  // AELF propose souvent plusieurs options pour un meme temps de lecture
  // ("OU BIEN"). On les regroupe par type, dans l'ordre d'apparition.
  const groups = new Map<string, any[]>();
  for (const l of lectures) {
    const arr = groups.get(l.type) ?? [];
    arr.push(l);
    groups.set(l.type, arr);
  }
  const build = (l: any): AelfReading => {
      const ref = cleanScriptureRef(String(l.ref || ''));
      const prefix = DEUTERO.find(d => ref.startsWith(d + ' '));
      const key = ref.split(',')[0].trim();
      return {
        kind: l.type,
        reference: ref,
        title: strip(l.titre || ''),
        intro: strip(l.intro_lue || ''),
        body: strip(l.contenu || ''),
        deuterocanonical: Boolean(prefix),
        substitute: prefix ? (SUBSTITUTIONS[key] ?? 'Esaie 55.6-9') : undefined
      };
  };

  const out: AelfReading[] = [];
  for (const options of groups.values()) {
    const parsed = options.map(build);
    // On prefere une option deja dans le canon protestant, pour eviter
    // une substitution quand AELF offre justement une alternative canonique.
    out.push(parsed.find(p => !p.deuterocanonical) ?? parsed[0]);
  }
  return out;
}

export function liturgicalInfo(payload: any) {
  const i = payload?.informations ?? {};
  return { season: i.temps_liturgique ?? null, week: i.semaine ?? null };
}
