import { Client } from '@notionhq/client';
import { config } from './config.js';
import { schemas } from './schema.js';

const notion = new Client({ auth: config.notionApiKey });

/* ── Helpers para construir propiedades de Notion ── */

function buildProperty(type, value) {
  if (value === undefined || value === null) return null;

  switch (type) {
    case 'title':
      return { title: [{ text: { content: String(value) } }] };
    case 'rich_text':
      return { rich_text: [{ text: { content: String(value) } }] };
    case 'number':
      return { number: Number(value) };
    case 'select':
      return { select: { name: String(value) } };
    case 'multi_select':
      return {
        multi_select: (Array.isArray(value) ? value : [value]).map((v) => ({
          name: String(v),
        })),
      };
    case 'date':
      return { date: { start: String(value) } };
    case 'checkbox':
      return { checkbox: Boolean(value) };
    case 'url':
      return { url: String(value) };
    case 'email':
      return { email: String(value) };
    case 'phone_number':
      return { phone_number: String(value) };
    case 'status':
      return { status: { name: String(value) } };
    default:
      return null;
  }
}

function mapProperties(dbKey, data) {
  const schema = schemas[dbKey];
  if (!schema) throw new Error(`DB desconocida: ${dbKey}`);

  const props = {};
  for (const [field, value] of Object.entries(data)) {
    const def = schema.properties[field];
    if (!def) continue;
    const built = buildProperty(def.type, value);
    if (built) props[def.notion_name] = built;
  }
  return props;
}

/** Extrae el valor legible de una propiedad de Notion */
function extractValue(prop) {
  if (!prop) return null;
  switch (prop.type) {
    case 'title':
      return prop.title?.map((t) => t.plain_text).join('') || '';
    case 'rich_text':
      return prop.rich_text?.map((t) => t.plain_text).join('') || '';
    case 'number':
      return prop.number;
    case 'select':
      return prop.select?.name || null;
    case 'multi_select':
      return prop.multi_select?.map((s) => s.name) || [];
    case 'date':
      return prop.date?.start || null;
    case 'checkbox':
      return prop.checkbox;
    case 'url':
      return prop.url;
    case 'email':
      return prop.email;
    case 'phone_number':
      return prop.phone_number;
    case 'status':
      return prop.status?.name || null;
    default:
      return null;
  }
}

function formatPage(page, dbKey) {
  const schema = schemas[dbKey];
  const result = { id: page.id };
  for (const [field, def] of Object.entries(schema.properties)) {
    const prop = page.properties[def.notion_name];
    if (prop) result[field] = extractValue(prop);
  }
  return result;
}

/* ── CRUD genérico ── */

export async function createPage(dbKey, data) {
  const dbId = config.notionDbs[dbKey];
  const properties = mapProperties(dbKey, data);
  const page = await notion.pages.create({
    parent: { database_id: dbId },
    properties,
  });
  return formatPage(page, dbKey);
}

export async function queryDatabase(dbKey, filter) {
  const dbId = config.notionDbs[dbKey];

  const queryParams = { database_id: dbId, page_size: 20 };

  // Filtro simple por texto en el título
  if (filter?.search) {
    const schema = schemas[dbKey];
    queryParams.filter = {
      property: schema.title,
      title: { contains: filter.search },
    };
  }

  // Filtro por propiedad exacta
  if (filter?.property && filter?.value) {
    const def = schemas[dbKey].properties[filter.property];
    if (def) {
      if (def.type === 'select' || def.type === 'status') {
        queryParams.filter = {
          property: def.notion_name,
          [def.type]: { equals: filter.value },
        };
      }
    }
  }

  const response = await notion.databases.query(queryParams);
  return response.results.map((p) => formatPage(p, dbKey));
}

export async function updatePage(dbKey, pageId, data) {
  const properties = mapProperties(dbKey, data);
  const page = await notion.pages.update({ page_id: pageId, properties });
  return formatPage(page, dbKey);
}

export async function archivePage(pageId) {
  await notion.pages.update({ page_id: pageId, archived: true });
  return { success: true };
}
