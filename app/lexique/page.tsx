import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import Lexique from '@/components/Lexique';

export const metadata = { title: 'Lexique hébreu et grec' };
export const dynamic = 'force-dynamic';

export default async function LexiquePage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { count } = await sb.from('strongs').select('code', { count: 'exact', head: true });

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Lexique</div>
          <h1>Les mots d&rsquo;origine</h1>
          <p className="lede">
            Chercher un mot hébreu ou grec, sa racine et ce que le français ne rend pas.
          </p>
        </header>

        <Lexique />

        <p className="fine" style={{ marginTop: 24, textAlign: 'center' }}>
          {count ? `${count.toLocaleString('fr-FR')} entrées. ` : ''}
          Concordance de James Strong, 1890, domaine public.
        </p>
      </main>
    </>
  );
}
