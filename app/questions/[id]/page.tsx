import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';

export const revalidate = 86400;

export default async function Reponse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: f } = await sb.from('faq').select('*').eq('id', Number(id)).eq('reviewed', true).maybeSingle();
  if (!f) notFound();
  const { data: { user } } = await sb.auth.getUser();

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">{f.category}</div>
          <h1 style={{ fontSize: 'clamp(30px,5.4vw,44px)' }}>{f.question}</h1>
        </header>
        <Link href="/questions" className="back">‹ Toutes les questions</Link>

        <div className="card pad pq">
          <div className="mini"><strong>En une phrase</strong><span>{f.short_answer}</span></div>
          <h3 style={{ marginTop: 28 }}>La parabole</h3>
          <p className="parable">{f.parable}</p>
          <h3>Pour aller plus loin</h3>
          {(f.body as string[]).map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
          <div className="keyv">
            <strong>A lire dans la Bible</strong>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 15 }}>
              {(f.verses as string[]).map((v, i) => (
                <span key={i}>{i > 0 && ' · '}<span className="ref-inline">{v}</span></span>
              ))}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
