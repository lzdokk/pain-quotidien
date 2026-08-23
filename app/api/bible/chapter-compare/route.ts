import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { getChapterCompared } from '@/lib/study';

export const dynamic = 'force-dynamic';

const REMOTE = new Set(['bolls', 'apibible', 'getbible', 'youversion']);

async function fetchRemoteChapter(code: string, book: number, chapter: number) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL
    ?? process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`
    ?? 'http://localhost:3000';
  const r = await fetch(`${origin}/api/bible/chapter?trans=${code}&book=${book}&chapter=${chapter}`, {
    cache: 'no-store'
  });
  if (!r.ok) return [];
  const j = await r.json();
  return ((j.verses ?? []) as [number, string][]).map(([verse, text]) => ({ verse, text }));
}

/** Compare un chapitre entier dans deux traductions. */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const book = +(sp.get('book') ?? 0);
  const chapter = +(sp.get('chapter') ?? 0);
  const a = sp.get('a') ?? '';
  const b = sp.get('b') ?? '';
  if (!book || !chapter || !a || !b) {
    return NextResponse.json({ chapters: [] }, { status: 400 });
  }

  const { data: meta } = await admin.from('translations').select('code, name, source').in('code', [a, b]);
  const info = new Map((meta ?? []).map(t => [t.code, t]));

  const load = async (code: string) => {
    const t = info.get(code);
    const name = t?.name ?? code;
    if (!t || !REMOTE.has(t.source ?? 'local')) {
      const local = await getChapterCompared(book, chapter, a, b);
      const hit = local.find(c => c.translation === code);
      if (hit) return hit;
    }
    const verses = await fetchRemoteChapter(code, book, chapter);
    return { translation: code, name, verses };
  };

  // Les deux locales : une seule requête SQL
  const aRemote = REMOTE.has(info.get(a)?.source ?? 'local');
  const bRemote = REMOTE.has(info.get(b)?.source ?? 'local');
  if (!aRemote && !bRemote) {
    const chapters = await getChapterCompared(book, chapter, a, b);
    return NextResponse.json({ chapters });
  }

  const chapters = await Promise.all([load(a), load(b)]);
  return NextResponse.json({ chapters });
}
