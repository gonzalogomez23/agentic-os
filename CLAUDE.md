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
- **GPT** (gpt-4.1) — redactor: posts, emails, copy, proposals (tool `draft_content`)

### Flujo del agente

```
Telegram (texto o voz) → transcripción (Groq Whisper) → Claude (tool use) → Notion
                                                                           ↘ GPT (redacción con tono de plataforma)
```

### Contexto de redacción (knowledge DB)

Al arrancar, el agente carga todas las páginas de la DB `knowledge` y las clasifica por su propiedad `Type`:

- `Base knowledge` — contexto general (quién eres, servicios, clientes, guía de estilo base). Se inyecta en el system prompt de Claude y en todas las redacciones de GPT.
- `Linkedin`, `Upwork`, `Website`, etc. — tono específico por plataforma. Se inyecta en GPT únicamente cuando `draft_content` se llama con ese `platform`.

Cuando el usuario pide "redacta un post de LinkedIn sobre X" o "genera una proposal para Upwork", Claude detecta la plataforma automáticamente y la pasa a `draft_content`. GPT recibe entonces el contexto general + el tono de esa plataforma.

Para añadir o modificar el tono de una plataforma, basta con editar la página correspondiente en Notion y reiniciar el agente. Para añadir una plataforma nueva, crear una página con el `Type` deseado — el enum de la tool se genera dinámicamente al arranque.

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
