/**
 * Modelo Portada — fotos de fondo del carrusel y de las cabeceras.
 *
 * Solo habla con la base de datos; no valida ni responde peticiones HTTP.
 */

import { consultar } from '../configuracion/baseDatos.js';

const CAMPOS = 'id, imagen, orden, activo, creado_en AS "creadoEn"';

/**
 * Lista las portadas en el orden en que deben mostrarse.
 * @param {object} opciones
 * @param {boolean} [opciones.soloActivas=true] el panel las quiere todas
 */
export async function listar({ soloActivas = true } = {}) {
  const donde = soloActivas ? 'WHERE activo = TRUE' : '';

  const { rows } = await consultar(
    `SELECT ${CAMPOS} FROM portadas ${donde} ORDER BY orden ASC, id ASC`
  );
  return rows;
}

/** Comprueba si ya hay una portada con esa misma imagen. */
export async function existe(imagen) {
  const { rows } = await consultar('SELECT 1 FROM portadas WHERE imagen = $1 LIMIT 1', [imagen]);
  return rows.length > 0;
}

/**
 * Anade una portada al final.
 *
 * El orden se calcula aqui y no lo manda quien llama: es un detalle interno
 * y pedirselo al panel solo abriria la puerta a huecos y repeticiones.
 */
export async function crear(imagen) {
  const { rows } = await consultar(
    `INSERT INTO portadas (imagen, orden)
     VALUES ($1, COALESCE((SELECT MAX(orden) + 1 FROM portadas), 0))
     RETURNING ${CAMPOS}`,
    [imagen]
  );
  return rows[0];
}

/** Activa o desactiva una portada. Devuelve la fila, o null si no existe. */
export async function cambiarActivo(id, activo) {
  const { rows } = await consultar(
    `UPDATE portadas SET activo = $2 WHERE id = $1 RETURNING ${CAMPOS}`,
    [id, activo]
  );
  return rows[0] || null;
}

/** Borra una portada. Devuelve la fila borrada, o null si no existia. */
export async function eliminar(id) {
  const { rows } = await consultar(
    `DELETE FROM portadas WHERE id = $1 RETURNING ${CAMPOS}`,
    [id]
  );
  return rows[0] || null;
}

/** Cuantas portadas quedan activas. Lo usa el controlador para no dejar cero. */
export async function contarActivas() {
  const { rows } = await consultar('SELECT COUNT(*)::int AS total FROM portadas WHERE activo = TRUE');
  return rows[0].total;
}
