/**
 * Responsables du cursus : accès à tout, et au panneau « Partager l'accès ».
 * Réglable via la variable CURSUS_ADMINS (emails séparés par des virgules) ;
 * par défaut, le compte du propriétaire.
 */
export const CURSUS_ADMINS = (process.env.CURSUS_ADMINS ?? 'lzdokk@gmail.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export const isCursusAdmin = (email?: string | null) =>
  !!email && CURSUS_ADMINS.includes(email.toLowerCase());
