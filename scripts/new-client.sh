#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$ROOT_DIR/clients/_template"
CLIENTS_DIR="$ROOT_DIR/clients"

if [ -z "${1:-}" ]; then
  echo "Uso: bash scripts/new-client.sh <nombre-cliente>"
  echo "Ejemplo: bash scripts/new-client.sh clinica-dental"
  exit 1
fi

CLIENT_ID="$1"
CLIENT_DIR="$CLIENTS_DIR/$CLIENT_ID"

if [ -d "$CLIENT_DIR" ]; then
  echo "Error: el cliente '$CLIENT_ID' ya existe en $CLIENT_DIR"
  exit 1
fi

cp -r "$TEMPLATE_DIR" "$CLIENT_DIR"

# Renombrar .env.example a .env
if [ -f "$CLIENT_DIR/.env.example" ]; then
  cp "$CLIENT_DIR/.env.example" "$CLIENT_DIR/.env"
fi

echo "Cliente '$CLIENT_ID' creado en $CLIENT_DIR"
echo ""
echo "Siguientes pasos:"
echo "  1. Editar $CLIENT_DIR/config.json con los datos del negocio"
echo "  2. Rellenar $CLIENT_DIR/.env con los secretos"
