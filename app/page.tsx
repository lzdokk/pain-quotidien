// L'accueil ouvre sur le pain du jour. Si l'utilisateur consultait une page
// il y a moins de 12 h (lecture, cours, priere...), on l'y ramene directement :
// l'application « reprend la ou on s'etait arrete ». Sinon, /pain par defaut.
// La decision se fait cote client (avant peinture) pour lire le localStorage.
export const dynamic = 'force-static';

export default function Home() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{
            var r=JSON.parse(localStorage.getItem('pq-resume')||'null');
            var fresh=r&&r.path&&(Date.now()-r.at<43200000);
            location.replace(fresh?r.path:'/pain');
          }catch(e){location.replace('/pain');}})();`
        }}
      />
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/pain" />
      </noscript>
    </>
  );
}
