/**
 * Esquemas de las 4 bases de datos de Notion.
 *
 * Modifica este fichero cuando cambien las propiedades de tus DBs.
 * Cada DB define:
 *   - title: nombre de la propiedad título
 *   - properties: { nombreCampo: { type, notion_name, options? } }
 *
 * Los tipos soportados: title, rich_text, number, select, multi_select,
 * date, checkbox, url, email, phone_number, status
 */

export const schemas = {
  tareas: {
    title: 'Nombre',
    properties: {
      nombre: { type: 'title', notion_name: 'Nombre' },
      estado: {
        type: 'status',
        notion_name: 'Estado',
        options: ['Sin empezar', 'En curso', 'Completada'],
      },
      fecha_limite: { type: 'date', notion_name: 'Fecha límite' },
      prioridad: {
        type: 'select',
        notion_name: 'Prioridad',
        options: ['Alta', 'Media', 'Baja'],
      },
      descripcion: { type: 'rich_text', notion_name: 'Descripción' },
    },
  },

  finanzas: {
    title: 'Concepto',
    properties: {
      concepto: { type: 'title', notion_name: 'Concepto' },
      tipo: {
        type: 'select',
        notion_name: 'Tipo',
        options: ['Ingreso', 'Gasto'],
      },
      cantidad: { type: 'number', notion_name: 'Cantidad' },
      categoria: {
        type: 'select',
        notion_name: 'Categoría',
        options: ['Material', 'Servicios', 'Nóminas', 'Ventas', 'Otros'],
      },
      fecha: { type: 'date', notion_name: 'Fecha' },
      notas: { type: 'rich_text', notion_name: 'Notas' },
    },
  },

  equipo: {
    title: 'Nombre',
    properties: {
      nombre: { type: 'title', notion_name: 'Nombre' },
      rol: { type: 'select', notion_name: 'Rol', options: [] },
      email: { type: 'email', notion_name: 'Email' },
      telefono: { type: 'phone_number', notion_name: 'Teléfono' },
      notas: { type: 'rich_text', notion_name: 'Notas' },
    },
  },

  clientes: {
    title: 'Nombre',
    properties: {
      nombre: { type: 'title', notion_name: 'Nombre' },
      email: { type: 'email', notion_name: 'Email' },
      telefono: { type: 'phone_number', notion_name: 'Teléfono' },
      fecha_nacimiento: { type: 'date', notion_name: 'Fecha de nacimiento' },
      membresia: {
        type: 'select',
        notion_name: 'Membresía',
        options: ['Mensual', 'Trimestral', 'Anual'],
      },
      objetivo: {
        type: 'select',
        notion_name: 'Objetivo',
        options: ['Perder peso', 'Ganar músculo', 'Recomposición corporal', 'Otro'],
      },
    },
  },
};
