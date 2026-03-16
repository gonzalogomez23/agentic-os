# Setup — Workflow de Onboarding

Guía para configurar las credenciales y poner en marcha el workflow.

## Requisitos previos

- Docker y Docker Compose instalados

## 0. Arrancar n8n

1. Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Arrancar el contenedor:
   ```bash
   docker compose up -d
   ```
3. Abrir `http://localhost:5678` en el navegador — deberías ver la UI de n8n.

## 1. Importar el workflow

1. Abrir n8n → menú superior → **Import from File**
2. Seleccionar `onboarding.json` de este directorio
3. Se importarán 4 nodos: Webhook → Notion → Email SMTP → Telegram

## 2. Configurar Notion

### Crear la base de datos

En Notion, crear una base de datos con estas columnas (los nombres deben ser exactos):

| Columna | Tipo |
|---------|------|
| Nombre | Title |
| Email | Email |
| Teléfono | Phone |
| Fecha de nacimiento | Date |
| Membresía | Select (opciones: Mensual, Trimestral, Anual) |
| Objetivo | Select (opciones: Perder peso, Ganar músculo, Recomposición corporal, Otro) |

### Crear la integración

1. Ir a https://www.notion.so/my-integrations
2. **New integration** → nombre: `Onboarding Gym` → Submit
3. Copiar el **Internal Integration Secret** (empieza con `ntn_`)
4. En la base de datos de Notion, clic en `···` → **Connections** → buscar y añadir `Onboarding Gym`

### Configurar en n8n

1. Abrir el nodo **Notion - Crear Ficha**
2. En **Credential**, clic en **Create New** → pegar el token
3. En **Database**, seleccionar la base de datos que creaste
4. Verificar que los campos están mapeados correctamente

## 3. Configurar Gmail (SMTP con contraseña de aplicación)

### Generar contraseña de aplicación

1. Ir a https://myaccount.google.com/apppasswords
   - Necesitas tener la **verificación en dos pasos** activada en tu cuenta de Google
2. En **Nombre de la aplicación**, escribir `n8n onboarding` (o el nombre que quieras)
3. Clic en **Crear** → Google te mostrará una contraseña de 16 caracteres (ej. `abcd efgh ijkl mnop`)
4. Copiar esa contraseña — no la podrás ver de nuevo

### Configurar en n8n

1. Abrir el nodo **Email SMTP - Bienvenida**
2. En **Credential**, clic en **Create New** → tipo **SMTP**
3. Rellenar:
   - **Host**: `smtp.gmail.com`
   - **Port**: `465`
   - **SSL/TLS**: activado
   - **User**: tu dirección de Gmail (ej. `tu@gmail.com`)
   - **Password**: la contraseña de aplicación que generaste (sin espacios)
4. En el nodo, rellenar el campo **From Email** con tu dirección de Gmail

## 4. Configurar Telegram

### Crear el bot

1. Abrir Telegram → buscar **@BotFather** → `/start`
2. Enviar `/newbot`
3. Elegir nombre y username para el bot
4. Copiar el **token** que te da BotFather

### Obtener el chat ID del grupo

1. Crear un grupo en Telegram (o usar uno existente)
2. Añadir el bot al grupo
3. Enviar cualquier mensaje en el grupo
4. Abrir en el navegador: `https://api.telegram.org/bot<TU_TOKEN>/getUpdates`
5. Buscar `"chat":{"id":-XXXXXXXXX}` — ese número negativo es el **chat ID**

### Configurar en n8n

1. Abrir el nodo **Telegram - Notificar**
2. En **Credential**, clic en **Create New** → pegar el token del bot
3. En **Chat ID**, poner el ID del grupo (incluir el signo `-`)

## 5. Configurar el workflow de errores

1. En n8n → **Import from File** → seleccionar `onboarding-error.json`
2. Abrir el nodo **Telegram - Notificar Error** → configurar la misma credencial de Telegram y el mismo **Chat ID** del grupo
3. **Guardar y activar** el workflow "Onboarding - Errores"
4. Volver al workflow principal ("Onboarding Gimnasio") → **Settings** (icono de engranaje) → **Error Workflow** → seleccionar **Onboarding - Errores**
5. Guardar el workflow principal

Si cualquier nodo del workflow principal falla, se enviará automáticamente un mensaje de Telegram al grupo con los detalles del error.

## 6. Activar y probar

1. En n8n, clic en **Save** y luego **Active** (toggle arriba a la derecha)
2. Desde la raíz del monorepo, servir el formulario:
   ```bash
   pnpm form:serve
   ```
3. Enviar el formulario desde `http://localhost:3000`, o probar con curl:
   ```bash
   curl -X POST http://localhost:5678/webhook/onboarding \
     -H "Content-Type: application/json" \
     -d '{"nombre":"Test","email":"tu@email.com","telefono":"+34600000000","fecha_nacimiento":"1990-01-01","membresia":"Mensual","objetivo":"Ganar músculo"}'
   ```
4. Verificar:
   - [ ] Nueva entrada en la base de datos de Notion
   - [ ] Email de bienvenida recibido
   - [ ] Mensaje en el grupo de Telegram
   - [ ] El formulario muestra confirmación de éxito

## Estructura del webhook

El formulario envía un POST con este body:

```json
{
  "nombre": "Juan García",
  "email": "juan@email.com",
  "telefono": "+34600000000",
  "fecha_nacimiento": "1990-05-15",
  "membresia": "Mensual",
  "objetivo": "Ganar músculo"
}
```

## Troubleshooting

- **Notion no aparece la base de datos**: Verificar que compartiste la DB con la integración (paso 2.4)
- **Gmail falla al enviar**: Verificar que la contraseña de aplicación es correcta y que la verificación en dos pasos está activada
- **Telegram no envía**: Verificar que el bot está en el grupo y el chat ID es correcto (incluir el `-`)
- **Webhook no recibe datos**: Verificar que el workflow está activo y que la URL es `http://localhost:5678/webhook/onboarding`
