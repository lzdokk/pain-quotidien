import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { supabaseServer } from '@/lib/supabase/server';
import { callJSON } from '@/lib/llm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Mot-à-mot d'un verset : chaque mot d'origine (STEPBible) avec sa
 * TRADUCTION FRANCAISE dans le contexte du verset, sa translitteration et sa
 * definition francaise (lexique Strong).
 *   /api/verse-words?book=1&chapter=1&verse=1
 *
 * La traduction francaise mot par mot est faite UNE SEULE FOIS par verset
 * (au premier affichage par un lecteur connecte), puis gardee en base
 * (verse_words.gloss_fr) pour tout le monde.
 */
const norm = (c: string) => {
  const m = (c || '').match(/^([HG])0*(\d+)/i);
  return m ? m[1].toUpperCase() + m[2] : c;
};

/* Repli sans IA : le premier sens francais cite entre guillemets dans la
   definition Strong (« créer », "Dieu"…), sinon rien. */
function quotedFr(def: string | null): string | null {
  if (!def) return null;
  const head = def.slice(0, 400);
  const m = head.match(/[«"“]\s*([^»"”]{1,40}?)\s*[»"”]/);
  if (!m) return null;
  const t = m[1].replace(/\*/g, '').trim();
  return t.split(/\s+/).length <= 4 ? t : null;
}

const GlossSchema = z.object({ mots: z.array(z.string()) });

async function translateVerse(book: number, chapter: number, verse: number, words: any[],
  save?: (glosses: string[]) => Promise<unknown>) {
  // Verset en francais (S21 si importee, sinon Segond 1910) pour le contexte.
  const read = (t: string) => admin.from('verses').select('text')
    .eq('translation', t).eq('book', book).eq('chapter', chapter).eq('verse', verse).maybeSingle();
  let { data: fr } = await read('S21');
  if (!fr) ({ data: fr } = await read('FRLSG'));

  const lang = words[0]?.lang === 'grec' ? 'grec' : 'hébreu';
  const glossHint = words.some((w: any) => w.gloss) ? ' (avec une glose anglaise indicative)' : '';
  const { data } = await callJSON(GlossSchema, {
    system: `Tu es un traducteur biblique. On te donne un verset ${lang} découpé mot par mot${glossHint}
et sa traduction française. Pour CHAQUE mot, dans
l'ordre, donne sa traduction française en contexte : un à quatre mots français simples,
tels qu'on les lirait dans une Bible interlinéaire (ex. « au commencement », « créa »,
« Dieu », « les cieux », « et », « la terre »). Pour une particule sans équivalent
(ex. la marque de l'objet direct), écris « [objet] ». Accents français obligatoires.
Réponds uniquement par un objet JSON : { "mots": [ ... ] }, exactement un élément par mot.`,
    user: `Traduction française du verset : ${fr?.text ?? '(indisponible)'}

Mots ${lang}s, dans l'ordre :
${words.map((w, i) => `${i + 1}. ${w.word}${w.gloss ? ` — ${w.gloss}` : ''}`).join('\n')}

Renvoie { "mots": [...] } avec ${words.length} éléments.`,
    responseSchema: {
      type: 'OBJECT',
      properties: { mots: { type: 'ARRAY', items: { type: 'STRING' } } },
      required: ['mots']
    },
    maxTokens: 1500,
    temperature: 0.2,
    gloss: false
  });
  if (data.mots.length !== words.length) return null;
  const out = data.mots.map(m => m.replace(/\*/g, '').trim().slice(0, 40));
  // Mise en cache (sans bloquer si la table/colonne n'existe pas encore).
  if (save) await save(out).catch(() => null);
  else await Promise.all(words.map((w, i) => admin.from('verse_words')
    .update({ gloss_fr: out[i] })
    .eq('book', book).eq('chapter', chapter).eq('verse', verse).eq('position', w.position)
  )).catch(() => null);
  return out;
}

async function isLoggedIn() {
  try {
    const sb = await supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    return !!user;
  } catch { return false; }
}

/* Nouveau Testament lu en HEBREU (Bible hebraique, code HEB) :
   les mots viennent du texte, la traduction francaise est faite en contexte
   puis gardee dans verse_words_he. */
async function hebrewNT(book: number, chapter: number, verse: number) {
  const { data: cached } = await admin.from('verse_words_he')
    .select('position, word, gloss_fr')
    .eq('book', book).eq('chapter', chapter).eq('verse', verse).order('position');
  let rows: Array<{ position: number; word: string; gloss_fr: string | null }> = (cached ?? []) as any[];

  if (!rows.length) {
    const { data: v } = await admin.from('verses').select('text')
      .eq('translation', 'HEB').eq('book', book).eq('chapter', chapter).eq('verse', verse).maybeSingle();
    if (!v?.text) return null;
    rows = v.text.replace(/[׃:;,.!?"«»]/g, ' ').split(/\s+/).filter(Boolean)
      .map((word: string, i: number) => ({ position: i + 1, word, gloss_fr: null }));
  }

  let complete = rows.every(r => r.gloss_fr);
  if (!complete && await isLoggedIn()) {
    try {
      const out = await translateVerse(book, chapter, verse,
        rows.map(r => ({ ...r, lang: 'hebreu', gloss: null })),
        g => admin.from('verse_words_he').upsert(rows.map((r, i) => ({
          book, chapter, verse, position: r.position, word: r.word, gloss_fr: g[i]
        }))) as any);
      if (out) { rows = rows.map((r, i) => ({ ...r, gloss_fr: out[i] })); complete = true; }
    } catch { /* on renvoie les mots sans traduction */ }
  }

  return {
    lang: 'hebreu', source: 'he', complete,
    line: rows.map(r => r.word).join(' '),
    words: rows.map(r => ({
      position: r.position, word: r.word, strong: null, gloss: null, lang: 'hebreu',
      gloss_fr: r.gloss_fr, translit: null, definition_fr: null
    }))
  };
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const book = +(sp.get('book') ?? 0), chapter = +(sp.get('chapter') ?? 0), verse = +(sp.get('verse') ?? 0);
  if (!book || !chapter || !verse) return NextResponse.json({ words: [] });

  // Nouveau Testament : hebreu (Delitzsch) par defaut, grec original avec ?src=grec.
  if (book >= 40 && sp.get('src') !== 'grec') {
    const he = await hebrewNT(book, chapter, verse);
    if (he) return NextResponse.json(he);
  }

  // select('*') : fonctionne avant ET apres l'ajout de la colonne gloss_fr.
  const { data: words } = await admin.from('verse_words')
    .select('*')
    .eq('book', book).eq('chapter', chapter).eq('verse', verse)
    .order('position');
  if (!words || words.length === 0) return NextResponse.json({ words: [] });

  // Récupère les entrées Strong correspondantes (formats paddé / non paddé).
  const codes = [...new Set(words.map((w: any) => w.strong).filter(Boolean) as string[])];
  const cand = new Set<string>();
  for (const c of codes) {
    cand.add(c);
    const m = c.match(/^([HG])(\d+)$/i);
    if (m) cand.add(m[1].toUpperCase() + m[2].padStart(4, '0'));
  }
  const { data: strongs } = cand.size
    ? await admin.from('strongs').select('code, translit, definition_fr').in('code', [...cand])
    : { data: [] as any[] };
  const map = new Map<string, any>();
  for (const s of (strongs ?? [])) map.set(norm(s.code), s);

  // Traduction francaise en contexte : en cache, sinon generee (lecteur connecte).
  let ctx: string[] | null = words.every((w: any) => w.gloss_fr) ? words.map((w: any) => w.gloss_fr) : null;
  if (!ctx && await isLoggedIn()) {
    try { ctx = await translateVerse(book, chapter, verse, words); } catch { ctx = null; }
  }

  const out = words.map((w: any, i: number) => {
    const s = w.strong ? map.get(norm(w.strong)) : null;
    return {
      position: w.position, word: w.word, strong: w.strong, gloss: w.gloss, lang: w.lang,
      gloss_fr: ctx?.[i] ?? (/^\[obj/i.test(w.gloss ?? '') ? '[objet]' : quotedFr(s?.definition_fr ?? null)),
      translit: s?.translit ?? null,
      definition_fr: s?.definition_fr ?? null
    };
  });
  return NextResponse.json({
    lang: words[0].lang, words: out,
    line: words.map((w: any) => w.word).join(' '), // le verset complet dans la langue d'origine
    complete: !!ctx,                                // traduction francaise mot a mot disponible
    source: words[0].lang === 'grec' ? 'grec' : 'he'
  });
}
