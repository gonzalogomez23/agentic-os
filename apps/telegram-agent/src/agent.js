import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';
import { tools, dispatch } from './tools.js';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

const SYSTEM_PROMPT = `Eres un asistente personal que gestiona 4 bases de datos de Notion para un negocio freelance.

Bases de datos disponibles:
1. **Tareas** — tareas con nombre, estado, fecha límite, prioridad, proyecto asociado y descripción.
2. **Proyectos** — proyectos con nombre, cliente, estado, fechas de inicio y entrega, importe y descripción.
3. **Ideas** — ideas y posts con título, canal, estado, fecha de publicación y notas.
4. **Leads** — contactos con nombre, email, teléfono, servicio de interés, presupuesto, canal de captación, estado y notas.

Instrucciones:
- Responde siempre en español de España (tuteo).
- Sé conciso y directo en tus respuestas.
- Cuando necesites actualizar o eliminar un registro, primero usa la herramienta list_ para encontrar el page_id.
- Si el usuario da una fecha relativa (ej: "mañana", "el viernes"), calcula la fecha absoluta. Hoy es ${new Date().toISOString().split('T')[0]}.
- Para fechas usa formato ISO: YYYY-MM-DD.
- Cuando crees un registro, confirma con un resumen breve de lo creado.
- Si no entiendes la intención, pide aclaración.
- Nunca inventes datos: si el usuario no menciona un campo, no lo rellenes.`;

/**
 * Ejecuta el loop de tool use con Claude.
 * @param {string} userText — Texto del usuario (transcripción o mensaje directo)
 * @returns {Promise<string>} — Respuesta final de Claude
 */
export async function runAgent(userText) {
  const messages = [{ role: 'user', content: userText }];

  // Loop de tool use — máximo 10 iteraciones para evitar bucles infinitos
  for (let i = 0; i < 10; i++) {
    const response = await client.messages.create({
      model: config.claudeModel,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    // Si no hay tool_use, extraer texto y devolver
    if (response.stop_reason === 'end_turn') {
      const textBlocks = response.content.filter((b) => b.type === 'text');
      return textBlocks.map((b) => b.text).join('\n') || 'Hecho.';
    }

    // Procesar tool calls
    const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
    if (toolUseBlocks.length === 0) {
      const textBlocks = response.content.filter((b) => b.type === 'text');
      return textBlocks.map((b) => b.text).join('\n') || 'Hecho.';
    }

    // Añadir la respuesta del asistente al historial
    messages.push({ role: 'assistant', content: response.content });

    // Ejecutar cada tool y añadir resultados
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

  return 'Se alcanzó el límite de iteraciones. Inténtalo con una petición más simple.';
}
