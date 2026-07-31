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
