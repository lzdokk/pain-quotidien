'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * L'utilisateur connecté, lu DANS LE NAVIGATEUR (session locale, sans appel
 * réseau bloquant). Les pages restent ainsi pré-générées et instantanées ;
 * l'avatar, les couleurs et les notes arrivent juste après.
 */
let current: any = undefined;          // undefined = pas encore lu
const listeners = new Set<(u: any) => void>();
let started = false;

function start() {
  if (started) return;
  started = true;
  supabase.auth.getSession().then(({ data }) => {
    current = data.session?.user ?? null;
    listeners.forEach(f => f(current));
  }).catch(() => { current = null; listeners.forEach(f => f(null)); });
  supabase.auth.onAuthStateChange((_e, session) => {
    current = session?.user ?? null;
    listeners.forEach(f => f(current));
  });
}

export function useUser(initial?: any) {
  const [user, setUser] = useState<any>(initial ?? (current === undefined ? null : current));
  useEffect(() => {
    start();
    if (current !== undefined) setUser(current);
    listeners.add(setUser);
    return () => { listeners.delete(setUser); };
  }, []);
  return user;
}

/** Droits d'administration (vérifiés côté serveur), mis en mémoire. */
let adminPromise: Promise<boolean> | null = null;
export function useIsAdmin() {
  const user = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    adminPromise ??= fetch('/api/me').then(r => r.json()).then(j => !!j.isAdmin).catch(() => false);
    adminPromise.then(setIsAdmin);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return isAdmin;
}
