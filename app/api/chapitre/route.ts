import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';
import { aiAccess, needKey, keyError } from '@/lib/ai-access';
import { ChapitreSchema, CHAPITRE_SYSTEM } from '@/lib/prompts/chapitre';

export const maxDuration = 60;

/**
 * AIDE D'UN CHAPITRE (comme la fiche du livre), écrite UNE SEULE FOIS puis
 * gardée en base pour tous les lecteurs suivants (table chapter_notes ; la fiche
 * complète est rangée dans la colonne jsonb « outline », marquée v: 2).
 * GET  /api/chapitre?b=45&c=2  → la fiche si elle existe (404 sinon), via le CDN.
 * POST { book, chapter }       → l'écrit avec la clé Gemini du lecteur, à sa demande.
 */
const CACHE = { 'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=31536000' };

function vers(row: any) {
  const o = row?.outline;
  if (!o || Array.isArray(o) || o.v !== 2) return null;
  return {
    title: row.title, dating: row.dating, resume: row.summary,
    blocs: o.blocs ?? [], questions: o.questions ?? [], jesus: o.jesus ?? [],
    etapes: o.etapes ?? [], parler: o.parler ?? { phrase: '', question: '' }
  };
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const book = Number(sp.get('b')), chapter = Number(sp.get('c'));
  if (!book || !chapter) return NextResponse.json(null, { status: 400 });
  const { data } = await admin.from('chapter_notes').select('*').eq('book', book).eq('chapter', chapter).maybeSingle();
  const f = vers(data);
  if (!f) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(f, { headers: CACHE });
}

export async function POST(req: NextRequest) {
  const { book, chapter } = await req.json().catch(() => ({}));
  if (!Number.isInteger(book) || !Number.isInteger(chapter) || book < 1 || book > 66 || chapter < 1 || chapter > 150)
    return NextResponse.json({ error: 'Chapitre inconnu' }, { status: 400 });

  const { data: cached } = await admin.from('chapter_notes').select('*').eq('book', book).eq('chapter', chapter).maybeSingle();
  const deja = vers(cached);
  if (deja) return NextResponse.json(deja);

  const access = await aiAccess(req);
  if (!access) return needKey();

  const [{ data: b }, { data: vv }] = await Promise.all([
    admin.from('books').select('name').eq('id', book).single(),
    admin.from('verses').select('verse, text').eq('translation', 'FRLSG').eq('book', book).eq('chapter', chapter).order('verse')
  ]);
  if (!vv?.length) return NextResponse.json({ error: 'Texte du chapitre introuvable' }, { status: 404 });

  let data: any;
  try {
    ({ data } = await callJSON(ChapitreSchema, {
      system: CHAPITRE_SYSTEM,
      user: `Chapitre : ${b?.name} ${chapter} (${vv.length} versets)\n\nTexte, Segond 1910 :\n${vv.map(v => `${v.verse}. ${v.text}`).join('\n')}`,
      maxTokens: 5000,
      userKey: access.userKey
    }));
  } catch (e) { return keyError(e); }

  const row = {
    book, chapter, title: data.title, dating: data.dating, summary: data.resume,
    outline: { v: 2, blocs: data.blocs, questions: data.questions, jesus: data.jesus, etapes: data.etapes, parler: data.parler },
    reading_key: data.jesus.join('\n'), why_here: data.parler.phrase
  };
  await admin.from('chapter_notes').upsert(row);
  return NextResponse.json(vers(row));
}
