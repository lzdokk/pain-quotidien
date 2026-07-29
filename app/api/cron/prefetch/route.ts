import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';
import { VerseNoteSchema, VERSE_SYSTEM } from '@/lib/prompts/verse';
import { parisDate } from '@/lib/date';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * PRE-GENERATION DES FICHES DE VERSETS
 *
 * Les fiches sont produites a l'avance, en arriere-plan, pour les versets que
 * le lecteur va reellement ouvrir : ceux des lectures du jour. Quand il clique,
 * la fiche est deja en base, l'affichage est instantane et ne coute rien.
 *
 *   ?n=8            nombre de fiches par passage (defaut 8)
 *   ?date=...       un jour precis (defaut : aujourd'hui)
 *
 * Relancable sans risque : les versets deja en cache sont ignores.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(1, Number(params.get('n') ?? 8)), 20);
  const date = params.get('date') ?? parisDate();

  const { data: readings } = await admin.from('readings')
    .select('reference, verses').eq('date', date).order('position');

  if (!readings?.length) {
    return NextResponse.json({ ok: false, message: `Aucune lecture pour le ${date}.` });
  }

  // Liste des versets du jour, dans l'ordre de lecture.
  const wanted: Array<{ book: number; chapter: number; verse: number; text: string }> = [];
  for (const r of readings) {
    const m = String(r.reference).match(/^(.+?)\s+(\d+)/);
    if (!m) continue;
    const norm = m[1].trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const { data: books } = await admin.from('books').select('id, name');
    const b = books?.find(x =>
      x.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').startsWith(norm));
    if (!b) continue;
    for (const [n, t] of (r.verses ?? []) as Array<[number, string]>) {
      wanted.push({ book: b.id, chapter: +m[2], verse: n, text: t });
    }
  }

  // On ecarte ceux qui sont deja en cache.
  const { data: cached } = await admin.from('verse_notes')
    .select('book, chapter, verse')
    .in('book', [...new Set(wanted.map(w => w.book))]);
  const has = new Set((cached ?? []).map(c => `${c.book}-${c.chapter}-${c.verse}`));
  const todo = wanted.filter(w => !has.has(`${w.book}-${w.chapter}-${w.verse}`)).slice(0, limit);

  let created = 0;
  const errors: string[] = [];

  for (const w of todo) {
    try {
      const { data: b } = await admin.from('books').select('name').eq('id', w.book).single();
      const { data: ctx } = await admin.from('verses').select('verse, text')
        .eq('translation', 'FRLSG').eq('book', w.book).eq('chapter', w.chapter)
        .gte('verse', Math.max(1, w.verse - 3)).lte('verse', w.verse + 3).order('verse');

      const { data } = await callJSON(VerseNoteSchema, {
        system: VERSE_SYSTEM,
        user: `Verset a expliquer : ${b?.name} ${w.chapter}.${w.verse}

Contexte immediat, Segond 1910 :
${(ctx ?? []).map(v => `${v.verse}. ${v.text}`).join('\n')}`,
        maxTokens: 2000
      });

      await admin.from('verse_notes').upsert({
        book: w.book, chapter: w.chapter, verse: w.verse,
        word_term: data.word_term, word_lang: data.word_lang, word_sense: data.word_sense,
        says: data.says, parable: data.parable, development: data.development,
        cross_refs: data.cross_refs
      });
      created++;
    } catch (e: any) {
      errors.push(`${w.book}.${w.chapter}.${w.verse} : ${String(e?.message ?? e).slice(0, 120)}`);
      // Quota atteint : inutile d'insister, on reprendra au prochain passage.
      if (String(e?.message ?? e).includes('429')) break;
    }
  }

  return NextResponse.json({
    ok: true, date, created,
    restant: Math.max(0, wanted.length - has.size - created),
    errors: errors.length ? errors : undefined
  });
}
