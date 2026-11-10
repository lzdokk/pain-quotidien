import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase PUBLIC (clé anonyme, sans cookie de session).
 * Pour les pages de contenu : comme il ne lit pas les cookies, la page peut
 * être générée à l'avance et servie instantanément (cache Vercel).
 * Les données personnelles se chargent ensuite dans le navigateur.
 */
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function supabasePublic() {
  return client;
}
