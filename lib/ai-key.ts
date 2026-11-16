'use client';
/**
 * Clé Gemini PERSONNELLE du lecteur.
 * Gardée uniquement sur cet appareil (localStorage). Envoyée seulement au
 * moment d'une génération IA, dans l'en-tête x-gemini-key ; jamais enregistrée
 * côté serveur. Ainsi chacun utilise son propre quota gratuit Google.
 */
const K = 'pq-gemini-key';
// Formats Google : l'ancien « AIza… » et le nouveau « AQ.… » (clés liées à un compte).
export const KEY_RE = /^(AIza[0-9A-Za-z_\-]{30,60}|AQ\.[0-9A-Za-z_\-.]{20,300})$/;

export function getAiKey(): string {
  try { return localStorage.getItem(K) ?? ''; } catch { return ''; }
}
export function setAiKey(v: string) {
  try { v ? localStorage.setItem(K, v.trim()) : localStorage.removeItem(K); } catch {}
  try { window.dispatchEvent(new Event('pq-ai-key')); } catch {}
}
export const hasAiKey = () => KEY_RE.test(getAiKey());

/** En-têtes à ajouter aux appels IA. */
export function aiHeaders(extra?: Record<string, string>): Record<string, string> {
  const k = getAiKey();
  return { ...(extra ?? {}), ...(KEY_RE.test(k) ? { 'x-gemini-key': k } : {}) };
}

/** fetch qui ajoute la clé du lecteur. */
export function aiFetch(url: string, init: RequestInit = {}) {
  return fetch(url, { ...init, headers: aiHeaders(init.headers as Record<string, string> | undefined) });
}

/** Ouvre le guide « Mon assistant IA » depuis n'importe où. */
export function openAiSetup() {
  try { window.dispatchEvent(new Event('pq-open-ai')); } catch {}
}

/** Vérifie la clé directement auprès de Google (sans passer par notre serveur). */
export async function testAiKey(k: string): Promise<'ok' | 'bad' | 'net'> {
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', {
      headers: { 'x-goog-api-key': k }
    });
    if (r.ok) return 'ok';
    return r.status === 400 || r.status === 401 || r.status === 403 ? 'bad' : 'net';
  } catch { return 'net'; }
}
