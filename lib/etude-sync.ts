import { supabase } from '@/lib/supabase/client';

/**
 * Synchronisation du suivi d'étude et des carnets entre appareils.
 * Stockage dans la table existante `notes` (déjà protégée : chacun ne voit que
 * les siennes), avec une référence réservée « ~etude:… ». Ces lignes sont
 * masquées du carnet de bord (voir Reader et la page Compte).
 * Hors connexion ou en cas d'erreur : tout continue de marcher en local.
 */
export const ETUDE_PREFIX = '~etude:';
let uid: string | null | undefined;
try { supabase.auth.onAuthStateChange(() => { uid = undefined; }); } catch {}

async function userId(): Promise<string | null> {
  if (uid !== undefined) return uid;
  try { const { data } = await supabase.auth.getUser(); uid = data.user?.id ?? null; } catch { uid = null; }
  return uid;
}

export async function getRemote(key: string): Promise<{ body: string; t: number } | null> {
  try {
    const u = await userId(); if (!u) return null;
    const { data } = await supabase.from('notes').select('id, body, updated_at')
      .eq('user_id', u).eq('reference', ETUDE_PREFIX + key).order('id').limit(1);
    const r = data?.[0];
    return r ? { body: r.body as string, t: Date.parse(r.updated_at as string) || 0 } : null;
  } catch { return null; }
}

export async function putRemote(key: string, body: string): Promise<void> {
  try {
    const u = await userId(); if (!u) return;
    const ref = ETUDE_PREFIX + key;
    const now = new Date().toISOString();
    const { data } = await supabase.from('notes').select('id').eq('user_id', u).eq('reference', ref).order('id');
    if (data && data.length) {
      await supabase.from('notes').update({ body, updated_at: now }).eq('id', data[0].id);
      if (data.length > 1) await supabase.from('notes').delete().in('id', data.slice(1).map((x: any) => x.id));
    } else {
      await supabase.from('notes').insert({ user_id: u, reference: ref, body, updated_at: now });
    }
  } catch {}
}

/** Toutes les lignes dont la clé commence par `prefix` (ex. « suivi: »). */
export async function listRemote(prefix: string): Promise<Array<{ key: string; body: string; t: number }>> {
  try {
    const u = await userId(); if (!u) return [];
    const { data } = await supabase.from('notes').select('reference, body, updated_at')
      .eq('user_id', u).like('reference', ETUDE_PREFIX + prefix + '%').order('id').limit(2000);
    return (data ?? []).map((r: any) => ({ key: String(r.reference).slice(ETUDE_PREFIX.length), body: r.body as string, t: Date.parse(r.updated_at) || 0 }));
  } catch { return []; }
}

/** Retire une ligne (action explicite du lecteur, ex. supprimer une entrée de son carnet). */
export async function delRemote(key: string): Promise<void> {
  try {
    const u = await userId(); if (!u) return;
    await supabase.from('notes').delete().eq('user_id', u).eq('reference', ETUDE_PREFIX + key);
  } catch {}
}
