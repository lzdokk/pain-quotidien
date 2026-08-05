'use client';
import Link from 'next/link';
import { Fragment, ReactNode } from 'react';

/**
 * Transforme les references de lecture ("Jean 1 a 5", "Genese 15 et 22",
 * "Romains 4 et Ephesiens 2.8-10") en liens cliquables vers le lecteur.
 * Chaque chapitre detecte ouvre directement /lire?ref=Livre Chapitre.
 */

// Canon protestant, noms Segond avec accents. Les prefixes numerotes
// d'abord pour que "1 Corinthiens" prime sur "Corinthiens".
const BOOKS = [
  '1 Corinthiens', '2 Corinthiens', '1 Thessaloniciens', '2 Thessaloniciens',
  '1 Chroniques', '2 Chroniques', '1 Timothée', '2 Timothée',
  '1 Samuel', '2 Samuel', '1 Rois', '2 Rois', '1 Pierre', '2 Pierre',
  '1 Jean', '2 Jean', '3 Jean',
  'Cantique des cantiques', 'Cantique', 'Lamentations',
  'Genèse', 'Exode', 'Lévitique', 'Nombres', 'Deutéronome', 'Josué', 'Juges',
  'Ruth', 'Esdras', 'Néhémie', 'Esther', 'Job', 'Psaumes', 'Psaume', 'Proverbes',
  'Ecclésiaste', 'Ésaïe', 'Esaïe', 'Jérémie', 'Ézéchiel', 'Ezéchiel', 'Daniel',
  'Osée', 'Joël', 'Amos', 'Abdias', 'Jonas', 'Michée', 'Nahum', 'Habacuc',
  'Sophonie', 'Aggée', 'Zacharie', 'Malachie',
  'Matthieu', 'Marc', 'Luc', 'Jean', 'Actes', 'Romains', 'Galates',
  'Éphésiens', 'Ephésiens', 'Philippiens', 'Colossiens', 'Tite', 'Philémon',
  'Hébreux', 'Jacques', 'Jude', 'Apocalypse'
].sort((a, b) => b.length - a.length);

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALT = BOOKS.map(esc).join('|');
const BOOK_RE = new RegExp('(' + ALT + ')\\s+(\\d+(?:[.:]\\d+(?:-\\d+)?)?)', 'gi');
// Chapitres qui suivent, relies par "et", "a", "-", ",".
const CONT_RE = /^(\s*(?:à|a|et|–|-|,)\s*)(\d+(?:[.:]\d+(?:-\d+)?)?)/i;
// Un chiffre qui demarre un livre numerote ("1 Pierre") n'est pas une suite.
const BOOK_AT = new RegExp('^(?:' + ALT + ')\\s+\\d', 'i');

function refLink(book: string, chap: string, key: string, from?: string): ReactNode {
  const suffix = from ? `&from=${encodeURIComponent(from)}` : '';
  return (
    <Link key={key} href={`/lire?ref=${encodeURIComponent(`${book} ${chap}`)}${suffix}`} className="rlink">
      {chap}
    </Link>
  );
}

/** `from` : chemin de retour affiche dans le lecteur (ex. la parabole d'origine). */
export default function ReadingLinks({ text, from }: { text: string; from?: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  BOOK_RE.lastIndex = 0;

  while ((m = BOOK_RE.exec(text)) !== null) {
    const [, book, chap] = m;
    if (m.index > last) out.push(<Fragment key={`t${last}`}>{text.slice(last, m.index)}</Fragment>);
    out.push(<Fragment key={`b${m.index}`}>{book} </Fragment>);
    out.push(refLink(book, chap, `r${m.index}`, from));
    let pos = m.index + m[0].length;

    // Chapitres additionnels du meme livre : "15 et 22", "1 a 5"
    let cont: RegExpMatchArray | null;
    while ((cont = text.slice(pos).match(CONT_RE)) !== null) {
      if (BOOK_AT.test(text.slice(pos + cont[1].length))) break;
      out.push(<Fragment key={`c${pos}`}>{cont[1]}</Fragment>);
      out.push(refLink(book, cont[2], `rc${pos}`, from));
      pos += cont[0].length;
    }
    last = pos;
    BOOK_RE.lastIndex = pos;
  }
  if (last < text.length) out.push(<Fragment key={`t${last}`}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}
