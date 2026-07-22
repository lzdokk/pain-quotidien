/** Conserve pour compatibilite. Le vrai point d'entree est lib/llm.ts. */
export { callJSON, callText, cost, modelName as MODEL_NAME, PROVIDER } from './llm';
export const MODEL = process.env.LLM_MODEL ?? 'gemini-2.5-flash';
