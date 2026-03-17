import 'dotenv/config';

const REQUIRED = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_ALLOWED_USER',
  'GROQ_API_KEY',
  'ANTHROPIC_API_KEY',
  'NOTION_API_KEY',
  'NOTION_DB_TAREAS',
  'NOTION_DB_FINANZAS',
  'NOTION_DB_EQUIPO',
  'NOTION_DB_CLIENTES',
];

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Faltan variables de entorno: ${missing.join(', ')}`);
  process.exit(1);
}

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  allowedUser: Number(process.env.TELEGRAM_ALLOWED_USER),
  groqApiKey: process.env.GROQ_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  claudeModel: process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
  notionApiKey: process.env.NOTION_API_KEY,
  notionDbs: {
    tareas: process.env.NOTION_DB_TAREAS,
    finanzas: process.env.NOTION_DB_FINANZAS,
    equipo: process.env.NOTION_DB_EQUIPO,
    clientes: process.env.NOTION_DB_CLIENTES,
  },
};
