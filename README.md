# agentic-os

Asistente IA personal para gestionar un negocio freelance desde Telegram.

## Qué hace

- Envías un mensaje de texto, una nota de voz o una imagen a un bot de Telegram.
- El agente interpreta la intención y actúa sobre tus bases de datos de Notion: crea y gestiona tareas, proyectos, ideas y leads.
- Si le pides redactar algo (un post, un email, una proposal), delega esa redacción en un segundo modelo especializado en copywriting.

Un servidor independiente (`contact-api`) recibe los leads del formulario de contacto de tu portfolio y los guarda en Notion, además de notificarte por email.

## Dos agentes, dos roles

El sistema usa dos modelos con responsabilidades separadas — no es un único LLM haciendo de todo:

| Agente | Modelo | Rol |
|---|---|---|
| **Organizador** | Claude (`claude-haiku-4-5`) | Interpreta lo que pides, decide qué herramienta usar y gestiona el CRUD contra Notion (crear/listar/actualizar/borrar tareas, proyectos, ideas, leads). Es quien mantiene la conversación y el contexto en Telegram. |
| **Redactor** | GPT (`gpt-4.1`) | Solo entra en juego cuando la petición es de redacción (posts, emails, copy, proposals). Claude nunca redacta contenido directamente: llama a la tool `draft_content`, que invoca a GPT con el contexto del negocio y el tono de la plataforma de destino ya inyectados. |

Esta separación existe porque son tareas distintas: Claude necesita ser fiable ejecutando acciones estructuradas (tool use, CRUD), mientras que GPT está afinado específicamente para producir copy con voz humana y evitar el tono genérico típico de texto generado por IA (ver el system prompt en `apps/telegram-agent/src/writer.js`).

### Flujo completo

```
Telegram (texto, voz o imagen)
   → transcripción si es voz (Groq Whisper)
   → Claude (tool use): decide la acción
        ├─ CRUD directo → Notion
        └─ tarea de redacción → draft_content → GPT (con contexto + tono de plataforma) → borrador
   → confirmación/guardado en Notion
```

### Contexto de redacción (knowledge DB)

Al arrancar, el agente carga todas las páginas de la base de datos `knowledge` de Notion y las clasifica por su propiedad `Type`:

- **`Base knowledge`** — contexto general del negocio (quién eres, servicios, clientes, guía de estilo). Se inyecta en el system prompt de Claude y en todas las redacciones de GPT.
- **`Linkedin`, `Upwork`, `Website`, etc.** — tono específico por plataforma. Se inyecta en GPT solo cuando `draft_content` se llama con esa `platform`.

Para editar el tono de una plataforma, basta con modificar la página correspondiente en Notion y reiniciar el agente. Para añadir una plataforma nueva, crea una página con el `Type` deseado — la tool la detecta automáticamente al arrancar.

## Estructura

```
apps/
├── telegram-agent/   → el asistente IA (Claude + GPT + Notion)
└── contact-api/       → backend del formulario de contacto del portfolio
packages/
└── emails/            → plantillas de email compartidas (React Email)
```

## Requisitos

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io)
- Cuenta en [Anthropic](https://console.anthropic.com) (Claude — agente organizador)
- Cuenta en [OpenAI](https://platform.openai.com) (GPT — agente redactor)
- Cuenta en [Groq](https://console.groq.com) (transcripción de voz)
- Cuenta en [Resend](https://resend.com) con un dominio propio verificado (envío de emails de notificación de leads — Resend rechaza el envío si el dominio del remitente no está verificado)
- Bot de Telegram creado con [@BotFather](https://t.me/BotFather)
- Integración de [Notion](https://www.notion.so/my-integrations) con las bases de datos: Tareas, Proyectos, Ideas, Knowledge y Leads

## Puesta en marcha

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp apps/telegram-agent/.env.example apps/telegram-agent/.env
cp apps/contact-api/.env.example apps/contact-api/.env
```

Rellena los valores en ambos ficheros.

### 3. Arrancar

```bash
pnpm agent:dev          # el asistente de Telegram
pnpm contact-api:dev    # el servidor de leads del portfolio
```

## Despliegue: webhook vs polling

En local, `telegram-agent` usa *long polling* (pregunta activamente a la API de Telegram por mensajes nuevos) — no requiere URL pública ni configuración extra.

En producción, si defines la variable `PUBLIC_URL` con la URL pública del servicio, el agente cambia automáticamente a modo **webhook**: monta un servidor HTTP y Telegram le envía los mensajes directamente por POST, verificados con la cabecera `X-Telegram-Bot-Api-Secret-Token`. Esto es necesario en hosting con *sleep* por inactividad (planes gratuitos tipo Railway Free) — el polling no genera tráfico entrante, así que el servicio no tiene forma de autodespertarse; el webhook sí. Sin `PUBLIC_URL`, sigue usando polling.

## Comandos

| Comando | Descripción |
|---|---|
| `pnpm agent:dev` | Agente de Telegram en modo watch (desarrollo) |
| `pnpm agent:start` | Agente de Telegram en producción |
| `pnpm contact-api:dev` | Contact API en modo watch (desarrollo) |
| `pnpm contact-api:start` | Contact API en producción |
| `pnpm emails:dev` | Servidor de previsualización de plantillas de email (`localhost:3030`) |
| `pnpm emails:build` | Compila las plantillas de email — ejecutar antes de hacer push si se han modificado |
