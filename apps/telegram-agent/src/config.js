import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const REQUIRED = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_ALLOWED_USER',
  'GROQ_API_KEY',
  'ANTHROPIC_API_KEY',
  'NOTION_API_KEY',
  'NOTION_DB_TAREAS',
  'NOTION_DB_PROYECTOS',
  'NOTION_DB_IDEAS',
  'NOTION_DB_LEADS',
];

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Faltan variables de entorno: ${missing.join(', ')}`);
  process.exit(1);
}

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  allowedUser:   Number(process.env.TELEGRAM_ALLOWED_USER),
  groqApiKey:    process.env.GROQ_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  claudeModel:   process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
  notionApiKey:  process.env.NOTION_API_KEY,
  notionDbs: {
    tareas:    process.env.NOTION_DB_TAREAS,
    proyectos: process.env.NOTION_DB_PROYECTOS,
    ideas:     process.env.NOTION_DB_IDEAS,
    leads:     process.env.NOTION_DB_LEADS,
  },
};
