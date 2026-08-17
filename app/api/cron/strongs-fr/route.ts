import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { callText } from '@/lib/llm';
import { VOICE } from '@/lib/prompts/voice';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * MISE EN FRANCAIS DU LEXIQUE STRONG — EN ARRIERE-PLAN
 *
 * La table `strongs` (concordance de James Strong, 1890) contient toutes les
 * entrees hebreu/grec avec leur definition d'origine (anglaise). La traduction
 * francaise (definition_fr) est produite a la demande quand un lecteur ouvre
 * une fiche ; ce cron la PRE-REMPLIT petit a petit pour que, a terme, tout le
 * lexique soit deja en francais, sans attendre.
 *
 * Il traite simplement les entrees ou definition_fr est encore vide : aucun
 * curseur necessaire, il en reste de moins en moins. Relancable sans risque.
 *
 *   ?n=20   nombre d'entrees traduites par appel (defaut 20, max 50)
 */
const SYSTEM = `Tu traduis et eclaires une entree du lexique Strong pour un lecteur francophone.

${VOICE}

Donne en trois a quatre phrases : le sens du mot en francais, sa nuance propre,
et ce que le francais courant ne rend pas. Pas de titre, pas de liste, du texte suivi.`;

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const limit = Math.min(Math.max(1, Number(new URL(req.url).searchParams.get('n') ?? 20)), 50);
  const started = Date.now();
  const BUDGET_MS = 200_000; // on rend la main avant la coupure Vercel (300 s)

  const { data: rows } = await admin.from('strongs')
    .select('code, lang, lemma, translit, definition_en, derivation, kjv_def')
    .is('definition_fr', null)
    .not('definition_en', 'is', null)
    .order('code')
    .limit(limit);

  if (!rows || rows.length === 0) {
    return NextResponse.json({ ok: true, done: true, message: 'Tout le lexique est deja en francais.' });
  }

  let translated = 0;
  const errors: string[] = [];
  let stopped = false;

  for (const d of rows) {
    if (Date.now() - started > BUDGET_MS) { stopped = true; break; }
    try {
      const { text } = await callText({
        system: SYSTEM,
        user: `Mot ${d.lang} : ${d.lemma ?? ''} (${d.translit ?? ''})
Definition anglaise de Strong : ${d.definition_en}
${d.derivation ? `Etymologie : ${d.derivation}` : ''}
${d.kjv_def ? `Traductions retenues : ${d.kjv_def}` : ''}`,
        maxTokens: 700
      });
      const fr = text.trim();
      if (fr) {
        await admin.from('strongs').update({ definition_fr: fr }).eq('code', d.code);
        translated++;
      }
    } catch (e: any) {
      errors.push(`${d.code} : ${String(e?.message ?? e).slice(0, 120)}`);
      // Quota ou panne : on s'arrete, on reprendra au prochain appel.
      stopped = true;
      break;
    }
  }

  return NextResponse.json({
    ok: true, translated, batch: rows.length, stopped,
    errors: errors.length ? errors : undefined
  });
}
