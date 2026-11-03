import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import { isCursusAdmin } from '@/lib/cursus-admins';

export const dynamic = 'force-dynamic';

/**
 * PARTAGE DE L'ACCÈS AU CURSUS (réservé au responsable) :
 *   GET                 -> { members, code }
 *   POST   { email, name } -> ajoute un frère / une sœur
 *   DELETE ?email=      -> retire l'accès
 *   PATCH  { code }     -> change le code d'accès de la section
 */
async function guard() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  return isCursusAdmin(user?.email) ? user : null;
}
const deny = () => NextResponse.json({ error: 'Réservé au responsable du cursus' }, { status: 403 });

async function currentCode() {
  const { data } = await admin.from('cursus').select('password').not('password', 'is', null).limit(1);
  return (data?.[0]?.password as string | undefined) ?? null;
}

export async function GET() {
  if (!(await guard())) return deny();
  const { data } = await admin.from('cursus_members').select('email, name, created_at').order('created_at', { ascending: false });
  return NextResponse.json({ members: data ?? [], code: await currentCode() });
}

export async function POST(req: NextRequest) {
  const me = await guard(); if (!me) return deny();
  const { email, name } = await req.json().catch(() => ({}));
  const e = String(email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  const { error } = await admin.from('cursus_members')
    .upsert({ email: e, name: String(name ?? '').trim() || null, added_by: me.email });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await guard())) return deny();
  const e = (new URL(req.url).searchParams.get('email') ?? '').trim().toLowerCase();
  if (!e) return NextResponse.json({ error: 'Email manquant' }, { status: 400 });
  await admin.from('cursus_members').delete().eq('email', e);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!(await guard())) return deny();
  const { code } = await req.json().catch(() => ({}));
  const c = String(code ?? '').trim();
  if (c.length < 4) return NextResponse.json({ error: 'Le code doit faire au moins 4 caractères' }, { status: 400 });
  const { error } = await admin.from('cursus').update({ password: c }).not('password', 'is', null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, code: c });
}
