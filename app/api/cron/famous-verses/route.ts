import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { callJSON, cost, PROVIDER, modelName } from '@/lib/llm';
import { FamousBatchSchema, FAMOUS_SYSTEM, famousUserPrompt, FAMOUS_GEMINI_SCHEMA, FAMOUS_THEMES } from '@/lib/prompts/famous';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * COUVERTURE SYSTEMATIQUE DES VERSETS IMPORTANTS (~10% de la Bible)
 *
 * Avance chapitre par chapitre dans TOUTE la Bible (ordre canonique de la
 * table `verses`, traduction FRLSG). Pour chaque chapitre, le modele retient
 * les versets les plus marquants (~un sur dix) et produit une fiche (theme,
 * titre, eclairage), inseree dans famous_verses. Repartis sur les 1189
 * chapitres, ces choix convergent vers ~10% de la Bible etoiles.
 *
 * Progression memorisee dans famous_verses_progress (une seule ligne) : chaque
 * appel reprend exactement ou le precedent s'est arrete. Relancable sans
 * risque (les versets deja presents, par slug ou par emplacement, sont sautes,
 * ce qui preserve les 56 versets curates du seed 0019).
 *
 *   ?c=3   nombre de chapitres traites par appel (defaut 3, max 8)
 *
 * Appele par le workflow GitHub .github/workflows/famous-verses.yml.
 */

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const chapters = Math.min(Math.max(1, Number(params.get('c') ?? 3)), 8);

  const { data: progress } = await admin.from('famous_verses_progress')
    .select('*').eq('id', 1).maybeSingle();

  if (progress?.done) {
    return NextResponse.json({ ok: true, done: true, message: 'Toute la Bible est deja couverte.' });
  }

  const p = progress ?? { book: 0, chapter: 0 };

  // Liste des couples (book, chapter) restants, dans l'ordre canonique.
  // On la derive de la table `verses` : distinct (book, chapter) apres le
  // curseur. Supabase ne fait pas de distinct simple ; on prend un lot de
  // versets et on regroupe.
  const { data: probe } = await admin.from('verses')
    .select('book, chapter')
    .eq('translation', 'FRLSG')
    .or(`book.gt.${p.book},and(book.eq.${p.book},chapter.gt.${p.chapter})`)
    .order('book').order('chapter')
    .limit(4000);

  if (!probe || probe.length === 0) {
    await admin.from('famous_verses_progress')
      .upsert({ id: 1, book: p.book, chapter: p.chapter, done: true, updated_at: new Date().toISOString() });
    return NextResponse.json({ ok: true, done: true, message: 'Toute la Bible est desormais couverte.' });
  }

  // Prochains chapitres distincts a traiter.
  const seen = new Set<string>();
  const todo: { book: number; chapter: number }[] = [];
  for (const r of probe) {
    const k = `${r.book}-${r.chapter}`;
    if (seen.has(k)) continue;
    seen.add(k);
    todo.push({ book: r.book, chapter: r.chapter });
    if (todo.length >= chapters) break;
  }

  const themeSet = new Set<string>(FAMOUS_THEMES as readonly string[]);
  const booksCache = new Map<number, { name: string }>();
  let created = 0, skipped = 0, totalIn = 0, totalOut = 0;
  let last = { book: p.book, chapter: p.chapter };
  const errors: string[] = [];
  const done: string[] = [];
  let stopped = false;

  for (const ch of todo) {
    try {
      if (!booksCache.has(ch.book)) {
        const { data: b } = await admin.from('books').select('name').eq('id', ch.book).single();
        booksCache.set(ch.book, { name: b?.name ?? '' });
      }
      const bookName = booksCache.get(ch.book)!.name;

      const { data: verses } = await admin.from('verses')
        .select('verse, text')
        .eq('translation', 'FRLSG').eq('book', ch.book).eq('chapter', ch.chapter)
        .order('verse');
      if (!verses || verses.length === 0) { last = ch; continue; }

      // Emplacements deja etoiles dans ce chapitre : on ne regenere pas
      // (preserve le seed curate 0019 et les passages deja traites).
      const { data: existing } = await admin.from('famous_verses')
        .select('verse_start').eq('book', ch.book).eq('chapter', ch.chapter);
      const taken = new Set((existing ?? []).map(e => e.verse_start));

      const { data, usage } = await callJSON(FamousBatchSchema, {
        system: FAMOUS_SYSTEM,
        user: famousUserPrompt({ bookName, chapter: ch.chapter, verses }),
        responseSchema: FAMOUS_GEMINI_SCHEMA,
        maxTokens: 8000,
        temperature: 0.5
      });
      totalIn += usage.input; totalOut += usage.output;

      // Garde-fou : ~10% du chapitre au maximum, versets valides et non deja pris.
      const cap = Math.max(1, Math.ceil(verses.length * 0.15));
      const maxVerse = verses[verses.length - 1].verse;
      const byText = new Map(verses.map(v => [v.verse, v.text]));

      const picks = data.selections
        .filter(s => s.verse_start >= 1 && s.verse_start <= maxVerse)
        .filter(s => !taken.has(s.verse_start))
        .filter(s => themeSet.has(s.theme))
        .slice(0, cap);

      const rows = picks.map(s => {
        const vEnd = Math.min(Math.max(s.verse_end, s.verse_start), maxVerse, s.verse_start + 4);
        const text: string[] = [];
        for (let v = s.verse_start; v <= vEnd; v++) if (byText.has(v)) text.push(byText.get(v)!);
        const ref = vEnd > s.verse_start
          ? `${bookName} ${ch.chapter}.${s.verse_start}-${vEnd}`
          : `${bookName} ${ch.chapter}.${s.verse_start}`;
        return {
          slug: slugify(`${bookName}-${ch.chapter}-${s.verse_start}`),
          ord: ch.book * 1_000_000 + ch.chapter * 1_000 + s.verse_start,
          book: ch.book, chapter: ch.chapter,
          verse_start: s.verse_start, verse_end: vEnd,
          reference: ref, theme: s.theme, title: s.title,
          blurb: s.blurb, verse_text: text.join(' ')
        };
      }).filter(r => r.verse_text.length > 0);

      if (rows.length) {
        // Ignore les conflits de slug (versets deja presents sous ce slug).
        const { error, count } = await admin.from('famous_verses')
          .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true, count: 'exact' });
        if (error) throw new Error(error.message);
        created += count ?? rows.length;
        done.push(`${bookName} ${ch.chapter} : ${rows.length}`);
      } else {
        skipped++;
      }
      last = ch;
    } catch (e: any) {
      errors.push(`${ch.book}.${ch.chapter} : ${String(e?.message ?? e).slice(0, 140)}`);
      stopped = true;
      break; // quota ou panne : on s'arrete, le curseur reprendra ici
    }
  }

  await admin.from('famous_verses_progress').upsert({
    id: 1, book: last.book, chapter: last.chapter,
    done: false, updated_at: new Date().toISOString()
  });

  revalidatePath('/versets');
  return NextResponse.json({
    ok: true, done: false, created, skipped,
    chapters: done, curseur: last, stopped,
    model: `${PROVIDER}/${modelName()}`,
    cost_usd: +cost(totalIn, totalOut).toFixed(4),
    errors: errors.length ? errors : undefined
  });
}
