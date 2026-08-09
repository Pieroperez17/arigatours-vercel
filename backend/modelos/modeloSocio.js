/**
 * Modelo Socio — paginas de contacto individuales.
 *
 * Cada socio tiene una direccion propia (/contacto/daniela) que reparte
 * impresa como QR en su tarjeta. El id es el ultimo tramo de esa direccion.
 */

import { consultar } from '../configuracion/baseDatos.js';

const CAMPOS = `
  id, nombre, cargo, foto, whatsapp, instagram, correo,
  mensaje_whatsapp AS "mensajeWhatsapp", orden, activo,
  creado_en AS "creadoEn", actualizado_en AS "actualizadoEn"
`;

/**
 * Lista socios ordenados como se quieran mostrar.
 * @param {object} opciones
 * @param {boolean} [opciones.soloActivos=true] el panel los quiere todos
 */
export async function listar({ soloActivos = true } = {}) {
  const donde = soloActivos ? 'WHERE activo = TRUE' : '';

  const { rows } = await consultar(
    `SELECT ${CAMPOS} FROM socios ${donde} ORDER BY orden ASC, nombre ASC`
  );
  return rows;
}

/** Devuelve un socio por id, o null. */
export async function buscarPorId(id) {
  const { rows } = await consultar(
    `SELECT ${CAMPOS} FROM socios WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/** Comprueba si ya existe un socio con ese id. */
export async function existe(id) {
  const { rows } = await consultar('SELECT 1 FROM socios WHERE id = $1 LIMIT 1', [id]);
  return rows.length > 0;
}

/** Crea un socio nuevo. */
export async function crear(datos) {
  const { rows } = await consultar(
    `INSERT INTO socios (id, nombre, cargo, foto, whatsapp, instagram, correo, mensaje_whatsapp, orden, activo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${CAMPOS}`,
    [
      datos.id, datos.nombre, datos.cargo, datos.foto, datos.whatsapp,
      datos.instagram, datos.correo, datos.mensajeWhatsapp, datos.orden, datos.activo,
    ]
  );
  return rows[0];
}

/** Actualiza un socio existente. Devuelve null si el id no existe. */
export async function actualizar(id, datos) {
  const { rows } = await consultar(
    `UPDATE socios SET
       nombre = $2, cargo = $3, foto = $4, whatsapp = $5, instagram = $6,
       correo = $7, mensaje_whatsapp = $8, orden = $9, activo = $10,
       actualizado_en = NOW()
     WHERE id = $1
     RETURNING ${CAMPOS}`,
    [
      id, datos.nombre, datos.cargo, datos.foto, datos.whatsapp,
      datos.instagram, datos.correo, datos.mensajeWhatsapp, datos.orden, datos.activo,
    ]
  );
  return rows[0] || null;
}

/** Borra un socio. Devuelve true si existia. */
export async function eliminar(id) {
  const { rowCount } = await consultar('DELETE FROM socios WHERE id = $1', [id]);
  return rowCount > 0;
}
