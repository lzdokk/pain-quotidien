import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { OSIS } from '@/lib/osis';
import { fetchApiBibleChapter } from '@/lib/apibible';

export const dynamic = 'force-dynamic';

/**
 * Fournit un chapitre pour une traduction hebergee sur API.Bible.
 * Les traductions locales (Segond, Darby) restent lues directement depuis
 * la table verses par le lecteur ; cette route ne sert que pour source=apibible.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trans = searchParams.get('trans') ?? '';
  const book = Number(searchParams.get('book'));
  const chapter = Number(searchParams.get('chapter'));

  if (!trans || !book || !chapter) {
    return NextResponse.json({ verses: [], error: 'parametres manquants' }, { status: 400 });
  }

  const { data: t } = await admin.from('translations')
    .select('source, api_id').eq('code', trans).maybeSingle();

  if (!t || t.source !== 'apibible' || !t.api_id) {
    return NextResponse.json({ verses: [] });
  }
  if (!process.env.BIBLE_API_KEY) {
    return NextResponse.json({ verses: [], error: 'BIBLE_API_KEY non configuree' }, { status: 500 });
  }

  const osis = OSIS[book - 1];
  if (!osis) return NextResponse.json({ verses: [], error: 'livre inconnu' }, { status: 400 });

  try {
    const verses = await fetchApiBibleChapter(t.api_id, `${osis}.${chapter}`);
    return NextResponse.json({ verses });
  } catch (e: any) {
    return NextResponse.json({ verses: [], error: String(e?.message ?? e) }, { status: 502 });
  }
}
