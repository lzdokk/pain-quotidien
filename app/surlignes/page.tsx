import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import SurlignesView from '@/components/SurlignesView';
import { loadHighlightItems } from '@/lib/highlight-items';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Versets surlignés' };

export default async function Surlignes() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/');

  const items = await loadHighlightItems(sb);

  return (
    <>
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Mon carnet</div>
          <h1>Versets surlignés</h1>
          <p className="lede">
            {items.length} verset{items.length > 1 ? 's' : ''}, classés par catégorie.
            Filtrez par couleur, par famille de livres ou par mot.
          </p>
        </header>
        <Link href="/compte" className="back">‹ Retour au profil</Link>

        <SurlignesView items={items} userId={user.id} />
      </main>
    </>
  );
}
