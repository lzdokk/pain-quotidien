import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import ValidateCourse from '@/components/ValidateCourse';
import CourseHomework from '@/components/CourseHomework';
import ReadingLinks from '@/components/ReadingLinks';
import { rich } from '@/lib/rich';

export const revalidate = 86400;
const KIND: Record<string, string> = { E: 'Exegese', D: 'Doctrine', P: 'Pratique', G: 'Langue' };

export default async function Fiche({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const sb = await supabaseServer();

  const { data: c } = await sb.from('courses').select('*').eq('code', code).maybeSingle();
  if (!c) notFound();
  const { data: { user } } = await sb.auth.getUser();
  const { data: g } = await sb.from('cursus_groups').select('level_id').eq('id', c.group_id).maybeSingle();
  const { data: lvl } = await sb.from('cursus_levels').select('name').eq('id', g?.level_id ?? '').maybeSingle();
  const { data: prog } = user
    ? await sb.from('course_progress').select('code').eq('code', code).maybeSingle()
    : { data: null };
  const { data: last } = user
    ? await sb.from('course_submissions').select('*').eq('code', code)
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null };

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">{lvl?.name} · {c.code}</div>
          <h1>{c.title}</h1>
          <p className="lede">{KIND[c.kind]} · {c.hours} heures · {c.hook}</p>
        </header>

        <Link href="/cursus" className="back">‹ Retour au cursus</Link>

        {c.status !== 'reviewed' ? (
          <div className="card pad">
            <span className="kicker">Fiche en préparation</span>
            <p style={{ marginTop: 10 }}>
              Cette fiche est produite par la génération hebdomadaire. Elle suivra le
              gabarit habituel : quatre objectifs, une parabole d&rsquo;entree, trois a quatre
              sections, un verset directeur, les lectures obligatoires et le travail a rendre.
            </p>
          </div>
        ) : (
          <>
            <div className="card pad">
              <span className="kicker">Objectifs du cours</span>
              <ul className="obj">{(c.objectives as string[]).map((o, i) => <li key={i}>{o}</li>)}</ul>
            </div>

            <div className="card pad pq">
              <span className="kicker">Pour entrer dans le sujet</span>
              <p className="parable">{c.parable}</p>
            </div>

            {(c.body as Array<{ h: string; p: string[] }>).map((sec, i) => (
              <div className="card pad pq" key={i}>
                <span className="kicker">{sec.h}</span>
                {sec.p.map((x, j) =>
                  <p key={j} className={j === 0 ? 'lead' : ''} dangerouslySetInnerHTML={{ __html: rich(x) }} />)}
              </div>
            ))}

            <div className="card pad">
              <span className="kicker">Verset directeur</span>
              <div className="keyv" style={{ marginTop: 4 }}>
                <p>{c.key_verse}<br /><span className="ref-inline">{c.key_verse_ref}</span></p>
              </div>
              <h3 style={{ marginTop: 26 }}>Lectures obligatoires</h3>
              <ul className="mlist">{(c.readings as string[]).map((r, i) => <li key={i}><ReadingLinks text={r} /></li>)}</ul>
              <h3 style={{ marginTop: 22 }}>Travail a rendre</h3>
              <p style={{ marginTop: 8 }}>{c.assignment}</p>
              <ValidateCourse code={c.code} user={user} initial={Boolean(prog)} />
            </div>

            <CourseHomework code={c.code} user={user} last={last} />
          </>
        )}
      </main>
    </>
  );
}
