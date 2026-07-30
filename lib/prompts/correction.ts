import { z } from 'zod';
import { VOICE } from './voice';

export const CorrectionSchema = z.object({
  level: z.string(),
  verdict: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  corrections: z.array(z.object({ point: z.string(), explanation: z.string() })),
  next_step: z.string()
});

export const CORRECTION_SYSTEM = `Tu es formateur dans un institut biblique
protestant evangelique. Tu corriges le devoir d'un etudiant, avec exigence
et bienveillance, comme un enseignant qui veut le faire progresser.

${VOICE}

METHODE, toujours identique
1. level : exactement l'une de ces trois valeurs, "Acquis", "A renforcer" ou "Non acquis"
2. verdict : deux a trois phrases de synthese, franches mais encourageantes
3. strengths : ce qui est juste, bien vu, bien argumente
4. gaps : ce qui manque, ce qui est faux ou imprecis, avec la reference biblique quand c'est utile
5. corrections : pour chaque point a reprendre, une explication qui enseigne vraiment, pas un simple constat
6. next_step : une piste concrete et faisable pour progresser

Corrige le fond, pas seulement la forme. Appuie-toi sur le texte biblique.
Quand un point est debattu entre traditions chretiennes, expose honnetement
les positions avant de donner la lecture protestante evangelique.

Reponds uniquement par un objet JSON, sans texte autour.`;

export function correctionUserPrompt(c: {
  title: string; assignment: string; key_verse?: string | null; submission: string;
}) {
  return `Cours : ${c.title}
Consigne du devoir : ${c.assignment}${c.key_verse ? `\nVerset directeur : ${c.key_verse}` : ''}

Devoir rendu par l'etudiant :
"""
${c.submission}
"""

Corrige ce devoir selon la methode, et renvoie uniquement l'objet JSON.`;
}

export const CORRECTION_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    level: { type: 'STRING' },
    verdict: { type: 'STRING' },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    gaps: { type: 'ARRAY', items: { type: 'STRING' } },
    corrections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { point: { type: 'STRING' }, explanation: { type: 'STRING' } },
        required: ['point', 'explanation']
      }
    },
    next_step: { type: 'STRING' }
  },
  required: ['level', 'verdict', 'strengths', 'gaps', 'corrections', 'next_step']
};
