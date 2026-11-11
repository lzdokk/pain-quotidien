import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Le Cursus est désormais réservé au responsable : plus d'accès par code. */
export async function POST() {
  return NextResponse.json({ ok: false });
}
