/**
 * Lit TOUTES les lignes d'une requête Supabase, par paquets de 1 000
 * (Supabase s'arrête à 1 000 lignes par réponse).
 *   const rows = await allRows(from => admin.from('bible_index').select('slug').range(from, from + 999));
 */
export async function allRows<T = any>(page: (from: number) => PromiseLike<{ data: T[] | null; error: any }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < 50000; from += 1000) {
    const { data, error } = await page(from);
    if (error || !data?.length) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}
