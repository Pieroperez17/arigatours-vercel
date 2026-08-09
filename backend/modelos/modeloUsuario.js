/**
 * Modelo Usuario — acceso a la tabla "usuarios".
 * Solo habla con la base de datos; no valida ni responde peticiones HTTP.
 */

import { consultar } from '../configuracion/baseDatos.js';

/** Busca un usuario por su correo. Devuelve null si no existe. */
export async function buscarPorCorreo(correo) {
  const { rows } = await consultar(
    'SELECT id, correo, clave_hash, nombre, rol FROM usuarios WHERE correo = $1 LIMIT 1',
    [correo]
  );
  return rows[0] || null;
}

/** Busca un usuario por id, sin devolver el hash de la clave. */
export async function buscarPorId(id) {
  const { rows } = await consultar(
    'SELECT id, correo, nombre, rol, creado_en FROM usuarios WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Crea un usuario o actualiza su clave si el correo ya existia.
 * Lo usa el script de siembra para dejar listo el admin inicial.
 */
export async function crearOActualizar({ correo, claveHash, nombre = 'Administrador', rol = 'admin' }) {
  const { rows } = await consultar(
    `INSERT INTO usuarios (correo, clave_hash, nombre, rol)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (correo) DO UPDATE
       SET clave_hash = EXCLUDED.clave_hash,
           nombre     = EXCLUDED.nombre,
           rol        = EXCLUDED.rol
     RETURNING id, correo, nombre, rol`,
    [correo, claveHash, nombre, rol]
  );
  return rows[0];
}
