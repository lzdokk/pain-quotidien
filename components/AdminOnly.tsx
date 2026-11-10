'use client';
import { useIsAdmin } from '@/lib/useUser';

/** Affiche son contenu seulement pour le responsable (vérifié côté serveur). */
export default function AdminOnly({ children }: { children: React.ReactNode }) {
  return useIsAdmin() ? <>{children}</> : null;
}
