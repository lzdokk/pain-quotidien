import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Renvoie un verset dans toutes les traductions activées, pour comparaison.
 * Local (table verses) en une requête ; bolls.life en parallèle (un verset).
 *   /api/verse-compare?book=43&chapter=3&verse=16
 */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const book = +(sp.get('book') ?? 0), chapter = +(sp.get('chapter') ?? 0), verse = +(sp.get('verse') ?? 0);
  if (!book || !chapter || !verse) return NextResponse.json({ items: [] });

  const { data: trans } = await admin.from('translations')
    .select('code, name, language, source, api_id').eq('enabled', true);
  const list = trans ?? [];

  const localCodes = list.filter(t => t.source !== 'bolls' && t.source !== 'apibible').map(t => t.code);
  const localText = new Map<string, string>();
  if (localCodes.length) {
    const { data } = await admin.from('verses').select('translation, text')
      .in('translation', localCodes).eq('book', book).eq('chapter', chapter).eq('verse', verse);
    for (const v of (data ?? [])) localText.set(v.translation, v.text);
  }

  const items = await Promise.all(list.map(async (t: any) => {
    let text = '';
    if (t.source === 'bolls') {
      try {
        const r = await fetch(`https://bolls.life/get-verse/${t.api_id ?? t.code}/${book}/${chapter}/${verse}/`,
          { next: { revalidate: 86400 } });
        if (r.ok) {
          const j = await r.json();
          text = String(j?.text ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        }
      } catch { /* traduction indisponible : ignorée */ }
    } else if (t.source !== 'apibible') {
      text = localText.get(t.code) ?? '';
    }
    return { code: t.code, name: t.name, language: t.language, text };
  }));

  return NextResponse.json({ items: items.filter(i => i.text) });
}
