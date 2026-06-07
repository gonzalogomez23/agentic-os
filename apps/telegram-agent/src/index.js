import { Bot } from 'grammy';
import { Client } from '@notionhq/client';
import { config } from './config.js';
import { loadSchemas } from './schema.js';
import { initTools } from './tools.js';
import { transcribe } from './transcribe.js';
import { runAgent } from './agent.js';

const bot = new Bot(config.telegramToken);

function isAllowed(ctx) {
  return ctx.from?.id === config.allowedUser;
}

const MESSAGE_LIMIT = 20;
const WINDOW_MS     = 60_000;
const rateBuckets   = new Map();

function checkRateLimit(chatId) {
  const now  = Date.now();
  const slot = rateBuckets.get(chatId) ?? { count: 0, windowStart: now };
  if (now - slot.windowStart > WINDOW_MS) { slot.count = 0; slot.windowStart = now; }
  slot.count++;
  rateBuckets.set(chatId, slot);
  return slot.count <= MESSAGE_LIMIT;
}

// NUNCA loguear el valor de retorno — contiene el bot token
function telegramFileUrl(filePath) {
  return `https://api.telegram.org/file/bot${config.telegramToken}/${filePath}`;
}

bot.use(async (ctx, next) => {
  if (!isAllowed(ctx)) {
    await ctx.reply('No tienes permiso para usar este bot.');
    return;
  }
  if (!checkRateLimit(ctx.from.id)) {
    await ctx.reply('Demasiados mensajes seguidos. Espera un momento.');
    return;
  }
  await next();
});

bot.command('start', async (ctx) => {
  await ctx.reply(
    '¡Hola! Soy tu asistente personal. Envíame una nota de voz o un mensaje de texto y gestionaré tus bases de datos de Notion.\n\nEscribe /ayuda para ver lo que puedo hacer.',
  );
});

bot.command('ayuda', async (ctx) => {
  await ctx.reply(
    `Soy tu asistente personal para gestionar tu negocio freelance.

Bases de datos de Notion:
• Tareas — crea, lista y actualiza trabajo pendiente
• Proyectos — seguimiento de clientes, fechas e importes
• Contenido — ideas y programación de posts y vídeos
• Conocimiento — notas y aprendizajes personales
• Contactos — leads y personas de interés

Redacción con IA:
• "Escríbeme un post de LinkedIn sobre productividad freelance"
• "Redacta un email de seguimiento para el cliente Acme"
• "Guarda el borrador en la idea X de Notion"

Otros ejemplos:
• "Crea una tarea para revisar la propuesta del cliente Acme, vence el viernes"
• "Lista mis tareas en curso"
• "Añade un proyecto: Web Acme, cliente Acme S.L., importe 2000€"
• "Marca el proyecto Web Acme como entregado"

Puedes enviar texto, notas de voz o imágenes.`,
  );
});

bot.on('message:voice', async (ctx) => {
  const processingMsg = await ctx.reply('🎙️ Procesando nota de voz...');

  try {
    const file = await ctx.getFile();
    const fileUrl = telegramFileUrl(file.file_path);
    const text = await transcribe(fileUrl);

    await ctx.api.editMessageText(
      ctx.chat.id,
      processingMsg.message_id,
      `🎙️ _"${text}"_\n\nProcesando...`,
      { parse_mode: 'Markdown' },
    );

    const reply = await runAgent(text, ctx.chat.id);
    await ctx.api.editMessageText(ctx.chat.id, processingMsg.message_id, reply);
  } catch (err) {
    console.error('Error procesando nota de voz:', err);
    await ctx.api.editMessageText(ctx.chat.id, processingMsg.message_id, 'Hubo un error. Inténtalo de nuevo.');
  }
});

bot.on('message:photo', async (ctx) => {
  const processingMsg = await ctx.reply('Procesando imagen...');

  try {
    const photo   = ctx.message.photo.at(-1);
    const file    = await ctx.api.getFile(photo.file_id);
    const fileUrl = telegramFileUrl(file.file_path);

    const res    = await fetch(fileUrl);
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const caption = ctx.message.caption || 'Analiza esta imagen y dime qué ves.';

    const reply = await runAgent(caption, ctx.chat.id, {
      type: 'image', base64, mediaType: 'image/jpeg',
    });
    await ctx.api.editMessageText(ctx.chat.id, processingMsg.message_id, reply);
  } catch (err) {
    console.error('Error procesando imagen:', err);
    await ctx.api.editMessageText(ctx.chat.id, processingMsg.message_id, 'Hubo un error. Inténtalo de nuevo.');
  }
});

bot.on('message:text', async (ctx) => {
  const processingMsg = await ctx.reply('Procesando...');

  try {
    const reply = await runAgent(ctx.message.text, ctx.chat.id);
    await ctx.api.editMessageText(ctx.chat.id, processingMsg.message_id, reply);
  } catch (err) {
    console.error('Error procesando mensaje:', err);
    await ctx.api.editMessageText(ctx.chat.id, processingMsg.message_id, 'Hubo un error. Inténtalo de nuevo.');
  }
});

/* ── Inicialización ── */

const notion = new Client({ auth: config.notionApiKey });
await loadSchemas(notion, config.notionDbs);
initTools();

bot.start({ onStart: () => console.log('Bot de Telegram iniciado') });
