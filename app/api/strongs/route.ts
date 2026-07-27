import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { callText } from '@/lib/llm';
import { VOICE } from '@/lib/prompts/voice';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Lexique Strong.
 *   ?q=agape        recherche par mot, translitteration ou definition
 *   ?code=G26       une entree precise
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

    // Traduction francaise a la demande, une seule fois.
    if (!data.definition_fr && data.definition_en) {
      try {
        const { text } = await callText({
          system: `Tu traduis et eclaires une entree du lexique Strong pour un lecteur francophone.

${VOICE}

Donne en trois a quatre phrases : le sens du mot en francais, sa nuance propre,
et ce que le francais courant ne rend pas. Pas de titre, pas de liste, du texte suivi.`,
          user: `Mot ${data.lang} : ${data.lemma ?? ''} (${data.translit ?? ''})
Definition anglaise de Strong : ${data.definition_en}
${data.derivation ? `Etymologie : ${data.derivation}` : ''}
${data.kjv_def ? `Traductions retenues : ${data.kjv_def}` : ''}`,
          maxTokens: 700
        });
        const fr = text.trim();
        if (fr) {
          await admin.from('strongs').update({ definition_fr: fr }).eq('code', data.code);
          data.definition_fr = fr;
        }
      } catch { /* on renvoie l'entree sans traduction plutot que d'echouer */ }
    }
    return NextResponse.json(data);
  }

  if (q.length < 2) return NextResponse.json({ results: [] });

  const like = `%${q}%`;
  const { data } = await admin.from('strongs')
    .select('code, lang, lemma, translit, definition_en, definition_fr')
    .or(`lemma.ilike.${like},translit.ilike.${like},definition_en.ilike.${like},definition_fr.ilike.${like}`)
    .limit(40);

  return NextResponse.json({ results: data ?? [] });
}
