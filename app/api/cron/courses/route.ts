import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { callJSON, cost, PROVIDER, modelName } from '@/lib/llm';
import { CourseSchema, COURSE_SYSTEM, courseUserPrompt, COURSE_GEMINI_SCHEMA } from '@/lib/prompts/course';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * GENERATION DU CURSUS, PAR PAQUETS, A LA DEMANDE
 * Independant de l'hebdomadaire. Genere les fiches de cours encore en
 * attente, dans l'ordre du cursus, et les stocke en base une fois pour
 * toutes. On peut donc prendre de l'avance sur son parcours.
 *
 *   ?batch=5            généré les 5 prochaines fiches "planned" (defaut 5)
 *   ?codes=UBE01,UBE02  généré exactement ces fiches, même ordre
 *   ?force=1            regenere même les fiches déjà produites
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = new URL(req.url);
  const batch = Math.min(Math.max(1, Number(url.searchParams.get('batch') ?? 5)), 12);
  const codes = url.searchParams.get('codes');
  const force = url.searchParams.get('force') === '1';

  const cols = 'code, title, kind, hook, hours, order_index';
  let pending: any[] | null = null;

  if (codes) {
    const { data } = await admin.from('courses').select(cols)
      .in('code', codes.split(',').map(s => s.trim())).order('order_index');
    pending = data;
  } else {
    let q = admin.from('courses').select(cols).order('order_index').limit(batch);
    if (!force) q = q.eq('status', 'planned');
    const { data } = await q;
    pending = data;
  }

  if (!pending?.length) {
    return NextResponse.json({ ok: true, generated: 0, remaining: 0, message: 'Rien a generer. Lance seed:ref si le cursus est vide.' });
  }

  let generated = 0, totalIn = 0, totalOut = 0;
  const errors: string[] = [];

  for (const c of pending) {
    try {
      const { data, usage } = await callJSON(CourseSchema, {
        system: COURSE_SYSTEM,
        user: courseUserPrompt(c),
        responseSchema: COURSE_GEMINI_SCHEMA,
        maxTokens: 16000
      });
      totalIn += usage.input; totalOut += usage.output;

      const { error } = await admin.from('courses').update({
        objectives: data.objectives,
        parable: data.parable,
        body: data.body,
        key_verse: data.key_verse,
        key_verse_ref: data.key_verse_ref,
        readings: data.readings,
        assignment: data.assignment,
        status: 'reviewed'
      }).eq('code', c.code);
      if (error) throw new Error(error.message);
      generated++;
    } catch (e: any) {
      errors.push(`${c.code} : ${String(e?.message ?? e)}`);
    }
  }

  const { count: remaining } = await admin.from('courses')
    .select('code', { count: 'exact', head: true }).eq('status', 'planned');

  revalidatePath('/cursus');
  return NextResponse.json({
    ok: generated > 0,
    generated,
    done: pending.filter(c => !errors.some(e => e.startsWith(c.code))).map(c => c.code),
    remaining: remaining ?? 0,
    model: `${PROVIDER}/${modelName()}`,
    errors: errors.length ? errors : undefined,
    cost_usd: +cost(totalIn, totalOut).toFixed(4)
  });
}
