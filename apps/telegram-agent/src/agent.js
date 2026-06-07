import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';
import { schemas } from './schema.js';
import { tools, dispatch } from './tools.js';
import { loadHistories, saveHistories } from './history.js';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

const DB_DESCRIPTIONS = {
  tasks:     'Tareas del día a día: trabajo pendiente, en curso o completado.',
  projects:  'Proyectos con clientes: seguimiento de estado, fechas e importe.',
  content:   'Contenido para publicar: posts, artículos, vídeos — ideas y programación.',
  knowledge: 'Base de conocimiento personal: notas, aprendizajes, referencias.',
  contacts:  'Contactos y leads: personas interesadas en los servicios o colaboraciones.',
};

function buildSystemPrompt() {
  const dbList = Object.entries(schemas)
    .map(([key, schema]) => {
      const desc = DB_DESCRIPTIONS[key] || '';
      const fields = Object.keys(schema.properties).join(', ');
      return `- **${schema.label}** — ${desc} Campos: ${fields}`;
    })
    .join('\n');

  return `Eres un asistente personal que gestiona bases de datos de Notion para un negocio freelance.

Bases de datos disponibles:
${dbList}

Instrucciones generales:
- Responde siempre en español de España (tuteo).
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
    });

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
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: `Error: ${err.message}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  saveHistories(histories);
  return 'Se alcanzó el límite de iteraciones. Inténtalo con una petición más simple.';
}
