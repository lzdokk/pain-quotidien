import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import { callText, PROVIDER } from '@/lib/llm';
import { VOICE } from '@/lib/prompts/voice';

export const maxDuration = 45;
export const dynamic = 'force-dynamic';

const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 50);

/**
 * Réponse IA à une question libre sur un (ou plusieurs) verset(s).
 * Décompte le quota quotidien par utilisateur (comme /api/ask).
 *   body : { reference, text, question }
 */
export async function POST(req: NextRequest) {
  const { reference, text, question } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: 'Question vide.' }, { status: 400 });

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour poser une question.' }, { status: 401 });
  if (PROVIDER === 'none') return NextResponse.json({ error: 'Assistant indisponible pour le moment.' }, { status: 503 });

  const { data: allowed } = await admin.rpc('consume_ai_quota', { p_user: user.id, p_limit: DAILY_LIMIT });
  if (!allowed) {
    return NextResponse.json({
      error: `Vous avez utilisé vos ${DAILY_LIMIT} questions du jour. Le compteur repart demain matin.`
    }, { status: 429 });
  }

  try {
    const { text: answer } = await callText({
      system: `${VOICE}

Tu réponds à une question précise posée sur un passage biblique. Appuie-toi sur le texte cité et son contexte, reste fidèle et clair. Deux à quatre courts paragraphes maximum. Pas de salutations ni de formule d'ouverture.`,
      user: `Passage : « ${text} » (${reference}).

Question : ${question}`,
      maxTokens: 1200,
      timeoutMs: 45_000
    });

    await admin.from('conversations').insert([
      { user_id: user.id, role: 'user', content: question, context_ref: reference ?? null },
      { user_id: user.id, role: 'assistant', content: answer, source: 'verse-ask' }
    ]).then(() => {}, () => {});

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: 'La réponse a échoué, réessayez dans un instant.' }, { status: 502 });
  }
}
