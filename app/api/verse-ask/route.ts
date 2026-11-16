import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { callText } from '@/lib/llm';
import { aiAccess, needKey, keyError } from '@/lib/ai-access';
import { VOICE } from '@/lib/prompts/voice';

export const maxDuration = 45;
export const dynamic = 'force-dynamic';

/**
 * Réponse IA à une question libre sur un (ou plusieurs) verset(s), avec la
 * clé Gemini du lecteur (ou le pool du site pour l'admin).
 *   body : { reference, text, question }
 */
export async function POST(req: NextRequest) {
  const { reference, text, question } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: 'Question vide.' }, { status: 400 });

  const access = await aiAccess(req);
  if (!access) return needKey();

  try {
    const { text: answer } = await callText({
      system: `${VOICE}

Tu réponds à une question précise posée sur un passage biblique. Appuie-toi sur le texte cité et son contexte, reste fidèle et clair. Deux à quatre courts paragraphes maximum. Pas de salutations ni de formule d'ouverture.`,
      user: `Passage : « ${text} » (${reference}).

Question : ${question}`,
      maxTokens: 1200,
      timeoutMs: 45_000,
      userKey: access.userKey
    });

    if (access.user) {
      const uid = access.user.id;
      await admin.from('conversations').insert([
        { user_id: uid, role: 'user', content: question, context_ref: reference ?? null },
        { user_id: uid, role: 'assistant', content: answer, source: 'verse-ask' }
      ]).then(() => {}, () => {});
    }

    return NextResponse.json({ answer });
  } catch (e) {
    return keyError(e);
  }
}
