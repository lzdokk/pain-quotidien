import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Compare un chapitre dans DEUX traductions.
 *   /api/bible/chapter-compare?book=43&chapter=3&a=FRLSG&b=BDSY
 * Renvoie { a: [[verset, texte], …], b: [[verset, texte], …] }.
 *
 * Gère le local (table verses, via le service role) ET le distant
 * (bolls / getbible / youversion / apibible, via /api/bible/chapter).
 */
const REMOTE = new Set(['bolls', 'apibible', 'getbible', 'youversion']);

function origin(): string {
  // Parenthèses obligatoires : on ne peut pas mélanger ?? et && sans elles.
  return process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
}

async function chapterFor(code: string, book: number, chapter: number): Promise<Array<[number, string]>> {
  const { data: t } = await admin.from('translations').select('source').eq('code', code).maybeSingle();
  const source = t?.source ?? 'local';

  if (REMOTE.has(source)) {
    const r = await fetch(
      `${origin()}/api/bible/chapter?trans=${encodeURIComponent(code)}&book=${book}&chapter=${chapter}`,
      { cache: 'no-store' }
    );
    if (!r.ok) return [];
    const j = await r.json();
    return (j.verses ?? []) as Array<[number, string]>;
  }

  const { data } = await admin.from('verses').select('verse, text')
    .eq('translation', code).eq('book', book).eq('chapter', chapter).order('verse');
  return (data ?? []).map((v: any) => [v.verse, v.text] as [number, string]);
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const book = +(sp.get('book') ?? 0);
  const chapter = +(sp.get('chapter') ?? 0);
  const a = sp.get('a') ?? 'FRLSG';
  const b = sp.get('b') ?? 'FRLSG';
  if (!book || !chapter) return NextResponse.json({ a: [], b: [] }, { status: 400 });

  const [va, vb] = await Promise.all([
    chapterFor(a, book, chapter),
    chapterFor(b, book, chapter)
  ]);
  return NextResponse.json({ a: va, b: vb });
}
