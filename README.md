# automation-hub

Monorepo para sistemas de automatización de procesos de onboarding, replicable por cliente.

## Estructura

```
apps/form/           → Formulario de registro (vanilla HTML/CSS/JS)
workflows/n8n/       → n8n con Docker Compose + workflows importables
clients/             → Configuración por cliente
packages/config/     → Utilidad para cargar config de cliente
scripts/             → Herramientas de scaffolding
```

## Quick start

### 1. Arrancar n8n

```bash
pnpm n8n:up
```

Abrir http://localhost:5678 y seguir la guía en `workflows/n8n/SETUP.md` para configurar credenciales e importar los workflows.

### 2. Servir el formulario

```bash
pnpm form:serve
```

Abrir http://localhost:3000. Editar `apps/form/config.js` para cambiar la URL del webhook.

## Añadir un nuevo cliente

```bash
pnpm new-client -- nombre-del-cliente
```

Esto crea `clients/nombre-del-cliente/` con `config.json` y `.env` listos para rellenar.

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm n8n:up` | Arrancar n8n |
| `pnpm n8n:down` | Parar n8n |
| `pnpm n8n:logs` | Ver logs de n8n |
| `pnpm form:serve` | Servir formulario en puerto 3000 |
| `pnpm new-client` | Crear cliente desde plantilla |

## Requisitos

- [Docker](https://docker.com) y Docker Compose
- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io)
