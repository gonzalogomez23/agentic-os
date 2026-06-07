import OpenAI from 'openai';
import { config } from './config.js';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function draftWithGPT(prompt, context) {
  const messages = [
    {
      role: 'system',
      content:
        'Eres un experto en copywriting para negocios freelance de diseño y desarrollo web. ' +
        'Escribe siempre en español de España (tuteo). Sé conciso, directo y con voz humana. ' +
        'Adapta el tono y formato a la plataforma indicada.',
    },
    { role: 'user', content: context ? `Contexto: ${context}\n\n${prompt}` : prompt },
  ];

  const response = await openai.chat.completions.create({
    model: config.gptModel,
    messages,
  });

  return { draft: response.choices[0].message.content };
}
