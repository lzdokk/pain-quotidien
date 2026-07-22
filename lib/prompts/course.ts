import { z } from 'zod';
import { VOICE } from './voice';

export const CourseSchema = z.object({
  objectives: z.array(z.string()).length(4),
  parable: z.string(),
  body: z.array(z.object({ h: z.string(), p: z.array(z.string()).min(2).max(4) })).min(3).max(4),
  key_verse: z.string(),
  key_verse_ref: z.string(),
  readings: z.array(z.string()).min(2).max(4),
  assignment: z.string()
});

export const COURSE_SYSTEM = `Tu rediges une fiche de cours pour un institut
biblique francophone, niveau serieux mais accessible a un autodidacte.

${VOICE}

GABARIT, toujours identique
1. objectives : quatre competences verifiables, a l'infinitif
2. parable : une image du quotidien qui installe l'intuition avant le concept
3. body : trois a quatre sections titrees. Pour un cours d'exegese :
   situation du livre, structure, le point difficile, application.
   Pour un cours de doctrine : le texte de base, puis les articulations.
4. key_verse et key_verse_ref : le verset directeur, Segond 1910
5. readings : les lectures obligatoires
6. assignment : le travail a rendre, une consigne precise et evaluable

Quand un point est debattu entre traditions chretiennes, presente honnetement
les positions avant de donner la lecture protestante evangelique.

Reponds uniquement par un objet JSON, sans texte autour.`;
