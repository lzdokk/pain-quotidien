'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Checklist from './Checklist';

export default function DayActions({ date, actions, user }:
  { date: string; actions: Array<{ title: string; body: string }>; user: any }) {
  const [initial, setInitial] = useState<number[]>([]);

  useEffect(() => {
    if (!user) {
      const l: number[] = [];
      actions.forEach((_, i) => { try { if (localStorage.getItem(`pq-step-${date}-${i}`) === '1') l.push(i); } catch {} });
      setInitial(l); return;
    }
    supabase.from('day_progress').select('action_index').eq('date', date)
      .then(({ data }) => setInitial((data ?? []).map(d => d.action_index)));
  }, [date, user, actions]);

  const toggle = async (i: number, on: boolean) => {
    if (!user) { try { localStorage.setItem(`pq-step-${date}-${i}`, on ? '1' : '0'); } catch {} return; }
    if (on) await supabase.from('day_progress').upsert({ user_id: user.id, date, action_index: i });
    else await supabase.from('day_progress').delete().eq('date', date).eq('action_index', i);
  };

  return <Checklist title="Concretement, aujourd'hui" items={actions} initial={initial} onToggle={toggle} />;
}
