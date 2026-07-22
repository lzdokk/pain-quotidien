/**
 * Charge les donnees de reference validees sur le prototype :
 * parcours de lecture, cursus complet, base de questions.
 *   npx tsx scripts/seed-reference.ts
 * Les fichiers sources sont ceux du prototype, deposes dans /seed.
 */
import './load-env';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function load(file: string) {
  const src = readFileSync(path.join(process.cwd(), 'seed', file), 'utf8');
  const w: any = { PARCOURS: [] };
  new Function('window', src)(w);
  return w;
}

async function main() {
  const d = load('donnees.js');
  const l = load('lecture.js');
  const c = load('cursus.js');

  // ── Parcours ────────────────────────────────────────────────────
  for (const [i, p] of (l.PARCOURS ?? d.PARCOURS).entries()) {
    await admin.from('reading_plans').upsert({
      id: p.id, name: p.nom, subtitle: p.sous, style: p.style ?? 'progressif',
      days: p.duree, audience: p.pour, rationale: p.pourquoi, order_index: i
    });
    await admin.from('plan_steps').delete().eq('plan_id', p.id);
    await admin.from('plan_steps').insert(p.etapes.map((e: any, j: number) => ({
      plan_id: p.id, position: j, book: e.livre, label: e.nom, chapters: e.ch,
      title: e.titre, description: e.quoi, key_passages: e.cles
    })));
  }

  // ── Cursus ──────────────────────────────────────────────────────
  for (const [i, n] of c.CURSUS.niveaux.entries()) {
    await admin.from('cursus_levels').upsert({
      id: n.id, name: n.nom, subtitle: n.sous, intro: n.intro, order_index: i
    });
    for (const [j, g] of n.groupes.entries()) {
      const { data: grp } = await admin.from('cursus_groups')
        .insert({ level_id: n.id, name: g.nom, order_index: j }).select('id').single();
      await admin.from('courses').upsert(g.cours.map((co: any, k: number) => ({
        code: co.c, group_id: grp!.id, title: co.t, kind: co.ty,
        hook: co.p, hours: co.h, order_index: k,
        status: c.LECONS?.[co.c] ? 'reviewed' : 'planned',
        ...(c.LECONS?.[co.c] ? {
          objectives: c.LECONS[co.c].objectifs, parable: c.LECONS[co.c].parabole,
          body: c.LECONS[co.c].corps, key_verse: c.LECONS[co.c].verset,
          key_verse_ref: c.LECONS[co.c].vref, readings: c.LECONS[co.c].lectures,
          assignment: c.LECONS[co.c].travail
        } : {})
      })));
    }
  }

  // ── Base de questions ───────────────────────────────────────────
  await admin.from('faq').upsert(d.FAQ.map((f: any) => ({
    id: f.id, category: f.cat, question: f.q, short_answer: f.court,
    parable: f.parabole, body: f.dev, verses: f.versets, reviewed: true
  })));

  // ── Fiches de chapitres et de versets deja redigees ─────────────
  for (const [k, v] of Object.entries<any>(l.EXPLIC_CH ?? {})) {
    const [book, chapter] = k.split('-').map(Number);
    await admin.from('chapter_notes').upsert({
      book, chapter, title: v.titre, dating: v.quand, summary: v.quoi,
      outline: v.struct, reading_key: v.cle, why_here: v.pourquoi
    });
  }
  for (const [k, v] of Object.entries<any>(l.EXPLIC_V ?? {})) {
    const [book, chapter, verse] = k.split('-').map(Number);
    await admin.from('verse_notes').upsert({
      book, chapter, verse,
      word_term: v.mot?.terme ?? null, word_lang: v.mot?.langue ?? null, word_sense: v.mot?.sens ?? null,
      says: v.quoi, parable: v.parabole, development: v.dev, cross_refs: v.versets
    });
  }

  console.log('Donnees de reference chargees.');
}
main();
