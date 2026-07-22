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

export function parseReadings(payload: any): AelfReading[] {
  const lectures = payload?.messes?.[0]?.lectures ?? [];
  const seen = new Set<string>();
  return lectures
    .filter((l: any) => {
      if (seen.has(l.type)) return false;   // AELF double parfois l'evangile
      seen.add(l.type); return true;
    })
    .map((l: any) => {
      const ref = String(l.ref || '').replace(/ /g, ' ').trim();
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
    });
}

export function liturgicalInfo(payload: any) {
  const i = payload?.informations ?? {};
  return { season: i.temps_liturgique ?? null, week: i.semaine ?? null };
}
