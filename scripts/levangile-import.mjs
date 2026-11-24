// Import unique du lexique Strong français de levangile.com (accord du propriétaire).
// Lancé par .github/workflows/levangile-import.yml. Rythme doux : 2 pages à la fois.
// N'écrit rien dans le dépôt : les lignes sont envoyées à /api/cron/strongs-import.
const BASE = 'https://www.levangile.com/';
const API = 'https://paindevie.vercel.app/api/cron/strongs-import';
const UA = 'Mozilla/5.0 (compatible; PainDeVie-import; accord du proprietaire)';
const SECRET = process.env.CRON_SECRET;
const LANGS = (process.env.LANGS || 'grec,hebreu').split(',');
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
const dec = s => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è').replace(/&agrave;/g, 'à').replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const clean = h => h.replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/<sup>\s*0*(\d+)\s*<\/sup>/gi, ' ($1)');
const txt = h => dec(clean(h).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.)])/g, '$1').trim();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function listHtml(h) {
  const marked = clean(h).replace(/<(\/?)(ol|ul|li)\b[^>]*>/gi, (_, sl, t) => `\u0001${sl}${t.toLowerCase()}\u0002`).replace(/<[^>]+>/g, ' ');
  return esc(dec(marked)).replace(/\u0001/g, '<').replace(/\u0002/g, '>').replace(/\s+/g, ' ').replace(/>\s+/g, '>').replace(/\s+</g, '<').trim();
}
function parse(p) {
  const a = p.indexOf('Strong numéro'); if (a < 0) return null;
  const b = p.indexOf('Concordance biblique', a);
  const s = p.slice(a, b > 0 ? b : undefined);
  const orig = s.match(/<td class="(?:hebreu|grec)">[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/);
  const tr = s.match(/translitt[\s\S]*?<\/tr>\s*<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/);
  const def = s.match(/Définition de[\s\S]*?<td colspan="2">([\s\S]*?)<\/td>/);
  const lsg = s.match(/traduit dans la Louis Segond par[\s\S]*?<td colspan="2">([\s\S]*?)<\/td>/);
  const fr_def = def ? listHtml(def[1]) : null;
  const plain = def ? dec(clean(def[1]).replace(/<li\b[^>]*>/gi, '\n').replace(/<[^>]+>/g, ' ')).split('\n').map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' ; ') : null;
  return {
    fr_def, definition_fr: plain || null,
    fr_lsg: lsg ? txt(lsg[1]) || null : null,
    fr_origine: orig ? txt(orig[1]) || null : null,
    fr_type: tr ? txt(tr[2]) || null : null
  };
}
async function send(rows) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch(API, { method: 'POST', headers: { authorization: `Bearer ${SECRET}`, 'content-type': 'application/json' }, body: JSON.stringify({ rows }) }).catch(() => null);
    if (r?.ok) return true;
    console.log('envoi refusé', r?.status, r ? (await r.text()).slice(0, 200) : '');
    await sleep(5000);
  }
  throw new Error('envoi impossible');
}

for (const lang of LANGS) {
  const list = lang === 'grec' ? 'Liste-Strong-Grec.php' : 'Liste-Strong-Hebreu.php';
  const re = new RegExp(`lexique-${lang}-(\\d+)-[^"'\\s#?]+`, 'g');
  const urls = new Map();
  for (let page = 1; page < 2000; page++) {
    const h = await get(`${BASE}${list}?page=${page}`);
    const before = urls.size;
    for (const m of (h ?? '').matchAll(re)) if (!urls.has(+m[1])) urls.set(+m[1], m[0]);
    if (urls.size === before) break;
    if (LIMIT && urls.size >= LIMIT) break;
    await sleep(150);
  }
  let todo = [...urls.entries()].sort((x, y) => x[0] - y[0]);
  if (LIMIT) todo = todo.slice(0, LIMIT);
  console.log(`${lang} : ${todo.length} fiches à lire`);
  let ok = 0, miss = 0, batch = [];
  const P = lang === 'grec' ? 'G' : 'H';
  let i = 0;
  async function worker() {
    while (i < todo.length) {
      const [num, slug] = todo[i++];
      const h = await get(BASE + slug);
      const f = h && parse(h);
      if (f && (f.fr_def || f.fr_lsg)) { batch.push({ code: `${P}${num}`, lang, num, ...f }); ok++; } else miss++;
      if (batch.length >= 150) { const b = batch; batch = []; await send(b); }
      await sleep(120);
    }
  }
  await Promise.all([worker(), worker()]);
  if (batch.length) await send(batch);
  console.log(`${lang} : ${ok} fiches importées, ${miss} vides ou introuvables`);
}
