/**
 * Date "calendaire" du lecteur, en heure de Paris, et non en UTC.
 *
 * Vercel execute tous les crons en UTC. Sans ceci, une publication qui tourne
 * juste apres minuit heure de Paris (mais encore avant minuit UTC en ete)
 * calculerait "aujourd'hui" comme la veille, et publierait le mauvais jour.
 * A utiliser partout ou on determine le "jour" cote lecteur : publication,
 * page du matin, page du soir, rappels, pre-generation des fiches.
 */
export function parisDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d);
}

export function parisHour(d: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', hour: '2-digit', hour12: false
  }).format(d));
}

/**
 * Jour "spirituel" du lecteur : il ne bascule pas a minuit mais a 3h du matin
 * (heure de Paris). Ainsi, celui qui lit sa veillee a minuit ou 00h30 voit
 * encore le jour qu'il vient de vivre, et non « le pain de demain arrive
 * bientot ». Le nouveau jour n'apparait qu'a partir de 3h. A utiliser pour
 * l'affichage lecteur (matin, soir, priere) et la publication quotidienne.
 */
export function contentDate(d: Date = new Date()): string {
  return parisDate(new Date(d.getTime() - 3 * 60 * 60 * 1000));
}
