import { config } from './config.js';

/**
 * Descarga un fichero de voz de Telegram y lo transcribe con Groq Whisper.
 * @param {string} fileUrl — URL del fichero OGG desde la API de Telegram
 * @returns {Promise<string>} — Texto transcrito
 */
export async function transcribe(fileUrl) {
  // Descargar el audio desde Telegram
  const audioResponse = await fetch(fileUrl);
  if (!audioResponse.ok) {
    throw new Error(`Error descargando audio: ${audioResponse.status}`);
  }
  const audioBuffer = await audioResponse.arrayBuffer();

  // Preparar FormData para Groq
  const blob = new Blob([audioBuffer], { type: 'audio/ogg' });
  const formData = new FormData();
  formData.append('file', blob, 'voice.ogg');
  formData.append('model', 'whisper-large-v3');
  formData.append('language', 'es');

  // Enviar a Groq Whisper API
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.groqApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error en Groq Whisper: ${response.status} — ${error}`);
  }

  const result = await response.json();
  return result.text;
}
