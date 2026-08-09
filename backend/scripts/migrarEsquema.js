/**
 * Crea (o actualiza) las tablas ejecutando basedatos/esquema.sql.
 *
 * Uso:  npm run migrar
 *
 * El SQL es idempotente, asi que se puede correr las veces que haga falta.
 * En el VPS se ejecuta automaticamente al arrancar el contenedor.
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../configuracion/baseDatos.js';

const carpetaActual = path.dirname(fileURLToPath(import.meta.url));
const rutaEsquema = path.join(carpetaActual, '..', 'basedatos', 'esquema.sql');

async function migrar() {
  console.log('[migracion] Leyendo esquema.sql...');
  const sql = readFileSync(rutaEsquema, 'utf-8');

  console.log('[migracion] Aplicando esquema en la base de datos...');
  await pool.query(sql);

  console.log('[migracion] Listo. Tablas creadas o ya existentes.');
}

migrar()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('[migracion] Fallo:', error.message);
    await pool.end().catch(() => {});
    process.exit(1);
  });
