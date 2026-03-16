const fs = require("fs");
const path = require("path");

const CLIENTS_DIR = path.resolve(__dirname, "../../clients");
const schema = JSON.parse(
  fs.readFileSync(path.join(__dirname, "schema.json"), "utf-8")
);

/**
 * Carga y valida la configuración de un cliente.
 * @param {string} clientId - Nombre del directorio del cliente (ej. "gimnasio-demo")
 * @returns {object} Configuración parseada
 */
function loadConfig(clientId) {
  const configPath = path.join(CLIENTS_DIR, clientId, "config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(`No se encontró config.json para el cliente "${clientId}"`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  validate(config);
  return config;
}

/**
 * Valida la configuración contra el esquema (validación básica).
 * Comprueba campos requeridos de primer y segundo nivel.
 */
function validate(config) {
  const required = schema.required || [];
  for (const key of required) {
    if (!(key in config)) {
      throw new Error(`Falta la sección requerida: "${key}"`);
    }
    const sectionSchema = schema.properties[key];
    if (sectionSchema && sectionSchema.required) {
      for (const subKey of sectionSchema.required) {
        if (!(subKey in config[key])) {
          throw new Error(`Falta el campo requerido: "${key}.${subKey}"`);
        }
      }
    }
  }
}

/**
 * Lista los clientes disponibles (directorios con config.json).
 * @returns {string[]}
 */
function listClients() {
  return fs
    .readdirSync(CLIENTS_DIR)
    .filter((dir) => {
      if (dir.startsWith("_")) return false;
      const configPath = path.join(CLIENTS_DIR, dir, "config.json");
      return fs.existsSync(configPath);
    });
}

module.exports = { loadConfig, listClients };
