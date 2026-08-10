import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import SurlignesView from '@/components/SurlignesView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Versets surlignés' };

export default async function Surlignes() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/');

  const { data: hls } = await sb.from('highlights')
    .select('book, chapter, verse, color').order('book').order('chapter').order('verse');
  const highlights = (hls ?? []).filter((h: any) => h.color >= 1 && h.color <= 7);

  const books = [...new Set(highlights.map((h: any) => h.book))];
  const { data: bookRows } = books.length
    ? await sb.from('books').select('id, name').in('id', books)
    : { data: [] as any[] };
  const bookName = new Map((bookRows ?? []).map((b: any) => [b.id, b.name]));

  const textMap = new Map<string, string>();
  if (highlights.length) {
    const or = highlights.slice(0, 400)
      .map((h: any) => `and(book.eq.${h.book},chapter.eq.${h.chapter},verse.eq.${h.verse})`).join(',');
    const { data: vs } = await sb.from('verses').select('book, chapter, verse, text')
      .eq('translation', 'FRLSG').or(or);
    for (const v of (vs ?? [])) textMap.set(`${v.book}-${v.chapter}-${v.verse}`, v.text);
  }

  const items = highlights.map((h: any) => {
    const bn = bookName.get(h.book) ?? `Livre ${h.book}`;
    return {
      color: h.color,
      ref: `${bn} ${h.chapter}.${h.verse}`,
      text: textMap.get(`${h.book}-${h.chapter}-${h.verse}`) ?? '',
      href: `/lire?ref=${encodeURIComponent(`${bn} ${h.chapter}.${h.verse}`)}`
    };
  });

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Mon carnet</div>
          <h1>Versets surlignés</h1>
          <p className="lede">
            {items.length} verset{items.length > 1 ? 's' : ''}, classés par thème.
            Dans le lecteur, la couleur choisie détermine le thème.
          </p>
        </header>
        <Link href="/compte" className="back">‹ Retour au profil</Link>

        <SurlignesView items={items} />
      </main>
    </>
  );
}
