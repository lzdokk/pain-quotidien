import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import { callText, cost, PROVIDER } from '@/lib/llm';
import { aiAccess, needKey, keyError } from '@/lib/ai-access';
import { VOICE } from '@/lib/prompts/voice';

export const maxDuration = 60;
/** off = base de questions uniquement, aucun appel modèle, cout garanti nul. */
const MODE = (process.env.AI_ASSISTANT ?? 'on') as 'on' | 'off';

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
   .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * 1. Recherche dans la base de questions : gratuit, instantane.
 * 2. Sinon appel Claude, decompte du quota quotidien.
 * 3. La question est enregistrée ; au bout de trois occurrences elle
 *    est promue pour redaction et rejoint la base gratuite.
 */
export async function POST(req: NextRequest) {
  const { question, context } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: 'Question vide' }, { status: 400 });

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });

  // ── 1. La base d'abord ────────────────────────────────────────────
  const { data: hits } = await admin
    .from('faq')
    .select('id, category, question, short_answer, parable, body, verses')
    .textSearch('question', question, { config: 'french', type: 'websearch' })
    .eq('reviewed', true)
    .limit(1);

  if (hits?.length) {
    const f = hits[0];
    await admin.rpc('increment_faq', { p_id: f.id }).then(() => {}, () => {});
    await admin.from('conversations').insert([
      { user_id: user.id, role: 'user', content: question, context_ref: context ?? null },
      { user_id: user.id, role: 'assistant', content: JSON.stringify(f), source: 'faq' }
    ]);
    return NextResponse.json({ source: 'faq', answer: f, quotaUsed: false });
  }

  // ── 2. Rien trouve : on enregistre la question pour enrichir la base ──
  const norm = normalize(question);
  await admin.from('pending_questions')
    .upsert({ question, normalized: norm, hits: 1, last_asked: new Date().toISOString() },
            { onConflict: 'normalized', ignoreDuplicates: false });
  await admin.rpc('bump_pending', { p_norm: norm }).then(() => {}, () => {});

  if (MODE === 'off' || PROVIDER === 'none') {
    return NextResponse.json({
      source: 'none',
      message: "Cette question n'est pas encore dans la base. Elle vient d'y être ajoutée : "
             + "les questions qui reviennent sont redigees puis publiées, et deviennent alors "
             + "consultables gratuitement par tout le monde."
    });
  }

  // ── 3. Clé Gemini du lecteur (ou pool du site pour l'admin) ─────
  const access = await aiAccess(req);
  if (!access) return needKey();

  // ── 4. Appel du modele ───────────────────────────────────────────
  let answer = '', usage = { input: 0, output: 0 };
  try {
    ({ text: answer, usage } = await callText({
    system: `Tu reponds a une question de foi pour le lecteur du Pain quotidien.

${VOICE}

FORMAT DE REPONSE
Commence par une phrase de synthese. Puis une image concrete du quotidien.
Puis deux paragraphes de developpement qui reconnaissent honnetement les
objections serieuses. Termine par deux ou trois références bibliques.
Si la question touche a un point debattu entre chretiens, dis-le clairement.`,
    user: context ? `Contexte de lecture : ${context}\n\nQuestion : ${question}` : question,
    maxTokens: 1600,
    userKey: access.userKey
    }));
  } catch (e) { return keyError(e); }

  await admin.from('conversations').insert([
    { user_id: user.id, role: 'user', content: question, context_ref: context ?? null },
    { user_id: user.id, role: 'assistant', content: answer, source: 'ai' }
  ]);

  return NextResponse.json({
    source: 'ai', answer, quotaUsed: !access.userKey,
    cost_usd: access.userKey ? 0 : +cost(usage.input, usage.output).toFixed(5)
  });
}
