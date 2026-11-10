'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Onglets internes de la section « Récits » : Théologie racontée, Fondements, Questions. */
const SUBTABS = [
  { href: '/paraboles', label: 'Théologie racontée' },
  { href: '/fondements', label: 'Fondements' },
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
