import OpenAI from 'openai';
import { config } from './config.js';
import { generalContext, platformTones } from './context.js';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function draftWithGPT(prompt, context, platform) {
  const baseInstructions =
    'Eres un experto en copywriting. ' +
    'Sé conciso, directo y con voz humana. ' +
    'Evita siempre señales típicas de texto generado por IA: no uses guiones largos tipo —, ' +
    'frases genéricas de marketing, cierres artificiales, tono corporativo vacío ni estructuras demasiado perfectas. ' +
    'Evita expresiones como "llevar al siguiente nivel", "potenciar tu marca", "soluciones integrales", ' +
    '"experiencias únicas", "transformar tu presencia digital", "en resumen", "en conclusión" o "es importante destacar". ' +
    'No uses emojis ni hashtags salvo que el usuario los pida. ' +
    'Prioriza frases claras, párrafos breves y ritmo natural. ' +
    'Natural no significa informal: adapta el nivel de profesionalidad al canal indicado.';

  const generalSection = generalContext
    ? `\n\n[Contexto general]\n${generalContext}`
    : '';

  const platformTone = platform ? platformTones[platform] : null;
  const platformSection = platformTone
    ? `\n\n[Tono para ${platform}]\n${platformTone}`
    : '';

  const messages = [
    {
      role: 'system',
      content: baseInstructions + generalSection + platformSection,
    },
    { role: 'user', content: context ? `Contexto adicional: ${context}\n\n${prompt}` : prompt },
  ];

  const response = await openai.chat.completions.create({
    model: config.gptModel,
    messages,
  }, { timeout: 30_000 });

  return { draft: response.choices[0].message.content };
}
