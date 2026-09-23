importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

/* ══════════════════════════════════════════════════════════════════════
   PAIN DE VIE — cache hors-ligne (par-dessus OneSignal, sans toucher au push)
   -----------------------------------------------------------------------
   • Pages visitees + assets Next.js  -> relisibles hors ligne (avion)
   • Lecture des versets (Supabase)   -> stale-while-revalidate
   Le handler laisse PASSER normalement tout ce qu'il ne gere pas : en cas de
   bug il ne casse rien. Pour tout revenir en arriere : remettre ce fichier a
   la seule ligne importScripts ci-dessus.
   ══════════════════════════════════════════════════════════════════════ */
const PDV_PAGES = 'pdv-pages-v1';
const PDV_ASSETS = 'pdv-assets-v1';
const PDV_DATA = 'pdv-data-v1';

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([PDV_PAGES, PDV_ASSETS, PDV_DATA]);
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('pdv-') && !keep.has(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // Ne jamais interferer avec OneSignal.
  if (url.hostname.includes('onesignal') || url.pathname.includes('OneSignal')) return;

  // 1) Assets immuables (Next.js + fichiers statiques) -> cache d'abord.
  if (url.origin === self.location.origin &&
      (url.pathname.startsWith('/_next/static/') ||
       /\.(css|js|woff2?|ttf|otf|png|jpe?g|svg|webp|ico|mp3|json)$/.test(url.pathname))) {
    event.respondWith(cacheFirst(req, PDV_ASSETS));
    return;
  }

  // 2) Lecture des versets (Supabase REST) -> cache + rafraichissement.
  if (url.hostname.endsWith('.supabase.co') && url.pathname.includes('/rest/v1/')) {
    event.respondWith(staleWhileRevalidate(req, PDV_DATA));
    return;
  }

  // 3) Navigations (pages de l'app) -> reseau d'abord, repli cache.
  if (req.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(networkFirst(req, PDV_PAGES));
    return;
  }
  // Tout le reste : on ne fait rien (comportement navigateur normal).
});

async function cacheFirst(req, name) {
  try {
    const cache = await caches.open(name);
    const hit = await cache.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch { return (await caches.match(req)) || Response.error(); }
}

async function networkFirst(req, name) {
  const cache = await caches.open(name);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req);
    if (hit) return hit;
    const fallback = (await cache.match('/pain')) || (await cache.match('/'));
    return fallback || new Response(
      '<meta charset="utf-8"><div style="font-family:system-ui;padding:40px;text-align:center;color:#4E6A85">Hors ligne — cette page n’a pas encore été ouverte. Reconnectez-vous une fois pour la garder.</div>',
      { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await net) || Response.error();
}
