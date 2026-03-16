# CLAUDE.md — automation-hub

## Idioma

Todo el texto visible para el usuario (UI, mensajes, documentación, comentarios) debe estar en **español de España** (tuteo, no voseo). Evitar formas argentinas como "completá", "seleccioná" — usar "completa", "selecciona", "inténtalo". Prefijo telefónico por defecto: +34.

## Arquitectura

Monorepo para sistemas de automatización de procesos, replicable por cliente.

```
automation-hub/
├── apps/form/        # Formulario vanilla HTML/CSS/JS (sin build)
├── workflows/n8n/    # Docker Compose + workflows JSON importables
├── clients/          # Configuración por cliente (config.json + .env)
├── packages/config/  # Utilidad para cargar/validar config de cliente
└── scripts/          # Herramientas de scaffolding
```

### Flujo

```
Form (localhost:3000) → POST → n8n (localhost:5678) → Notion + Gmail SMTP + Telegram
```

## Comandos

```bash
pnpm n8n:up        # Arrancar n8n
pnpm n8n:down      # Parar n8n
pnpm n8n:logs      # Ver logs de n8n
pnpm form:serve    # Servir formulario en localhost:3000
pnpm new-client    # Crear nuevo cliente desde plantilla
```

## Multi-cliente

Cada cliente tiene su directorio en `clients/` con:
- `config.json` — configuración del negocio (branding, horarios, opciones del formulario, IDs de n8n)
- `.env` — secretos (tokens de Notion, Telegram, SMTP). Nunca se sube a git.

Plantilla base en `clients/_template/`. Crear nuevo cliente: `bash scripts/new-client.sh <nombre>`.

## Convenciones

- El formulario NO usa framework ni bundler — son 4 ficheros estáticos.
- `config.js` en el form contiene `CONFIG.WEBHOOK_URL` y textos de branding.
- Los workflows de n8n están en `workflows/n8n/` (son infra, no apps).
- Las credenciales de n8n se configuran en la UI, no en ficheros.
- Ficheros `.env` van en `.gitignore`. Usar `.env.example` como referencia.
