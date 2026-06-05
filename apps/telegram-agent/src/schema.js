export const schemas = {
  tareas: {
    title: 'Nombre',
    properties: {
      nombre:      { type: 'title',     notion_name: 'Nombre' },
      estado:      { type: 'status',    notion_name: 'Estado',       options: ['Sin empezar', 'En curso', 'Completada'] },
      fecha_limite:{ type: 'date',      notion_name: 'Fecha límite' },
      prioridad:   { type: 'select',    notion_name: 'Prioridad',    options: ['Alta', 'Media', 'Baja'] },
      proyecto:    { type: 'rich_text', notion_name: 'Proyecto' },
      descripcion: { type: 'rich_text', notion_name: 'Descripción' },
    },
  },

  proyectos: {
    title: 'Nombre',
    properties: {
      nombre:        { type: 'title',     notion_name: 'Nombre' },
      cliente:       { type: 'rich_text', notion_name: 'Cliente' },
      estado:        { type: 'select',    notion_name: 'Estado',         options: ['Propuesta', 'En curso', 'Entregado', 'Archivado'] },
      fecha_inicio:  { type: 'date',      notion_name: 'Fecha de inicio' },
      fecha_entrega: { type: 'date',      notion_name: 'Fecha de entrega' },
      importe:       { type: 'number',    notion_name: 'Importe' },
      descripcion:   { type: 'rich_text', notion_name: 'Descripción' },
    },
  },

  ideas: {
    title: 'Título',
    properties: {
      titulo:           { type: 'title',     notion_name: 'Título' },
      canal:            { type: 'select',    notion_name: 'Canal',              options: ['Blog', 'LinkedIn', 'Instagram', 'YouTube', 'Otro'] },
      estado:           { type: 'select',    notion_name: 'Estado',             options: ['Idea', 'Redactando', 'Programado', 'Publicado'] },
      fecha_publicacion:{ type: 'date',      notion_name: 'Fecha de publicación' },
      notas:            { type: 'rich_text', notion_name: 'Notas' },
    },
  },

  leads: {
    title: 'Nombre',
    properties: {
      nombre:    { type: 'title',        notion_name: 'Nombre' },
      email:     { type: 'email',        notion_name: 'Email' },
      telefono:  { type: 'phone_number', notion_name: 'Teléfono' },
      servicio:  { type: 'select',       notion_name: 'Servicio',   options: ['Diseño web', 'SEO', 'Consultoría', 'Otro'] },
      presupuesto:{ type: 'rich_text',   notion_name: 'Presupuesto' },
      canal:     { type: 'select',       notion_name: 'Canal',      options: ['Portfolio', 'Referido', 'LinkedIn', 'Otro'] },
      estado:    { type: 'select',       notion_name: 'Estado',     options: ['Nuevo', 'Contactado', 'Propuesta enviada', 'Cerrado', 'Descartado'] },
      notas:     { type: 'rich_text',    notion_name: 'Notas' },
    },
  },
};
