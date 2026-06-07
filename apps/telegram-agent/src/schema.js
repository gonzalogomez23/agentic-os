function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

function extractOptions(propDef) {
  if (propDef.type === 'select') return propDef.select?.options?.map((o) => o.name);
  if (propDef.type === 'multi_select') return propDef.multi_select?.options?.map((o) => o.name);
  if (propDef.type === 'status') return propDef.status?.options?.map((o) => o.name);
  return undefined;
}

export let schemas = {};

export async function loadSchemas(notion, dbs) {
  const loaded = {};

  for (const [dbKey, dbId] of Object.entries(dbs)) {
    if (!dbId) continue;

    const db = await notion.databases.retrieve({ database_id: dbId });
    const properties = {};
    let titleField = null;
    const label = db.title?.[0]?.plain_text || dbKey;

    for (const [propName, propDef] of Object.entries(db.properties)) {
      const slug = slugify(propName);
      const options = extractOptions(propDef);

      properties[slug] = {
        type: propDef.type,
        notion_name: propName,
        ...(options?.length ? { options } : {}),
      };

      if (propDef.type === 'title') titleField = propName;
    }

    loaded[dbKey] = { title: titleField, label, properties };
  }

  Object.assign(schemas, loaded);
  console.log(`Schemas cargados: ${Object.keys(loaded).join(', ')}`);
}
