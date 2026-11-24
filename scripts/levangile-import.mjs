// Import unique depuis levangile.com (accord de son propriétaire) :
//   • le lexique Strong en français (grec, hébreu)  → table strongs (colonnes fr_*)
//   • le dictionnaire biblique Westphal              → table dictionnaire
// Lancé par .github/workflows/levangile-import.yml. Rythme doux : 2 pages à la fois.
// N'écrit rien dans le dépôt : les lignes sont envoyées à l'API du site.
const BASE = 'https://www.levangile.com/';
const SITE = 'https://paindevie.vercel.app';
const UA = 'Mozilla/5.0 (compatible; PainDeVie-import; accord du proprietaire)';
const SECRET = process.env.CRON_SECRET;
const SOURCES = (process.env.LANGS || 'grec,hebreu,westphal').split(',').map(s => s.trim()).filter(Boolean);
const LIMIT = Number(process.env.LIMIT || 0); // 0 = tout
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url) {
  for (let t = 0; t < 4; t++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA } });
      if (r.status === 404) return null;
      if (r.ok) return await r.text();
    } catch {}
    await sleep(3000 * (t + 1));
  }
  return null;
}

/* ── Texte ─────────────────────────────────────────────────────────── */
export const dec = s => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è').replace(/&agrave;/g, 'à').replace(/&ccedil;/g, 'ç').replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const clean = h => h.replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/<sup>\s*0*(\d+)\s*<\/sup>/gi, ' ($1)');
const txt = h => dec(clean(h).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.)])/g, '$1').trim();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');

/** Garde seulement les balises permises (sans attribut) ; tout le reste devient du texte échappé.
 *  `keep` : balises déjà converties, protégées par \u0001…\u0002. */
function sanitize(h, allowed) {
  const keep = [];
  h = h.replace(/\u0003([^\u0004]*)\u0004/g, (_, x) => { keep.push(x); return `\u0005${keep.length - 1}\u0006`; });
  const re = new RegExp(`<(\\/?)(${allowed.join('|')})\\b[^>]*>`, 'gi');
  const marked = h.replace(re, (_, sl, t) => `\u0001${sl}${t.toLowerCase()}\u0002`).replace(/<[^>]+>/g, ' ');
  return esc(dec(marked))
    .replace(/\u0005(\d+)\u0006/g, (_, i) => keep[+i])
    .replace(/\u0001/g, '<').replace(/\u0002/g, '>')
    .replace(/[ \t\r\n]+/g, ' ').replace(/>\s+</g, '><').trim();
}

/* ── Strong ────────────────────────────────────────────────────────── */
export function parseStrong(p) {
  const a = p.indexOf('Strong numéro'); if (a < 0) return null;
  const b = p.indexOf('Concordance biblique', a);
  const s = p.slice(a, b > 0 ? b : undefined);
  const orig = s.match(/<td class="(?:hebreu|grec)">[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/);
  const tr = s.match(/translitt[\s\S]*?<\/tr>\s*<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/);
  const def = s.match(/Définition de[\s\S]*?<td colspan="2">([\s\S]*?)<\/td>/);
  const lsg = s.match(/traduit dans la Louis Segond par[\s\S]*?<td colspan="2">([\s\S]*?)<\/td>/);
  const plain = def ? dec(clean(def[1]).replace(/<li\b[^>]*>/gi, '\n').replace(/<[^>]+>/g, ' '))
    .split('\n').map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' ; ') : null;
  return {
    fr_def: def ? sanitize(clean(def[1]), ['ol', 'ul', 'li']) : null,
    definition_fr: plain || null,
    fr_lsg: lsg ? txt(lsg[1]) || null : null,
    fr_origine: orig ? txt(orig[1]) || null : null,
    fr_type: tr ? txt(tr[2]) || null : null
  };
}

