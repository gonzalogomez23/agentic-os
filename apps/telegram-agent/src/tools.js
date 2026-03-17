import { schemas } from './schema.js';
import { createPage, queryDatabase, updatePage, archivePage } from './notion.js';

/* ── Genera las propiedades como JSON Schema para Claude ── */

function propsToSchema(dbKey, includeId) {
  const schema = schemas[dbKey];
  const props = {};
  const required = [];

  if (includeId) {
    props.page_id = { type: 'string', description: 'ID de la página de Notion' };
    required.push('page_id');
  }

  for (const [field, def] of Object.entries(schema.properties)) {
    const prop = { description: def.notion_name };

    switch (def.type) {
      case 'title':
      case 'rich_text':
      case 'url':
      case 'email':
      case 'phone_number':
      case 'date':
      case 'status':
      case 'select':
        prop.type = 'string';
        if (def.options?.length) {
          prop.enum = def.options;
        }
        break;
      case 'number':
        prop.type = 'number';
        break;
      case 'checkbox':
        prop.type = 'boolean';
        break;
      case 'multi_select':
        prop.type = 'array';
        prop.items = { type: 'string' };
        if (def.options?.length) {
          prop.items.enum = def.options;
        }
        break;
      default:
        prop.type = 'string';
    }

    props[field] = prop;
  }

  return { props, required };
}

/* ── Definiciones de tools para Claude ── */

const DB_NAMES = {
  tareas: 'Tareas',
  finanzas: 'Finanzas',
  equipo: 'Equipo',
  clientes: 'Clientes/Leads',
};

function makeTools() {
  const tools = [];

  for (const [dbKey, dbLabel] of Object.entries(DB_NAMES)) {
    const { props: createProps } = propsToSchema(dbKey, false);
    const { props: updateProps } = propsToSchema(dbKey, true);
    const titleField = schemas[dbKey].title;

    // CREATE
    tools.push({
      name: `create_${dbKey}`,
      description: `Crea un registro en la base de datos ${dbLabel} de Notion.`,
      input_schema: {
        type: 'object',
        properties: createProps,
        required: [Object.keys(schemas[dbKey].properties)[0]],
      },
    });

    // LIST
    tools.push({
      name: `list_${dbKey}`,
      description: `Lista registros de la base de datos ${dbLabel}. Puedes filtrar por texto (búsqueda en ${titleField}) o por una propiedad concreta.`,
      input_schema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: `Texto a buscar en el campo ${titleField}`,
          },
          property: {
            type: 'string',
            description: 'Nombre del campo por el que filtrar (ej: estado, prioridad)',
          },
          value: {
            type: 'string',
            description: 'Valor exacto del filtro',
          },
        },
      },
    });

    // UPDATE
    tools.push({
      name: `update_${dbKey}`,
      description: `Actualiza un registro existente en ${dbLabel}. Necesitas el page_id (obtenlo con list_${dbKey} primero).`,
      input_schema: {
        type: 'object',
        properties: updateProps,
        required: ['page_id'],
      },
    });

    // DELETE
    tools.push({
      name: `delete_${dbKey}`,
      description: `Archiva (elimina) un registro de ${dbLabel}. Necesitas el page_id.`,
      input_schema: {
        type: 'object',
        properties: {
          page_id: {
            type: 'string',
            description: 'ID de la página a archivar',
          },
        },
        required: ['page_id'],
      },
    });
  }

  return tools;
}

export const tools = makeTools();

/* ── Dispatcher: ejecuta la tool y devuelve resultado ── */

export async function dispatch(name, input) {
  // Extraer dbKey y acción del nombre (ej: create_tareas → create, tareas)
  const match = name.match(/^(create|list|update|delete)_(\w+)$/);
  if (!match) throw new Error(`Tool desconocida: ${name}`);

  const [, action, dbKey] = match;

  switch (action) {
    case 'create': {
      const result = await createPage(dbKey, input);
      return result;
    }
    case 'list': {
      const results = await queryDatabase(dbKey, input);
      if (results.length === 0) return { message: 'No se encontraron registros.' };
      return results;
    }
    case 'update': {
      const { page_id, ...data } = input;
      const result = await updatePage(dbKey, page_id, data);
      return result;
    }
    case 'delete': {
      const result = await archivePage(input.page_id);
      return result;
    }
    default:
      throw new Error(`Acción desconocida: ${action}`);
  }
}
