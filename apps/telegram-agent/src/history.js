import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const DIR  = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const FILE = join(DIR, 'history.json');

export function loadHistories() {
  try {
    return new Map(JSON.parse(readFileSync(FILE, 'utf8')));
  } catch {
    return new Map();
  }
}

export function saveHistories(histories) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify([...histories]));
}
