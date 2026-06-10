import { schemas } from './schema.js';
import { createPage, queryDatabase, updatePage, archivePage, appendPageContent, getPageContent } from './notion.js';
import { draftWithGPT } from './writer.js';
import { platformTones, getKnowledgeForPlatform } from './context.js';

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
        if (def.options?.length) prop.enum = def.options;
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
        if (def.options?.length) prop.items.enum = def.options;
        break;
      default:
        prop.type = 'string';
    }

    props[field] = prop;
  }

  return { props, required };
}

function makeTools() {
  const tools = [];

  for (const [dbKey, schema] of Object.entries(schemas)) {
    const label = schema.label || dbKey;
    const { props: createProps } = propsToSchema(dbKey, false);
    const { props: updateProps } = propsToSchema(dbKey, true);
    const titleField = schema.title;

    tools.push({
      name: `create_${dbKey}`,
      description: `Crea un registro en la base de datos ${label} de Notion.`,
      input_schema: {
        type: 'object',
        properties: createProps,
        required: [Object.keys(schema.properties)[0]],
      },
    });

    tools.push({
      name: `list_${dbKey}`,
      description: `Lista registros de ${label}. Puedes filtrar por texto (búsqueda en ${titleField}) o por una propiedad concreta.`,
      input_schema: {
        type: 'object',
        properties: {
          search: { type: 'string', description: `Texto a buscar en el campo ${titleField}` },
          property: { type: 'string', description: 'Nombre del campo por el que filtrar' },
          value: { type: 'string', description: 'Valor exacto del filtro' },
        },
      },
    });

    tools.push({
      name: `update_${dbKey}`,
      description: `Actualiza un registro existente en ${label}. Necesitas el page_id (obtenlo con list_${dbKey} primero).`,
      input_schema: {
        type: 'object',
        properties: updateProps,
        required: ['page_id'],
      },
    });

    tools.push({
      name: `delete_${dbKey}`,
      description: `Archiva (elimina) un registro de ${label}. Necesitas el page_id.`,
      input_schema: {
        type: 'object',
        properties: {
          page_id: { type: 'string', description: 'ID de la página a archivar' },
        },
        required: ['page_id'],
      },
    });
  }

  const platformKeys = Object.keys(platformTones);
  const platformProp = platformKeys.length
    ? { type: 'string', description: 'Plataforma de destino del contenido', enum: platformKeys }
    : { type: 'string', description: 'Plataforma de destino (ej: linkedin, upwork, email, instagram)' };

  tools.push({
    name: 'draft_content',
    description: 'Usa GPT para redactar contenido: posts de LinkedIn/Instagram, emails, proposals de Upwork, newsletters... Incluye siempre el campo platform para aplicar el tono correcto.',
    input_schema: {
      type: 'object',
      properties: {
        prompt:   { type: 'string', description: 'Qué redactar: tipo de contenido, tema, longitud' },
        context:  { type: 'string', description: 'Contexto adicional: audiencia, detalles específicos del encargo' },
        platform: platformProp,
      },
      required: ['prompt', 'platform'],
    },
  });

  tools.push({
    name: 'write_page_content',
    description: 'Añade contenido (texto, párrafos, listas) al cuerpo de una página de Notion. Usa markdown: # para títulos, - para listas, > para citas.',
    input_schema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'ID de la página de Notion' },
        content: { type: 'string', description: 'Texto en markdown a guardar en la página' },
      },
      required: ['page_id', 'content'],
    },
  });

  tools.push({
    name: 'read_page_content',
    description: 'Lee el cuerpo (bloques de texto) de una página de Notion.',
    input_schema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'ID de la página de Notion' },
      },
      required: ['page_id'],
    },
  });

  tools.push({
    name: 'get_knowledge',
    description: 'Devuelve el contexto de conocimiento del negocio: perfil profesional, servicios, voz y posicionamiento. Si se indica platform, incluye también el tono específico de esa plataforma. Úsala antes de redactar o cuando necesites contexto sobre el negocio.',
    input_schema: {
      type: 'object',
      properties: {
        platform: platformKeys.length
          ? { type: 'string', description: 'Plataforma para incluir su tono específico', enum: platformKeys }
          : { type: 'string', description: 'Plataforma para incluir su tono específico (ej: Linkedin, Upwork, Website)' },
      },
      required: [],
    },
  });

  return tools;
}

export let tools = [];

export function initTools() {
  tools = makeTools();
}

export async function dispatch(name, input) {
  if (name === 'draft_content')      return draftWithGPT(input.prompt, input.context, input.platform);
  if (name === 'write_page_content') return appendPageContent(input.page_id, input.content);
  if (name === 'read_page_content')  return getPageContent(input.page_id);
  if (name === 'get_knowledge')      return { context: getKnowledgeForPlatform(input.platform) };

  const match = name.match(/^(create|list|update|delete)_(\w+)$/);
  if (!match) throw new Error(`Tool desconocida: ${name}`);

  const [, action, dbKey] = match;

  switch (action) {
    case 'create':
      return createPage(dbKey, input);
    case 'list': {
      const results = await queryDatabase(dbKey, input);
      return results.length === 0 ? { message: 'No se encontraron registros.' } : results;
    }
    case 'update': {
      const { page_id, ...data } = input;
      return updatePage(dbKey, page_id, data);
    }
    case 'delete':
      return archivePage(input.page_id);
    default:
      throw new Error(`Acción desconocida: ${action}`);
  }
}
