# agentic-os

Asistente IA personal para gestionar un negocio freelance desde Telegram.

## Qué hace

- Envías un mensaje de texto o una nota de voz a un bot de Telegram.
- Claude interpreta la intención y actúa sobre tus bases de datos de Notion.
- Gestiona tareas, proyectos, ideas y leads sin salir de Telegram.

Un servidor webhook independiente recibe los leads de tu portfolio y los guarda directamente en Notion.

## Estructura

```
apps/telegram-agent/   → el asistente IA
apps/webhook/          → backend del formulario de contacto del portfolio
```

## Requisitos

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io)
- Cuenta en [Anthropic](https://console.anthropic.com) (Claude)
- Cuenta en [Groq](https://console.groq.com) (transcripción de voz)
- Bot de Telegram creado con [@BotFather](https://t.me/BotFather)
- Integración de [Notion](https://www.notion.so/my-integrations) con las 4 bases de datos creadas

## Puesta en marcha

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp apps/telegram-agent/.env.example apps/telegram-agent/.env
cp apps/webhook/.env.example apps/webhook/.env
```

Rellenar los valores en ambos ficheros.

### 3. Arrancar

```bash
pnpm agent:dev      # el asistente de Telegram
pnpm webhook:dev    # el servidor de leads
```

## Comandos

| Comando | Descripción |
|---|---|
| `pnpm agent:dev` | Agente en modo watch (desarrollo) |
| `pnpm agent:start` | Agente en producción |
| `pnpm webhook:dev` | Webhook en modo watch (desarrollo) |
| `pnpm webhook:start` | Webhook en producción |
