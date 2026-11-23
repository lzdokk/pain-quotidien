import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { callText } from '@/lib/llm';
import { aiAccess } from '@/lib/ai-access';
import { VOICE } from '@/lib/prompts/voice';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Lexique Strong.
 *   ?q=agape        recherche par mot, translitteration ou definition
 *   ?code=G26       une entree précise
 *
 * La definition francaise est produite une seule fois par entree puis
 * conservee en base : toutes les consultations suivantes sont gratuites.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const q = (searchParams.get('q') ?? '').trim();

  if (code) {
    const { data } = await admin.from('strongs').select('*').eq('code', code.toUpperCase()).maybeSingle();
    if (!data) return NextResponse.json({ error: 'Entree introuvable' }, { status: 404 });

    // Traduction francaise a la demande, une seule fois (cle du lecteur ou admin).
    // Fiche traduite une seule fois, pour tous : clé du lecteur si elle existe, sinon pool du site.
    const access = !data.definition_fr && data.definition_en ? ((await aiAccess(req)) ?? { admin: false, user: null }) : null;
    if (access) {
      try {
        const { text } = await callText({
          system: `Tu rédiges une entrée de LEXIQUE biblique (concordance Strong) pour un lecteur francophone.
En deux à trois phrases, en français simple et exact : le sens précis du mot, sa nuance propre,
et ses principales traductions possibles selon le contexte. Reste fidèle à la définition de Strong.
INTERDIT : conseils, applications pratiques, exhortations, tutoiement ou vouvoiement du lecteur,
titres, listes. Uniquement le sens du mot.`,
          user: `Mot ${data.lang} : ${data.lemma ?? ''} (${data.translit ?? ''})
Definition anglaise de Strong : ${data.definition_en}
${data.derivation ? `Etymologie : ${data.derivation}` : ''}
${data.kjv_def ? `Traductions retenues : ${data.kjv_def}` : ''}`,
          maxTokens: 700,
          userKey: access.userKey
        });
        const fr = text.trim();
        if (fr) {
          await admin.from('strongs').update({ definition_fr: fr }).eq('code', data.code);
          data.definition_fr = fr;
        }
      } catch { /* on renvoie l'entree sans traduction plutot que d'echouer */ }
    }

    // ?usage=1 : ou ce mot apparait dans la Bible et comment il est traduit.
    let usage: any;
    if (searchParams.get('usage')) {
      const { data: occ, count } = await admin.from('verse_words')
        .select('book, chapter, verse, gloss_fr', { count: 'exact' })
        .eq('strong', data.code).order('book').order('chapter').order('verse').limit(800);
      const seen = new Set<string>();
      const refs: Array<{ b: number; c: number; v: number }> = [];
      const tally = new Map<string, number>();
      for (const o of (occ ?? []) as any[]) {
        const k = `${o.book}-${o.chapter}-${o.verse}`;
        if (!seen.has(k) && refs.length < 80) { seen.add(k); refs.push({ b: o.book, c: o.chapter, v: o.verse }); }
        const fr = String(o.gloss_fr ?? '').replace(/[\[\]«»"]/g, '').trim().toLowerCase();
        if (fr && fr.length < 40 && fr !== 'objet') tally.set(fr, (tally.get(fr) ?? 0) + 1);
      }
      const renderings = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([fr, n]) => ({ fr, n }));
      usage = { count: count ?? refs.length, refs, renderings };
    }

    // Une fiche complete ne change plus : on la garde en cache cote serveur et navigateur.
    const headers = data.definition_fr
      ? { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000' }
      : undefined;
    return NextResponse.json(usage ? { ...data, usage } : data, { headers });
  }

  if (q.length < 2) return NextResponse.json({ results: [] });

  const like = `%${q}%`;
  const { data } = await admin.from('strongs')
    .select('code, lang, lemma, translit, definition_en, definition_fr')
    .or(`lemma.ilike.${like},translit.ilike.${like},definition_en.ilike.${like},definition_fr.ilike.${like}`)
    .limit(40);

  return NextResponse.json({ results: data ?? [] },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' } });
}
