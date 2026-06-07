import { render } from '@react-email/render';
import { writeFileSync } from 'node:fs';
import { NewLeadEmail } from './src/new-lead.js';

const html = await render(
  NewLeadEmail({
    nombre: 'Ana García',
    email: 'ana@ejemplo.com',
    telefono: '+34 612 345 678',
    mensaje: 'Hola, me gustaría hablar contigo sobre un proyecto de diseño web para mi empresa.',
  }),
);

writeFileSync('preview.html', html);
console.log('✔ preview.html generado — ábrelo en el navegador');
