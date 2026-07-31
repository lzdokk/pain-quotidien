'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Onglets internes de la section « Apprendre » : Paraboles, Mots, Versets. */
const SUBTABS = [
  { href: '/paraboles', label: 'Paraboles' },
  { href: '/mots', label: 'Mots' },
  { href: '/versets', label: 'Versets' },
  { href: '/questions', label: 'Questions' }
];

export default function LearnTabs() {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + '/');
  return (
    <div className="learn-tabs" role="tablist">
      {SUBTABS.map(t => (
        <Link key={t.href} href={t.href} className="learn-tab"
              aria-selected={active(t.href)} role="tab">
          {t.label}
        </Link>
      ))}
    </div>
  );
}
