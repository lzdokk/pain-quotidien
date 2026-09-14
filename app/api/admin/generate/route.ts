import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/* Emails admin (bypass) — meme reglage que le cursus / le diagnostic. */
const ADMINS = (process.env.CURSUS_ADMINS ?? 'lzdokk@gmail.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

/* ══════════════════════════════════════════════════════════════════
   FORCER LA GENERATION D'UN JOUR — DEPUIS L'APP, EN ADMIN
   -----------------------------------------------------------------
   POST /api/admin/generate  { "date": "AAAA-MM-JJ" }
   ou   GET  /api/admin/generate?date=AAAA-MM-JJ
   -> reserve a ton email admin (aucun secret a taper cote client)
   -> genere ce jour via le moteur hebdomadaire (le CRON_SECRET reste
      cote serveur), puis PUBLIE le jour et rafraichit les pages.
   ══════════════════════════════════════════════════════════════════ */
async function handle(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, error: 'date invalide (AAAA-MM-JJ)' }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base || !process.env.CRON_SECRET) {
    return NextResponse.json({
      ok: false, error: 'NEXT_PUBLIC_SITE_URL ou CRON_SECRET manquant cote serveur',
    }, { status: 500 });
  }

  // 1. Generation du jour precis (le moteur hebdo sait faire ?date=…).
  const gen = await fetch(`${base}/api/cron/weekly?date=${date}`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  }).then(r => r.json()).catch((e) => ({ ok: false, error: String(e) }));

  // 2. Le jour existe-t-il maintenant ? Si oui, on le publie.
  const { data: fresh } = await admin.from('daily_bread')
    .select('date').eq('date', date).maybeSingle();

  if (!fresh) {
    return NextResponse.json({ ok: false, date, published: false, gen }, { status: 502 });
  }

  await admin.from('daily_bread').update({ published: true }).eq('date', date);
  revalidatePath('/pain');
  revalidatePath('/priere');
  revalidatePath('/soir');
  revalidatePath(`/jour/${date}`);
  revalidatePath('/');

  return NextResponse.json({ ok: true, date, published: true, gen });
}

async function guard() {
  try {
    const sb = await supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    return !!user?.email && ADMINS.includes(user.email.toLowerCase());
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  if (!(await guard())) return new NextResponse('Reserve a l\'admin', { status: 401 });
  const body = await req.json().catch(() => ({}));
  const url = new URL(req.url);
  const date = (body?.date ?? url.searchParams.get('date') ?? '').trim();
  return handle(date);
}

export async function GET(req: NextRequest) {
  if (!(await guard())) return new NextResponse('Reserve a l\'admin', { status: 401 });
  const date = (new URL(req.url).searchParams.get('date') ?? '').trim();
  return handle(date);
}
