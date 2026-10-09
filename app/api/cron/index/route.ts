import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';
import { parseShortRef } from '@/lib/refs';
import {
  allEntries, IndexEntrySchema, INDEX_SYSTEM, INDEX_GEMINI_SCHEMA, indexUserPrompt, slugify
} from '@/lib/prompts/study-index';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * INDEX D'ETUDE : genere les fiches manquantes, quelques-unes par appel.
 *   /api/cron/index?n=3          fiches manquantes suivantes
 *   /api/cron/index?slug=abraham regenere UNE fiche precise
 * Appele par le workflow GitHub .github/workflows/index.yml.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const sp = new URL(req.url).searchParams;
  const n = Math.min(Math.max(1, Number(sp.get('n') ?? 3)), 6);
  const only = sp.get('slug');

  const planned = allEntries();
  const { data: existing } = await admin.from('bible_index').select('slug');
  const have = new Set((existing ?? []).map((e: any) => e.slug));
  const todo = only ? planned.filter(e => e.slug === only) : planned.filter(e => !have.has(e.slug)).slice(0, n);
  const titles = new Map(planned.map(e => [slugify(e.title), e.title]));

  const started = Date.now();
  const done: string[] = [];
  const errors: string[] = [];

  for (const e of todo) {
    if (Date.now() - started > 240_000) { errors.push(`${e.slug} : temps écoulé, au prochain passage`); break; }
    try {
      const { data } = await callJSON(IndexEntrySchema, {
        system: INDEX_SYSTEM,
        user: indexUserPrompt(e),
        responseSchema: INDEX_GEMINI_SCHEMA,
        maxTokens: 6000,
        temperature: 0.3,
        timeoutMs: 90_000
      });

      // Nettoyage : seules les references valides sont gardees, au format abrege.
      let refsKept = 0, refsDropped = 0;
      const sections = data.sections.map(s => ({
        title: s.title.trim(),
        items: s.items.map(it => {
          const refs = it.refs.map(r => parseShortRef(r)).filter(Boolean).map(r => r!.label);
          refsKept += refs.length; refsDropped += it.refs.length - refs.length;
          return { label: it.label.trim(), refs: [...new Set(refs)] };
        }).filter(it => it.refs.length > 0)
      })).filter(s => s.items.length > 0);

      if (sections.length === 0) { errors.push(`${e.slug} : aucune référence valide`); continue; }

      // « Voir aussi » : seulement des entrees qui existent dans l'index.
      const seeAlso = (data.see_also ?? [])
        .map(t => titles.get(slugify(t)))
        .filter((t): t is string => !!t && slugify(t) !== e.slug);

      const { error } = await admin.from('bible_index').upsert({
        slug: e.slug, kind: e.kind, title: e.title, category: e.category, subcategory: e.subcategory,
        definition: data.definition.trim(), sections, see_also: [...new Set(seeAlso)]
      });
      if (error) throw new Error(error.message);
      done.push(`${e.title} (${refsKept} réf.${refsDropped ? `, ${refsDropped} écartées` : ''})`);
    } catch (err: any) {
      errors.push(`${e.slug} : ${String(err?.message ?? err)}`);
    }
  }

  if (done.length) { revalidatePath('/etude'); }
  const total = (existing?.length ?? 0) + (only ? 0 : done.length);
  return NextResponse.json({
    ok: done.length > 0 || todo.length === 0,
    done, errors: errors.length ? errors : undefined,
    progress: `${Math.min(total, planned.length)}/${planned.length}`
  });
}
