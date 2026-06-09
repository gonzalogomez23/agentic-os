import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';
import { schemas } from './schema.js';
import { tools, dispatch } from './tools.js';
import { loadHistories, saveHistories } from './history.js';
import { queryDatabase, getPageContent } from './notion.js';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

let cachedContext = '';

export async function initContext() {
  if (!schemas.knowledge) return;
  try {
    const pages = await queryDatabase('knowledge', { search: 'Instrucciones' });
    if (!pages.length) return;
    const { content } = await getPageContent(pages[0].id);
    if (content && content !== '(página sin contenido)') {
      cachedContext = content;
      console.log('[agent] Contexto cargado desde knowledge');
    }
  } catch (err) {
    console.warn('[agent] No se pudo cargar el contexto:', err.message);
  }
}

function buildSystemPrompt() {
  const dbList = Object.entries(schemas)
    .map(([, schema]) => {
      const fields = Object.keys(schema.properties).join(', ');
      return `- **${schema.label}** — campos: ${fields}`;
    })
    .join('\n');

  const contextSection = cachedContext ? `${cachedContext}\n\n---\n\n` : '';

  return `${contextSection}Gestionas bases de datos de Notion mediante herramientas.

Bases de datos disponibles:
${dbList}

Instrucciones generales:
- Sé conciso y directo en tus respuestas.
- Cuando necesites actualizar o eliminar un registro, primero usa la herramienta list_ para encontrar el page_id.
- Si el usuario da una fecha relativa (ej: "mañana", "el viernes"), calcula la fecha absoluta. Hoy es ${new Date().toISOString().split('T')[0]}.
- Para fechas usa formato ISO: YYYY-MM-DD.
- Cuando crees un registro, confirma con un resumen breve de lo creado.
- Si no entiendes la intención, pide aclaración.
- Nunca inventes datos: si el usuario no menciona un campo, no lo rellenes.
- Para campos con opciones predefinidas (categorías, canal, estado, etc.), usa únicamente los valores de la lista. Si ninguno encaja, deja el campo vacío — nunca uses un valor que no esté en la lista.

Redacción de contenido:
- Para cualquier tarea de redacción (posts, emails, copy, newsletters), usa siempre la herramienta draft_content — no redactes tú mismo.
- Antes de redactar contenido nuevo, consulta el contexto existente en Notion:
  1. Usa las herramientas de listado disponibles para obtener registros recientes del mismo tipo de contenido.
  2. Busca entre las bases de datos disponibles páginas con guías de estilo, instrucciones de voz o ejemplos; si las encuentras, léelas con read_page_content.
  3. Incluye ese contexto en el prompt que pases a draft_content para mantener coherencia de tono y evitar repeticiones.
- Tras recibir el borrador de draft_content, preséntalo al usuario tal cual y pregunta si quiere ajustes o guardarlo.
- Para guardarlo en Notion: busca primero el registro con list_*, obtén el page_id, luego usa write_page_content.
- Para editar contenido existente, lee primero con read_page_content, luego redacta la versión revisada con draft_content y guárdala.
- El contenido siempre se añade al final de la página. Si el usuario quiere reemplazarlo, avísale de que debe borrar el contenido anterior en Notion.`;
}

const histories = loadHistories();

export async function runAgent(userText, chatId, image = null) {
  if (!histories.has(chatId)) histories.set(chatId, []);
  const history = histories.get(chatId);

  history.push({ role: 'user', content: userText });

  // Mantener máximo 20 mensajes para no superar el límite de tokens
  if (history.length > 20) history.splice(0, history.length - 20);

  // Construir los mensajes para la API; el último puede incluir imagen (no se guarda en historial)
  const messages = history.slice(0, -1);
  messages.push({
    role: 'user',
    content: image
      ? [
          { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.base64 } },
          { type: 'text', text: userText },
        ]
      : userText,
  });

  for (let i = 0; i < 10; i++) {
    const response = await client.messages.create({
      model: config.claudeModel,
      max_tokens: 4096,
      system: buildSystemPrompt(),
      tools,
      messages,
    }, { timeout: 60_000 });

    if (response.stop_reason === 'end_turn') {
      const textBlocks = response.content.filter((b) => b.type === 'text');
      const reply = textBlocks.map((b) => b.text).join('\n') || 'Hecho.';
      history.push({ role: 'assistant', content: reply });
      saveHistories(histories);
      return reply;
    }

    const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
    if (toolUseBlocks.length === 0) {
      const textBlocks = response.content.filter((b) => b.type === 'text');
      const reply = textBlocks.map((b) => b.text).join('\n') || 'Hecho.';
      history.push({ role: 'assistant', content: reply });
      saveHistories(histories);
      return reply;
    }

    messages.push({ role: 'assistant', content: response.content });

    const toolResults = [];
    for (const toolUse of toolUseBlocks) {
      try {
        const result = await dispatch(toolUse.name, toolUse.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      } catch (err) {
        console.error(`[tool:${toolUse.name}] error:`, err.message);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: 'La herramienta falló con un error interno.',
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  saveHistories(histories);
  return 'Se alcanzó el límite de iteraciones. Inténtalo con una petición más simple.';
}
