import { createClient } from '@supabase/supabase-js';

/** Client service_role. Serveur uniquement, jamais importe dans un composant client. */
export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
