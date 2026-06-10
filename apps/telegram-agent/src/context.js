export let generalContext = '';
export const platformTones = {};

export function appendGeneralContext(text) {
  generalContext = generalContext ? `${generalContext}\n\n---\n\n${text}` : text;
}

export function setPlatformTone(platform, text) {
  platformTones[platform] = text;
}

export function getKnowledgeForPlatform(platform) {
  const parts = [];
  if (generalContext) parts.push(generalContext);
  if (platform && platformTones[platform]) parts.push(`[Tono para ${platform}]\n${platformTones[platform]}`);
  return parts.join('\n\n---\n\n') || 'No hay contexto de negocio cargado.';
}
