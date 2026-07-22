import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import QuestionBrowser from '@/components/QuestionBrowser';

export const revalidate = 3600;
export const metadata = { title: 'Questions' };

export default async function Questions() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: faq } = await sb.from('faq')
    .select('id, category, question, short_answer').eq('reviewed', true).order('id');
  const { data: usage } = user
    ? await sb.from('ai_usage').select('count').eq('day', new Date().toISOString().slice(0, 10)).maybeSingle()
    : { data: null };

  return (
    <>
      <Nav user={user} />
      <QuestionBrowser faq={faq ?? []} user={user} used={usage?.count ?? 0} />
    </>
  );
}
