/**
 * Import unique du texte biblique dans Supabase.
 *   npx tsx scripts/import-bible.ts FRLSG
 * Environ 31 000 versets par traduction, moins de 5 Mo, une seule fois.
 */
import './load-env';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const BOOKS: Array<[string, number, 'AT' | 'NT']> = [
  ['Genese',50,'AT'],['Exode',40,'AT'],['Levitique',27,'AT'],['Nombres',36,'AT'],['Deuteronome',34,'AT'],
  ['Josue',24,'AT'],['Juges',21,'AT'],['Ruth',4,'AT'],['1 Samuel',31,'AT'],['2 Samuel',24,'AT'],
  ['1 Rois',22,'AT'],['2 Rois',25,'AT'],['1 Chroniques',29,'AT'],['2 Chroniques',36,'AT'],['Esdras',10,'AT'],
  ['Nehemie',13,'AT'],['Esther',10,'AT'],['Job',42,'AT'],['Psaumes',150,'AT'],['Proverbes',31,'AT'],
  ['Ecclesiaste',12,'AT'],['Cantique des cantiques',8,'AT'],['Esaie',66,'AT'],['Jeremie',52,'AT'],['Lamentations',5,'AT'],
  ['Ezechiel',48,'AT'],['Daniel',12,'AT'],['Osee',14,'AT'],['Joel',3,'AT'],['Amos',9,'AT'],
  ['Abdias',1,'AT'],['Jonas',4,'AT'],['Michee',7,'AT'],['Nahum',3,'AT'],['Habacuc',3,'AT'],
  ['Sophonie',3,'AT'],['Aggee',2,'AT'],['Zacharie',14,'AT'],['Malachie',4,'AT'],
  ['Matthieu',28,'NT'],['Marc',16,'NT'],['Luc',24,'NT'],['Jean',21,'NT'],['Actes',28,'NT'],
  ['Romains',16,'NT'],['1 Corinthiens',16,'NT'],['2 Corinthiens',13,'NT'],['Galates',6,'NT'],['Ephesiens',6,'NT'],
  ['Philippiens',4,'NT'],['Colossiens',4,'NT'],['1 Thessaloniciens',5,'NT'],['2 Thessaloniciens',3,'NT'],['1 Timothee',6,'NT'],
  ['2 Timothee',4,'NT'],['Tite',3,'NT'],['Philemon',1,'NT'],['Hebreux',13,'NT'],['Jacques',5,'NT'],
  ['1 Pierre',5,'NT'],['2 Pierre',3,'NT'],['1 Jean',5,'NT'],['2 Jean',1,'NT'],['3 Jean',1,'NT'],
  ['Jude',1,'NT'],['Apocalypse',22,'NT']
];

async function main() {
  const code = process.argv[2] ?? 'FRLSG';

  await admin.from('books').upsert(
    BOOKS.map((b, i) => ({ id: i + 1, name: b[0], chapters: b[1], testament: b[2] }))
  );
  await admin.from('translations').upsert({
    code, name: code === 'FRLSG' ? 'Segond 1910' : code,
    public_domain: code === 'FRLSG' || code === 'FRDBY', enabled: true,
    notice: 'Domaine public'
  });

  let total = 0;
  for (let book = 1; book <= 66; book++) {
    for (let ch = 1; ch <= BOOKS[book - 1][1]; ch++) {
      const r = await fetch(`https://bolls.life/get-chapter/${code}/${book}/${ch}/`);
      if (!r.ok) { console.warn(`echec ${book}/${ch}`); continue; }
      const rows = (await r.json() as any[]).map(v => ({
        translation: code, book, chapter: ch, verse: v.verse,
        text: String(v.text).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      }));
      if (rows.length) {
        const { error } = await admin.from('verses').upsert(rows);
        if (error) console.error(error.message);
        total += rows.length;
      }
      await new Promise(r => setTimeout(r, 60));   // courtoisie envers l'API
    }
    console.log(`${BOOKS[book - 1][0]} : ${total} versets cumules`);
  }
  console.log(`Termine. ${total} versets importes pour ${code}.`);
}
main();
