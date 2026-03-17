import { Bot } from 'grammy';
import { config } from './config.js';
import { transcribe } from './transcribe.js';
import { runAgent } from './agent.js';

const bot = new Bot(config.telegramToken);

/* ── Verificación de usuario ── */

function isAllowed(ctx) {
  return ctx.from?.id === config.allowedUser;
}

/* ── Middleware: rechazar usuarios no autorizados ── */

bot.use(async (ctx, next) => {
  if (!isAllowed(ctx)) {
    await ctx.reply('No tienes permiso para usar este bot.');
    return;
  }
  await next();
});

/* ── Comando /start ── */

bot.command('start', async (ctx) => {
  await ctx.reply(
    '¡Hola! Soy tu asistente personal. Envíame una nota de voz o un mensaje de texto y gestionaré tus bases de datos de Notion.\n\nEscribe /ayuda para ver lo que puedo hacer.',
  );
});

/* ── Comando /ayuda ── */

bot.command('ayuda', async (ctx) => {
  await ctx.reply(
    `Puedo gestionar 4 bases de datos de Notion:

📋 *Tareas* — crear, listar, actualizar, completar, eliminar
💰 *Finanzas* — registrar ingresos y gastos
👥 *Equipo* — gestionar miembros del equipo
🤝 *Clientes/Leads* — seguimiento de clientes

*Ejemplos:*
• "Crea una tarea para llamar al fontanero mañana"
• "Lista mis tareas pendientes"
• "Apunta un gasto de 50 euros en material de oficina"
• "Añade un lead: María García, empresa Acme, email maria@acme.com"
• "Marca como completada la tarea del fontanero"

Puedes enviar texto o notas de voz.`,
    { parse_mode: 'Markdown' },
  );
});

/* ── Handler de notas de voz ── */

bot.on('message:voice', async (ctx) => {
  const processingMsg = await ctx.reply('🎙️ Procesando nota de voz...');

  try {
    // Obtener URL del fichero de audio
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${config.telegramToken}/${file.file_path}`;

    // Transcribir
    const text = await transcribe(fileUrl);
    await ctx.api.editMessageText(
      ctx.chat.id,
      processingMsg.message_id,
      `🎙️ _"${text}"_\n\nProcesando...`,
      { parse_mode: 'Markdown' },
    );

    // Ejecutar agente
    const reply = await runAgent(text);
    await ctx.api.editMessageText(ctx.chat.id, processingMsg.message_id, reply);
  } catch (err) {
    console.error('Error procesando nota de voz:', err);
    await ctx.api.editMessageText(
      ctx.chat.id,
      processingMsg.message_id,
      `Error: ${err.message}`,
    );
  }
});

/* ── Handler de mensajes de texto ── */

bot.on('message:text', async (ctx) => {
  const processingMsg = await ctx.reply('Procesando...');

  try {
    const reply = await runAgent(ctx.message.text);
    await ctx.api.editMessageText(ctx.chat.id, processingMsg.message_id, reply);
  } catch (err) {
    console.error('Error procesando mensaje:', err);
    await ctx.api.editMessageText(
      ctx.chat.id,
      processingMsg.message_id,
      `Error: ${err.message}`,
    );
  }
});

/* ── Arrancar bot ── */

bot.start({
  onStart: () => console.log('Bot de Telegram iniciado'),
});
