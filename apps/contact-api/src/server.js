import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Client } from '@notionhq/client';
import { Resend } from 'resend';

const REQUIRED = ['NOTION_API_KEY', 'NOTION_DB_CONTACTS', 'RESEND_API_KEY', 'TO_EMAIL'];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Faltan variables de entorno: ${missing.join(', ')}`);
  process.exit(1);
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);
const DB_LEADS = process.env.NOTION_DB_CONTACTS;
const TO_EMAIL = process.env.TO_EMAIL;
const FROM_EMAIL = process.env.FROM_EMAIL || 'leads@notifications.gonzalogomez.dev';
const PORT = process.env.PORT || 3001;

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : true;

if (!process.env.CORS_ORIGINS) {
  console.warn('ADVERTENCIA: CORS_ORIGINS no configurado. En producción establece CORS_ORIGINS=https://tuportfolio.com');
}

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10kb' }));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/contact', contactLimiter, async (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body ?? {};

  if (!nombre?.trim() || !email?.trim()) {
    return res.status(400).json({ ok: false, error: 'nombre y email son obligatorios' });
  }
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ ok: false, error: 'email inválido' });
  }
  if (nombre.trim().length > 100) {
    return res.status(400).json({ ok: false, error: 'nombre demasiado largo' });
  }
  if (mensaje && mensaje.length > 3000) {
    return res.status(400).json({ ok: false, error: 'mensaje demasiado largo' });
  }

  try {
    await notion.pages.create({
      parent: { database_id: DB_LEADS },
      properties: {
        Name:                   { title: [{ text: { content: nombre.trim() } }] },
        Email:                  { email: email.trim() },
        ...(telefono?.trim() && { Phone: { phone_number: telefono.trim() } }),
        ...(mensaje?.trim()  && { 'Contact Form Message': { rich_text: [{ text: { content: mensaje.trim() } }] } }),
        Status:                 { status: { name: 'Not started' } },
      },
    });

    resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Nuevo lead: ${nombre.trim()}`,
      html: buildEmailHtml({ nombre, email, telefono, mensaje }),
    }).catch((err) => console.error('Error al enviar email de notificación:', err.message));

    res.json({ ok: true });
  } catch (err) {
    console.error('Error al crear lead en Notion:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
});

function buildEmailHtml({ nombre, email, telefono, mensaje }) {
  const rows = [
    ['Nombre', nombre?.trim()],
    ['Email', email?.trim()],
    telefono?.trim() ? ['Teléfono', telefono.trim()] : null,
    mensaje?.trim() ? ['Mensaje', mensaje.trim().replace(/\n/g, '<br>')] : null,
  ].filter(Boolean);

  const rowsHtml = rows
    .map(([label, value]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap">${label}</td><td style="padding:6px 12px;color:#222">${value}</td></tr>`)
    .join('');

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#111;margin-bottom:4px">Nuevo lead del portfolio</h2>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;background:#f9f9f9;border-radius:8px">
        ${rowsHtml}
      </table>
    </div>`;
}

app.listen(PORT, () => {
  console.log(`Webhook escuchando en http://localhost:${PORT}`);
});