/* ── Westphal ──────────────────────────────────────────────────────── */
export function parseWestphal(p) {
  const t = p.match(/<h1>([\s\S]*?)<br/);
  const a = p.indexOf('<div id="logos">');
  if (!t || a < 0) return null;
  const b = p.indexOf('<div class="read-more">', a);
  let h = p.slice(a + '<div id="logos">'.length, b > 0 ? b : undefined).replace(/<\/div>\s*$/, '');
  // Renvois vers un verset : quick_pick('Esther', '1', '10', '0')
  h = h.replace(/<span[^>]*quick_pick\('([^']*)',\s*'(\d+)',\s*'(\d+)',\s*'(\d+)'\)[^>]*>([\s\S]*?)<\/span>/g,
    (_, bk, c, v, e, inner) => `\u0003<a data-ref="${attr(`${dec(bk)} ${c}${+v ? '.' + v : ''}${+e ? '-' + e : ''}`)}">\u0004${inner}\u0003</a>\u0004`);
  // Renvois vers un autre article : quick_pick_d('W','Assuérus')
  h = h.replace(/<span[^>]*quick_pick_d\('W',\s*'([^']*)'\)[^>]*>([\s\S]*?)<\/span>/g,
    (_, w, inner) => `\u0003<a data-w="${attr(dec(w))}">\u0004${inner}\u0003</a>\u0004`);
  const html = sanitize(h.replace(/<svg[\s\S]*?<\/svg>/gi, ''), ['p', 'br', 'em', 'i', 'b', 'strong', 'ul', 'ol', 'li', 'sup', 'sub', 'blockquote', 'h3', 'h4']);
  const texte = txt(h.replace(/[\u0003\u0004]/g, '').replace(/<\/?(?:a|span|em|i|b|strong|sup|sub)\b[^>]*>/gi, ''));
  return { titre: txt(t[1]), html, texte };
}

/* ── Envoi ─────────────────────────────────────────────────────────── */
async function send(path, rows) {
  for (let t = 0; t < 5; t++) {
    const r = await fetch(SITE + path, {
      method: 'POST', headers: { authorization: `Bearer ${SECRET}`, 'content-type': 'application/json' },
      body: JSON.stringify({ rows })
    }).catch(() => null);
    if (r?.ok) return;
    console.log('envoi refusé', r?.status, r ? (await r.text()).slice(0, 200) : '');
    await sleep(6000);
  }
  throw new Error('envoi impossible');
}

async function crawl(list, re) {
  const urls = new Map();
  for (let page = 1; page < 3000; page++) {
    const h = await get(`${BASE}${list}?page=${page}`);
    const before = urls.size;
    for (const m of (h ?? '').matchAll(re)) if (!urls.has(+m[1])) urls.set(+m[1], m[0]);
    if (urls.size === before) break;
    if (LIMIT && urls.size >= LIMIT) break;
    await sleep(150);
  }
  let todo = [...urls.entries()].sort((x, y) => x[0] - y[0]);
  if (LIMIT) todo = todo.slice(0, LIMIT);
  return todo;
}

async function run(todo, path, build) {
  let ok = 0, miss = 0, i = 0, batch = [];
  async function worker() {
    while (i < todo.length) {
      const [num, url] = todo[i++];
      const h = await get(url.startsWith('http') ? url : BASE + url.replace(/^\//, ''));
      const row = h && build(num, h);
      if (row) { batch.push(row); ok++; } else miss++;
      if (batch.length >= 120) { const b = batch; batch = []; await send(path, b); }
      if ((ok + miss) % 1000 === 0) console.log(`  … ${ok + miss} / ${todo.length}`);
      await sleep(120);
    }
  }
  await Promise.all([worker(), worker()]);
  if (batch.length) await send(path, batch);
  return { ok, miss };
}

if (process.argv[1] && process.argv[1].endsWith('levangile-import.mjs') && !process.env.NO_RUN) {
  for (const src of SOURCES) {
    if (src === 'westphal') {
      const todo = await crawl('Dictionnaire-Biblique/Liste-Definitions-Westphal.php', /Dictionnaire-Biblique\/definition-westphal-(\d+)-[^"'\s#?]*/g);
      console.log(`westphal : ${todo.length} articles à lire`);
      const r = await run(todo, '/api/cron/dict-import', (id, h) => { const w = parseWestphal(h); return w && w.titre ? { source: 'westphal', id, ...w } : null; });
      console.log(`westphal : ${r.ok} articles importés, ${r.miss} vides ou introuvables`);
    } else {
      const P = src === 'grec' ? 'G' : 'H';
      const todo = await crawl(src === 'grec' ? 'Liste-Strong-Grec.php' : 'Liste-Strong-Hebreu.php', new RegExp(`lexique-${src}-(\\d+)-[^"'\\s#?]+`, 'g'));
      console.log(`${src} : ${todo.length} fiches à lire`);
      const r = await run(todo, '/api/cron/strongs-import', (num, h) => { const f = parseStrong(h); return f && (f.fr_def || f.fr_lsg) ? { code: `${P}${num}`, lang: src, num, ...f } : null; });
      console.log(`${src} : ${r.ok} fiches importées, ${r.miss} vides ou introuvables`);
    }
  }
}
