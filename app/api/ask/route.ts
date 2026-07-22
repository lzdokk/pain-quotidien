import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import { callText, cost, PROVIDER } from '@/lib/llm';
import { VOICE } from '@/lib/prompts/voice';

export const maxDuration = 60;
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 8);
/** off = base de questions uniquement, aucun appel modele, cout garanti nul. */
const MODE = (process.env.AI_ASSISTANT ?? 'on') as 'on' | 'off';

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
   .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * 1. Recherche dans la base de questions : gratuit, instantane.
 * 2. Sinon appel Claude, decompte du quota quotidien.
 * 3. La question est enregistree ; au bout de trois occurrences elle
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
      message: "Cette question n'est pas encore dans la base. Elle vient d'y etre ajoutee : "
             + "les questions qui reviennent sont redigees puis publiees, et deviennent alors "
             + "consultables gratuitement par tout le monde."
    });
  }

  // ── 3. Quota par utilisateur, puis plafond global du jour ────────
  const { data: allowed } = await admin.rpc('consume_ai_quota', { p_user: user.id, p_limit: DAILY_LIMIT });
  if (!allowed) {
    return NextResponse.json({
      source: 'quota',
      message: `Vous avez utilise vos ${DAILY_LIMIT} questions du jour. La base de questions reste accessible sans limite, et le compteur repart demain matin.`
    }, { status: 429 });
  }

  const { data: budget } = await admin.rpc('consume_global_budget', {
    p_limit: Number(process.env.AI_GLOBAL_DAILY_CAP ?? 400)
  });
  if (!budget) {
    return NextResponse.json({
      source: 'quota',
      message: "Le plafond quotidien du site est atteint. La base de questions reste accessible, et le compteur repart demain."
    }, { status: 429 });
  }

  // ── 4. Appel du modele ───────────────────────────────────────────
  const { text: answer, usage } = await callText({
    system: `Tu reponds a une question de foi pour le lecteur du Pain quotidien.

${VOICE}

FORMAT DE REPONSE
Commence par une phrase de synthese. Puis une image concrete du quotidien.
Puis deux paragraphes de developpement qui reconnaissent honnetement les
objections serieuses. Termine par deux ou trois references bibliques.
Si la question touche a un point debattu entre chretiens, dis-le clairement.`,
    user: context ? `Contexte de lecture : ${context}\n\nQuestion : ${question}` : question,
    maxTokens: 1600
  });

  await admin.from('conversations').insert([
    { user_id: user.id, role: 'user', content: question, context_ref: context ?? null },
    { user_id: user.id, role: 'assistant', content: answer, source: 'ai' }
  ]);

  const { data: used } = await admin.from('ai_usage')
    .select('count').eq('user_id', user.id).eq('day', new Date().toISOString().slice(0, 10)).single();

  return NextResponse.json({
    source: 'ai', answer, quotaUsed: true,
    remaining: Math.max(0, DAILY_LIMIT - (used?.count ?? DAILY_LIMIT)),
    cost_usd: +cost(usage.input, usage.output).toFixed(5)
  });
}
