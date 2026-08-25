import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { Bot, webhookCallback } from 'grammy';
import { Client } from '@notionhq/client';
import { config } from './config.js';
import { loadSchemas, schemas } from './schema.js';
import { initTools } from './tools.js';
import { transcribe } from './transcribe.js';
import { runAgent, initContext } from './agent.js';
import { generalContext, platformTones } from './context.js';

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
  await ctx.reply('Envíame un mensaje de texto o una nota de voz. Escribe /ayuda para ver lo que puedo hacer.');
});

bot.command('ayuda', async (ctx) => {
  const dbLines = Object.values(schemas).map(s => `• ${s.label}`).join('\n');
  await ctx.reply(
    `Bases de datos disponibles:\n${dbLines}\n\nRedacción con IA:\n• Pídeme que escriba posts, emails, newsletters u otro contenido\n\nPuedes enviarme texto, notas de voz o imágenes.`,
  );
});

bot.command('contexto', async (ctx) => {
  const wordCount = generalContext.split(/\s+/).filter(Boolean).length;
  const platforms = Object.keys(platformTones);
  const generalStatus = generalContext
    ? `✅ ${wordCount} palabras`
    : '❌ No cargado';
  const platformStatus = platforms.length
    ? `✅ ${platforms.join(', ')}`
    : '❌ Ninguno';
  await ctx.reply(
    `Estado del contexto:\n\nGeneral: ${generalStatus}\nTonos de plataforma: ${platformStatus}`,
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
await initContext();
initTools();

const PORT = process.env.PORT || 8080;

if (config.publicUrl) {
  // El token en la ruta actúa como secreto adicional — mismo modelo de confianza que telegramFileUrl().
  const webhookPath = `/webhook/${config.telegramToken}`;
  // Verifica la cabecera X-Telegram-Bot-Api-Secret-Token para que nadie pueda
  // falsificar un Update (y su ctx.from.id) sin conocer este secreto derivado.
  const secretToken = createHash('sha256').update(config.telegramToken).digest('hex');
  await bot.api.setWebhook(`${config.publicUrl}${webhookPath}`, { secret_token: secretToken });
  const handleUpdate = webhookCallback(bot, 'http', { secretToken });

  createServer((req, res) => {
    if (req.method === 'POST' && req.url === webhookPath) {
      handleUpdate(req, res);
      return;
    }
    res.writeHead(200).end('OK');
  }).listen(PORT, () => console.log(`Bot de Telegram iniciado (webhook, puerto ${PORT})`));
} else {
  await bot.api.deleteWebhook();
  bot.start({ onStart: () => console.log('Bot de Telegram iniciado (polling)') });
}
