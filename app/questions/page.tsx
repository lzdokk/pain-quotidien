import { supabasePublic } from '@/lib/supabase/public';
import QuestionBrowser from '@/components/QuestionBrowser';

export const revalidate = 3600;
export const metadata = { title: 'Questions' };

export default async function Questions() {
  const sb = await supabasePublic();
  const user: any = null; // lu dans le navigateur (useUser)
  const { data: faq } = await sb.from('faq')
    .select('id, category, question, short_answer').eq('reviewed', true).order('id');
  const { data: usage } = user
    ? await sb.from('ai_usage').select('count').eq('day', new Date().toISOString().slice(0, 10)).maybeSingle()
    : { data: null };

  return (
    <>
      <QuestionBrowser faq={faq ?? []} user={user} used={usage?.count ?? 0} />
    </>
  );
}
