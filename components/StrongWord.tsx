'use client';

/**
 * Un mot cliquable relié à un code Strong. S'il n'a pas de code, il s'affiche
 * en texte simple. Le clic remonte le code au parent (qui ouvre <StrongModal/>).
 *
 * Exemple d'usage (rendre un verset interlinéaire cliquable) :
 *
 *   const [code, setCode] = useState<string | null>(null);
 *   const words = await getVerseWords(book, chapter, verse); // lib/study.ts
 *   ...
 *   <p className="sw-verse" dir={words[0]?.lang === 'hebreu' ? 'rtl' : 'ltr'}>
 *     {words.map(w => (
 *       <StrongWord key={w.position} word={w.word} code={w.strong} onOpen={setCode} />
 *     ))}
 *   </p>
 *   <StrongModal code={code} onClose={() => setCode(null)} />
 */
export default function StrongWord({ word, code, onOpen }:
  { word: string; code?: string | null; onOpen: (code: string) => void }) {
  if (!code) return <span className="sw-word-plain">{word} </span>;
  return (
    <button type="button" className="sw-word" onClick={() => onOpen(code)} title={`Strong ${code}`}>
      {word}
    </button>
  );
}
