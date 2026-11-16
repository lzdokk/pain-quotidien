import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { isCursusAdmin } from '@/lib/cursus-admins';

/**
 * QUI PAIE L'APPEL IA ?
 * ─────────────────────
 * • Le lecteur a mis SA clé Gemini (gratuite) dans l'app : elle arrive dans
 *   l'en-tête x-gemini-key, l'appel passe par son quota à lui. La clé n'est
 *   jamais enregistrée ni journalisée côté serveur.
 * • Le responsable du site (admin) : le pool de clés du site, comme avant.
 * • Sinon : pas d'appel IA. Les contenus déjà générés (en base) restent
 *   gratuits pour tout le monde ; seul ce qui n'existe pas encore demande une clé.
 */
export type AIAccess = { userKey?: string; admin: boolean; user: { id: string; email?: string | null } | null };

// Formats Google : l'ancien « AIza… » et le nouveau « AQ.… ».
const KEY_RE = /^(AIza[0-9A-Za-z_\-]{30,60}|AQ\.[0-9A-Za-z_\-.]{20,300})$/;

export async function aiAccess(req: NextRequest): Promise<AIAccess | null> {
  const raw = (req.headers.get('x-gemini-key') ?? '').trim();
  const userKey = KEY_RE.test(raw) ? raw : undefined;
  let user: AIAccess['user'] = null;
  try {
    const sb = await supabaseServer();
    const { data } = await sb.auth.getUser();
    user = data.user ? { id: data.user.id, email: data.user.email } : null;
  } catch { /* lecteur non connecté */ }
  const admin = isCursusAdmin(user?.email);
  if (userKey) return { userKey, admin, user };
  if (admin) return { admin: true, user };
  return null;
}

/** Réponse standard quand une clé est nécessaire (l'app ouvre alors le guide). */
export const needKey = () => NextResponse.json({
  needKey: true,
  error: 'Ajoute ta clé Gemini gratuite pour utiliser l’assistant.'
}, { status: 402 });

/** Message clair quand la clé du lecteur est refusée ou à court de quota. */
export function keyError(e: any) {
  const st = e?.status;
  if (st === 400 || st === 401 || st === 403) {
    return NextResponse.json({ needKey: true, error: 'Ta clé Gemini est refusée par Google. Vérifie-la dans « Mon assistant IA ».' }, { status: 402 });
  }
  if (st === 429) {
    return NextResponse.json({ error: 'Ton quota Gemini gratuit du moment est atteint. Réessaie un peu plus tard.' }, { status: 429 });
  }
  return NextResponse.json({ error: 'La réponse a échoué, réessaie dans un instant.' }, { status: 502 });
}
