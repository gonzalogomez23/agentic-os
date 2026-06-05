import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';

const REQUIRED = ['NOTION_API_KEY', 'NOTION_DB_LEADS'];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Faltan variables de entorno: ${missing.join(', ')}`);
  process.exit(1);
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_LEADS = process.env.NOTION_DB_LEADS;
const PORT = process.env.PORT || 3001;

const app = express();

// CORS: en producción limitar a los orígenes del portfolio
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : true; // true = cualquier origen (útil en desarrollo)

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.post('/leads', async (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body ?? {};

  if (!nombre?.trim() || !email?.trim()) {
    return res.status(400).json({ ok: false, error: 'nombre y email son obligatorios' });
  }

  try {
    await notion.pages.create({
      parent: { database_id: DB_LEADS },
      properties: {
        Nombre:     { title:        [{ text: { content: nombre.trim() } }] },
        Email:      { email:        email.trim() },
        Teléfono:   telefono?.trim() ? { phone_number: telefono.trim() } : undefined,
        Notas:      mensaje?.trim()  ? { rich_text: [{ text: { content: mensaje.trim() } }] } : undefined,
        Canal:      { select: { name: 'Portfolio' } },
        Estado:     { select: { name: 'Nuevo' } },
      },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Error al crear lead en Notion:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook escuchando en http://localhost:${PORT}`);
});
