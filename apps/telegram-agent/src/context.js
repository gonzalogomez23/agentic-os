export let generalContext = '';
export const platformTones = {};

export function appendGeneralContext(text) {
  generalContext = generalContext ? `${generalContext}\n\n---\n\n${text}` : text;
}

export function setPlatformTone(platform, text) {
  platformTones[platform] = text;
}
