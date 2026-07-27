import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';
import {
  CorrectionSchema, CORRECTION_SYSTEM, correctionUserPrompt, CORRECTION_GEMINI_SCHEMA
} from '@/lib/prompts/correction';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Correction d'un devoir de cursus par l'IA.
 * L'etudiant rend sa réponse, le modèle evalue et explique, le tout est
 * enregistre dans course_submissions (isole par utilisateur via RLS).
 */
export async function POST(req: NextRequest) {
  const { code, submission } = await req.json();
  if (!submission?.trim() || submission.trim().length < 20) {
    return NextResponse.json({ error: 'Ecris ta réponse (au moins quelques phrases) avant d\'envoyer.' }, { status: 400 });
  }

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });

  const { data: allowed } = await admin.rpc('consume_ai_quota', {
    p_user: user.id, p_limit: Number(process.env.AI_DAILY_LIMIT ?? 8)
  });
  if (!allowed) {
    return NextResponse.json({ error: 'Tu as atteint ta limite de corrections du jour. Le compteur repart demain.' }, { status: 429 });
  }

  const { data: c } = await admin.from('courses')
    .select('title, assignment, key_verse').eq('code', code).maybeSingle();
  if (!c) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });

  const { data } = await callJSON(CorrectionSchema, {
    system: CORRECTION_SYSTEM,
    user: correctionUserPrompt({
      title: c.title, assignment: c.assignment, key_verse: c.key_verse, submission
    }),
    responseSchema: CORRECTION_GEMINI_SCHEMA,
    maxTokens: 8000
  });

  await admin.from('course_submissions').insert({
    user_id: user.id, code, submission,
    level: data.level, verdict: data.verdict, strengths: data.strengths,
    gaps: data.gaps, corrections: data.corrections, next_step: data.next_step
  });

  return NextResponse.json(data);
}
