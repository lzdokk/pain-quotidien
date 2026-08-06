import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import { HL_THEMES } from '@/lib/highlight-themes';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Versets surlignés' };

export default async function Surlignes() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/');

  const { data: hls } = await sb.from('highlights')
    .select('book, chapter, verse, color').order('book').order('chapter').order('verse');
  const highlights = (hls ?? []).filter((h: any) => h.color >= 1 && h.color <= 7);

  // Noms de livres
  const books = [...new Set(highlights.map((h: any) => h.book))];
  const { data: bookRows } = books.length
    ? await sb.from('books').select('id, name').in('id', books)
    : { data: [] as any[] };
  const bookName = new Map((bookRows ?? []).map((b: any) => [b.id, b.name]));

  // Textes des versets (Segond)
  const textMap = new Map<string, string>();
  if (highlights.length) {
    const or = highlights.slice(0, 400)
      .map((h: any) => `and(book.eq.${h.book},chapter.eq.${h.chapter},verse.eq.${h.verse})`).join(',');
    const { data: vs } = await sb.from('verses').select('book, chapter, verse, text')
      .eq('translation', 'FRLSG').or(or);
    for (const v of (vs ?? [])) textMap.set(`${v.book}-${v.chapter}-${v.verse}`, v.text);
  }

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Mon carnet</div>
          <h1>Versets surlignés</h1>
          <p className="lede">
            {highlights.length} verset{highlights.length > 1 ? 's' : ''}, classés par thème.
            Dans le lecteur, la couleur choisie détermine le thème.
          </p>
        </header>
        <Link href="/compte" className="back">‹ Retour au profil</Link>

        {highlights.length === 0 ? (
          <div className="card pad">
            <p className="empty">Aucun surlignage pour l&rsquo;instant. Dans le lecteur, touche un
              verset et choisis une couleur : chaque couleur correspond à un thème ci-dessous.</p>
          </div>
        ) : HL_THEMES.map(th => {
          const list = highlights.filter((h: any) => h.color === th.color);
          return (
            <section key={th.color} className="card pad" style={{ marginTop: 16 }}>
              <div className="sl-th">
                <span className={`swatch s${th.color}`} />
                <div className="sl-th-txt">
                  <strong>{th.label}</strong>
                  <span className="sl-hint">{th.hint}</span>
                </div>
                <span className="sl-count">{list.length}</span>
              </div>

              {list.length === 0 ? (
                <p className="fine" style={{ marginTop: 12 }}>Aucun verset dans ce thème pour l&rsquo;instant.</p>
              ) : (
                <div className="sl-list">
                  {list.map((h: any) => {
                    const bn = bookName.get(h.book) ?? `Livre ${h.book}`;
                    const txt = textMap.get(`${h.book}-${h.chapter}-${h.verse}`);
                    return (
                      <Link key={`${h.book}-${h.chapter}-${h.verse}`} className="sl-item"
                            href={`/lire?ref=${encodeURIComponent(`${bn} ${h.chapter}.${h.verse}`)}`}>
                        <span className="sl-ref">{bn} {h.chapter}.{h.verse}</span>
                        {txt && <span className="sl-text">{txt}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </main>
    </>
  );
}
