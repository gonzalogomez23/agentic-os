# CLAUDE.md — agentic-os

## Idioma

Todo el texto visible para el usuario (UI, mensajes, documentación, comentarios) debe estar en **español de España** (tuteo, no voseo). Evitar formas argentinas como "completá", "seleccioná" — usar "completa", "selecciona", "inténtalo". Prefijo telefónico por defecto: +34.

El código fuente se mantiene en inglés.

## Qué es este proyecto

Asistente IA personal para gestionar un negocio freelance. Dos aplicaciones:

- **telegram-agent** — bot de Telegram que interpreta mensajes de texto y voz con Claude y ejecuta acciones en Notion (crear tareas, proyectos, ideas, leads).
- **webhook** — servidor Express que recibe el POST del formulario de contacto del portfolio y guarda el lead en Notion.

## Arquitectura

```
agentic-os/
├── apps/
│   ├── telegram-agent/   # Bot de Telegram + agente Claude + Notion
│   └── webhook/          # Servidor Express para leads del portfolio
├── package.json
└── pnpm-workspace.yaml
```

### Flujo del agente

```
Telegram (texto o voz) → transcripción (Groq Whisper) → Claude (tool use) → Notion
```

### Flujo del webhook

```
Portfolio (POST /leads) → webhook → Notion (DB Leads)
```

## Comandos

```bash
pnpm agent:dev      # Arrancar el agente en modo watch
pnpm agent:start    # Arrancar el agente en producción
pnpm webhook:dev    # Arrancar el webhook en modo watch
pnpm webhook:start  # Arrancar el webhook en producción
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
