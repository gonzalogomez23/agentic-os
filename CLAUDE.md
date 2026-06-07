# CLAUDE.md — agentic-os

## Idioma

Todo el texto visible para el usuario (UI, mensajes, documentación, comentarios) debe estar en **español de España** (tuteo, no voseo). Evitar formas argentinas como "completá", "seleccioná" — usar "completa", "selecciona", "inténtalo". Prefijo telefónico por defecto: +34.

El código fuente se mantiene en inglés.

## Qué es este proyecto

Asistente IA personal para gestionar un negocio freelance. Dos aplicaciones:

- **telegram-agent** — bot de Telegram que interpreta mensajes de texto y voz con Claude y ejecuta acciones en Notion (crear tareas, proyectos, ideas, leads).
- **contact-api** — servidor Express que recibe el POST del formulario de contacto del portfolio y guarda el lead en Notion.

## Arquitectura

```
agentic-os/
├── apps/
│   ├── telegram-agent/   # Bot de Telegram + agente Claude + Notion
│   └── contact-api/      # Servidor Express para leads del portfolio
├── packages/
│   └── emails/           # Plantillas de email con React Email (compartidas)
├── package.json
└── pnpm-workspace.yaml
```

### Agentes y modelos

- **Claude** (claude-haiku-4-5) — organizador: interpreta peticiones, gestiona Notion (CRUD)
- **GPT** (gpt-4o-mini) — redactor: posts, emails, copy, newsletters (tool `draft_content`)

### Flujo del agente

```
Telegram (texto o voz) → transcripción (Groq Whisper) → Claude (tool use) → Notion
                                                                           ↘ GPT (redacción)
```

### Flujo del contact-api

```
Portfolio (POST /contact) → contact-api → Notion (DB Leads) + Email
```

## Comandos

```bash
pnpm agent:dev          # Arrancar el agente en modo watch
pnpm agent:start        # Arrancar el agente en producción
pnpm contact-api:dev    # Arrancar la contact-api en modo watch
pnpm contact-api:start  # Arrancar la contact-api en producción
pnpm emails:dev         # Servidor de previsualización de emails (localhost:3030)
pnpm emails:build       # Compilar plantillas — ejecutar antes de hacer push si se han modificado
```

## Bases de datos de Notion

Definidas en `apps/telegram-agent/src/schema.js`:

- **Tareas** — nombre, estado, fecha límite, prioridad, proyecto, descripción
- **Proyectos** — nombre, cliente, estado, fecha inicio, fecha entrega, importe, descripción
- **Ideas** — título, canal, estado, fecha de publicación, notas
- **Leads** — nombre, email, teléfono, presupuesto, canal, estado, notas

## Convenciones

- Los IDs de las DBs de Notion van en `.env`, nunca en el código.
- Ficheros `.env` van en `.gitignore`. Usar `.env.example` como referencia.
- Para añadir una nueva DB: añadir su schema en `schema.js` y su ID en `config.js` + `.env.example`. El resto (tools, CRUD) se genera automáticamente.
- No usar n8n ni Docker para la lógica propia — todo es Node.js.
